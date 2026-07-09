const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/video.controller');

router.get('/', ctrl.listVideos);
router.get('/:id', ctrl.getVideo);
router.post('/', ctrl.createVideo);
router.patch('/:id', ctrl.updateVideo);
router.delete('/:id', ctrl.deleteVideo);

router.post('/:id/view', ctrl.recordView);
router.get('/:id/related', ctrl.getRelated);

router.post('/:id/like', ctrl.toggleLike);
router.get('/:id/like-status', ctrl.getLikeStatus);

router.get('/:id/comments', ctrl.getComments);
router.post('/:id/comments', ctrl.addComment);
router.delete('/:id/comments/:commentId', ctrl.deleteComment);

router.post('/:id/rating', ctrl.rateVideo);

module.exports = router;
