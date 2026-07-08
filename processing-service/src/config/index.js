




import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); 




const config = {

  env: process.env.NODE_ENV || 'development',


  port: parseInt(process.env.PORT || process.env.PROCESSING_SERVICE_PORT || '3004', 10),


  videoServiceUrl: process.env.VIDEO_SERVICE_URL || 'http://localhost:3003',


  gcp: {
    projectId:       process.env.GCP_PROJECT_ID || 'your-gcp-project-id',
    bucketName:      process.env.GCS_BUCKET_NAME || 'vod-videos-your-project-id',
    rawFolder:       process.env.GCS_RAW_VIDEO_FOLDER || 'raw-videos',
    hlsFolder:       process.env.GCS_HLS_OUTPUT_FOLDER || 'hls-outputs',
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json',
  },


  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
    queues: {
      processing: process.env.RABBITMQ_QUEUE_VIDEO_PROCESSING || 'video-processing',
      processed:  process.env.RABBITMQ_QUEUE_VIDEO_PROCESSED || 'video-processed',
    },
  },


  tempDir: path.resolve(__dirname, '../../tmp'),
};

export default config;
