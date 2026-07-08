require('dotenv').config();
const express = require('express');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'user-service', timestamp: new Date().toISOString() });
});


app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} không tồn tại` });
});



app.use((err, req, res, _next) => {
  if (res.headersSent) return;


  if (err.type === 'request.aborted' || err.code === 'ECONNRESET') {
    return;
  }


  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Bad Request', message: 'JSON không hợp lệ' });
  }

  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Đã có lỗi xảy ra',
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ User Service chạy trên port ${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB:  ${process.env.DATABASE_URL ? 'DATABASE_URL' : `${process.env.DB_HOST}:${process.env.DB_PORT}`}`);
});