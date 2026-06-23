const express = require('express');
const router = express.Router();
const config = require('../config');

// GET /health
// Dùng để kiểm tra service còn sống không
// Docker, Cloud Run, Load Balancer đều ping endpoint này
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

module.exports = router;