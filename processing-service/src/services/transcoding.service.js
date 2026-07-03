// ============================================================================
// TRANSCODING SERVICE - Chuyển đổi video sang HLS đa chất lượng (US-03)
//
// Sử dụng FFmpeg (H.264) để tạo Adaptive Bitrate Streaming:
//   - 360p  (SD)  : 640x360,  400 kbps video, 64 kbps audio
//   - 720p  (HD)  : 1280x720, 2500 kbps video, 128 kbps audio
//   - 1080p (FHD) : 1920x1080, 5000 kbps video, 192 kbps audio
//
// Cấu trúc thư mục đầu ra (phẳng):
//   output/
//   ├── master.m3u8         ← Master playlist
//   ├── 360p.m3u8           ← Variant playlist
//   ├── 720p.m3u8
//   ├── 1080p.m3u8
//   ├── 360p_001.ts         ← Video segment
//   ├── 360p_002.ts
//   ├── 720p_001.ts
//   ├── 1080p_001.ts
//   └── ...
//
// Sử dụng ffprobe để lấy duration video (US-05)
// ============================================================================

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import logger from '../config/logger.js';

// --- Định nghĩa các preset chất lượng (US-03) ---
const HLS_PRESETS = [
  {
    name: '360p',
    width: 640,
    height: 360,
    videoBitrate: '400k',
    audioBitrate: '64k',
    bandwidth: 400000,
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    videoBitrate: '2500k',
    audioBitrate: '128k',
    bandwidth: 2500000,
  },
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    videoBitrate: '5000k',
    audioBitrate: '192k',
    bandwidth: 5000000,
  },
];

class TranscodingService {
  // ==========================================================================
  // HÀM CHÍNH: TRANSCODE VIDEO SANG HLS (US-03)
  // ==========================================================================

  /**
   * Chuyển đổi video sang HLS đa chất lượng (360p, 720p, 1080p)
   *
   * @param {string}   inputPath  - Đường dẫn file video gốc
   * @param {string}   outputDir  - Thư mục lưu output (cấu trúc phẳng)
   * @param {function} onProgress - Callback tiến độ: (percent, presetName)
   */
  async transcodeToHls(inputPath, outputDir, onProgress) {
    logger.info(`Bắt đầu transcode HLS: ${inputPath}`);

    // Tạo thư mục output
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Transcode tuần tự từng preset (tiết kiệm CPU)
    for (let i = 0; i < HLS_PRESETS.length; i++) {
      const preset = HLS_PRESETS[i];

      await this._transcodePreset(inputPath, preset, outputDir, (percent) => {
        if (onProgress) {
          // Tiến độ tổng thể: chia đều cho số preset
          const overall = Math.round((i * 100 + percent) / HLS_PRESETS.length);
          onProgress(overall, preset.name);
        }
      });
    }

    // Tạo master playlist liên kết tất cả variant
    this._createMasterPlaylist(outputDir);

    logger.info(`Transcode hoàn tất tại: ${outputDir}`);
  }

  // ==========================================================================
  // LẤY THỜI LƯỢNG VIDEO BẰNG FFPROBE (US-05)
  // ==========================================================================

  /**
   * Dùng ffprobe để lấy thời lượng video (giây)
   * @param {string} filePath - Đường dẫn file video
   * @returns {Promise<number>} Thời lượng video tính bằng giây (làm tròn)
   */
  getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Lỗi ffprobe', { error: err.message });
          reject(err);
          return;
        }

        const duration = Math.round(metadata.format.duration || 0);
        logger.info(`Thời lượng video: ${duration} giây`);
        resolve(duration);
      });
    });
  }

  // ==========================================================================
  // PRIVATE: TRANSCODE MỘT PRESET
  // ==========================================================================

  /**
   * Chạy FFmpeg cho một preset (360p / 720p / 1080p)
   *
   * Output vào cùng thư mục (cấu trúc phẳng):
   *   - {name}.m3u8        (variant playlist)
   *   - {name}_001.ts      (segment files)
   *
   * @private
   */
  _transcodePreset(inputPath, preset, outputDir, onPercent) {
    return new Promise((resolve, reject) => {
      // File output nằm trực tiếp trong outputDir (phẳng, không nested)
      const playlistFile = path.join(outputDir, `${preset.name}.m3u8`);
      const segmentPattern = path.join(outputDir, `${preset.name}_%03d.ts`);

      logger.info(`Transcode variant: ${preset.name} (${preset.width}x${preset.height})`);

      ffmpeg(inputPath)
        .outputOptions([
          // --- Video codec: H.264 (US-03) ---
          '-c:v libx264',
          '-profile:v main',
          '-crf 20',
          `-b:v ${preset.videoBitrate}`,
          `-maxrate ${preset.videoBitrate}`,
          '-bufsize 5000k',

          // --- Scale + padding giữ tỉ lệ khung hình ---
          `-vf scale=w=${preset.width}:h=${preset.height}:force_original_aspect_ratio=decrease,pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2`,

          // --- Audio codec ---
          '-c:a aac',
          '-ar 48000',
          `-b:a ${preset.audioBitrate}`,

          // --- HLS segment ---
          '-g 60',                    // Keyframe mỗi 60 frame
          '-sc_threshold 0',          // Không thêm keyframe khi scene change
          '-hls_time 6',              // Mỗi segment 6 giây
          '-hls_playlist_type vod',
          `-hls_segment_filename ${segmentPattern}`,
        ])
        .output(playlistFile)
        .on('start', (cmd) => {
          logger.debug(`FFmpeg command: ${cmd}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            onPercent(Math.min(100, Math.max(0, progress.percent)));
          }
        })
        .on('end', () => {
          logger.info(`Hoàn tất variant: ${preset.name}`);
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          logger.error(`Lỗi transcode ${preset.name}`, { error: err.message });
          logger.debug(`FFmpeg stderr: ${stderr}`);
          reject(err);
        })
        .run();
    });
  }

  // ==========================================================================
  // TRÍCH XUẤT THUMBNAIL TỪ VIDEO (US-06)
  // ==========================================================================

  /**
   * Dùng FFmpeg trích xuất 1 frame làm thumbnail
   * @param {string} inputPath  - Đường dẫn file video gốc
   * @param {string} outputPath - Đường dẫn file thumbnail output (.jpg)
   * @returns {Promise<void>}
   */
  extractThumbnail(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      logger.info(`Trích xuất thumbnail: ${inputPath} → ${outputPath}`);

      ffmpeg(inputPath)
        .outputOptions([
          '-ss', '00:00:03',       // Tại giây thứ 3 (tránh giây 0 thường đen)
          '-vframes', '1',         // Chỉ lấy 1 frame
          '-q:v', '2',             // Chất lượng JPEG (1=tốt nhất, 31=tệ nhất)
          '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
        ])
        .output(outputPath)
        .on('end', () => {
          logger.info(`Thumbnail đã tạo: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Lỗi trích xuất thumbnail', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  // ==========================================================================
  // PRIVATE: TẠO MASTER PLAYLIST
  // ==========================================================================

  /**
   * Tạo file master.m3u8 liên kết các variant playlist
   * @private
   */
  _createMasterPlaylist(outputDir) {
    const masterPath = path.join(outputDir, 'master.m3u8');

    let content = '#EXTM3U\n#EXT-X-VERSION:3\n';

    for (const preset of HLS_PRESETS) {
      content += `#EXT-X-STREAM-INF:BANDWIDTH=${preset.bandwidth},RESOLUTION=${preset.width}x${preset.height}\n`;
      content += `${preset.name}.m3u8\n`;
    }

    fs.writeFileSync(masterPath, content, 'utf8');
    logger.info(`Đã tạo master playlist: ${masterPath}`);
  }
}

// Singleton instance
const transcodingService = new TranscodingService();
export default transcodingService;
