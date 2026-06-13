// Tầng service - tương tác trực tiếp với Firestore
const { getDb } = require('../firebase');
const admin = require('firebase-admin');

const COLLECTION = 'videos';

/**
 * Lấy danh sách video (có filter userId, pagination limit)
 */
async function listVideos({ userId, limit = 10 }) {
  const db = getDb();
  let query = db.collection(COLLECTION).orderBy('createdAt', 'desc');

  if (userId) {
    query = query.where('userId', '==', userId);
  }

  query = query.limit(Number(limit));

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Lấy một video theo ID
 */
async function getVideoById(videoId) {
  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(videoId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Tạo metadata video mới (gọi sau khi upload xong)
 */
async function createVideo(data) {
  const db = getDb();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const docData = {
    videoId: data.videoId || '',
    userId: data.userId || '',
    title: data.title || 'Untitled',
    description: data.description || '',
    status: data.status || 'UPLOADING',
    gcsPath: data.gcsPath || '',
    hlsUrl: data.hlsUrl || '',
    thumbnailUrl: data.thumbnailUrl || '',
    duration: data.duration || 0,
    createdAt: now,
    updatedAt: now,
    processedAt: null,
  };

  // Dùng videoId làm document ID nếu có, không thì để Firestore tự tạo
  let ref;
  if (data.videoId) {
    ref = db.collection(COLLECTION).doc(data.videoId);
    await ref.set(docData);
  } else {
    ref = await db.collection(COLLECTION).add(docData);
  }

  const created = await ref.get();
  return { id: created.id, ...created.data() };
}

/**
 * Cập nhật metadata video (status, hlsUrl, gcsPath, v.v.)
 */
async function updateVideo(videoId, data) {
  const db = getDb();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // Chỉ cho phép cập nhật các trường này
  const allowedFields = ['status', 'hlsUrl', 'gcsPath', 'duration', 'errorMessage', 'processedAt', 'thumbnailUrl'];
  const updateData = { updatedAt: now };

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  await db.collection(COLLECTION).doc(videoId).update(updateData);
  const updated = await db.collection(COLLECTION).doc(videoId).get();
  return { id: updated.id, ...updated.data() };
}

/**
 * Xóa video theo ID
 */
async function deleteVideo(videoId) {
  const db = getDb();
  await db.collection(COLLECTION).doc(videoId).delete();
  return true;
}

module.exports = { listVideos, getVideoById, createVideo, updateVideo, deleteVideo };
