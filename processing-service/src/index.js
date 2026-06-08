// ============================================================================
// ENTRY POINT - Processing Service
//
// Khởi động:
//   1. Express server cho health check (GET /health)
//   2. Kết nối RabbitMQ
//   3. Lắng nghe và xử lý video từ hàng đợi
//   4. Graceful shutdown khi nhận SIGTERM / SIGINT
// ============================================================================

import express from 'express';
import fs from 'fs';
import config from './config/index.js';
import logger from './config/logger.js';
import rabbitMQService from './services/rabbitmq.service.js';
import { initVideoConsumer } from './consumer/video.consumer.js';

// --- Khởi tạo Express ---
const app = express();
app.use(express.json());

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'processing-service',
    timestamp: new Date().toISOString(),
    rabbitmq: rabbitMQService.isConnected ? 'connected' : 'disconnected',
  });
});

// ============================================================================
// BOOTSTRAP
// ============================================================================

async function bootstrap() {
  logger.info(`Khởi động Processing Service [${config.env}]`);

  // Tạo thư mục tạm nếu chưa có
  if (!fs.existsSync(config.tempDir)) {
    fs.mkdirSync(config.tempDir, { recursive: true });
    logger.info(`Đã tạo thư mục tạm: ${config.tempDir}`);
  }

  // Kết nối RabbitMQ (US-02)
  await rabbitMQService.connect();

  // Đăng ký consumer xử lý video (US-02)
  await initVideoConsumer();

  // Khởi động HTTP server
  const server = app.listen(config.port, () => {
    logger.info(`HTTP server đang chạy tại port ${config.port}`);
  });

  // --- Graceful Shutdown ---
  const shutdown = async (signal) => {
    logger.warn(`Nhận tín hiệu ${signal} - đang tắt service...`);

    server.close(() => logger.info('HTTP server đã đóng'));
    await rabbitMQService.close();

    logger.info('Service đã tắt hoàn toàn');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// --- Chạy ---
bootstrap().catch((error) => {
  logger.error('Lỗi nghiêm trọng khi khởi động', { error: error.stack });
  process.exit(1);
});
