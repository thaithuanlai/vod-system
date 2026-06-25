# Processing Service cần FFmpeg để xử lý video
# Dùng node:20-slim thay vì alpine vì alpine gặp vấn đề với FFmpeg codec
FROM node:20-slim AS runtime

LABEL maintainer="VOD Team"
LABEL service="processing-service"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ffmpeg \
      wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN ffmpeg -version | head -1

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production 2>/dev/null || npm install --only=production

COPY . .

RUN addgroup --gid 1001 nodejs && \
    adduser  --uid 1001 --ingroup nodejs --disabled-password nodejs && \
    chown -R nodejs:nodejs /app

RUN mkdir -p /tmp/vod-processing && \
    chown nodejs:nodejs /tmp/vod-processing

USER nodejs

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3004/health || exit 1

ENV NODE_ENV=production
ENV TMPDIR=/tmp/vod-processing

CMD ["node", "src/index.js"]
