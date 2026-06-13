/**
 * T07 - Firestore Setup Script
 * Tạo sample documents cho collection "videos" và "notifications"
 *
 * Cách chạy:
 *   node scripts/firestore-seed.js
 *
 * Yêu cầu:
 *   - GOOGLE_APPLICATION_CREDENTIALS trỏ đến service-account.json
 *   - FIRESTORE_PROJECT_ID là GCP project của bạn
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Khởi tạo Admin SDK
const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS))
  : admin.credential.applicationDefault();

admin.initializeApp({
  credential,
  projectId: process.env.FIRESTORE_PROJECT_ID,
});

const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

// ---- Sample data ----

const sampleVideo = {
  videoId: 'video001',
  userId: 'user001',
  title: 'Demo Video',
  description: 'Video test HLS',
  status: 'READY',
  gcsPath: 'hls-outputs/video001/master.m3u8',
  hlsUrl: '/stream/video001/master.m3u8',
  thumbnailUrl: '',
  duration: 120,
  createdAt: now,
  updatedAt: now,
  processedAt: now,
};

const sampleNotification = {
  videoId: 'video001',
  userId: 'user001',
  event: 'video-processed',
  status: 'READY',
  message: 'Video processed successfully',
  timestamp: now,
};

// ---- Seed ----

async function seed() {
  console.log('🌱 Bắt đầu seed Firestore...\n');

  // Collection: videos
  await db.collection('videos').doc('video001').set(sampleVideo);
  console.log('✅ Đã tạo document videos/video001');

  // Collection: notifications
  const notifRef = await db.collection('notifications').add(sampleNotification);
  console.log('✅ Đã tạo document notifications/' + notifRef.id);

  console.log('\n🎉 Seed hoàn tất!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Lỗi seed:', err.message);
  process.exit(1);
});
