
const { getDb } = require('../firebase');
const admin = require('firebase-admin');

const VIDEOS = 'videos';
const PROGRESS = 'watchProgress';
const FAVORITES = 'favorites';

function docId(userId, videoId) {
  return `${userId}_${videoId}`;
}

async function joinVideos(db, entries, videoIdField = 'videoId') {
  if (entries.length === 0) return [];

  const videoDocs = await db.getAll(
    ...entries.map(e => db.collection(VIDEOS).doc(e[videoIdField]))
  );

  return entries
    .map((entry, i) => {
      const videoDoc = videoDocs[i];
      if (!videoDoc.exists) return null;
      return { ...entry, video: { id: videoDoc.id, ...videoDoc.data() } };
    })
    .filter(Boolean);
}




async function upsertProgress(userId, videoId, { positionSeconds, durationSeconds }) {
  const db = getDb();
  const ref = db.collection(PROGRESS).doc(docId(userId, videoId));

  await ref.set({
    userId,
    videoId,
    positionSeconds: Number(positionSeconds) || 0,
    durationSeconds: Number(durationSeconds) || 0,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return true;
}




async function getProgress(userId, videoId) {
  const db = getDb();
  const doc = await db.collection(PROGRESS).doc(docId(userId, videoId)).get();
  if (!doc.exists) return null;
  return doc.data();
}




async function getContinueWatching(userId, limit = 10) {
  const db = getDb();
  const snapshot = await db.collection(PROGRESS)
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .limit(Number(limit))
    .get();

  const entries = snapshot.docs.map(doc => doc.data());
  const joined = await joinVideos(db, entries);
  // Drop videos already finished (within 15s of the end) or no longer READY
  return joined.filter(e =>
    e.video.status === 'READY' &&
    (!e.durationSeconds || e.durationSeconds - e.positionSeconds > 15)
  );
}




async function getFavoriteStatus(userId, videoId) {
  const db = getDb();
  const doc = await db.collection(FAVORITES).doc(docId(userId, videoId)).get();
  return { favorited: doc.exists };
}




async function toggleFavorite(userId, videoId) {
  const db = getDb();
  const ref = db.collection(FAVORITES).doc(docId(userId, videoId));
  const doc = await ref.get();

  if (doc.exists) {
    await ref.delete();
    return { favorited: false };
  }

  await ref.set({ userId, videoId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { favorited: true };
}




async function getFavorites(userId) {
  const db = getDb();
  const snapshot = await db.collection(FAVORITES)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  const entries = snapshot.docs.map(doc => doc.data());
  return joinVideos(db, entries);
}

module.exports = {
  upsertProgress,
  getProgress,
  getContinueWatching,
  getFavoriteStatus,
  toggleFavorite,
  getFavorites,
};
