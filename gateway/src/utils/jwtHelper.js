const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Giải mã và xác thực JWT token
 * @param {string} token - JWT token (không có prefix "Bearer ")
 * @returns {{ valid: boolean, payload: object|null, error: string|null }}
 */
const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return { valid: true, payload, error: null };
  } catch (err) {
    // Phân biệt rõ từng loại lỗi để trả message cụ thể cho client
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
    // Lỗi không xác định
    return {
      valid: false,
      payload: null,
      error: 'Xác thực thất bại.',
    };
  }
};

/**
 * Trích xuất token từ Authorization header
 * Header format: "Bearer eyJhbGci..."
 * @param {string} authHeader - Giá trị của header Authorization
 * @returns {string|null} - Token string hoặc null nếu không hợp lệ
 */
const extractToken = (authHeader) => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');

  // Phải có đúng 2 phần: "Bearer" và token
  if (parts.length !== 2) return null;
  if (parts[0].toLowerCase() !== 'bearer') return null;
  if (!parts[1] || parts[1].trim() === '') return null;

  return parts[1];
};

module.exports = { verifyToken, extractToken };