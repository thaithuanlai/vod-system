// ============================================================================
// STORAGE SERVICE - Tương tác với Google Cloud Storage (GCS)
//
// Chức năng chính:
//   1. Tải video gốc (raw) từ GCS về máy local        (US-03)
//   2. Upload toàn bộ file HLS lên GCS                 (US-04)
//
// Content-Type được gán theo yêu cầu:
//   .m3u8 → application/x-mpegURL
//   .ts   → video/MP2T
// ============================================================================

import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';
import logger from '../config/logger.js';

// Bảng ánh xạ Content-Type cho các file HLS (US-04)
const CONTENT_TYPES = {
  '.m3u8': 'application/x-mpegURL',
  '.ts':   'video/MP2T',
};

class StorageService {
  constructor() {
    const options = {};

    // Dùng credentials file nếu có (local dev)
    // Trên Cloud Run sẽ dùng Service Account mặc định
    if (fs.existsSync(config.gcp.credentialsPath)) {
      options.keyFilename = config.gcp.credentialsPath;
    }
    if (config.gcp.projectId && config.gcp.projectId !== 'your-gcp-project-id') {
      options.projectId = config.gcp.projectId;
    }

    this.storage = new Storage(options);
    this.bucket = this.storage.bucket(config.gcp.bucketName);

    logger.info(`GCS client khởi tạo cho bucket: ${config.gcp.bucketName}`);
  }

  // ==========================================================================
  // TẢI VIDEO GỐC TỪ GCS VỀ LOCAL (US-03 Bước 1)
  // ==========================================================================

  /**
   * Download video gốc từ GCS
   * @param {string} filename  - Tên file trong thư mục raw (vd: "video123.mp4")
   * @param {string} localPath - Đường dẫn local đích
   */
  async downloadRawVideo(filename, localPath) {
    const gcsPath = `${config.gcp.rawFolder}/${filename}`;
    logger.info(`Đang tải từ GCS: ${gcsPath}`);

    const file = this.bucket.file(gcsPath);

    // Kiểm tra file tồn tại trên GCS
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File không tồn tại trên GCS: ${gcsPath}`);
    }

    // Tạo thư mục đích nếu chưa có
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await file.download({ destination: localPath });
    logger.info(`Tải thành công: ${filename}`);
  }

  // ==========================================================================
  // UPLOAD THƯ MỤC HLS LÊN GCS (US-04)
  // Đường dẫn lưu trữ: hls-outputs/{videoId}/
  // ==========================================================================

  /**
   * Upload toàn bộ file HLS lên GCS
   * @param {string} localFolder - Thư mục local chứa output HLS (cấu trúc phẳng)
   * @param {string} videoId     - ID video, dùng làm tên thư mục trên GCS
   * @returns {string} URL của file master.m3u8 trên GCS
   */
  async uploadHlsFolder(localFolder, videoId) {
    logger.info(`Đang upload HLS lên GCS: ${config.gcp.hlsFolder}/${videoId}/`);

    if (!fs.existsSync(localFolder)) {
      throw new Error(`Thư mục local không tồn tại: ${localFolder}`);
    }

    // Lấy danh sách tất cả file (đệ quy)
    const files = this._getFilesRecursive(localFolder);
    logger.info(`Tìm thấy ${files.length} file cần upload`);

    // Upload song song tất cả file
    const uploadTasks = files.map((filePath) => {
      const relativePath = path.relative(localFolder, filePath).replace(/\\/g, '/');
      const destination = `${config.gcp.hlsFolder}/${videoId}/${relativePath}`;
      const ext = path.extname(filePath);
      const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

      return this.bucket.upload(filePath, {
        destination,
        metadata: {
          contentType,
          cacheControl: 'public, max-age=3600',
        },
      });
    });

    await Promise.all(uploadTasks);

    // Trả về URL master playlist (US-04)
    const masterUrl = `https://storage.googleapis.com/${config.gcp.bucketName}/${config.gcp.hlsFolder}/${videoId}/master.m3u8`;
    logger.info(`Upload HLS hoàn tất. Master playlist: ${masterUrl}`);
    return masterUrl;
  }

  // ==========================================================================
  // UPLOAD THUMBNAIL LÊN GCS (US-06)
  // ==========================================================================

  /**
   * Upload ảnh thumbnail lên GCS
   * @param {string} localPath - Đường dẫn file thumbnail local (.jpg)
   * @param {string} videoId   - ID video
   * @returns {string} Public URL của thumbnail trên GCS
   */
  async uploadThumbnail(localPath, videoId) {
    const destination = `thumbnails/${videoId}/thumbnail.jpg`;
    logger.info(`Đang upload thumbnail lên GCS: ${destination}`);

    await this.bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=86400', // Cache 24h
      },
    });

    // Tạo public URL
    const thumbnailUrl = `https://storage.googleapis.com/${config.gcp.bucketName}/${destination}`;
    logger.info(`Upload thumbnail hoàn tất: ${thumbnailUrl}`);
    return thumbnailUrl;
  }

  // ==========================================================================
  // HELPER
  // ==========================================================================

  /**
   * Lấy danh sách file đệ quy trong thư mục
   * @private
   */
  _getFilesRecursive(dir) {
    let results = [];

    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);

      if (fs.statSync(fullPath).isDirectory()) {
        results = results.concat(this._getFilesRecursive(fullPath));
      } else {
        results.push(fullPath);
      }
    }

    return results;
  }
}

// Singleton instance
const storageService = new StorageService();
export default storageService;
