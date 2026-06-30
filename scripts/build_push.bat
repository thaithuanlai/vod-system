@echo off
set REPO=asia-southeast1-docker.pkg.dev/vod-system-2025/vod-docker-repo

for %%S in (gateway user-service upload-service video-service processing-service streaming-service notification-service frontend) do (
    echo Building %%S...
    docker build -t %%S -f %%S/Dockerfile %%S
    docker tag %%S %REPO%/%%S:latest
    docker push %REPO%/%%S:latest
)
