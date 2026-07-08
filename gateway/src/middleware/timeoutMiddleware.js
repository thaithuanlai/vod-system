







const timeoutMiddleware = (ms) => (req, res, next) => {

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


  res.on('finish',  () => clearTimeout(timer));
  res.on('close',   () => clearTimeout(timer));

  next();
};

module.exports = timeoutMiddleware;