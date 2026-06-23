#!/bin/bash
# ================================================================
# Script test toàn bộ API phần của Nhi
# Chạy: chmod +x scripts/test-api.sh && ./scripts/test-api.sh
# ================================================================

VIDEO_URL="http://localhost:3003"
STREAM_URL="http://localhost:3005"
NOTIF_URL="http://localhost:3006"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ PASS${NC} $1"; }
fail() { echo -e "${RED}❌ FAIL${NC} $1"; }
section() { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }

# ─── Video Service ──────────────────────────────────────────────
section "Video Service (port 3003)"

# Health
RES=$(curl -s "$VIDEO_URL/health")
echo "$RES" | grep -q '"success":true' && pass "GET /health" || fail "GET /health → $RES"

# Tạo video
RES=$(curl -s -X POST "$VIDEO_URL/videos" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"test-v1","userId":"user-test","title":"Test Video","description":"Auto test","status":"UPLOADING"}')
echo "POST /videos → $RES"
echo "$RES" | grep -q '"success":true' && pass "POST /videos" || fail "POST /videos"

# Lấy danh sách
RES=$(curl -s "$VIDEO_URL/videos?userId=user-test&limit=5")
echo "$RES" | grep -q '"success":true' && pass "GET /videos?userId=user-test" || fail "GET /videos"

# Lấy theo ID
RES=$(curl -s "$VIDEO_URL/videos/test-v1")
echo "$RES" | grep -q '"success":true' && pass "GET /videos/test-v1" || fail "GET /videos/test-v1 → $RES"

# Cập nhật
RES=$(curl -s -X PATCH "$VIDEO_URL/videos/test-v1" \
  -H "Content-Type: application/json" \
  -d '{"status":"READY","hlsUrl":"/stream/test-v1/master.m3u8","duration":90}')
echo "$RES" | grep -q '"success":true' && pass "PATCH /videos/test-v1" || fail "PATCH /videos/test-v1 → $RES"

# Xóa
RES=$(curl -s -X DELETE "$VIDEO_URL/videos/test-v1")
echo "$RES" | grep -q '"success":true' && pass "DELETE /videos/test-v1" || fail "DELETE /videos/test-v1 → $RES"

# ─── Streaming Service ──────────────────────────────────────────
section "Streaming Service (port 3005)"

RES=$(curl -s "$STREAM_URL/health")
echo "$RES" | grep -q '"success":true' && pass "GET /health" || fail "GET /health → $RES"

# Thử lấy master.m3u8 (sẽ 404 nếu chưa có video, nhưng service phải respond)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$STREAM_URL/stream/video001/master.m3u8")
[ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] \
  && pass "GET /stream/video001/master.m3u8 (HTTP $HTTP_CODE)" \
  || fail "GET /stream/video001/master.m3u8 (HTTP $HTTP_CODE — expected 200 or 404)"

# ─── Notification Service ───────────────────────────────────────
section "Notification Service (port 3006)"

RES=$(curl -s "$NOTIF_URL/health")
echo "$RES" | grep -q '"success":true' && pass "GET /health" || fail "GET /health → $RES"

RES=$(curl -s "$NOTIF_URL/notifications/user-test")
echo "$RES" | grep -q '"success":true' && pass "GET /notifications/user-test" || fail "GET /notifications/user-test → $RES"

echo -e "\n${GREEN}━━━ Test hoàn tất! ━━━${NC}"
echo "Frontend: http://localhost:5173 (dev) hoặc http://localhost:8080 (Docker)"
echo "RabbitMQ Management: http://localhost:15672 (guest/guest)"
