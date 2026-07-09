const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const requireAdmin = require('../middlewares/requireAdmin.middleware');

router.use(requireAdmin);

router.get('/', ctrl.listAllVideos);
router.delete('/:id', ctrl.deleteAnyVideo);

module.exports = router;
