// Controller cho API /notifications
const { getDb } = require('../firebase');

/**
 * GET /notifications/:userId
 * Trả danh sách notifications của user, mới nhất trước
 */
async function getNotificationsByUser(req, res) {
  try {
    const { userId } = req.params;
    const db = getDb();

    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, message: 'OK', data: notifications });
  } catch (err) {
    console.error('[getNotificationsByUser]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getNotificationsByUser };
