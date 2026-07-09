const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/activity.controller');

router.get('/continue-watching', ctrl.getContinueWatching);
router.get('/favorites', ctrl.getFavorites);
router.get('/favorites/:videoId/status', ctrl.getFavoriteStatus);
router.post('/favorites/:videoId', ctrl.toggleFavorite);

router.put('/progress/:videoId', ctrl.upsertProgress);
router.get('/progress/:videoId', ctrl.getProgress);

module.exports = router;
