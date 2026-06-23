import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { uploadBufferToGCS } from '../services/gcs.service.js';
import { initRabbitMQ, publishToQueue } from '../services/queue.service.js';
import { createInitialMetadata } from '../services/video-metadata.service.js';

export { initRabbitMQ };

/**
 * Controller xử lý luồng upload video hoàn chỉnh:
 * T15 – Validate & nhận file qua multer
 * T16 – Upload buffer lên Google Cloud Storage
 * T17 – Publish message vào RabbitMQ
 * T18 – Tạo metadata ban đầu trên Video Service
 */
export const uploadVideo = (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        // --- ĐOẠN XỬ LÝ LỖI VALIDATION PHÁT SINH TỪ T15 ---
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ success: false, message: 'Payload Too Large: File vượt quá 500MB.' });
            }
            if (err.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({ success: false, message: `Bad Request: ${err.message}` });
            }
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Bad Request: Thiếu file tải lên.' });
        }

        try {
            // Giả lập lấy userId từ JWT Token (được API Gateway giải mã và truyền qua header)
            const userId = req.headers['x-user-id'] || 'user_default_123';

            console.log(`[Upload Flow] Bắt đầu xử lý file: ${req.file.originalname}`);

            // BƯỚC 1: Triển khai T16 - Đẩy dữ liệu lên Google Cloud Storage
            const gcsResult = await uploadBufferToGCS(req.file);

            // BƯỚC 2: Triển khai T18 - Đăng ký bản ghi Metadata ban đầu sang Video Service trước
            const titleDefault = req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')) || req.file.originalname;

            const metadataPayload = {
                userId,
                title: titleDefault,
                status: 'UPLOADING', // Trạng thái ban đầu bắt buộc theo đặc tả hệ thống
                gcsPath: gcsResult.gcsPath,
                createdAt: new Date().toISOString()
            };

            // Đồng bộ định danh videoId được sinh từ cơ sở dữ liệu hệ thống
            const videoId = await createInitialMetadata(metadataPayload);

            // BƯỚC 3: Triển khai T17 - Bắn message thông báo tác vụ vào RabbitMQ Broker
            const mqPayload = {
                videoId,
                gcsPath: gcsResult.gcsPath,
                originalName: gcsResult.originalName,
                userId,
                uploadedAt: metadataPayload.createdAt
            };

            await publishToQueue(mqPayload);

            // BƯỚC 4: Phản hồi thành công về phía Client (Đảm bảo tiêu chí Non-blocking)
            return res.status(201).json({
                success: true,
                message: 'Video đã được tải lên thành công và đưa vào hàng đợi xử lý.',
                data: {
                    videoId,
                    status: 'UPLOADING',
                    gcsUrl: gcsResult.gcsPath
                }
            });

        } catch (processError) {
            console.error(`[Upload Flow Critical Error] Trục trặc hệ thống: ${processError.message}`);
            return res.status(500).json({
                success: false,
                message: `Internal Server Error: Luồng xử lý thất bại do: ${processError.message}`
            });
        }
    });
};
