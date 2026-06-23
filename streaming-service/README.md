# 📡 Streaming Service

Service phục vụ **HLS video streaming** từ Google Cloud Storage. Đọc file `.m3u8` và `.ts` từ GCS rồi stream về client.

## Công nghệ
- Node.js 20 + Express
- @google-cloud/storage SDK
- Docker

## Cài đặt

```bash
cd streaming-service
npm install
cp .env.example .env
# Điền GCS_BUCKET_NAME và credentials vào .env
```

## Chạy local

```bash
npm run dev   # development
npm start     # production
```

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `PORT` | Port chạy service | `3005` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Đường dẫn service account | `./service-account.json` |
| `GCS_BUCKET_NAME` | Tên bucket GCS | `vod-videos-my-project` |
| `GCS_HLS_PREFIX` | Folder chứa HLS output | `hls-outputs` |

## Cấu trúc file trên GCS

```
hls-outputs/
└── {videoId}/
    ├── master.m3u8
    ├── 360p/
    │   ├── playlist.m3u8
    │   ├── seg000.ts
    │   └── seg001.ts
    ├── 720p/
    │   ├── playlist.m3u8
    │   └── ...
    └── 1080p/
        ├── playlist.m3u8
        └── ...
```

## API Endpoints

### `GET /health`

### `GET /stream/:videoId/master.m3u8`
Trả về master playlist HLS.

**MIME type:** `application/vnd.apple.mpegurl`

---

### `GET /stream/:videoId/:quality/playlist.m3u8`
Trả về playlist theo chất lượng (360p, 720p, 1080p).

---

### `GET /stream/:videoId/:quality/:segment`
Trả về video segment `.ts`.

**MIME type:** `video/mp2t`

---

## Test bằng curl

```bash
# Health
curl http://localhost:3005/health

# Lấy master playlist (cần videoId đã xử lý xong trên GCS)
curl http://localhost:3005/stream/video001/master.m3u8

# Lấy playlist 720p
curl http://localhost:3005/stream/video001/720p/playlist.m3u8
```

## Dùng với hls.js

```javascript
import Hls from 'hls.js';
const hls = new Hls();
hls.loadSource('http://localhost:3005/stream/video001/master.m3u8');
hls.attachMedia(videoElement);
```

## Build Docker

```bash
docker build -t streaming-service ./streaming-service
docker run -p 3005:3005 --env-file .env streaming-service
```

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `404` khi gọi stream | File chưa tồn tại trên GCS | Kiểm tra processing-service đã chạy xong chưa |
| `CORS error` trên trình duyệt | CORS chưa cấu hình đúng | Đã cấu hình sẵn `origin: '*'` |
| `GCS timeout` | Kết nối GCS chậm | Kiểm tra credentials và network |
