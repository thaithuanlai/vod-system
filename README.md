# Hệ thống Lưu trữ và Phân phối Nội dung Video (VOD)
Kiến trúc Microservices + Google Cloud Platform

## Công nghệ sử dụng
- Backend: Node.js + Express
- Database: PostgreSQL 15
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

│ ├── setup-gcp.sh 

│ └── start-proxy.sh 

├── services/ 

│ └── user-service/ 

│ ├── src/ 

│ │ ├── index.js 

│ │ ├── routes/auth.js 

│ │ ├── db/ 

│ │ │ ├── migrate.js 

│ │ │ ├── seed.js 

│ │ │ └── pool.js 

│ │ └── middleware/auth.js 

│ ├── package.json 

│ └── .env.example 

└── frontend/ 

├── src/ 

│ ├── pages/ 

│ ├── components/ 

│ ├── services/ 

│ └── hooks/ 

├── Dockerfile 

└── nginx.conf

## Cách chạy project

### 1. Clone repo
```bash
git clone https://github.com/truonglinh798021-crypto/vod-system.git
cd vod-system
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
- [ ] Task 2: Database Schema & Migration
- [ ] Task 3: API Đăng ký (/register)
- [ ] Task 4: API Đăng nhập & JWT (/login)
- [ ] Task 5: React App Setup (Vite)
- [ ] Task 6: Trang Register & Login
- [ ] Task 7: Dockerfile & Docker Compose