
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const RETRY_DELAY_MS = 5000; 
const MAX_RETRIES = 20;

let connection = null;
let channel = null;





async function connectRabbitMQ(retries = 0) {
  try {
    console.log(`[RabbitMQ] Đang kết nối tới ${RABBITMQ_URL}...`);
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('[RabbitMQ] ✅ Kết nối thành công');


    connection.on('error', (err) => {
      console.error('[RabbitMQ] Connection error:', err.message);
    });

    connection.on('close', () => {
      console.warn('[RabbitMQ] Kết nối bị đóng. Đang reconnect sau 5s...');
      channel = null;
      connection = null;
      setTimeout(() => connectRabbitMQ(), RETRY_DELAY_MS);
    });

    return channel;
  } catch (err) {
    console.error(`[RabbitMQ] Kết nối thất bại (lần ${retries + 1}):`, err.message);

    if (retries < MAX_RETRIES) {
      console.log(`[RabbitMQ] Thử lại sau ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      return connectRabbitMQ(retries + 1);
    }

    throw new Error('[RabbitMQ] Không thể kết nối sau nhiều lần thử');
  }
}

function getChannel() {
  if (!channel) throw new Error('[RabbitMQ] Channel chưa sẵn sàng');
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
