@echo off
set REPO=asia-southeast1-docker.pkg.dev/vod-system-2025/vod-docker-repo
set GATEWAY_URL=https://gateway-aff6buw57a-as.a.run.app
set STREAMING_URL=https://streaming-service-aff6buw57a-as.a.run.app

echo Building Frontend...
docker build --build-arg VITE_API_GATEWAY_URL=%GATEWAY_URL% --build-arg VITE_STREAMING_SERVICE_URL=%STREAMING_URL% -t frontend -f frontend/Dockerfile frontend
docker tag frontend %REPO%/frontend:latest
docker push %REPO%/frontend:latest

echo Deploying Frontend...
gcloud run deploy frontend --image %REPO%/frontend:latest --region asia-southeast1 --allow-unauthenticated --port=80
