const { verifyToken, extractToken } = require('../utils/jwtHelper');






const PUBLIC_ROUTES = [
  { method: 'POST', path: '/auth/register' },
  { method: 'POST', path: '/auth/login' },
  { method: 'GET',  path: '/health' },
  { method: 'GET',  path: '/api/health' },
];







const isPublicRoute = (method, path) => {

  const isExactMatch = PUBLIC_ROUTES.some(
    (route) =>
      route.method === method.toUpperCase() &&
      path === route.path
  );
  if (isExactMatch) return true;



  if (path.startsWith('/auth/')) return true;


  if (path.startsWith('/stream/')) return true;

  return false;
};











const authMiddleware = (req, res, next) => {
  const { method, path } = req;


  if (isPublicRoute(method, path)) {
    return next();
  }


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



  req.user = {
    id:    payload.userId || payload.id,
    email: payload.email,
    role:  payload.role || 'user',
  };



  req.headers['x-user-id']    = String(req.user.id);
  req.headers['x-user-email'] = req.user.email;
  req.headers['x-user-role']  = req.user.role;






  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Auth] ✅ User authenticated: ${req.user.email} → ${method} ${path}`
    );
  }


  next();
};

module.exports = authMiddleware;