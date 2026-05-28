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