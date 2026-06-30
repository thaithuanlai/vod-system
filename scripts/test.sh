#!/bin/bash

echo "── STEP 1: Đăng ký user ──────────────────────────"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lead@vod.com",
    "password": "Password123",
    "username": "TeamLead"
  }'

echo -e "\n\n── STEP 2: Đăng nhập lấy token ───────────────────"
RES=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lead@vod.com",
    "password": "Password123"
  }')

echo $RES
TOKEN=$(echo $RES | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo -e "\n🔑 Token: ${TOKEN:0:20}..."

echo -e "\n── STEP 3: Upload video test ─────────────────────"
# Tạo một file nhỏ 1MB thay vì dùng ffmpeg sinh video test, hoặc tạo video xịn nếu có ffmpeg
if ! command -v ffmpeg &> /dev/null
then
    echo "Không có ffmpeg, tạo file text đóng giả video"
    echo "test video content" > /tmp/test-video.mp4
else
    ffmpeg -y -f lavfi -i testsrc=duration=2:size=640x480:rate=30 -c:v libx264 /tmp/test-video.mp4 2>/dev/null
fi

UPLOAD_RES=$(curl -s -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/tmp/test-video.mp4")

echo $UPLOAD_RES

VIDEO_ID=$(echo $UPLOAD_RES | grep -o '"videoId":"[^"]*' | grep -o '[^"]*$')
echo "VIDEO_ID=$VIDEO_ID"

echo -e "\n── STEP 4: Kiểm tra trạng thái xử lý ────────────"
sleep 5
curl -s http://localhost:3000/videos/$VIDEO_ID \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n── STEP 5: Danh sách video ──────────────────────"
curl -s http://localhost:3000/videos \
  -H "Authorization: Bearer $TOKEN"
