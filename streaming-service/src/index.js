require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initStorage } = require('./storage');
const streamRoutes = require('./routes/stream.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3005;

// CORS cho phép player web gọi được
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'Content-Type'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Content-Type'],
}));

// Khởi tạo GCS
initStorage();
console.log('✅ GCS Storage initialized, bucket:', process.env.GCS_BUCKET_NAME);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Streaming Service is running', port: PORT });
});

// Stream routes
app.use('/stream', streamRoutes);

// Error handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`📡 Streaming Service chạy tại port ${PORT}`);
});
