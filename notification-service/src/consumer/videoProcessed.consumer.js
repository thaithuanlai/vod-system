// Consumer lắng nghe queue "video-processed" từ RabbitMQ
const { getChannel } = require('../rabbitmq');
const { getDb } = require('../firebase');
const admin = require('firebase-admin');

const QUEUE = process.env.RABBITMQ_VIDEO_PROCESSED_QUEUE || 'video-processed';
const COLLECTION = 'notifications';

/**
 * Bắt đầu consume queue video-processed.
 * Mỗi khi nhận được message:
 *  1. Log ra console
 *  2. Lưu vào Firestore collection "notifications"
 *  3. Ack nếu thành công, Nack nếu lỗi
 */
async function startVideoProcessedConsumer() {
  const channel = getChannel();

  // Đảm bảo queue tồn tại (idempotent)
  await channel.assertQueue(QUEUE, { durable: true });

  // Chỉ nhận 1 message một lúc (fair dispatch)
  channel.prefetch(1);

  console.log(`[Consumer] ✅ Đang lắng nghe queue: ${QUEUE}`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const timestamp = new Date().toISOString();
    let payload;

    try {
      // Parse payload JSON
      payload = JSON.parse(msg.content.toString());
      console.log(`[Consumer] [${timestamp}] 📩 Nhận event:`, JSON.stringify(payload));

      const { videoId, userId, status, message } = payload;

      // Lưu notification vào Firestore
      const db = getDb();
      await db.collection(COLLECTION).add({
        videoId: videoId || '',
        userId: userId || '',
        event: 'video-processed',
        status: status || 'UNKNOWN',
        message: message || '',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[Consumer] [${timestamp}] ✅ Đã lưu notification cho video: ${videoId}`);

      // Ack message - báo RabbitMQ xử lý thành công
      channel.ack(msg);
    } catch (err) {
      console.error(`[Consumer] [${timestamp}] ❌ Lỗi xử lý message:`, err.message);

      // Nack và không requeue (tránh vòng lặp lỗi)
      channel.nack(msg, false, false);
    }
  });
}

module.exports = { startVideoProcessedConsumer };
