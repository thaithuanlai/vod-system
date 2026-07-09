
const { getDb } = require('../firebase');
const admin = require('firebase-admin');

const COLLECTION = 'videos';

function forbidden(message) {
  const e = new Error(message);
  e.status = 403;
  return e;
}

function notFound(message) {
  const e = new Error(message);
  e.status = 404;
  return e;
}

function mapVideo(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    viewCount: data.viewCount || 0,
    likeCount: data.likeCount || 0,
    commentCount: data.commentCount || 0,
    ratingCount: data.ratingCount || 0,
    avgRating: data.avgRating || 0,
    sizeBytes: data.sizeBytes || 0,
  };
}

// requester.id is undefined for trusted internal service-to-service calls
// (upload-service/processing-service call video-service directly, not through the gateway,
// so they carry no x-user-id header). Only enforce ownership when a requester identity is present.
async function assertOwnerOrAdmin(videoId, requester) {
  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(videoId).get();
  if (!doc.exists) throw notFound('Video không tìm thấy');

  if (requester?.id) {
    const video = doc.data();
    if (requester.role !== 'admin' && video.userId !== requester.id) {
      throw forbidden('Không có quyền thao tác trên video này');
    }
  }

  return doc;
}




async function listVideos({ userId, scope, limit = 10, sort = 'newest', startAfterId, search } = {}) {
  const db = getDb();
  let query = db.collection(COLLECTION);

  if (scope === 'all') {
    query = query.where('status', '==', 'READY');
  } else if (userId) {
    query = query.where('userId', '==', userId);
  }

  const orderField = sort === 'popular' ? 'viewCount' : 'createdAt';
  query = query.orderBy(orderField, 'desc');

  // Firestore has no substring full-text search; for search requests we widen the page
  // and filter client-side in-memory, which is fine at this project's data scale.
  const fetchLimit = search ? Math.max(Number(limit) * 5, 100) : Number(limit);
  query = query.limit(fetchLimit);

  if (startAfterId) {
    const cursorDoc = await db.collection(COLLECTION).doc(startAfterId).get();
    if (cursorDoc.exists) query = query.startAfter(cursorDoc);
  }

  const snapshot = await query.get();
  let videos = snapshot.docs.map(mapVideo);

  if (search) {
    const q = search.toLowerCase();
    videos = videos.filter(v => (v.title || '').toLowerCase().includes(q)).slice(0, Number(limit));
  }

  return videos;
}




async function getVideoById(videoId) {
  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(videoId).get();
  if (!doc.exists) return null;
  return mapVideo(doc);
}




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
    sizeBytes: data.sizeBytes || 0,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    ratingCount: 0,
    ratingSum: 0,
    avgRating: 0,
    createdAt: now,
    updatedAt: now,
    processedAt: null,
  };


  let ref;
  if (data.videoId) {
    ref = db.collection(COLLECTION).doc(data.videoId);
    await ref.set(docData);
  } else {
    ref = await db.collection(COLLECTION).add(docData);
  }

  const created = await ref.get();
  return mapVideo(created);
}




async function updateVideo(videoId, data, requester) {
  await assertOwnerOrAdmin(videoId, requester);

  const db = getDb();
  const now = admin.firestore.FieldValue.serverTimestamp();


  const allowedFields = ['status', 'hlsUrl', 'gcsPath', 'duration', 'errorMessage', 'processedAt', 'thumbnailUrl', 'sizeBytes', 'title', 'description'];
  const updateData = { updatedAt: now };

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  await db.collection(COLLECTION).doc(videoId).update(updateData);
  const updated = await db.collection(COLLECTION).doc(videoId).get();
  return mapVideo(updated);
}




async function deleteVideo(videoId, requester) {
  await assertOwnerOrAdmin(videoId, requester);

  const db = getDb();
  await db.collection(COLLECTION).doc(videoId).delete();
  return true;
}




async function incrementView(videoId) {
  const db = getDb();
  const ref = db.collection(COLLECTION).doc(videoId);
  const doc = await ref.get();
  if (!doc.exists) throw notFound('Video không tìm thấy');
  await ref.update({ viewCount: admin.firestore.FieldValue.increment(1) });
  return true;
}




async function toggleLike(videoId, userId) {
  const db = getDb();
  const videoRef = db.collection(COLLECTION).doc(videoId);
  const likeRef = videoRef.collection('likes').doc(userId);

  const [videoDoc, likeDoc] = await Promise.all([videoRef.get(), likeRef.get()]);
  if (!videoDoc.exists) throw notFound('Video không tìm thấy');

  if (likeDoc.exists) {
    await likeRef.delete();
    await videoRef.update({ likeCount: admin.firestore.FieldValue.increment(-1) });
    return { liked: false };
  }

  await likeRef.set({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
  await videoRef.update({ likeCount: admin.firestore.FieldValue.increment(1) });
  return { liked: true };
}




async function getLikeStatus(videoId, userId) {
  const db = getDb();
  const likeDoc = await db.collection(COLLECTION).doc(videoId).collection('likes').doc(userId).get();
  return { liked: likeDoc.exists };
}




async function addComment(videoId, { userId, username, text }) {
  const db = getDb();
  const videoRef = db.collection(COLLECTION).doc(videoId);
  const videoDoc = await videoRef.get();
  if (!videoDoc.exists) throw notFound('Video không tìm thấy');

  const now = admin.firestore.FieldValue.serverTimestamp();
  const commentsRef = videoRef.collection('comments');
  const ref = await commentsRef.add({ userId, username, text, createdAt: now });
  await videoRef.update({ commentCount: admin.firestore.FieldValue.increment(1) });

  const created = await ref.get();
  return { id: created.id, ...created.data() };
}




async function getComments(videoId, { limit = 20, startAfterId } = {}) {
  const db = getDb();
  const commentsCol = db.collection(COLLECTION).doc(videoId).collection('comments');
  let query = commentsCol.orderBy('createdAt', 'desc').limit(Number(limit));

  if (startAfterId) {
    const cursorDoc = await commentsCol.doc(startAfterId).get();
    if (cursorDoc.exists) query = query.startAfter(cursorDoc);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}




async function deleteComment(videoId, commentId, requester) {
  const db = getDb();
  const commentRef = db.collection(COLLECTION).doc(videoId).collection('comments').doc(commentId);
  const commentDoc = await commentRef.get();
  if (!commentDoc.exists) throw notFound('Bình luận không tồn tại');

  const comment = commentDoc.data();
  if (requester.role !== 'admin' && comment.userId !== requester.id) {
    throw forbidden('Không có quyền xóa bình luận này');
  }

  await commentRef.delete();
  await db.collection(COLLECTION).doc(videoId).update({ commentCount: admin.firestore.FieldValue.increment(-1) });
}




async function rateVideo(videoId, userId, stars) {
  const db = getDb();
  const videoRef = db.collection(COLLECTION).doc(videoId);
  const ratingRef = videoRef.collection('ratings').doc(userId);

  return db.runTransaction(async (tx) => {
    const [videoDoc, ratingDoc] = await Promise.all([tx.get(videoRef), tx.get(ratingRef)]);
    if (!videoDoc.exists) throw notFound('Video không tìm thấy');

    const videoData = videoDoc.data();
    let ratingSum = videoData.ratingSum || 0;
    let ratingCount = videoData.ratingCount || 0;

    if (ratingDoc.exists) {
      ratingSum = ratingSum - ratingDoc.data().stars + stars;
    } else {
      ratingSum += stars;
      ratingCount += 1;
    }

    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

    tx.set(ratingRef, { stars, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.update(videoRef, { ratingSum, ratingCount, avgRating });

    return { avgRating, ratingCount, stars };
  });
}




async function getRelated(videoId, limit = 8) {
  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(videoId).get();
  if (!doc.exists) return [];

  const { userId } = doc.data();
  const snapshot = await db.collection(COLLECTION)
    .where('userId', '==', userId)
    .where('status', '==', 'READY')
    .orderBy('createdAt', 'desc')
    .limit(Number(limit) + 1)
    .get();

  return snapshot.docs
    .map(mapVideo)
    .filter(v => v.id !== videoId)
    .slice(0, Number(limit));
}

module.exports = {
  listVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  incrementView,
  toggleLike,
  getLikeStatus,
  addComment,
  getComments,
  deleteComment,
  rateVideo,
  getRelated,
};
