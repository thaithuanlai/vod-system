const jwt = require('jsonwebtoken');
const config = require('../config');






const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return { valid: true, payload, error: null };
  } catch (err) {

    if (err.name === 'TokenExpiredError') {
      return {
        valid: false,
        payload: null,
        error: 'Token đã hết hạn. Vui lòng đăng nhập lại.',
      };
    }
    if (err.name === 'JsonWebTokenError') {
      return {
        valid: false,
        payload: null,
        error: 'Token không hợp lệ.',
      };
    }
    if (err.name === 'NotBeforeError') {
      return {
        valid: false,
        payload: null,
        error: 'Token chưa có hiệu lực.',
      };
    }

    return {
      valid: false,
      payload: null,
      error: 'Xác thực thất bại.',
    };
  }
};







const extractToken = (authHeader) => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');


  if (parts.length !== 2) return null;
  if (parts[0].toLowerCase() !== 'bearer') return null;
  if (!parts[1] || parts[1].trim() === '') return null;

  return parts[1];
};

module.exports = { verifyToken, extractToken };