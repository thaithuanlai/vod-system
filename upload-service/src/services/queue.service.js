import amqp from 'amqplib';

let channel = null;
const queueName = process.env.QUEUE_VIDEO_PROCESSING || 'video-processing';

/**
 * Hàm khởi tạo kết nối đến RabbitMQ Server
 * Được gọi một lần khi ứng dụng bắt đầu khởi chạy
 */
export const initRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        // Đảm bảo Queue tồn tại, durable: true giúp hàng đợi sống sót khi RabbitMQ bị restart
        await channel.assertQueue(queueName, { durable: true });
        console.log(`[RabbitMQ] Đã kết nối và sẵn sàng trên queue: ${queueName}`);
    } catch (error) {
        console.error(`[RabbitMQ Error] Không thể kết nối tới Broker: ${error.message}`);
        // Không gọi process.exit(1) để tránh crash service theo đúng tiêu chí của task T17
    }
};

/**
 * Hàm đẩy tải tin nhắn (Payload Job) vào hàng đợi
 * @param {Object} payload - Dữ liệu công việc bàn giao cho Processing Service
 */
export const publishToQueue = async (payload) => {
    if (!channel) {
        console.error('[RabbitMQ Error] Tin nhắn không thể gửi đi vì Channel chưa được khởi tạo.');
        return false;
    }

    try {
        const messageBuffer = Buffer.from(JSON.stringify(payload));
        // Tiến hành publish message với tùy chọn persistent để ghi dữ liệu xuống đĩa cứng
        const isPublished = channel.sendToQueue(queueName, messageBuffer, {
            persistent: true // Bảo vệ message tránh mất mát dữ liệu khi hệ thống Broker down
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