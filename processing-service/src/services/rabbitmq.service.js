// ============================================================================
// RABBITMQ SERVICE - Quản lý kết nối và giao tiếp với Message Broker
//
// Chức năng chính:
//   1. Kết nối RabbitMQ với cơ chế tự động reconnect
//   2. Đăng ký consumer (subscribe) - tự kích hoạt khi có kết nối
//   3. Gửi message (publish) đến queue
//   4. Đóng kết nối an toàn (graceful shutdown)
//
// Lưu ý:
//   - Sử dụng prefetch(1): chỉ xử lý 1 job tại một thời điểm
//   - ACK khi xử lý thành công, NACK + requeue khi lỗi (US-02)
// ============================================================================

import amqp from 'amqplib';
import config from '../config/index.js';
import logger from '../config/logger.js';

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectDelay = 5000; // 5 giây

    // Registry lưu subscription - tự đăng ký lại khi reconnect
    this.subscriptions = [];
  }

  // ==========================================================================
  // KẾT NỐI
  // ==========================================================================

  /**
   * Kết nối đến RabbitMQ server và khởi tạo các queue
   */
  async connect() {
    const safeUrl = config.rabbitmq.url.replace(/:[^:@\n]+@/, ':****@');

    try {
      logger.info(`Đang kết nối RabbitMQ tại ${safeUrl}`);

      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      this.isConnected = true;

      logger.info('Kết nối RabbitMQ thành công');

      // Lắng nghe sự kiện lỗi / đóng kết nối → tự reconnect
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

      // Khai báo các queue
      await this._assertQueues();

      // Kích hoạt lại tất cả consumer đã đăng ký
      for (const sub of this.subscriptions) {
        await this._setupConsumer(sub.queueName, sub.handler);
      }
    } catch (error) {
      logger.error('Không thể kết nối RabbitMQ, sẽ thử lại...', { error: error.message });
      this.isConnected = false;
      this._scheduleReconnect();
    }
  }

  /**
   * Lên lịch kết nối lại
   * @private
   */
  _scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      await this.connect();
    }, this.reconnectDelay);
  }

  /**
   * Khai báo (assert) các queue - durable để không mất message khi restart
   * @private
   */
  async _assertQueues() {
    if (!this.channel) return;

    const { processing, processed } = config.rabbitmq.queues;

    await this.channel.assertQueue(processing, { durable: true });
    await this.channel.assertQueue(processed, { durable: true });

    logger.info(`Đã khai báo queue: [${processing}], [${processed}]`);
  }

  // ==========================================================================
  // GỬI MESSAGE (PUBLISH)
  // ==========================================================================

  /**
   * Gửi message đến một queue
   * @param {string} queueName - Tên queue đích
   * @param {object} data      - Nội dung message (sẽ được JSON.stringify)
   */
  async publish(queueName, data) {
    if (!this.isConnected || !this.channel) {
      throw new Error(`Không thể gửi message - chưa kết nối RabbitMQ. Queue: ${queueName}`);
    }

    const buffer = Buffer.from(JSON.stringify(data));

    this.channel.sendToQueue(queueName, buffer, {
      persistent: true, // Message tồn tại khi broker restart
    });

    logger.debug(`Đã gửi message đến [${queueName}]`, { data });
  }

  // ==========================================================================
  // NHẬN MESSAGE (SUBSCRIBE)
  // ==========================================================================

  /**
   * Đăng ký lắng nghe message từ queue.
   * Nếu chưa kết nối → lưu registry, tự kích hoạt khi connect thành công.
   *
   * @param {string}   queueName - Tên queue
   * @param {function} handler   - Hàm xử lý (nhận object JS đã parse)
   */
  async subscribe(queueName, handler) {
    // Lưu vào registry (tránh trùng lặp)
    const exists = this.subscriptions.some(
      (sub) => sub.queueName === queueName && sub.handler === handler
    );
    if (!exists) {
      this.subscriptions.push({ queueName, handler });
    }

    // Chưa kết nối → chờ, sẽ tự kích hoạt trong connect()
    if (!this.isConnected || !this.channel) {
      logger.warn(`Chưa có kết nối. Subscription [${queueName}] sẽ kích hoạt khi kết nối thành công.`);
      return;
    }

    await this._setupConsumer(queueName, handler);
  }

  /**
   * Tạo consumer thực tế trên channel
   * @private
   */
  async _setupConsumer(queueName, handler) {
    // Prefetch = 1: xử lý tuần tự, 1 job tại một thời điểm (US-02)
    await this.channel.prefetch(1);

    logger.info(`Đã kích hoạt consumer trên queue: [${queueName}]`);

    await this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        logger.info(`Nhận message từ [${queueName}]`, { videoId: content.videoId });

        // Gọi handler xử lý
        await handler(content);

        // ACK: xác nhận đã xử lý xong → xóa message khỏi queue
        this.channel.ack(msg);
        logger.info(`ACK message thành công`, { videoId: content.videoId });
      } catch (error) {
        logger.error(`Lỗi xử lý message từ [${queueName}]`, { error: error.message });

        // NACK + requeue: trả message lại queue để thử xử lý lại (US-02)
        this.channel.nack(msg, false, true);
        logger.warn(`NACK + requeue message`, { videoId: msg.content?.videoId });
      }
    });
  }

  // ==========================================================================
  // ĐÓNG KẾT NỐI
  // ==========================================================================

  /**
   * Đóng kết nối an toàn
   */
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

// Singleton instance
const rabbitMQService = new RabbitMQService();
export default rabbitMQService;
