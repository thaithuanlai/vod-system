// Đọc và validate toàn bộ biến môi trường
// Tập trung ở một chỗ, dễ kiểm soát
require('dotenv').config();

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT (dùng ở T10)
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',

  // Service URLs (dùng ở T11)
  services: {
    user:         process.env.USER_SERVICE_URL         || 'http://localhost:3001',
    upload:       process.env.UPLOAD_SERVICE_URL       || 'http://localhost:3002',
    video:        process.env.VIDEO_SERVICE_URL        || 'http://localhost:3003',
    processing:   process.env.PROCESSING_SERVICE_URL  || 'http://localhost:3004',
    streaming:    process.env.STREAMING_SERVICE_URL    || 'http://localhost:3005',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
  },

  // CORS - danh sách origins được phép gọi API
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100,                  // tối đa 100 requests / 15 phút / IP
  },
};

// Cảnh báo nếu dùng secret mặc định ở production
if (config.nodeEnv === 'production' && config.jwtSecret === 'dev-secret-change-in-production') {
  console.error('❌ FATAL: JWT_SECRET chưa được cấu hình cho production!');
  process.exit(1);
}

module.exports = config;