
function errorMiddleware(err, req, res, next) {
  console.error('[Unhandled Error]', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
}

module.exports = errorMiddleware;
