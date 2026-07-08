





















import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import logger from '../config/logger.js';
import storageService from '../services/storage.service.js';
import transcodingService from '../services/transcoding.service.js';
import rabbitMQService from '../services/rabbitmq.service.js';




export async function initVideoConsumer() {
  const INPUT_QUEUE = config.rabbitmq.queues.processing;
  const OUTPUT_QUEUE = config.rabbitmq.queues.processed;

  logger.info(`Khởi tạo video consumer cho queue: [${INPUT_QUEUE}]`);

  await rabbitMQService.subscribe(INPUT_QUEUE, async (message) => {

    const { videoId, filename, fileName } = message;
    const videoFilename = filename || fileName; 

    if (!videoId || !videoFilename) {
      logger.error('Message không hợp lệ - thiếu videoId hoặc filename', { message });
      return;
    }


    const jobDir = path.join(config.tempDir, videoId);
    const rawFilePath = path.join(jobDir, videoFilename);
    const hlsOutputDir = path.join(jobDir, 'hls');

    try {
      logger.info(`══════════ BẮT ĐẦU XỬ LÝ VIDEO: ${videoId} ══════════`);




      if (!fs.existsSync(jobDir)) {
        fs.mkdirSync(jobDir, { recursive: true });
      }

      logger.info(`[1/5] Đang tải video từ GCS: ${videoFilename}`);
      await storageService.downloadRawVideo(videoFilename, rawFilePath);




      logger.info(`[2/5] Đang transcode video...`);

      await transcodingService.transcodeToHls(rawFilePath, hlsOutputDir,
        (progress, presetName) => {
          logger.debug(`Tiến độ transcode ${videoId}: ${progress}% (${presetName})`);
        }
      );




      logger.info(`[3/6] Đang upload HLS lên GCS...`);
      const hlsUrl = await storageService.uploadHlsFolder(hlsOutputDir, videoId);




      let thumbnailUrl = null;
      try {
        logger.info(`[4/6] Đang trích xuất thumbnail...`);
        const thumbnailPath = path.join(jobDir, 'thumbnail.jpg');
        await transcodingService.extractThumbnail(rawFilePath, thumbnailPath);
        thumbnailUrl = await storageService.uploadThumbnail(thumbnailPath, videoId);
        logger.info(`[4/6] ✅ Thumbnail: ${thumbnailUrl}`);
      } catch (thumbnailError) {

        logger.warn(`[4/6] ⚠️ Thumbnail lỗi (bỏ qua): ${thumbnailError.message}`);
      }




      logger.info(`[5/6] Đang lấy thời lượng video bằng ffprobe...`);
      const duration = await transcodingService.getVideoDuration(rawFilePath);




      logger.info(`[6/6] Đang cập nhật trạng thái video...`);


      await updateVideoService(videoId, {
        status: 'READY',
        hlsUrl,
        thumbnailUrl,
        processedAt: new Date().toISOString(),
        duration,
      });


      await rabbitMQService.publish(OUTPUT_QUEUE, {
        event: 'video-processed',
        videoId,
      });

      logger.info(`══════════ HOÀN TẤT XỬ LÝ VIDEO: ${videoId} ══════════`);

    } catch (error) {
      logger.error(`Lỗi xử lý video ${videoId}`, { error: error.message });


      await updateVideoService(videoId, {
        status: 'ERROR',
        error: error.message,
      });


      throw error;

    } finally {

      cleanupTempDir(jobDir);
    }
  });
}














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

    logger.warn(`Không thể gọi Video Service`, { videoId, error: err.message });
  }
}









function cleanupTempDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    logger.info(`Đã dọn dẹp thư mục tạm: ${dirPath}`);
  } catch (err) {
    logger.error(`Lỗi dọn dẹp thư mục: ${dirPath}`, { error: err.message });
  }
}
