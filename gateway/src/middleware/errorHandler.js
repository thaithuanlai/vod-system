


const errorHandler = (err, req, res, _next) => {

  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);


  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }


  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',

      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;