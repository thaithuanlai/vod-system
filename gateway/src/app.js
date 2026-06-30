const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const config                      = require('./config');
const logger                      = require('./middleware/logger');
const errorHandler                = require('./middleware/errorHandler');
const authMiddleware              = require('./middleware/authMiddleware');
const { registerProxyRoutes }     = require('./middleware/proxyMiddleware');
const healthRouter                = require('./routes/health');

const app = express();

// ─── 1. Security Headers ────────────────────────────────────────
app.use(helmet());

// ─── 2. CORS ────────────────────────────────────────────────────
app.use(cors({
  origin:         config.corsOrigins,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));

// ─── 3. Request Logging ─────────────────────────────────────────
app.use(logger);

// ─── 4. Body Parser ─────────────────────────────────────────────
// ĐÃ XÓA: API Gateway KHÔNG NÊN parse body vì nó sẽ consume stream của proxy.
// Để các downstream microservices tự parse body.

// ─── 5. Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs:       config.rateLimit.windowMs,
  max:            config.rateLimit.max,
  message: {
    success: false,
    error: { message: 'Quá nhiều request. Vui lòng thử lại sau 15 phút.' },
  },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use(limiter);

// ─── 6. JWT Authentication ──────────────────────────────────────
app.use(authMiddleware);

// ─── 7. Internal Routes (không proxy) ───────────────────────────
app.get('/health', (req, res) => res.redirect('/api/health'));
app.use('/api/health', healthRouter);

// ─── 8. Proxy Routes → Microservices ────────────────────────────
// Đăng ký tất cả proxy routes từ config/routes.js
registerProxyRoutes(app);

// ─── 9. 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} không tồn tại`,
    },
  });
});

// ─── 10. Error Handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;