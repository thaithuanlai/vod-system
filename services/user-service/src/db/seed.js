const pool = require('./pool');
const bcrypt = require('bcrypt');

const seedUsers = async () => {
  try {
    console.log('🔄 Đang tạo seed data...');

    const passwordHash = await bcrypt.hash('Test1234', 12);

    const query = `
      INSERT INTO users (email, password_hash, username)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, username, created_at;
    `;

    const values = ['test@vod.com', passwordHash, 'testuser'];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      console.log('✅ Seed user tạo thành công:');
      console.table(result.rows);
    } else {
      console.log('⚠️ User đã tồn tại, bỏ qua seed.');
    }
  } catch (err) {
    console.error('❌ Lỗi seed:', err.message);
  } finally {
    await pool.end();
  }
};

seedUsers();