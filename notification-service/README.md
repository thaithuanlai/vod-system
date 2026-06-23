# 🔔 Notification Service

Service **nhận event từ RabbitMQ** và **lưu thông báo vào Firestore**. Khi processing-service xử lý video xong, nó publish message vào queue `video-processed` — notification-service consume và lưu lại.

## Công nghệ
- Node.js 20 + Express
- amqplib (RabbitMQ client)
- Firebase Admin SDK (Firestore)
- Docker

## Cài đặt

```bash
cd notification-service
npm install
cp .env.example .env
# Điền RABBITMQ_URL, FIRESTORE_PROJECT_ID, credentials
```

## Chạy local

```bash
npm run dev   # development
npm start     # production
```

> ⚠️ Cần RabbitMQ đang chạy. Khởi động bằng Docker:
> ```bash
> docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
> ```

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `PORT` | Port HTTP | `3006` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account | `./service-account.json` |
| `FIRESTORE_PROJECT_ID` | GCP Project ID | `my-vod-project` |
| `RABBITMQ_URL` | RabbitMQ connection string | `amqp://admin:admin123@localhost:5672` |
| `RABBITMQ_VIDEO_PROCESSED_QUEUE` | Tên queue | `video-processed` |

## Luồng hoạt động

```
Processing Service
    │ publish message
    ▼
RabbitMQ queue: video-processed
    │ consume
    ▼
Notification Service
    ├── Log ra console
    └── Lưu vào Firestore collection "notifications"
```

## Payload message từ RabbitMQ

```json
{
  "videoId": "video001",
  "userId": "user001",
  "status": "READY",
  "message": "Video processed successfully"
}
```

## API Endpoints

### `GET /health`

### `GET /notifications/:userId`
Lấy danh sách notifications của user, sắp xếp mới nhất trước.

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "abc123",
      "videoId": "video001",
      "userId": "user001",
      "event": "video-processed",
      "status": "READY",
      "message": "Video processed successfully",
      "timestamp": "..."
    }
  ]
}
```

## Test bằng curl

```bash
# Health check
curl http://localhost:3006/health

# Lấy notifications của user
curl http://localhost:3006/notifications/user001
```

## Gửi test message vào RabbitMQ

```javascript
// test-publish.js - chạy: node test-publish.js
const amqp = require('amqplib');

async function main() {
  const conn = await amqp.connect('amqp://localhost:5672');
  const ch = await conn.createChannel();
  await ch.assertQueue('video-processed', { durable: true });

  const msg = {
    videoId: 'video001',
    userId: 'user001',
    status: 'READY',
    message: 'Video processed successfully'
  };

  ch.sendToQueue('video-processed', Buffer.from(JSON.stringify(msg)));
  console.log('Đã gửi message:', msg);

  setTimeout(() => { conn.close(); }, 500);
}

main();
```

## Build Docker

```bash
docker build -t notification-service ./notification-service
docker run -p 3006:3006 --env-file .env notification-service
```

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `ECONNREFUSED amqp://rabbitmq:5672` | RabbitMQ chưa chạy | Khởi động RabbitMQ hoặc chờ service retry tự động |
| `Firestore index required` | Thiếu composite index | Vào Firestore Console → Indexes → tạo index cho `userId` + `timestamp` |
| Consumer không nhận message | Channel bị ngắt | Service tự reconnect sau 5s, kiểm tra log |
