import multer from 'multer';
import path from 'path';


const storage = multer.memoryStorage();


const ALLOWED_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv'];
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];


const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;


    if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mimeType)) {
        cb(null, true); 
    } else {

        const error = new Error('Định dạng file không hợp lệ. Chỉ chấp nhận mp4, avi, mov, mkv.');
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false); 
    }
};


export const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 
    }
}).single('video'); 