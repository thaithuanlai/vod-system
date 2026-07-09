const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const requireAdmin = require('../middlewares/requireAdmin.middleware');

router.use(requireAdmin);

router.get('/', ctrl.getStats);

module.exports = router;
