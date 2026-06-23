<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# 🖥️ VOD Frontend

Giao diện người dùng cho hệ thống VOD, xây dựng bằng **React + Vite + TailwindCSS**.

## Công nghệ
- React 18 + React Router v6
- Vite 5
- TailwindCSS 3
- hls.js (HLS video player)

## Cài đặt

```bash
cd frontend
npm install
cp .env.example .env
# Chỉnh VITE_VIDEO_SERVICE_URL, VITE_STREAMING_SERVICE_URL nếu cần
```

## Chạy local

```bash
npm run dev
# Mở http://localhost:5173
```

## Build production

```bash
npm run build
# Output ra thư mục dist/
```

## Biến môi trường

| Biến | Mô tả | Mặc định |
|---|---|---|
| `VITE_API_BASE_URL` | URL API Gateway | `http://localhost:3000` |
| `VITE_VIDEO_SERVICE_URL` | URL Video Service | `http://localhost:3003` |
| `VITE_STREAMING_SERVICE_URL` | URL Streaming Service | `http://localhost:3005` |

## Trang và Component

### Pages
| Trang | Route | Mô tả |
|---|---|---|
| `Videos.jsx` | `/videos` | Danh sách video, auto-refresh khi có video đang xử lý |
| `VideoDetail.jsx` | `/videos/:id` | Chi tiết video + HLS player |

### Components
| Component | Mô tả |
|---|---|
| `Navbar.jsx` | Thanh điều hướng |
| `VideoCard.jsx` | Card hiển thị một video trong danh sách |
| `StatusBadge.jsx` | Badge trạng thái (UPLOADING/PROCESSING/READY/ERROR) |
| `HlsPlayer.jsx` | Video player tích hợp hls.js, hỗ trợ quality selector |

### Services
| File | Mô tả |
|---|---|
| `videoApi.js` | Hàm gọi API: `fetchVideos()`, `fetchVideoById()` |

## Tính năng chính (T36 + T37)

### T36 - Danh sách video (`/videos`)
- Hiển thị danh sách video của user với thumbnail, title, status, ngày tạo
- Status badge màu sắc khác nhau cho từng trạng thái
- **Auto-refresh mỗi 10 giây** khi có video đang PROCESSING/UPLOADING
- Nút **Load More** để tải thêm video
- Đầy đủ loading / error / empty state
- Click vào card → chuyển sang `/videos/:id`

### T37 - Video Player (`/videos/:id`)
- Tích hợp **hls.js** cho HLS streaming
- Fallback về native video cho Safari (hỗ trợ HLS sẵn)
- **Quality selector** tự động lấy từ hls.js levels
- `hls.destroy()` cleanup khi unmount
- Hiển thị trạng thái tương ứng khi video chưa READY

## Build Docker

```bash
docker build -t vod-frontend ./frontend
docker run -p 8080:80 vod-frontend
# Mở http://localhost:8080
```

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `CORS error` khi gọi API | Video/Streaming service chưa bật CORS | Các service đã cấu hình `cors()`, kiểm tra service có đang chạy không |
| Video không phát được | HLS files chưa có trên GCS | Chạy processing-service xử lý video trước |
| Trang trắng sau `npm run build` | React Router cần cấu hình nginx | Dùng Dockerfile đã có, nginx đã cấu hình `try_files` |
>>>>>>> develop
