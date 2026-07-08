const express = require('express');
const router = express.Router();
const config = require('../config');




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