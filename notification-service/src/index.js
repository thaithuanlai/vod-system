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


app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Notification Service is running', port: PORT });
});


app.use('/notifications', notificationRoutes);


app.use(errorMiddleware);


async function main() {

  try {
    initFirestore();
    console.log('✅ Firestore initialized');
  } catch (err) {
    console.warn('⚠️ Firestore chưa khởi tạo (credentials placeholder?):', err.message);
  }


  try {
    await connectRabbitMQ();
    await startVideoProcessedConsumer();
  } catch (err) {
    console.error('❌ Lỗi khởi động consumer:', err.message);

  }


  app.listen(PORT, () => {
    console.log(`🔔 Notification Service chạy tại port ${PORT}`);
  });
}

main();
