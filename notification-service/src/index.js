require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initFirestore } = require('./firebase');
const { connectRabbitMQ } = require('./rabbitmq');
const { startVideoProcessedConsumer } = require('./consumer/videoProcessed.consumer');
const notificationRoutes = require('./routes/notification.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Notification Service is running', port: PORT });
});

// Notification API
app.use('/notifications', notificationRoutes);

// Error handler
app.use(errorMiddleware);

// Khởi động service
async function main() {
  // 1. Kết nối Firestore
  try {
    initFirestore();
    console.log('✅ Firestore initialized');
  } catch (err) {
    console.warn('⚠️ Firestore chưa khởi tạo (credentials placeholder?):', err.message);
  }

  // 2. Kết nối RabbitMQ rồi bắt đầu consume
  try {
    await connectRabbitMQ();
    await startVideoProcessedConsumer();
  } catch (err) {
    console.error('❌ Lỗi khởi động consumer:', err.message);
    // Service vẫn chạy, chỉ không có consumer
  }

  // 3. Khởi động HTTP server
  app.listen(PORT, () => {
    console.log(`🔔 Notification Service chạy tại port ${PORT}`);
  });
}

main();
