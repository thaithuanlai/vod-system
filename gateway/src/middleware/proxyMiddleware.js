const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const timeoutMiddleware = require('./timeoutMiddleware');
const ROUTES = require('../config/routes');





const createProxyErrorHandler = (serviceName) => (err, req, res) => {

  if (res.headersSent) return;

  const isConnRefused = err.code === 'ECONNREFUSED';
  const isTimeout     = err.code === 'ECONNRESET' || err.message?.includes('timeout');

  console.error(
    `[Proxy] ❌ ${serviceName} — ${err.code || err.message} — ${req.method} ${req.path}`
  );


  if (isConnRefused) {
    return res.status(503).json({
      success: false,
      error: {
        code:    'SERVICE_UNAVAILABLE',
        message: `${serviceName} hiện không khả dụng. Vui lòng thử lại sau.`,
      },
    });
  }

  if (isTimeout) {
    return res.status(503).json({
      success: false,
      error: {
        code:    'SERVICE_TIMEOUT',
        message: `${serviceName} không phản hồi. Vui lòng thử lại sau.`,
      },
    });
  }

  return res.status(502).json({
    success: false,
    error: {
      code:    'BAD_GATEWAY',
      message: `Lỗi kết nối đến ${serviceName}.`,
    },
  });
};






const createServiceProxy = (route) => {
  const serviceName = route.description.split('—')[0].trim();

  const proxy = createProxyMiddleware({
    target:       route.target,
    changeOrigin: true,    
    pathRewrite:  (path, req) => req.originalUrl, 

    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(
          `[Proxy] → ${serviceName} | ${req.method} ${req.path}`
        );
      },
      proxyRes: (proxyRes, req) => {
        console.log(
          `[Proxy] ← ${serviceName} | ${req.method} ${req.path} | ${proxyRes.statusCode}`
        );
      },
      error: createProxyErrorHandler(serviceName),
    },
  });



  return [timeoutMiddleware(route.timeout), proxy];
};





const registerProxyRoutes = (app) => {
  console.log('\n[Gateway] Đăng ký proxy routes:');

  ROUTES.forEach((route) => {
    const middlewares = createServiceProxy(route);


    app.use(route.prefix, ...middlewares);


    console.log(
      `  ${route.protected ? '🔒' : '🌐'} ${route.prefix.padEnd(12)} → ${route.target.padEnd(30)} (timeout: ${route.timeout / 1000}s)`
    );
  });

  console.log('');
};

module.exports = { registerProxyRoutes };