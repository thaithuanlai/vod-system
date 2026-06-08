# ============================================================
# Dockerfile - Processing Service (US-01)
#
# Base: Node.js 20 Alpine + FFmpeg
# Yêu cầu:
#   - Docker build thành công (AC1)
#   - ffmpeg -version chạy được trong container (AC2)
#   - Container khởi động dưới 10 giây (AC3)
#   - Kích thước image < 500 MB (AC4)
# ============================================================

FROM node:20-alpine

# Cài đặt FFmpeg (bao gồm FFprobe) — dùng cho transcode và lấy duration
RUN apk add --no-cache ffmpeg

# Thư mục làm việc
WORKDIR /app

# Cài đặt dependencies (cache layer riêng)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Tạo thư mục tạm và cấp quyền
RUN mkdir -p tmp && chown -R node:node /app

# Chạy với user non-root (bảo mật)
USER node

# Port cho health check API
EXPOSE 3004

# Kiểm tra FFmpeg khi build (AC2)
RUN ffmpeg -version && ffprobe -version

# Lệnh khởi động
CMD ["npm", "start"]
