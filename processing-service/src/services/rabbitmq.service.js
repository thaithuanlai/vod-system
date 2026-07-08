













import amqp from 'amqplib';
import config from '../config/index.js';
import logger from '../config/logger.js';

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectDelay = 5000; 


    this.subscriptions = [];
  }








  async connect() {
    const safeUrl = config.rabbitmq.url.replace(/:[^:@\n]+@/, ':****@');

    try {
      logger.info(`Đang kết nối RabbitMQ tại ${safeUrl}`);

      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      this.isConnected = true;

      logger.info('Kết nối RabbitMQ thành công');


      this.connection.on('error', (err) => {
        logger.error('Lỗi kết nối RabbitMQ', { error: err.message });
        this.isConnected = false;
        this._scheduleReconnect();
      });

      this.connection.on('close', () => {
        logger.warn('Kết nối RabbitMQ đã đóng');
        this.isConnected = false;
        this._scheduleReconnect();
      });


      await this._assertQueues();


      for (const sub of this.subscriptions) {
        await this._setupConsumer(sub.queueName, sub.handler);
      }
    } catch (error) {
      logger.error('Không thể kết nối RabbitMQ, sẽ thử lại...', { error: error.message });
      this.isConnected = false;
      this._scheduleReconnect();
    }
  }





  _scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      await this.connect();
    }, this.reconnectDelay);
  }





  async _assertQueues() {
    if (!this.channel) return;

    const { processing, processed } = config.rabbitmq.queues;

    await this.channel.assertQueue(processing, { durable: true });
    await this.channel.assertQueue(processed, { durable: true });

    logger.info(`Đã khai báo queue: [${processing}], [${processed}]`);
  }










  async publish(queueName, data) {
    if (!this.isConnected || !this.channel) {
      throw new Error(`Không thể gửi message - chưa kết nối RabbitMQ. Queue: ${queueName}`);
    }

    const buffer = Buffer.from(JSON.stringify(data));

    this.channel.sendToQueue(queueName, buffer, {
      persistent: true, 
    });

    logger.debug(`Đã gửi message đến [${queueName}]`, { data });
  }












  async subscribe(queueName, handler) {

    const exists = this.subscriptions.some(
      (sub) => sub.queueName === queueName && sub.handler === handler
    );
    if (!exists) {
      this.subscriptions.push({ queueName, handler });
    }


    if (!this.isConnected || !this.channel) {
      logger.warn(`Chưa có kết nối. Subscription [${queueName}] sẽ kích hoạt khi kết nối thành công.`);
      return;
    }

    await this._setupConsumer(queueName, handler);
  }





  async _setupConsumer(queueName, handler) {

    await this.channel.prefetch(1);

    logger.info(`Đã kích hoạt consumer trên queue: [${queueName}]`);

    await this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        logger.info(`Nhận message từ [${queueName}]`, { videoId: content.videoId });


        await handler(content);


        this.channel.ack(msg);
        logger.info(`ACK message thành công`, { videoId: content.videoId });
      } catch (error) {
        logger.error(`Lỗi xử lý message từ [${queueName}]`, { error: error.message });


        this.channel.nack(msg, false, true);
        logger.warn(`NACK + requeue message`, { videoId: msg.content?.videoId });
      }
    });
  }








  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      logger.info('Đã đóng kết nối RabbitMQ');
    } catch (error) {
      logger.error('Lỗi khi đóng kết nối RabbitMQ', { error: error.message });
    }
  }
}


const rabbitMQService = new RabbitMQService();
export default rabbitMQService;
