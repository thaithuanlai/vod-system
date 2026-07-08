






















import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import logger from '../config/logger.js';


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











  async transcodeToHls(inputPath, outputDir, onProgress) {
    logger.info(`Bắt đầu transcode HLS: ${inputPath}`);


    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }


    for (let i = 0; i < HLS_PRESETS.length; i++) {
      const preset = HLS_PRESETS[i];

      await this._transcodePreset(inputPath, preset, outputDir, (percent) => {
        if (onProgress) {

          const overall = Math.round((i * 100 + percent) / HLS_PRESETS.length);
          onProgress(overall, preset.name);
        }
      });
    }


    this._createMasterPlaylist(outputDir);

    logger.info(`Transcode hoàn tất tại: ${outputDir}`);
  }










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














  _transcodePreset(inputPath, preset, outputDir, onPercent) {
    return new Promise((resolve, reject) => {

      const playlistFile = path.join(outputDir, `${preset.name}.m3u8`);
      const segmentPattern = path.join(outputDir, `${preset.name}_%03d.ts`);

      logger.info(`Transcode variant: ${preset.name} (${preset.width}x${preset.height})`);

      ffmpeg(inputPath)
        .outputOptions([

          '-c:v libx264',
          '-profile:v main',
          '-crf 20',
          `-b:v ${preset.videoBitrate}`,
          `-maxrate ${preset.videoBitrate}`,
          '-bufsize 5000k',


          `-vf scale=w=${preset.width}:h=${preset.height}:force_original_aspect_ratio=decrease,pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2`,


          '-c:a aac',
          '-ar 48000',
          `-b:a ${preset.audioBitrate}`,


          '-g 60',                    
          '-sc_threshold 0',          
          '-hls_time 6',              
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











  extractThumbnail(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      logger.info(`Trích xuất thumbnail: ${inputPath} → ${outputPath}`);

      ffmpeg(inputPath)
        .outputOptions([
          '-ss', '00:00:03',       
          '-vframes', '1',         
          '-q:v', '2',             
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


const transcodingService = new TranscodingService();
export default transcodingService;
