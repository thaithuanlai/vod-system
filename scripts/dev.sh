#!/bin/bash
# ════════════════════════════════════════════════════
# Script: Quản lý VOD System local
# Dùng: bash scripts/dev.sh [command]
# ════════════════════════════════════════════════════

COMPOSE="docker-compose"

check_container_health() {
  local container=$1
  local port=$2
  local label=$3

  if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
    echo "   ❌ $label — container không chạy"
    return
  fi

  if docker exec "$container" wget -qO- "http://localhost:$port/health" >/dev/null 2>&1; then
    echo "   ✅ $label — OK"
  else
    echo "   ❌ $label — FAIL"
  fi
}

case "$1" in
  up)
    echo "🚀 Khởi động tất cả services..."
    $COMPOSE up --build -d
    echo ""
    echo "📋 Trạng thái services:"
    $COMPOSE ps
    echo ""
    echo "🌐 URLs:"
    echo "   API Gateway:       http://localhost:3000"
    echo "   RabbitMQ UI:       http://localhost:15672 (admin/admin123)"
    echo "   PostgreSQL:        localhost:5432"
    ;;
  down)
    echo "🛑 Dừng tất cả services..."
    $COMPOSE down
    ;;
  reset)
    echo "🗑️  Dừng và xóa tất cả data..."
    $COMPOSE down -v
    ;;
  logs)
    SERVICE=${2:-""}
    $COMPOSE logs -f $SERVICE
    ;;
  ps)
    $COMPOSE ps
    ;;
  health)
    echo "🏥 Kiểm tra health tất cả services..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null)
    if [ "$STATUS" = "200" ]; then
      echo "   ✅ Gateway (port 3000) — OK"
    else
      echo "   ❌ Gateway (port 3000) — FAIL (HTTP $STATUS)"
    fi
    check_container_health vod-user-service 3001 "User Service (3001)"
    check_container_health vod-upload-service 3002 "Upload Service (3002)"
    check_container_health vod-video-service 3003 "Video Service (3003)"
    check_container_health vod-processing-service 3004 "Processing Service (3004)"
    check_container_health vod-streaming-service 3005 "Streaming Service (3005)"
    check_container_health vod-notification-service 3006 "Notification Service (3006)"
    ;;
  restart)
    SERVICE=${2:-""}
    echo "🔄 Restart $SERVICE..."
    $COMPOSE restart $SERVICE
    ;;
  *)
    echo "Cách dùng: bash scripts/dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up              Khởi động tất cả services"
    echo "  down            Dừng tất cả services"
    echo "  reset           Dừng + xóa toàn bộ data"
    echo "  logs [service]  Xem logs (bỏ trống = tất cả)"
    echo "  ps              Trạng thái services"
    echo "  health          Kiểm tra health endpoints"
    echo "  restart [svc]   Restart một service"
    ;;
esac
