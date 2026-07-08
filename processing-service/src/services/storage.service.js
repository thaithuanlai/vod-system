











import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';
import logger from '../config/logger.js';


const CONTENT_TYPES = {
  '.m3u8': 'application/x-mpegURL',
  '.ts':   'video/MP2T',
};

class StorageService {
  constructor() {
    const options = {};



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










  async downloadRawVideo(filename, localPath) {
    const gcsPath = `${config.gcp.rawFolder}/${filename}`;
    logger.info(`Đang tải từ GCS: ${gcsPath}`);

    const file = this.bucket.file(gcsPath);


    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File không tồn tại trên GCS: ${gcsPath}`);
    }


    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await file.download({ destination: localPath });
    logger.info(`Tải thành công: ${filename}`);
  }












  async uploadHlsFolder(localFolder, videoId) {
    logger.info(`Đang upload HLS lên GCS: ${config.gcp.hlsFolder}/${videoId}/`);

    if (!fs.existsSync(localFolder)) {
      throw new Error(`Thư mục local không tồn tại: ${localFolder}`);
    }


    const files = this._getFilesRecursive(localFolder);
    logger.info(`Tìm thấy ${files.length} file cần upload`);


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


    const masterUrl = `https://storage.googleapis.com/${config.gcp.bucketName}/${config.gcp.hlsFolder}/${videoId}/master.m3u8`;
    logger.info(`Upload HLS hoàn tất. Master playlist: ${masterUrl}`);
    return masterUrl;
  }











  async uploadThumbnail(localPath, videoId) {
    const destination = `thumbnails/${videoId}/thumbnail.jpg`;
    logger.info(`Đang upload thumbnail lên GCS: ${destination}`);

    await this.bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=86400', 
      },
    });


    const thumbnailUrl = `https://storage.googleapis.com/${config.gcp.bucketName}/${destination}`;
    logger.info(`Upload thumbnail hoàn tất: ${thumbnailUrl}`);
    return thumbnailUrl;
  }









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


const storageService = new StorageService();
export default storageService;
