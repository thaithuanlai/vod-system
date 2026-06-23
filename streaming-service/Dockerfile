# Stage 1: build dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# Stage 2: production image
FROM node:20-alpine AS runner
WORKDIR /app

# Không chạy bằng root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

USER appuser

ENV NODE_ENV=production
EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3003/health || exit 1

CMD ["node", "src/index.js"]
