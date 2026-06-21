const pool = require('./pool');

const createUsersTable = async () => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      username      VARCHAR(100) NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  try {
    console.log('🔄 Đang chạy migration...');
    await pool.query(query);
    console.log('✅ Tạo bảng users thành công!');
    console.log('✅ Index trên email đã tạo!');
  } catch (err) {
    console.error('❌ Lỗi migration:', err.message);
  } finally {
    await pool.end();
  }
};

createUsersTable();