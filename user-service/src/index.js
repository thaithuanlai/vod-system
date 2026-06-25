require('dotenv').config();
const express = require('express');
const app = express();

// ─── Body Parser ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────────
// Đăng ký routes — gateway strip prefix /auth trước khi forward
// nên user-service nhận /login, /register (không có /auth)
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// ─── Health Check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'user-service', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} không tồn tại` });
});

// ─── Global Error Handler ────────────────────────────────────────
// Bắt lỗi Express 5 BadRequestError (request aborted, invalid JSON, v.v.)
app.use((err, req, res, _next) => {
  if (res.headersSent) return;

  // Request bị abort (client đóng kết nối giữa chừng) — bỏ qua
  if (err.type === 'request.aborted' || err.code === 'ECONNRESET') {
    return;
  }

  // Bad JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Bad Request', message: 'JSON không hợp lệ' });
  }

  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Đã có lỗi xảy ra',
  });
});

// ─── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ User Service chạy trên port ${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB:  ${process.env.DATABASE_URL ? 'DATABASE_URL' : `${process.env.DB_HOST}:${process.env.DB_PORT}`}`);
});