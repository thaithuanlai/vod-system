#!/bin/bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-vod-system-2025}"
REGION="asia-southeast1"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/vod-docker-repo"
SQL_CONN="${PROJECT_ID}:${REGION}:vod-postgres"

JWT_SECRET=$(gcloud secrets versions access latest \
  --secret=jwt-secret --project=$PROJECT_ID)

DB_PASS=$(gcloud secrets versions access latest \
  --secret=db-password --project=$PROJECT_ID)

SA_EMAIL="vod-system-sa@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🚀 Deploying VOD System lên Cloud Run..."
echo "   Project: $PROJECT_ID | Region: $REGION"
echo ""

# ── 1. User Service ───────────────────────────────
echo "📦 Deploying user-service..."
gcloud run deploy user-service \
  --image="${REGISTRY}/user-service:latest" \
  --platform=managed \
  --region=$REGION \
  --no-allow-unauthenticated \
  --port=3001 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --service-account=$SA_EMAIL \
  --add-cloudsql-instances=$SQL_CONN \
  --set-env-vars="NODE_ENV=production,PORT=3001,JWT_SECRET=${JWT_SECRET},JWT_EXPIRES_IN=24h" \
  --set-env-vars="DATABASE_URL=postgresql://vod_admin:${DB_PASS}@/vod_users?host=/cloudsql/${SQL_CONN}" \
  --project=$PROJECT_ID \
  --quiet

USER_URL=$(gcloud run services describe user-service \
  --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)
echo "✅ user-service → $USER_URL"

# ── 2. Upload Service ─────────────────────────────
echo "📦 Deploying upload-service..."
gcloud run deploy upload-service \
  --image="${REGISTRY}/upload-service:latest" \
  --platform=managed \
  --region=$REGION \
  --no-allow-unauthenticated \
  --port=3002 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --service-account=$SA_EMAIL \
  --set-env-vars="NODE_ENV=production,PORT=3002" \
  --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID},GCS_BUCKET_NAME=vod-videos-${PROJECT_ID}" \
  --project=$PROJECT_ID \
  --quiet

UPLOAD_URL=$(gcloud run services describe upload-service \
  --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)
echo "✅ upload-service → $UPLOAD_URL"

# ── 3. Video Service ──────────────────────────────
echo "📦 Deploying video-service..."
gcloud run deploy video-service \
  --image="${REGISTRY}/video-service:latest" \
  --platform=managed \
  --region=$REGION \
  --no-allow-unauthenticated \
  --port=3003 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --service-account=$SA_EMAIL \
  --set-env-vars="NODE_ENV=production,PORT=3003,GCP_PROJECT_ID=${PROJECT_ID}" \
  --project=$PROJECT_ID \
  --quiet

VIDEO_URL=$(gcloud run services describe video-service \
  --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)
echo "✅ video-service → $VIDEO_URL"

# ── 4. Processing Service ─────────────────────────
echo "📦 Deploying processing-service..."
gcloud run deploy processing-service \
  --image="${REGISTRY}/processing-service:latest" \
  --platform=managed \
  --region=$REGION \
  --no-allow-unauthenticated \
  --port=3004 \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=0 \
  --max-instances=2 \
  --timeout=900 \
  --service-account=$SA_EMAIL \
  --set-env-vars="NODE_ENV=production,PORT=3004,GCP_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars="GCS_BUCKET_NAME=vod-videos-${PROJECT_ID}" \
  --project=$PROJECT_ID \
  --quiet

PROCESSING_URL=$(gcloud run services describe processing-service \
  --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)
echo "✅ processing-service → $PROCESSING_URL"

# ── 5. Streaming Service ──────────────────────────
echo "📦 Deploying streaming-service..."
gcloud run deploy streaming-service \
  --image="${REGISTRY}/streaming-service:latest" \
  --platform=managed \
  --region=$REGION \
  --no-allow-unauthenticated \
  --port=3005 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --service-account=$SA_EMAIL \
  --set-env-vars="NODE_ENV=production,PORT=3005,GCP_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars="GCS_BUCKET_NAME=vod-videos-${PROJECT_ID}" \
  --project=$PROJECT_ID \
  --quiet

STREAM_URL=$(gcloud run services describe streaming-service \
  --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)
echo "✅ streaming-service → $STREAM_URL"

# ── 6. Notification Service ───────────────────────
echo "📦 Deploying notification-service..."
gcloud run deploy notification-service \
  --image="${REGISTRY}/notification-service:latest" \
  --platform=managed \
  --region=$REGION \
  --no-allow-unauthenticated \
  --port=3006 \
  --memory=256Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=2 \
  --service-account=$SA_EMAIL \
  --set-env-vars="NODE_ENV=production,PORT=3006,GCP_PROJECT_ID=${PROJECT_ID}" \
  --project=$PROJECT_ID \
  --quiet

NOTIFY_URL=$(gcloud run services describe notification-service \
  --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)
echo "✅ notification-service → $NOTIFY_URL"

# ── 7. API Gateway (deploy cuối — cần URLs các service) ──
echo "📦 Deploying gateway..."
gcloud run deploy gateway \
  --image="${REGISTRY}/gateway:latest" \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5 \
  --service-account=$SA_EMAIL \
  --set-env-vars="NODE_ENV=production,PORT=3000,JWT_SECRET=${JWT_SECRET}" \
  --set-env-vars="USER_SERVICE_URL=${USER_URL}" \
  --set-env-vars="UPLOAD_SERVICE_URL=${UPLOAD_URL}" \
  --set-env-vars="VIDEO_SERVICE_URL=${VIDEO_URL}" \
  --set-env-vars="PROCESSING_SERVICE_URL=${PROCESSING_URL}" \
  --set-env-vars="STREAMING_SERVICE_URL=${STREAM_URL}" \
  --set-env-vars="NOTIFICATION_SERVICE_URL=${NOTIFY_URL}" \
  --project=$PROJECT_ID \
  --quiet

GATEWAY_URL=$(gcloud run services describe gateway \
  --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)

echo ""
echo "════════════════════════════════════════════"
echo "  🎉 DEPLOY HOÀN TẤT!"
echo "════════════════════════════════════════════"
echo ""
echo "  🌐 GATEWAY (Public URL):"
echo "     $GATEWAY_URL"
echo ""
echo "  📋 Internal Services:"
echo "     User:         $USER_URL"
echo "     Upload:       $UPLOAD_URL"
echo "     Video:        $VIDEO_URL"
echo "     Processing:   $PROCESSING_URL"
echo "     Streaming:    $STREAM_URL"
echo "     Notification: $NOTIFY_URL"
echo ""
echo "  💾 Lưu GATEWAY_URL vào .env.production!"
echo "     GATEWAY_URL=$GATEWAY_URL"
