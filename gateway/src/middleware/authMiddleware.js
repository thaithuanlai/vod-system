const { verifyToken, extractToken } = require('../utils/jwtHelper');

/**
 * Danh sách routes KHÔNG cần xác thực JWT
 * Format: { method: 'POST', path: '/auth/login' }
 * hoặc dùng prefix để skip toàn bộ path bắt đầu bằng /auth
 */
const PUBLIC_ROUTES = [
  { method: 'POST', path: '/auth/register' },
  { method: 'POST', path: '/auth/login' },
  { method: 'GET',  path: '/health' },
  { method: 'GET',  path: '/api/health' },
];

/**
 * Kiểm tra route hiện tại có phải public không
 * @param {string} method - HTTP method (GET, POST, ...)
 * @param {string} path   - URL path (/auth/login, ...)
 * @returns {boolean}
 */
const isPublicRoute = (method, path) => {
  // Kiểm tra exact match trong PUBLIC_ROUTES
  const isExactMatch = PUBLIC_ROUTES.some(
    (route) =>
      route.method === method.toUpperCase() &&
      path === route.path
  );
  if (isExactMatch) return true;

  // Tất cả routes bắt đầu bằng /auth/ đều public
  // (Phòng trường hợp thêm route auth mới sau này)
  if (path.startsWith('/auth/')) return true;

  // HLS stream routes (video playback) phải là public
  if (path.startsWith('/stream/')) return true;

  return false;
};

/**
 * JWT Authentication Middleware
 *
 * Luồng xử lý:
 * 1. Kiểm tra route có phải public → bỏ qua nếu có
 * 2. Trích xuất token từ Authorization header
 * 3. Verify token với JWT secret
 * 4. Gắn user info vào request headers để services downstream dùng
 * 5. Gọi next() để tiếp tục xử lý
 */
const authMiddleware = (req, res, next) => {
  const { method, path } = req;

  // ─── Bước 1: Bỏ qua public routes ──────────────────────
  if (isPublicRoute(method, path)) {
    return next();
  }

  // ─── Bước 2: Trích xuất token ───────────────────────────
  const token = extractToken(req.headers['authorization']);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Yêu cầu xác thực. Vui lòng đăng nhập.',
      },
    });
  }

  // ─── Bước 3: Verify token ───────────────────────────────
  const { valid, payload, error } = verifyToken(token);

  if (!valid) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: error,
      },
    });
  }

  // ─── Bước 4: Gắn user info vào request ─────────────────
  // Gắn vào req.user để dùng trong cùng gateway
  req.user = {
    id:    payload.userId || payload.id,
    email: payload.email,
    role:  payload.role || 'user',
  };

  // Gắn vào headers để forward xuống các services phía sau
  // Services downstream đọc headers này thay vì verify JWT lại
  req.headers['x-user-id']    = String(req.user.id);
  req.headers['x-user-email'] = req.user.email;
  req.headers['x-user-role']  = req.user.role;

  // Xóa Authorization header gốc — services không cần verify JWT
  // (Tùy chọn: giữ lại nếu services cần verify độc lập)
  // delete req.headers['authorization'];

  // Log để debug (chỉ ở development)
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Auth] ✅ User authenticated: ${req.user.email} → ${method} ${path}`
    );
  }

  // ─── Bước 5: Tiếp tục xử lý ─────────────────────────────
  next();
};

module.exports = authMiddleware;