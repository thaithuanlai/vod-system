









import express from 'express';
import fs from 'fs';
import config from './config/index.js';
import logger from './config/logger.js';
import rabbitMQService from './services/rabbitmq.service.js';
import { initVideoConsumer } from './consumer/video.consumer.js';


const app = express();
app.use(express.json());


app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'processing-service',
    timestamp: new Date().toISOString(),
    rabbitmq: rabbitMQService.isConnected ? 'connected' : 'disconnected',
  });
});





async function bootstrap() {
  logger.info(`Khởi động Processing Service [${config.env}]`);


  if (!fs.existsSync(config.tempDir)) {
    fs.mkdirSync(config.tempDir, { recursive: true });
    logger.info(`Đã tạo thư mục tạm: ${config.tempDir}`);
  }


  await rabbitMQService.connect();


  await initVideoConsumer();


  const server = app.listen(config.port, () => {
    logger.info(`HTTP server đang chạy tại port ${config.port}`);
  });


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


bootstrap().catch((error) => {
  logger.error('Lỗi nghiêm trọng khi khởi động', { error: error.stack });
  process.exit(1);
});
