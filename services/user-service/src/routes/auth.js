const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

// Kết nối PostgreSQL trực tiếp
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'vod_users',
  user: process.env.DB_USER || 'vod_admin',
  password: process.env.DB_PASSWORD || 'Vod2024Secure',
});

// ==========================================
// POST /api/auth/register — Đăng ký tài khoản
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Bước 1: Validate input
    if (!email || !password || !username) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email, password và username là bắt buộc'
      });
    }

    // Bước 2: Validate format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email không hợp lệ'
      });
    }

    // Bước 3: Validate password tối thiểu 8 ký tự
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password phải có ít nhất 8 ký tự'
      });
    }

    // Bước 4: Kiểm tra email đã tồn tại chưa
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email đã được sử dụng'
      });
    }

    // Bước 5: Hash password với bcrypt salt=12
    const passwordHash = await bcrypt.hash(password, 12);

    // Bước 6: Lưu user vào database
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at`,
      [email, passwordHash, username]
    );

    const newUser = result.rows[0];

    // Bước 7: Trả về user (không có password)
    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('❌ Lỗi register:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Đã có lỗi xảy ra'
    });
  }
});

module.exports = router;