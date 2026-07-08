require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initStorage } = require('./storage');
const streamRoutes = require('./routes/stream.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3005;


app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'Content-Type'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Content-Type'],
}));


initStorage();
console.log('✅ GCS Storage initialized, bucket:', process.env.GCS_BUCKET_NAME);


app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Streaming Service is running', port: PORT });
});


app.use('/stream', streamRoutes);


app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`📡 Streaming Service chạy tại port ${PORT}`);
});
