require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initFirestore } = require('./firebase');
const videoRoutes = require('./routes/video.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Khởi tạo Firestore
initFirestore();
console.log('✅ Firestore initialized');

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Video Service is running', port: PORT });
});

app.use('/videos', videoRoutes);

// Error handler (phải đặt cuối cùng)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🎬 Video Service chạy tại port ${PORT}`);
});
