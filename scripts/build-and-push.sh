#!/bin/bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-vod-system-2025}"
REGION="asia-southeast1"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/vod-docker-repo"

SERVICES=(
  "gateway"
  "user-service"
  "upload-service"
  "video-service"
  "processing-service"
  "streaming-service"
  "notification-service"
)

echo "🔧 Configuring Docker auth..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

echo ""
echo "🚀 Building and pushing images..."

for SERVICE in "${SERVICES[@]}"; do
  IMAGE="${REGISTRY}/${SERVICE}:latest"
  echo ""
  echo "📦 Building ${SERVICE}..."
  docker build -t "$IMAGE" "./${SERVICE}"

  echo "⬆️  Pushing ${SERVICE}..."
  docker push "$IMAGE"

  echo "✅ ${SERVICE} done → ${IMAGE}"
done

echo ""
echo "🎉 Tất cả images đã push lên Artifact Registry!"
echo "   Registry: ${REGISTRY}"
