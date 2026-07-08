require('dotenv').config();
const pool = require('./pool');

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Đang chạy migration...');

    await client.query('BEGIN');


    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    console.log('  ✅ Extension uuid-ossp sẵn sàng');


    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
        email         VARCHAR(255)  UNIQUE NOT NULL,
        password_hash VARCHAR(255)  NOT NULL,
        username      VARCHAR(100)  NOT NULL,
        role          VARCHAR(20)   NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin')),
        is_active     BOOLEAN       NOT NULL DEFAULT true,
        avatar_url    TEXT,
        created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);
    console.log('  ✅ Bảng users đã tạo (hoặc đã tồn tại)');


    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  VARCHAR(255)  NOT NULL,
        expires_at  TIMESTAMPTZ   NOT NULL,
        created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        revoked_at  TIMESTAMPTZ
      );
    `);
    console.log('  ✅ Bảng refresh_tokens đã tạo (hoặc đã tồn tại)');


    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email
        ON users(email);

      CREATE INDEX IF NOT EXISTS idx_users_role
        ON users(role);

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
        ON refresh_tokens(user_id);

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
        ON refresh_tokens(expires_at)
        WHERE revoked_at IS NULL;
    `);
    console.log('  ✅ Indexes đã tạo');


    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'trg_users_updated_at'
        ) THEN
          CREATE TRIGGER trg_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END
      $$;
    `);
    console.log('  ✅ Trigger updated_at đã tạo');

    await client.query('COMMIT');

    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║   ✅  Migration hoàn tất thành công   ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');
    console.log('📋 Các bảng đã tạo:');
    console.log('   • users          — Tài khoản người dùng');
    console.log('   • refresh_tokens — JWT refresh token');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration thất bại, đã rollback:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();