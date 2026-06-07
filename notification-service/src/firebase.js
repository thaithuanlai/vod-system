// Khởi tạo Firebase Admin SDK
const admin = require('firebase-admin');

let db;

function initFirestore() {
  if (!admin.apps.length) {
    const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS))
      : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      projectId: process.env.FIRESTORE_PROJECT_ID,
    });
  }

  db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

function getDb() {
  if (!db) throw new Error('Firestore chưa được khởi tạo');
  return db;
}

module.exports = { initFirestore, getDb };
