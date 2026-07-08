import amqp from 'amqplib';

let channel = null;
const queueName = process.env.QUEUE_VIDEO_PROCESSING || 'video-processing';





export const initRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertQueue(queueName, { durable: true });
        console.log(`[RabbitMQ] Đã kết nối và sẵn sàng trên queue: ${queueName}`);
    } catch (error) {
        console.error(`[RabbitMQ Error] Không thể kết nối tới Broker: ${error.message}`);

    }
};





export const publishToQueue = async (payload) => {
    if (!channel) {
        console.error('[RabbitMQ Error] Tin nhắn không thể gửi đi vì Channel chưa được khởi tạo.');
        return false;
    }

    try {
        const messageBuffer = Buffer.from(JSON.stringify(payload));

        const isPublished = channel.sendToQueue(queueName, messageBuffer, {
            persistent: true 
        });

        if (isPublished) {
            console.log(`[RabbitMQ] Đã gửi thông báo xử lý thành công cho Video ID: ${payload.videoId}`);
        }
        return isPublished;
    } catch (error) {
        console.error(`[RabbitMQ Error] Lỗi phát sinh khi publish message: ${error.message}`);
        return false;
    }
};