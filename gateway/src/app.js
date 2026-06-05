const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');

const config       = require('./config');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');

const app = express();

// ─── 1. Security Headers ────────────────────────────────────────
// Helmet tự động set các HTTP headers bảo mật
// X-Content-Type-Options, X-Frame-Options, ...vv
app.use(helmet());

// ─── 2. CORS ────────────────────────────────────────────────────
// Chỉ cho phép các origins trong config được gọi API
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Cho phép gửi cookies/auth headers
}));

// ─── 3. Request Logging ─────────────────────────────────────────
// Morgan log mọi request — phải đặt trước routes
app.use(logger);

// ─── 4. Body Parser ─────────────────────────────────────────────
// Parse JSON body từ request
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── 5. Rate Limiting ───────────────────────────────────────────
// Giới hạn 100 requests / 15 phút / IP để chống spam
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  message: {
    success: false,
    error: { message: 'Quá nhiều request. Vui lòng thử lại sau 15 phút.' },
  },
  standardHeaders: true, // Trả header RateLimit-* chuẩn
  legacyHeaders: false,
});
app.use(limiter);

// ─── 6. Routes ──────────────────────────────────────────────────
// Health check — không cần auth
app.get('/health', (req, res) => res.redirect('/api/health'));
app.use('/api/health', healthRouter);

// T10: JWT auth middleware | T11: proxy routing tới microservices

// ─── 7. 404 Handler ─────────────────────────────────────────────
// Bắt tất cả routes không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} không tồn tại`,
    },
  });
});

// ─── 8. Error Handler ───────────────────────────────────────────
// PHẢI đặt cuối cùng — Express nhận dạng qua 4 params
app.use(errorHandler);

module.exports = app;