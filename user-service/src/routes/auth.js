require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db/pool');


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

// ==========================================
// POST /api/auth/login — Đăng nhập
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Bước 1: Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email và password là bắt buộc'
      });
    }

    // Bước 2: Tìm user theo email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // Bước 3: Không tìm thấy user → 401
    // Không reveal email có tồn tại hay không
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Email hoặc password không đúng'
      });
    }

    const user = result.rows[0];

    // Bước 4: So sánh password với hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Email hoặc password không đúng'
      });
    }

    // Bước 5: Sinh JWT token
    const jwt = require('jsonwebtoken');

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server Error', message: 'JWT_SECRET chưa được cấu hình' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Bước 6: Trả về token
    return res.status(200).json({
      message: 'Đăng nhập thành công',
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('❌ Lỗi login:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Đã có lỗi xảy ra'
    });
  }
});

module.exports = router;