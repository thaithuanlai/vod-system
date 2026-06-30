const { execSync } = require('child_process');
const fs = require('fs');

const PROJECT_ID = 'vod-system-2025';
const REGION = 'asia-southeast1';
const REPO = `asia-southeast1-docker.pkg.dev/${PROJECT_ID}/vod-docker-repo`;
const SQL_CONN = 'vod-system-2025:asia-southeast1:vod-postgres';
const JWT_SECRET = '/1MFveJJWmD/vXUyXjv/Lmiyj5pUw39dG1UIDJ5sGpbQCus30mkyvzjYIgaPQ5Mn';
const GCS_BUCKET = 'vod-videos-vod-system-2025';

function run(cmd) {
  console.log(`Running: ${cmd}`);
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }).trim();
}

try {
  console.log('Fetching RabbitMQ IP...');
  const rabbitMqIp = run(`gcloud compute instances describe rabbitmq-vm --zone asia-southeast1-b --format="value(networkInterfaces[0].accessConfigs[0].natIP)"`);
  const RABBITMQ_URL = `amqp://admin:admin123@${rabbitMqIp}:5672`;
  console.log(`RabbitMQ URL: ${RABBITMQ_URL}`);

  console.log('\\n--- Deploying Video Service ---');
  const videoUrl = run(`gcloud run deploy video-service --image ${REPO}/video-service:latest --region ${REGION} --allow-unauthenticated --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID}" --format="value(status.url)"`);
  console.log(`Video Service URL: ${videoUrl}`);

  console.log('\\n--- Deploying User Service ---');
  const userUrl = run(`gcloud run deploy user-service --image ${REPO}/user-service:latest --region ${REGION} --allow-unauthenticated --set-env-vars="DB_HOST=/cloudsql/${SQL_CONN},DB_USER=vod_admin,DB_PASSWORD=VodAdmin@2025,DB_NAME=vod_users,JWT_SECRET=${JWT_SECRET}" --add-cloudsql-instances=${SQL_CONN} --format="value(status.url)"`);
  console.log(`User Service URL: ${userUrl}`);

  console.log('\\n--- Deploying Upload Service ---');
  const uploadUrl = run(`gcloud run deploy upload-service --image ${REPO}/upload-service:latest --region ${REGION} --allow-unauthenticated --set-env-vars="GCS_BUCKET_NAME=${GCS_BUCKET},RABBITMQ_URL=${RABBITMQ_URL},VIDEO_SERVICE_URL=${videoUrl}" --format="value(status.url)"`);
  console.log(`Upload Service URL: ${uploadUrl}`);

  console.log('\\n--- Deploying Processing Service ---');
  const processingUrl = run(`gcloud run deploy processing-service --image ${REPO}/processing-service:latest --region ${REGION} --allow-unauthenticated --set-env-vars="GCS_BUCKET_NAME=${GCS_BUCKET},RABBITMQ_URL=${RABBITMQ_URL},VIDEO_SERVICE_URL=${videoUrl},GCP_PROJECT_ID=${PROJECT_ID}" --format="value(status.url)"`);
  console.log(`Processing Service URL: ${processingUrl}`);

  console.log('\\n--- Deploying Streaming Service ---');
  const streamUrl = run(`gcloud run deploy streaming-service --image ${REPO}/streaming-service:latest --region ${REGION} --allow-unauthenticated --set-env-vars="GCS_BUCKET_NAME=${GCS_BUCKET}" --format="value(status.url)"`);
  console.log(`Streaming Service URL: ${streamUrl}`);

  console.log('\\n--- Deploying Notification Service ---');
  const notifUrl = run(`gcloud run deploy notification-service --image ${REPO}/notification-service:latest --region ${REGION} --allow-unauthenticated --set-env-vars="RABBITMQ_URL=${RABBITMQ_URL}" --format="value(status.url)"`);
  console.log(`Notification Service URL: ${notifUrl}`);

  console.log('\\n--- Deploying API Gateway ---');
  const gatewayUrl = run(`gcloud run deploy gateway --image ${REPO}/gateway:latest --region ${REGION} --allow-unauthenticated --set-env-vars="USER_SERVICE_URL=${userUrl},UPLOAD_SERVICE_URL=${uploadUrl},VIDEO_SERVICE_URL=${videoUrl},STREAMING_SERVICE_URL=${streamUrl},NOTIFICATION_SERVICE_URL=${notifUrl},JWT_SECRET=${JWT_SECRET},CORS_ORIGINS=*" --format="value(status.url)"`);
  console.log(`API Gateway URL: ${gatewayUrl}`);

  console.log('\\n--- Building Frontend ---');
  console.log(`Using GATEWAY_URL=${gatewayUrl}`);
  execSync(`docker build --build-arg VITE_API_GATEWAY_URL=${gatewayUrl} -t frontend -f frontend/Dockerfile frontend`, { stdio: 'inherit' });
  execSync(`docker tag frontend ${REPO}/frontend:latest`, { stdio: 'inherit' });
  execSync(`docker push ${REPO}/frontend:latest`, { stdio: 'inherit' });

  console.log('\\n--- Deploying Frontend ---');
  const frontendUrl = run(`gcloud run deploy frontend --image ${REPO}/frontend:latest --region ${REGION} --allow-unauthenticated --format="value(status.url)"`);
  console.log(`Frontend URL: ${frontendUrl}`);

  console.log('\\n✅ All services deployed successfully!');
} catch (error) {
  console.error('Deployment failed:', error);
}
