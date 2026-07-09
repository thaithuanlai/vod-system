const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, role, is_active, avatar_url, created_at, updated_at
       FROM users ORDER BY created_at DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Lỗi list users:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Đã có lỗi xảy ra' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    if (role !== undefined && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Bad Request', message: 'role không hợp lệ' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'Không có trường nào để cập nhật' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, email, username, role, is_active, avatar_url, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Không tìm thấy user' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ Lỗi update user:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Đã có lỗi xảy ra' });
  }
});

module.exports = router;
