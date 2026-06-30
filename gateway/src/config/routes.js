/**
 * Route Configuration Table
 *
 * Định nghĩa mapping: path prefix → target service
 *
 * Cấu trúc mỗi route:
 * {
 *   prefix:     Path prefix client gọi vào Gateway
 *   target:     URL của service đích (từ env hoặc default local)
 *   protected:  true = cần JWT | false = public
 *   rewrite:    true = xóa prefix trước khi forward
 *   timeout:    Milliseconds chờ tối đa (default 30000)
 *   description: Ghi chú
 * }
 */

const config = require('./index');

const ROUTES = [
  // ─── USER SERVICE (/auth/*) ─────────────────────────────
  {
    prefix:      '/auth',
    target:      config.services.user,
    protected:   false,      // Login/Register không cần JWT
    rewrite:     false,      // Giữ nguyên path: /auth/login → /auth/login
    timeout:     15000,      // 15s đủ cho auth operations
    description: 'User Service — Register, Login, Profile',
  },

  // ─── UPLOAD SERVICE (/upload/*) ─────────────────────────
  {
    prefix:      '/upload',
    target:      config.services.upload,
    protected:   true,       // Phải đăng nhập mới upload được
    rewrite:     false,
    timeout:     120000,     // 120s vì upload file lớn mất thời gian
    description: 'Upload Service — Video Upload to GCS',
  },

  // ─── VIDEO SERVICE (/videos/*) ──────────────────────────
  {
    prefix:      '/videos',
    target:      config.services.video,
    protected:   true,
    rewrite:     false,
    timeout:     30000,
    description: 'Video Service — Metadata CRUD',
  },

  // ─── STREAMING SERVICE (/stream/*) ──────────────────────
  {
    prefix:      '/stream',
    target:      config.services.streaming,
    protected:   false,
    rewrite:     false,
    timeout:     30000,
    description: 'Streaming Service — HLS Playlist & Segments',
  },

  // ─── NOTIFICATION SERVICE (/notify/*) ───────────────────
  {
    prefix:      '/notify',
    target:      config.services.notification,
    protected:   true,
    rewrite:     false,
    timeout:     10000,
    description: 'Notification Service — Events & Logs',
  },
];

module.exports = ROUTES;