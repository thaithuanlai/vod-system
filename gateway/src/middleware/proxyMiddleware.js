const { createProxyMiddleware } = require('http-proxy-middleware');
const timeoutMiddleware = require('./timeoutMiddleware');
const ROUTES = require('../config/routes');

/**
 * Tạo error handler cho proxy
 * Xử lý khi service đích không chạy hoặc từ chối kết nối
 */
const createProxyErrorHandler = (serviceName) => (err, req, res) => {
  // Tránh gửi response khi đã gửi rồi
  if (res.headersSent) return;

  const isConnRefused = err.code === 'ECONNREFUSED';
  const isTimeout     = err.code === 'ECONNRESET' || err.message?.includes('timeout');

  console.error(
    `[Proxy] ❌ ${serviceName} — ${err.code || err.message} — ${req.method} ${req.path}`
  );

  // Phân biệt lỗi để trả thông báo phù hợp
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

/**
 * Tạo proxy middleware cho một service
 * @param {object} route - Route config từ routes.js
 * @returns {Function[]} Mảng middlewares: [timeout, proxy]
 */
const createServiceProxy = (route) => {
  const serviceName = route.description.split('—')[0].trim();

  const proxy = createProxyMiddleware({
    target:       route.target,
    changeOrigin: true,    // Đổi Host header thành target host

    // Ghi log mỗi lần proxy request
    on: {
      proxyReq: (proxyReq, req) => {
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

  // Trả về mảng: [timeoutMiddleware, proxyMiddleware]
  // timeout phải chạy TRƯỚC proxy để có thể cancel kịp thời
  return [timeoutMiddleware(route.timeout), proxy];
};

/**
 * Đăng ký tất cả routes vào Express app
 * @param {Express} app - Express application instance
 */
const registerProxyRoutes = (app) => {
  console.log('\n[Gateway] Đăng ký proxy routes:');

  ROUTES.forEach((route) => {
    const middlewares = createServiceProxy(route);

    // app.use(prefix, ...middlewares)
    app.use(route.prefix, ...middlewares);

    // Log routing table khi khởi động
    console.log(
      `  ${route.protected ? '🔒' : '🌐'} ${route.prefix.padEnd(12)} → ${route.target.padEnd(30)} (timeout: ${route.timeout / 1000}s)`
    );
  });

  console.log('');
};

module.exports = { registerProxyRoutes };