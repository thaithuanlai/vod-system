@echo off
set PROJECT_ID=vod-system-2025
set REGION=asia-southeast1
set REPO=asia-southeast1-docker.pkg.dev/%PROJECT_ID%/vod-docker-repo
set SQL_CONN=vod-system-2025:asia-southeast1:vod-postgres
set JWT_SECRET=/1MFveJJWmD/vXUyXjv/Lmiyj5pUw39dG1UIDJ5sGpbQCus30mkyvzjYIgaPQ5Mn
set GCS_BUCKET=vod-videos-vod-system-2025

REM Get RabbitMQ Internal IP
FOR /F "tokens=*" %%g IN ('gcloud compute instances describe rabbitmq-vm --zone asia-southeast1-b --format="value(networkInterfaces[0].accessConfigs[0].natIP)"') do (SET RABBITMQ_IP=%%g)
set RABBITMQ_URL=amqp://admin:admin123@%RABBITMQ_IP%:5672

echo RabbitMQ Public IP: %RABBITMQ_IP%

REM 1. Deploy Video Service
echo Deploying Video Service...
gcloud run deploy video-service --image %REPO%/video-service:latest --region %REGION% --allow-unauthenticated --set-env-vars="GCP_PROJECT_ID=%PROJECT_ID%" --format="value(status.url)" > video_url.txt
set /p VIDEO_SERVICE_URL=<video_url.txt

REM 2. Deploy User Service
echo Deploying User Service...
gcloud run deploy user-service --image %REPO%/user-service:latest --region %REGION% --allow-unauthenticated --set-env-vars="POSTGRES_USER=vod_admin,POSTGRES_PASSWORD=VodAdmin@2025,POSTGRES_DB=vod_users,JWT_SECRET=%JWT_SECRET%,CLOUD_SQL_CONNECTION_NAME=%SQL_CONN%" --format="value(status.url)" > user_url.txt
set /p USER_SERVICE_URL=<user_url.txt

REM 3. Deploy Upload Service
echo Deploying Upload Service...
gcloud run deploy upload-service --image %REPO%/upload-service:latest --region %REGION% --allow-unauthenticated --set-env-vars="GCS_BUCKET_NAME=%GCS_BUCKET%,RABBITMQ_URL=%RABBITMQ_URL%,VIDEO_SERVICE_URL=%VIDEO_SERVICE_URL%" --format="value(status.url)" > upload_url.txt
set /p UPLOAD_SERVICE_URL=<upload_url.txt

REM 4. Deploy Processing Service
echo Deploying Processing Service...
gcloud run deploy processing-service --image %REPO%/processing-service:latest --region %REGION% --allow-unauthenticated --set-env-vars="GCS_BUCKET_NAME=%GCS_BUCKET%,RABBITMQ_URL=%RABBITMQ_URL%,VIDEO_SERVICE_URL=%VIDEO_SERVICE_URL%,GCP_PROJECT_ID=%PROJECT_ID%"

REM 5. Deploy Streaming Service
echo Deploying Streaming Service...
gcloud run deploy streaming-service --image %REPO%/streaming-service:latest --region %REGION% --allow-unauthenticated --set-env-vars="GCS_BUCKET_NAME=%GCS_BUCKET%" --format="value(status.url)" > stream_url.txt
set /p STREAMING_SERVICE_URL=<stream_url.txt

REM 6. Deploy Notification Service
echo Deploying Notification Service...
gcloud run deploy notification-service --image %REPO%/notification-service:latest --region %REGION% --allow-unauthenticated --set-env-vars="RABBITMQ_URL=%RABBITMQ_URL%" --format="value(status.url)" > notif_url.txt
set /p NOTIFICATION_SERVICE_URL=<notif_url.txt

REM 7. Deploy Gateway
echo Deploying API Gateway...
gcloud run deploy gateway --image %REPO%/gateway:latest --region %REGION% --allow-unauthenticated --set-env-vars="USER_SERVICE_URL=%USER_SERVICE_URL%,UPLOAD_SERVICE_URL=%UPLOAD_SERVICE_URL%,VIDEO_SERVICE_URL=%VIDEO_SERVICE_URL%,STREAMING_SERVICE_URL=%STREAMING_SERVICE_URL%,NOTIFICATION_SERVICE_URL=%NOTIFICATION_SERVICE_URL%,JWT_SECRET=%JWT_SECRET%,CORS_ORIGINS=*" --format="value(status.url)" > gateway_url.txt
set /p GATEWAY_URL=<gateway_url.txt

REM 8. Build Frontend With Gateway URL and Deploy
echo Building Frontend with GATEWAY_URL=%GATEWAY_URL%...
docker build --build-arg VITE_API_GATEWAY_URL=%GATEWAY_URL% -t frontend -f frontend/Dockerfile frontend
docker tag frontend %REPO%/frontend:latest
docker push %REPO%/frontend:latest

echo Deploying Frontend...
gcloud run deploy frontend --image %REPO%/frontend:latest --region %REGION% --allow-unauthenticated
