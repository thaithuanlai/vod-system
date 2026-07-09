require('dotenv').config();

const config = {
  port:    parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',

  services: {
    user:         process.env.USER_SERVICE_URL         || 'http://localhost:3001',
    upload:       process.env.UPLOAD_SERVICE_URL       || 'http://localhost:3002',
    video:        process.env.VIDEO_SERVICE_URL        || 'http://localhost:3003',
    processing:   process.env.PROCESSING_SERVICE_URL  || 'http://localhost:3004',
    streaming:    process.env.STREAMING_SERVICE_URL   || 'http://localhost:3005',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
  },

  corsOrigins: process.env.CORS_ORIGINS === '*'
    ? true 
    : process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://localhost:3000'],

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max:      parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  },
};

if (config.nodeEnv === 'production' && config.jwtSecret === 'dev-secret-change-in-production') {
  console.error('FATAL: JWT_SECRET chưa được cấu hình cho production!');
  process.exit(1);
}

module.exports = config;