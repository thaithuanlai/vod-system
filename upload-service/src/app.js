import express from 'express';
import { uploadVideo, initRabbitMQ } from './controllers/upload.controller.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Khởi tạo hàng đợi RabbitMQ khi ứng dụng khởi chạy
initRabbitMQ();

app.post('/upload', uploadVideo);

app.listen(PORT, () => {
    console.log(`[Upload Service] Toàn bộ hệ thống lõi đang vận hành tại port ${PORT}`);
});