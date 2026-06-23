const express = require('express');
const app = express();

// Parse JSON request body
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');

// Đăng ký routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'user-service' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ User Service chạy trên port ${PORT}`);
});