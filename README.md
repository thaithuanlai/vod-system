<<<<<<< HEAD
# Hệ thống Lưu trữ và Phân phối Nội dung Video (VOD)
Kiến trúc Microservices + Google Cloud Platform

## Công nghệ sử dụng
| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL 15 |
| Frontend | React + Vite + TailwindCSS |
| Container | Docker + Docker Compose |
| Cloud | Google Cloud Platform |

## Yêu cầu môi trường
| Công cụ | Version | Mục đích |
|---|---|---|
| Docker Desktop | >= 24.x | Chạy containers |
| Node.js | >= 20.x | Chạy frontend dev |
| Git | >= 2.x | Version control |

## Cấu trúc thư mục
vod-system/

├── .env                          # Biến môi trường

├── .gitignore

├── docker-compose.yml            # Orchestrate toàn bộ services

├── README.md

├── infra/

│   ├── setup-gcp.sh

│   └── start-proxy.sh

├── services/

│   └── user-service/             # Backend Node.js

│       ├── src/

│       │   ├── index.js          # Entry point Express

│       │   ├── routes/

│       │   │   └── auth.js       # API /register, /login

│       │   ├── db/

│       │   │   ├── migrate.js    # Tạo bảng users

│       │   │   ├── seed.js       # Seed data

│       │   │   └── pool.js       # Kết nối PostgreSQL

│       │   └── middleware/

│       │       └── auth.js       # Verify JWT

│       ├── package.json

│       └── .env.example

└── frontend/                     # React + Vite

├── src/

│   ├── pages/

│   │   ├── Login.jsx         # Trang đăng nhập

│   │   ├── Register.jsx      # Trang đăng ký

│   │   └── Dashboard.jsx     # Trang chính sau login

│   ├── components/

│   ├── services/

│   │   └── api.js            # Axios config

│   └── hooks/

│       └── useAuth.js        # JWT localStorage logic

├── Dockerfile                # Multi-stage build

├── nginx.conf                # Nginx config

└── vite.config.js            # Proxy config

## Cách chạy project

### Cách 1 — Docker (Khuyến nghị)
```bash
# Clone repo
git clone https://github.com/thaithuanlai/vod-system.git
cd vod-system
git checkout feature/linh

# Khởi động toàn bộ hệ thống
docker-compose up -d --build

# Kiểm tra containers
docker ps
```

Truy cập:
- Frontend: http://localhost:80
- API: http://localhost:3001

### Cách 2 — Local Development
```bash
# Bước 1: Khởi động Database
docker-compose up -d postgres

# Bước 2: Chạy User Service
cd services/user-service
npm install
npm start

# Bước 3: Chạy Frontend (terminal mới)
cd frontend
npm install
npm run dev
```

Truy cập:
- Frontend: http://localhost:5173
- API: http://localhost:3001

## Biến môi trường
Tạo file `.env` ở thư mục root:
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=vod_users
DB_USER=vod_admin
DB_PASSWORD=Vod2024Secure
JWT_SECRET=vod_super_secret_key_2024
JWT_EXPIRES_IN=24h
```

## Tài khoản test
Email:    testlai@vod.com

Password: Password123

## API Endpoints
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /api/auth/register | Đăng ký tài khoản |
| POST | /api/auth/login | Đăng nhập + nhận JWT |

### POST /api/auth/register
```json
// Request
{
  "email": "user@example.com",
  "password": "Password123",
  "username": "username"
}

// Response 201
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-xx-xx"
  }
}
```

### POST /api/auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "Password123"
}

// Response 200
{
  "message": "Đăng nhập thành công",
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

## Các Tasks

- [x] Task 1: PostgreSQL Database Setup (Docker)
- [x] Task 2: Database Schema & Migration
- [x] Task 3: API Đăng ký (/register)
- [x] Task 4: API Đăng nhập & JWT (/login)
- [x] Task 5: React App Setup (Vite)
- [x] Task 6: Trang Register & Login
- [x] Task 7: Dockerfile & Docker Compose

## Chi tiết Tasks

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
- Seed data: 1 user test (`test@vod.com`)

### Task 3: API Đăng ký (/register)
- Endpoint: `POST /api/auth/register`
- Validate email format, password tối thiểu 8 ký tự
- Hash password bằng bcrypt salt rounds=12
- Trả về user object không có password
- Status codes:
  - `201 Created` — Đăng ký thành công
  - `409 Conflict` — Email đã tồn tại
  - `400 Bad Request` — Dữ liệu không hợp lệ

### Task 4: API Đăng nhập & JWT (/login)
- Endpoint: `POST /api/auth/login`
- Kiểm tra email tồn tại, so sánh bcrypt hash
- Sinh JWT token (payload: userId, email, exp: 24h)
- Không tiết lộ email có tồn tại hay không
- Status codes:
  - `200 OK` — Đăng nhập thành công + accessToken
  - `401 Unauthorized` — Sai credentials

### Task 5: Khởi tạo React App
- Vite + React, port 5173
- Cài: axios, react-router-dom, tailwindcss
- Cấu trúc: pages/ components/ services/ hooks/
- Proxy dev server → API port 3001

### Task 6: Trang Register & Login
- Trang /register: form đăng ký, validate, gọi API
- Trang /login: form đăng nhập, lưu JWT localStorage
- Redirect /dashboard sau login thành công
- Protected routes: chưa login → redirect /login
- Logout xóa token → redirect /login

### Task 7: Dockerfile Frontend & Docker Compose
- Dockerfile multi-stage: node:20-alpine build + nginx:alpine serve
- Nginx proxy /api đến user-service
- docker-compose.yml: postgres + user-service + frontend
- Frontend chạy trên port 80
- Image size < 100MB
=======
# 🎬 VOD System — Microservices + Google Cloud Platform

Hệ thống Video On Demand (VOD) xây dựng theo kiến trúc Microservices, triển khai trên Google Cloud Platform.

## 🏗️ Kiến trúc

```text
Client → API Gateway (3000)
├── User Service (3001)       - PostgreSQL
├── Upload Service (3002)     - Google Cloud Storage
├── Video Service (3003)      - Firestore
├── Processing Service (3004) - FFmpeg + GCS
├── Streaming Service (3005)  - GCS HLS
└── Notification Service (3006) - Firestore
↕
RabbitMQ (Message Queue)
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js + Vite + TailwindCSS |
| **Backend** | Node.js 20 + Express |
| **User DB** | Google Cloud SQL (PostgreSQL 15) |
| **Video Metadata** | Google Firestore |
| **Object Storage** | Google Cloud Storage (GCS) |
| **Message Queue** | RabbitMQ |
| **Video Processing** | FFmpeg (HLS) |
| **Containerization**| Docker + Docker Compose |
| **Deployment** | Google Cloud Run |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- Docker Desktop
- Google Cloud SDK (gcloud CLI)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/thaithuanlai/vod-system.git
cd vod-system

# 2. Cấu hình môi trường
cp .env.example .env
# Điền values vào .env

# 3. Khởi động tất cả services
docker-compose up --build
```

### Services URLs (local)
- **API Gateway:** http://localhost:3000
- **RabbitMQ Management:** http://localhost:15672

## 👥 Nhóm thực hiện

| Thành viên | Vai trò | Services |
|---|---|---|
| **Thai Thuan Lai (Lead)** | API Gateway + Integration | `gateway/` |
| **Che Linh Truong** | User Service + Frontend | `user-service/`, `frontend/` |
| **Trung Hau Nguyen** | Upload Service | `upload-service/` |
| **Tinh Nghia Nguyen** | Processing Service | `processing-service/` |
| **Thi Tuyet Nhi Nguyen** | Video/Stream/Notify | `video-service/`, `streaming-service/`, `notification-service/` |

## 📅 Deadline
* 25/06/2025

## 📖 Tài liệu
Xem chi tiết trong thư mục `docs/` hoặc Google Docs của nhóm.
>>>>>>> develop
