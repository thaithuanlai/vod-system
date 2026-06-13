import multer from 'multer';
import path from 'path';

// 1. Cấu hình Memory Storage - File sẽ được lưu trong RAM dưới dạng Buffer
const storage = multer.memoryStorage();

// 2. Định nghĩa danh sách các định dạng video được phép (MIME types và Extensions)
const ALLOWED_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv'];
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];

// 3. Hàm lọc file (File Filter) để kiểm tra định dạng
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    // Kiểm tra xem extension và mimeType có nằm trong danh sách cho phép không
    if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mimeType)) {
        cb(null, true); // Chấp nhận file
    } else {
        // Tạo một lỗi tùy chỉnh để xử lý ở tầng Express Error Handler
        const error = new Error('Định dạng file không hợp lệ. Chỉ chấp nhận mp4, avi, mov, mkv.');
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false); // Từ chối file
    }
};

// 4. Khởi tạo cấu hình multer hoàn chỉnh
export const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // Giới hạn kích thước: 500MB quy đổi ra Bytes
    }
}).single('video'); // 'video' là key (fieldname) mà Client phải gửi lên trong Form-Data