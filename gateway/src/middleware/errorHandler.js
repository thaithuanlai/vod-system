// Middleware xử lý lỗi tập trung — luôn đặt CUỐI cùng trong app.js
// Nhận 4 params: (err, req, res, next) — Express tự nhận dạng là error handler

const errorHandler = (err, req, res, _next) => {
  // Log lỗi ra console với đầy đủ thông tin
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Nếu là dev thì log stack trace để debug
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Xác định HTTP status code
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      // Chỉ trả về stack trace khi dev
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;