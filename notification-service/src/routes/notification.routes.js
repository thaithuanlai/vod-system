const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');

router.get('/:userId', ctrl.getNotificationsByUser);

module.exports = router;
