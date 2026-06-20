import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Khởi tạo đối tượng Storage từ thư viện của Google Cloud
// Hệ thống sẽ tự động cấu hình qua biến môi trường GOOGLE_APPLICATION_CREDENTIALS trên Cloud Run
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;

/**
 * Hàm xử lý upload file từ bộ nhớ RAM (Buffer) lên GCS Bucket
 * @param {Object} fileObject - Đối tượng file nhận từ multer (req.file)
 * @returns {Promise<Object>} - Trả về thông tin đường dẫn file trên Cloud
 */
export const uploadBufferToGCS = async (fileObject) => {
    if (!bucketName) {
        throw new Error("Cấu hình thiếu GCS_BUCKET_NAME trong biến môi trường.");
    }

    const bucket = storage.bucket(bucketName);

    // Tạo tên file duy nhất bằng UUID và giữ lại phần mở rộng (extension) nguyên bản
    const fileExtension = fileObject.originalname.split('.').pop();
    const uniqueFileName = `raw-videos/${uuidv4()}.${fileExtension}`;

    const blob = bucket.file(uniqueFileName);

    // Cấu hình Metadata lưu trữ đi kèm file trên Cloud Storage theo yêu cầu T16
    const metadata = {
        contentType: fileObject.mimetype,
        metadata: {
            originalName: fileObject.originalname,
            size: fileObject.size.toString(),
            mimeType: fileObject.mimetype
        }
    };

    // Khởi tạo luồng ghi (Write Stream) để đẩy buffer lên GCS
    return new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream({
            metadata: metadata,
            resumable: false // Tắt chế độ resumable vì dung lượng qua buffer RAM thường tối ưu ghi thẳng
        });

        blobStream.on('error', (err) => {
            reject(new Error(`GCS Upload Fail: ${err.message}`));
        });

        blobStream.on('finish', () => {
            // Định dạng Cloud Storage URL chuẩn: gs://[bucket-name]/[file-path]
            const gcsPath = `gs://${bucketName}/${uniqueFileName}`;
            resolve({
                gcsPath,
                fileName: uniqueFileName,
                originalName: fileObject.originalname
            });
        });

        // Đổ dữ liệu nhị phân từ RAM vào luồng ghi để truyền tải
        blobStream.end(fileObject.buffer);
    });
};