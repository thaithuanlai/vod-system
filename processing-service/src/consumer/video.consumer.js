// ============================================================================
// VIDEO CONSUMER - Điều phối xử lý video từ hàng đợi RabbitMQ
//
// Luồng xử lý tổng thể (US-01 → US-05):
//
//   RabbitMQ [video-processing]
//       ↓
//   Download video từ GCS              (US-03 Bước 1)
//       ↓
//   FFmpeg Transcode → HLS 360/720/1080p  (US-03 Bước 2, 3)
//       ↓
//   Upload HLS lên GCS                 (US-04)
//       ↓
//   ffprobe lấy duration               (US-05)
//       ↓
//   Cập nhật Video Service (HTTP)       (US-05)
//       ↓
//   Publish event → video-processed     (US-05)
//       ↓
//   Dọn dẹp file tạm
// ============================================================================

import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import logger from '../config/logger.js';
import storageService from '../services/storage.service.js';
import transcodingService from '../services/transcoding.service.js';
import rabbitMQService from '../services/rabbitmq.service.js';

/**
 * Khởi tạo consumer lắng nghe và xử lý video từ hàng đợi
 */
export async function initVideoConsumer() {
  const INPUT_QUEUE = config.rabbitmq.queues.processing;
  const OUTPUT_QUEUE = config.rabbitmq.queues.processed;

  logger.info(`Khởi tạo video consumer cho queue: [${INPUT_QUEUE}]`);

  await rabbitMQService.subscribe(INPUT_QUEUE, async (message) => {
    // --- Đọc thông tin từ message ---
    const { videoId, filename, fileName } = message;
    const videoFilename = filename || fileName; // Hỗ trợ cả 2 format

    if (!videoId || !videoFilename) {
      logger.error('Message không hợp lệ - thiếu videoId hoặc filename', { message });
      return;
    }

    // --- Chuẩn bị đường dẫn local ---
    const jobDir = path.join(config.tempDir, videoId);
    const rawFilePath = path.join(jobDir, videoFilename);
    const hlsOutputDir = path.join(jobDir, 'hls');

    try {
      logger.info(`══════════ BẮT ĐẦU XỬ LÝ VIDEO: ${videoId} ══════════`);

      // ====================================================================
      // BƯỚC 1: Download video từ GCS (US-03)
      // ====================================================================
      if (!fs.existsSync(jobDir)) {
        fs.mkdirSync(jobDir, { recursive: true });
      }

      logger.info(`[1/5] Đang tải video từ GCS: ${videoFilename}`);
      await storageService.downloadRawVideo(videoFilename, rawFilePath);

      // ====================================================================
      // BƯỚC 2: Transcode sang HLS đa chất lượng (US-03)
      // ====================================================================
      logger.info(`[2/5] Đang transcode video...`);

      await transcodingService.transcodeToHls(rawFilePath, hlsOutputDir,
        (progress, presetName) => {
          logger.debug(`Tiến độ transcode ${videoId}: ${progress}% (${presetName})`);
        }
      );

      // ====================================================================
      // BƯỚC 3: Upload HLS lên GCS (US-04)
      // ====================================================================
      logger.info(`[3/5] Đang upload HLS lên GCS...`);
      const hlsUrl = await storageService.uploadHlsFolder(hlsOutputDir, videoId);

      // ====================================================================
      // BƯỚC 4: Lấy duration bằng ffprobe (US-05)
      // ====================================================================
      logger.info(`[4/5] Đang lấy thời lượng video bằng ffprobe...`);
      const duration = await transcodingService.getVideoDuration(rawFilePath);

      // ====================================================================
      // BƯỚC 5: Cập nhật Video Service + Gửi sự kiện (US-05)
      // ====================================================================
      logger.info(`[5/5] Đang cập nhật trạng thái video...`);

      // 5a. Gọi Video Service API - cập nhật status = READY
      await updateVideoService(videoId, {
        status: 'READY',
        hlsUrl,
        processedAt: new Date().toISOString(),
        duration,
      });

      // 5b. Publish event đến queue video-processed → Notification Service
      await rabbitMQService.publish(OUTPUT_QUEUE, {
        event: 'video-processed',
        videoId,
      });

      logger.info(`══════════ HOÀN TẤT XỬ LÝ VIDEO: ${videoId} ══════════`);

    } catch (error) {
      logger.error(`Lỗi xử lý video ${videoId}`, { error: error.message });

      // Cập nhật Video Service - status = ERROR (US-05)
      await updateVideoService(videoId, {
        status: 'ERROR',
        error: error.message,
      });

      // Throw lại để RabbitMQ service thực hiện NACK + requeue (US-02)
      throw error;

    } finally {
      // Luôn dọn dẹp file tạm (US-04)
      cleanupTempDir(jobDir);
    }
  });
}

// ============================================================================
// CẬP NHẬT VIDEO SERVICE QUA HTTP (US-05)
// ============================================================================

/**
 * Gọi API Video Service để cập nhật trạng thái video
 *
 * Thành công: { status: "READY", hlsUrl, processedAt, duration }
 * Thất bại:   { status: "ERROR", error: "..." }
 *
 * @param {string} videoId - ID video
 * @param {object} data    - Dữ liệu cập nhật
 */
async function updateVideoService(videoId, data) {
  const url = `${config.videoServiceUrl}/videos/${videoId}`;

  try {
    logger.info(`Gọi Video Service: PATCH ${url}`, { data });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      logger.warn(`Video Service trả về ${response.status}`, { videoId });
    } else {
      logger.info(`Cập nhật Video Service thành công: ${data.status}`, { videoId });
    }
  } catch (err) {
    // Chỉ log warning, không throw → không ảnh hưởng luồng chính
    logger.warn(`Không thể gọi Video Service`, { videoId, error: err.message });
  }
}

// ============================================================================
// DỌN DẸP FILE TẠM (US-04)
// ============================================================================

/**
 * Xóa thư mục tạm sau khi xử lý xong
 * @param {string} dirPath - Đường dẫn thư mục cần xóa
 */
function cleanupTempDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    logger.info(`Đã dọn dẹp thư mục tạm: ${dirPath}`);
  } catch (err) {
    logger.error(`Lỗi dọn dẹp thư mục: ${dirPath}`, { error: err.message });
  }
}
