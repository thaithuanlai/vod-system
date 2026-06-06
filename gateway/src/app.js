const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const config          = require('./config');
const logger          = require('./middleware/logger');
const errorHandler    = require('./middleware/errorHandler');
const authMiddleware  = require('./middleware/authMiddleware'); // ← Thêm dòng này
const healthRouter    = require('./routes/health');

const app = express();

// ─── 1. Security Headers ────────────────────────────────────────
app.use(helmet());

// ─── 2. CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── 3. Request Logging ─────────────────────────────────────────
app.use(logger);

// ─── 4. Body Parser ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── 5. Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  message: {
    success: false,
    error: { message: 'Quá nhiều request. Vui lòng thử lại sau 15 phút.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── 6. JWT Authentication ──────────────────────────────────────
// Đặt sau logger để log request trước khi check auth
// Đặt trước routes để bảo vệ tất cả routes phía sau
app.use(authMiddleware); // ← Thêm dòng này

// ─── 7. Routes ──────────────────────────────────────────────────
app.get('/health', (req, res) => res.redirect('/api/health'));
app.use('/api/health', healthRouter);

// Placeholder cho T11 (proxy routing)
// app.use('/auth',   proxy → user-service)
// app.use('/upload', proxy → upload-service)

// ─── 8. 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} không tồn tại`,
    },
  });
});

// ─── 9. Error Handler ───────────────────────────────────────────
app.use(errorHandler);

module.exports = app;