# 🎬 Video Service

Service quản lý **metadata video** trong hệ thống VOD. Lưu trữ và truy vấn thông tin video qua **Google Firestore**.

## Công nghệ
- Node.js 20 + Express
- Firebase Admin SDK (Firestore Native Mode)
- Docker

## Cài đặt

```bash
cd video-service
npm install
cp .env.example .env
# Điền FIRESTORE_PROJECT_ID và đường dẫn service-account.json vào .env
```

## Chạy local

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `PORT` | Port chạy service | `3003` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Đường dẫn file service account | `./service-account.json` |
| `FIRESTORE_PROJECT_ID` | GCP Project ID | `my-vod-project` |

## API Endpoints

### `GET /health`
Kiểm tra service còn sống không.

**Response:**
```json
{ "success": true, "message": "Video Service is running", "port": 3003 }
```

---

### `GET /videos?userId=user001&limit=10`
Lấy danh sách video. Filter theo `userId`, giới hạn số lượng bằng `limit`.

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "video001",
      "title": "Demo Video",
      "status": "READY",
      "createdAt": "..."
    }
  ]
}
```

---

### `GET /videos/:id`
Lấy chi tiết một video.

**Response lỗi 404:**
```json
{ "success": false, "message": "Video không tìm thấy" }
```

---

### `POST /videos`
Tạo metadata video mới (gọi sau khi upload xong).

**Body:**
```json
{
  "videoId": "video001",
  "userId": "user001",
  "title": "Demo Video",
  "description": "Test",
  "status": "UPLOADING",
  "gcsPath": "raw-videos/video001.mp4"
}
```

---

### `PATCH /videos/:id`
Cập nhật trạng thái/thông tin video.

**Body (các trường cho phép):**
```json
{
  "status": "READY",
  "hlsUrl": "/stream/video001/master.m3u8",
  "gcsPath": "hls-outputs/video001/master.m3u8",
  "duration": 120,
  "processedAt": "2025-01-01T00:00:00Z"
}
```

---

### `DELETE /videos/:id`
Xóa document video khỏi Firestore.

---

## Test bằng curl

```bash
# Health check
curl http://localhost:3003/health

# Tạo video
curl -X POST http://localhost:3003/videos \
  -H "Content-Type: application/json" \
  -d '{"videoId":"v1","userId":"user001","title":"Test","status":"UPLOADING"}'

# Lấy danh sách
curl "http://localhost:3003/videos?userId=user001&limit=5"

# Cập nhật status
curl -X PATCH http://localhost:3003/videos/v1 \
  -H "Content-Type: application/json" \
  -d '{"status":"READY","hlsUrl":"/stream/v1/master.m3u8","duration":120}'

# Xóa
curl -X DELETE http://localhost:3003/videos/v1
```

## Build Docker

```bash
docker build -t video-service ./video-service
docker run -p 3003:3003 --env-file .env video-service
```

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `Could not load the default credentials` | Thiếu file service account | Kiểm tra `GOOGLE_APPLICATION_CREDENTIALS` |
| `Firestore chưa được khởi tạo` | `initFirestore()` chưa chạy | Đảm bảo gọi `initFirestore()` trước khi xử lý request |
| `Cannot order by field that is not being filtered on` | Firestore index chưa tạo | Tạo composite index trên Firestore Console |
