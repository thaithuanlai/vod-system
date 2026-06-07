const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stream.controller');

// Master playlist
router.get('/:videoId/master.m3u8', ctrl.getMasterPlaylist);

// Quality-specific playlist
router.get('/:videoId/:quality/playlist.m3u8', ctrl.getQualityPlaylist);

// Video segments (.ts files)
router.get('/:videoId/:quality/:segment', ctrl.getSegment);

module.exports = router;
