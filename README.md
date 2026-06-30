# 🎬 VOD System — Hệ thống Lưu trữ và Phân phối Nội dung Video
Kiến trúc Microservices triển khai trên Google Cloud Platform.

## 🏗️ Kiến trúc Hệ thống
Hệ thống được chia thành 8 Microservices giao tiếp qua API Gateway và Message Queue (RabbitMQ).

```text
Client (React) → API Gateway (:3000)
├── User Service (:3001)       - PostgreSQL (Quản lý User, Auth JWT)
├── Upload Service (:3002)     - GCS (Nhận file raw upload)
├── Video Service (:3003)      - Firestore (CRUD Metadata Video)
├── Processing Service (:3004) - FFmpeg + GCS (Worker: Transcode HLS đa độ phân giải)
├── Streaming Service (:3005)  - GCS (Phân phối luồng HLS phẳng)
└── Notification Service (:3006) - Firestore (Thông báo realtime)
↕
RabbitMQ (Message Broker điều phối tiến trình Upload -> Processing)
```

## 🛠️ Công nghệ sử dụng
| Lớp (Layer) | Công nghệ |
|---|---|
| **Frontend** | React.js + Vite + TailwindCSS |
| **Backend** | Node.js 20 + Express |
| **Database** | PostgreSQL (User) + Google Firestore (Video/NoSQL) |
| **Storage** | Google Cloud Storage (GCS) |
| **Message Queue** | RabbitMQ |
| **Video Processing** | FFmpeg (chuyển đổi m3u8/ts) |
| **Deployment** | Docker Compose (Local) / Google Cloud Run (GCP Production) |

## 🚀 Hướng dẫn Cài đặt & Chạy Local cho Nhóm

### 1. Yêu cầu môi trường (Prerequisites)
- [Node.js](https://nodejs.org/en) (>= 20.x)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- File `credentials.json` (Service Account GCP có quyền Storage Admin & Datastore User)

### 2. Cấu hình biến môi trường (.env)
Mở terminal tại thư mục gốc (`vod-system`) và sao chép file `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Mở file `.env` và điền đầy đủ các thông tin:
- **GCP Credentials:** Trỏ đường dẫn tuyệt đối tới file `credentials.json` (Để chạy Docker thì nên mount file này vào trong container, xem `docker-compose.yml`).
- **Project ID, Bucket Name** của dự án GCP.
- **RabbitMQ URL** (Mặc định nếu chạy docker: `amqp://admin:admin@rabbitmq:5672`).
- **Postgres DB Config** (Mặc định dùng chung với Docker network).

### 3. Chạy toàn bộ hệ thống bằng Docker Compose
Đây là cách nhanh nhất để khởi động toàn bộ hệ thống (8 services + PostgreSQL + RabbitMQ) bằng một lệnh duy nhất:
```bash
# Xoá cache cũ (nếu có) và build lại toàn bộ image
docker-compose build --no-cache

# Khởi động ẩn dưới nền
docker-compose up -d
```

**Các cổng (Ports) đang mở ở Local:**
- **Frontend Web:** [http://localhost:5173](http://localhost:5173) (Hoặc tuỳ cấu hình Nginx trong Docker của Frontend)
- **API Gateway:** [http://localhost:3000](http://localhost:3000) (Tất cả gọi API qua đây)
- **RabbitMQ Management UI:** [http://localhost:15672](http://localhost:15672) (user: `admin`, pass: `admin`)
- **Postgres Database:** `5432`

Để dừng và xoá toàn bộ containers:
```bash
docker-compose down
```

## ☁️ Hướng dẫn Triển khai lên Google Cloud Platform (Production)

Hệ thống đã được thiết kế chuẩn hoá để chạy Serverless trên **Google Cloud Run**.

**Bước 1:** Cấu hình GCP CLI & Xác thực
```bash
gcloud auth login
gcloud config set project [PROJECT_ID]
```

**Bước 2:** Build và Push Image lên Artifact Registry
Ví dụ đối với `streaming-service`:
```bash
cd streaming-service
gcloud builds submit --tag asia-southeast1-docker.pkg.dev/[PROJECT_ID]/vod-docker-repo/streaming-service:latest .
```

**Bước 3:** Deploy lên Cloud Run
```bash
gcloud run deploy streaming-service \
  --image asia-southeast1-docker.pkg.dev/[PROJECT_ID]/vod-docker-repo/streaming-service:latest \
  --region asia-southeast1 \
  --allow-unauthenticated
```
*(⚠️ Lưu ý cực kỳ quan trọng: `processing-service` cần chạy chế độ Background Worker. Khi deploy nhớ bắt buộc thêm cờ `--no-cpu-throttling` và cấu hình bộ nhớ `--memory=2Gi` để FFmpeg không bị văng OOM).*

**Bước 4:** Cập nhật biến môi trường cho Frontend
Khi deploy Frontend, cần truyền URL của API Gateway sản xuất (Production Gateway) vào biến môi trường trong lúc Build:
```bash
cd frontend
gcloud builds submit --config=cloudbuild.yaml --substitutions=_API_GATEWAY_URL="https://[PROD_GATEWAY_URL]"
```

## 👥 Nhóm thực hiện

| Thành viên | Vai trò | Services Phụ trách |
|---|---|---|
| **Thai Thuan Lai (Lead)** | System Architect, API Gateway | `gateway/`, Setup GCP Hạ tầng |
| **Che Linh Truong** | Auth, Database PostgreSQL, Frontend UI | `user-service/`, `frontend/` |
| **Trung Hau Nguyen** | Storage API, Nhận file Raw upload | `upload-service/` |
| **Tinh Nghia Nguyen** | FFmpeg Worker (Background Transcoding) | `processing-service/` |
| **Thi Tuyet Nhi Nguyen**| HLS Streaming (Cấu trúc phẳng), Firestore Metadata, Server-Sent Events | `video-service/`, `streaming-service/`, `notification-service/` |

---
*VOD System 2025.*
