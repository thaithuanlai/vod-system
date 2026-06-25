FROM node:20-alpine

LABEL maintainer="VOD Team"
LABEL service="video-service"

RUN apk add --no-cache wget

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --only=production 2>/dev/null || npm install --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser  -u 1001 -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
