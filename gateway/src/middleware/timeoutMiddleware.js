/**
 * Timeout Middleware
 *
 * Tự động hủy request nếu service downstream không phản hồi
 * trong khoảng thời gian cho phép.
 *
 * @param {number} ms - Timeout tính bằng milliseconds
 */
const timeoutMiddleware = (ms) => (req, res, next) => {
  // Đặt timer — nếu hết giờ mà chưa có response → trả 503
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      console.error(
        `[Timeout] ⏰ ${req.method} ${req.path} vượt quá ${ms}ms`
      );
      res.status(503).json({
        success: false,
        error: {
          code:    'SERVICE_TIMEOUT',
          message: `Service không phản hồi sau ${ms / 1000}s. Vui lòng thử lại.`,
        },
      });
    }
  }, ms);

  // Hủy timer khi response đã được gửi (dù thành công hay lỗi)
  res.on('finish',  () => clearTimeout(timer));
  res.on('close',   () => clearTimeout(timer));

  next();
};

module.exports = timeoutMiddleware;