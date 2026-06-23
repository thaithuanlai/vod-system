const morgan = require('morgan');

// Format log tùy chỉnh: rõ ràng, dễ đọc
// Ví dụ output:
// [2025-05-25 10:30:45] POST /auth/login 200 45ms - 128b
const customFormat = '[:date[iso]] :method :url :status :response-time ms - :res[content-length]b';

// Dev: màu sắc, chi tiết
// Production: format chuẩn, không màu
const logger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : customFormat
);

module.exports = logger;