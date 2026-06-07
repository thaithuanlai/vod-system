// Khởi tạo Firebase Admin SDK để kết nối Firestore
const admin = require('firebase-admin');

let db;

function initFirestore() {
  if (!admin.apps.length) {
    // Nếu có file credentials thì dùng, không thì dùng Application Default Credentials (trên Cloud Run)
    const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS))
      : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      projectId: process.env.FIRESTORE_PROJECT_ID,
    });
  }

  db = admin.firestore();
  // Dùng Native Mode - timestamps trả về dạng Date thật
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

function getDb() {
  if (!db) throw new Error('Firestore chưa được khởi tạo');
  return db;
}

module.exports = { initFirestore, getDb };
