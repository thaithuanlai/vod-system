REPO=asia-southeast1-docker.pkg.dev/vod-system-2025/vod-docker-repo  
FOR %%S IN (gateway user-service upload-service video-service processing-service streaming-service notification-service frontend) DO (echo Building %%S... & docker build -t %%S -f %%S/Dockerfile %%S & docker tag %%S %%REPO%%/%%S:latest & docker push %%REPO%%/%%S:latest)  
