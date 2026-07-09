require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initFirestore } = require('./firebase');
const videoRoutes = require('./routes/video.routes');
const activityRoutes = require('./routes/activity.routes');
const adminVideoRoutes = require('./routes/admin.routes');
const statsRoutes = require('./routes/stats.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3003;


app.use(cors());
app.use(express.json());


try {
  initFirestore();
  console.log('✅ Firestore initialized');
} catch (err) {
  console.warn('⚠️ Firestore chưa khởi tạo (credentials placeholder?):', err.message);
}


app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Video Service is running', port: PORT });
});

app.use('/videos', videoRoutes);
app.use('/users/me', activityRoutes);
app.use('/admin/videos', adminVideoRoutes);
app.use('/admin/stats', statsRoutes);


app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🎬 Video Service chạy tại port ${PORT}`);
});
