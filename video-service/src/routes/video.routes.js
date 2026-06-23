const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/video.controller');

router.get('/', ctrl.listVideos);
router.get('/:id', ctrl.getVideo);
router.post('/', ctrl.createVideo);
router.patch('/:id', ctrl.updateVideo);
router.delete('/:id', ctrl.deleteVideo);

module.exports = router;
