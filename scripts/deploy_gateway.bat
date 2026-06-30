@echo off
set REPO=asia-southeast1-docker.pkg.dev/vod-system-2025/vod-docker-repo
set REGION=asia-southeast1
set JWT_SECRET=/1MFveJJWmD/vXUyXjv/Lmiyj5pUw39dG1UIDJ5sGpbQCus30mkyvzjYIgaPQ5Mn
set USER_SERVICE_URL=https://user-service-aff6buw57a-as.a.run.app
set UPLOAD_SERVICE_URL=https://upload-service-aff6buw57a-as.a.run.app
set VIDEO_SERVICE_URL=https://video-service-aff6buw57a-as.a.run.app
set STREAMING_SERVICE_URL=https://streaming-service-aff6buw57a-as.a.run.app
set NOTIFICATION_SERVICE_URL=https://notification-service-aff6buw57a-as.a.run.app

echo Building Gateway...
docker build -t gateway -f gateway/Dockerfile gateway
docker tag gateway %REPO%/gateway:latest
docker push %REPO%/gateway:latest

echo Deploying Gateway...
gcloud run deploy gateway --image %REPO%/gateway:latest --region %REGION% --allow-unauthenticated --set-env-vars="USER_SERVICE_URL=%USER_SERVICE_URL%,UPLOAD_SERVICE_URL=%UPLOAD_SERVICE_URL%,VIDEO_SERVICE_URL=%VIDEO_SERVICE_URL%,STREAMING_SERVICE_URL=%STREAMING_SERVICE_URL%,NOTIFICATION_SERVICE_URL=%NOTIFICATION_SERVICE_URL%,JWT_SECRET=%JWT_SECRET%,CORS_ORIGINS=*"
