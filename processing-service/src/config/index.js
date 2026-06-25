// ============================================================================
// CẤU HÌNH TRUNG TÂM - Processing Service
// Đọc biến môi trường từ file .env và xuất ra object config duy nhất
// ============================================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Xử lý đường dẫn trong ESM (thay thế __dirname của CommonJS) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load biến môi trường ---
// Ưu tiên file .env ở thư mục gốc dự án (dùng chung cho tất cả services)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // Fallback: file .env riêng của processing-service

// ============================================================================
// EXPORT CẤU HÌNH
// ============================================================================
const config = {
  // Môi trường: development | production
  env: process.env.NODE_ENV || 'development',

  // Cổng HTTP cho health check endpoint
  port: parseInt(process.env.PORT || process.env.PROCESSING_SERVICE_PORT || '3004', 10),

  // --- URL các service liên quan ---
  videoServiceUrl: process.env.VIDEO_SERVICE_URL || 'http://localhost:3003',

  // --- Google Cloud Platform ---
  gcp: {
    projectId:       process.env.GCP_PROJECT_ID || 'your-gcp-project-id',
    bucketName:      process.env.GCS_BUCKET_NAME || 'vod-videos-your-project-id',
    rawFolder:       process.env.GCS_RAW_VIDEO_FOLDER || 'raw-videos',
    hlsFolder:       process.env.GCS_HLS_OUTPUT_FOLDER || 'hls-outputs',
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json',
  },

  // --- RabbitMQ ---
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
    queues: {
      processing: process.env.RABBITMQ_QUEUE_VIDEO_PROCESSING || 'video-processing',
      processed:  process.env.RABBITMQ_QUEUE_VIDEO_PROCESSED || 'video-processed',
    },
  },

  // Thư mục tạm lưu video khi xử lý
  tempDir: path.resolve(__dirname, '../../tmp'),
};

export default config;
