
const { getChannel } = require('../rabbitmq');
const { getDb } = require('../firebase');
const admin = require('firebase-admin');

const QUEUE = process.env.RABBITMQ_VIDEO_PROCESSED_QUEUE || 'video-processed';
const COLLECTION = 'notifications';








async function startVideoProcessedConsumer() {
  const channel = getChannel();


  await channel.assertQueue(QUEUE, { durable: true });


  channel.prefetch(1);

  console.log(`[Consumer] ✅ Đang lắng nghe queue: ${QUEUE}`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const timestamp = new Date().toISOString();
    let payload;

    try {

      payload = JSON.parse(msg.content.toString());
      console.log(`[Consumer] [${timestamp}] 📩 Nhận event:`, JSON.stringify(payload));

      const { videoId, userId, status, message } = payload;


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


      channel.ack(msg);
    } catch (err) {
      console.error(`[Consumer] [${timestamp}] ❌ Lỗi xử lý message:`, err.message);


      channel.nack(msg, false, false);
    }
  });
}

module.exports = { startVideoProcessedConsumer };
