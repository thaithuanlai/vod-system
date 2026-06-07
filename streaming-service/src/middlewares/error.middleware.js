function errorMiddleware(err, req, res, next) {
  console.error('[Streaming Error]', err.message);
  if (!res.headersSent) {
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}

module.exports = errorMiddleware;
