FROM node:20-alpine

LABEL maintainer="VOD Team"
LABEL service="user-service"

# wget dùng cho health check
RUN apk add --no-cache wget

WORKDIR /app

# Cài dependencies trước (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Copy source
COPY . .

# Tạo user không có quyền root
RUN addgroup -g 1001 -S nodejs && \
    adduser  -u 1001 -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Chạy migrate rồi mới start server
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]
