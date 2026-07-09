
const { getDb } = require('../firebase');

const COLLECTION = 'videos';

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




async function listAllVideos({ limit = 50, startAfterId } = {}) {
  const db = getDb();
  let query = db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(Number(limit));

  if (startAfterId) {
    const cursorDoc = await db.collection(COLLECTION).doc(startAfterId).get();
    if (cursorDoc.exists) query = query.startAfter(cursorDoc);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(mapVideo);
}




async function deleteAnyVideo(videoId) {
  const db = getDb();
  await db.collection(COLLECTION).doc(videoId).delete();
  return true;
}




async function getStats() {
  const db = getDb();
  const snapshot = await db.collection(COLLECTION).get();

  const stats = snapshot.docs.reduce((acc, doc) => {
    const data = doc.data();
    acc.totalVideos += 1;
    acc.totalViews += data.viewCount || 0;
    acc.totalStorageBytes += data.sizeBytes || 0;
    acc.byStatus[data.status] = (acc.byStatus[data.status] || 0) + 1;
    return acc;
  }, { totalVideos: 0, totalViews: 0, totalStorageBytes: 0, byStatus: {} });

  return stats;
}

module.exports = { listAllVideos, deleteAnyVideo, getStats };
