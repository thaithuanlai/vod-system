const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stream.controller');


router.get('/:videoId/master.m3u8', ctrl.getMasterPlaylist);


router.get('/:videoId/:file', ctrl.getFileFlat);


router.get('/:videoId/:quality/playlist.m3u8', ctrl.getQualityPlaylist);


router.get('/:videoId/:quality/:segment', ctrl.getSegment);

module.exports = router;
