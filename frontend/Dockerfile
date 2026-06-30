# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_GATEWAY_URL
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ARG VITE_STREAMING_SERVICE_URL
ENV VITE_STREAMING_SERVICE_URL=$VITE_STREAMING_SERVICE_URL
RUN npm run build

# Stage 2: Serve bằng nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
