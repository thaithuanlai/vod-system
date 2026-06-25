# ════════════════════════════════════════════════════
# Stage 1: Dependencies
# Chỉ cài production packages, bỏ devDependencies
# ════════════════════════════════════════════════════
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files trước — tận dụng Docker layer cache
# Nếu package.json không đổi thì không cần npm install lại
COPY package.json package-lock.json ./

# Chỉ cài production dependencies
RUN npm ci --only=production

# ════════════════════════════════════════════════════
# Stage 2: Runtime
# Image nhẹ nhất có thể — chỉ chứa những gì cần thiết
# ════════════════════════════════════════════════════
FROM node:20-alpine AS runtime

# Metadata
LABEL maintainer="VOD Team"
LABEL service="api-gateway"

RUN apk add --no-cache wget

WORKDIR /app

# Tạo user không phải root — bảo mật
RUN addgroup -g 1001 -S nodejs && \
    adduser  -u 1001 -S nodejs -G nodejs

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Chuyển sang non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check — Docker tự ping mỗi 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Chạy production mode
ENV NODE_ENV=production

CMD ["node", "index.js"]