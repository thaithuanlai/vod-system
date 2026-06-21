# Hệ thống Lưu trữ và Phân phối Nội dung Video (VOD)
Kiến trúc Microservices + Google Cloud Platform

## Công nghệ sử dụng
- Backend: Node.js + Express
- Database: PostgreSQL 15 (Docker local)
- Frontend: React + Vite + TailwindCSS
- Container: Docker + Docker Compose
- Cloud: Google Cloud Platform

## Cấu trúc thư mục
vod-system/

├── .env

├── .gitignore

├── docker-compose.yml

├── README.md

├── infra/

│   ├── setup-gcp.sh

│   └── start-proxy.sh

├── services/

│   └── user-service/

│       ├── src/

│       │   ├── index.js

│       │   ├── routes/auth.js

│       │   ├── db/

│       │   │   ├── migrate.js

│       │   │   ├── seed.js

│       │   │   └── pool.js

│       │   └── middleware/auth.js

│       ├── package.json

│       └── .env.example

└── frontend/

├── src/

│   ├── pages/

│   ├── components/

│   ├── services/

│   └── hooks/

├── Dockerfile

└── nginx.conf

## Cách chạy project

### 1. Clone repo
```bash
git clone https://github.com/thaithuanlai/vod-system.git
cd vod-system
git checkout feature/linh
```

### 2. Tạo file .env
```bash
cp .env.example .env
# Điền thông tin database vào .env
```

### 3. Khởi động Database
```bash
docker-compose up -d
```

### 4. Chạy User Service
```bash
cd services/user-service
npm install
npm start
```

### 5. Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```

## Các Tasks

- [x] Task 1: PostgreSQL Database Setup (Docker)
- [x] Task 2: Database Schema & Migration
- [x] Task 3: API Đăng ký (/register)
- [ ] Task 4: API Đăng nhập & JWT (/login)
- [ ] Task 5: React App Setup (Vite)
- [ ] Task 6: Trang Register & Login
- [ ] Task 7: Dockerfile & Docker Compose

## Chi tiết Tasks đã hoàn thành

### Task 1: PostgreSQL Database Setup
- Docker PostgreSQL 15 chạy trên port 5432
- Database: `vod_users`, User: `vod_admin`
- Cấu hình qua `docker-compose.yml` và `.env`

### Task 2: Database Schema & Migration
- Bảng `users` với các cột:
  - `id` UUID PRIMARY KEY
  - `email` VARCHAR(255) UNIQUE NOT NULL
  - `password_hash` VARCHAR(255) NOT NULL
  - `username` VARCHAR(100) NOT NULL
  - `created_at` TIMESTAMP
  - `updated_at` TIMESTAMP
- Index trên cột `email`
- Seed data: 1 user test (`test@vod.com`)git add README.md

### Task 3: API Đăng ký (/register)
- Endpoint: `POST /api/auth/register`
- Validate email format, password tối thiểu 8 ký tự
- Hash password bằng bcrypt salt rounds=12
- Trả về user object không có password
- Status codes:
  - `201 Created` — Đăng ký thành công
  - `409 Conflict` — Email đã tồn tại
  - `400 Bad Request` — Dữ liệu không hợp lệ