require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcrypt');

const SEED_USERS = [
  {
    email:    'admin@vod.com',
    password: 'Admin1234',
    username: 'admin',
    role:     'admin',
  },
  {
    email:    'test@vod.com',
    password: 'Test1234',
    username: 'testuser',
    role:     'user',
  },
];

const seedUsers = async () => {
  try {
    console.log('🔄 Đang tạo seed data...');

    const results = [];

    for (const userData of SEED_USERS) {
      const passwordHash = await bcrypt.hash(userData.password, 12);

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, username, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, email, username, role, created_at`,
        [userData.email, passwordHash, userData.username, userData.role]
      );

      if (result.rows.length > 0) {
        results.push(result.rows[0]);
        console.log(`  ✅ Tạo user: ${userData.email} (role: ${userData.role})`);
      } else {
        console.log(`  ⚠️  Đã tồn tại: ${userData.email}, bỏ qua`);
      }
    }

    if (results.length > 0) {
      console.log('');
      console.log('📋 Seed users thành công:');
      console.table(results.map(u => ({
        id:       u.id,
        email:    u.email,
        username: u.username,
        role:     u.role,
      })));
    }

    console.log('');
    console.log('🔑 Thông tin đăng nhập test:');
    console.log('   Admin : admin@vod.com / Admin1234');
    console.log('   User  : test@vod.com  / Test1234');

  } catch (err) {
    console.error('❌ Lỗi seed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedUsers();