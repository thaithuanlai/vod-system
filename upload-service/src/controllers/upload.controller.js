import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { uploadBufferToGCS } from '../services/gcs.service.js';
import { initRabbitMQ, publishToQueue } from '../services/queue.service.js';
import { createInitialMetadata } from '../services/video-metadata.service.js';

export { initRabbitMQ };








export const uploadVideo = (req, res) => {
    uploadMiddleware(req, res, async (err) => {

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

            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized: Thiếu thông tin user.' });
            }

            console.log(`[Upload Flow] Bắt đầu xử lý file: ${req.file.originalname}`);


            const gcsResult = await uploadBufferToGCS(req.file);


            const titleDefault = req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')) || req.file.originalname;

            const metadataPayload = {
                userId,
                title: titleDefault,
                status: 'UPLOADING', 
                gcsPath: gcsResult.gcsPath,
                createdAt: new Date().toISOString()
            };


            const videoId = await createInitialMetadata(metadataPayload);


            const mqPayload = {
                videoId,
                gcsPath: gcsResult.gcsPath,
                filename: gcsResult.gcsPath.split('/').pop(), 
                originalName: gcsResult.originalName,
                userId,
                uploadedAt: metadataPayload.createdAt
            };

            await publishToQueue(mqPayload);


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
