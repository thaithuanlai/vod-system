
const adminService = require('../services/admin.service');

const ok = (res, data, message = 'OK') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });




async function listAllVideos(req, res) {
  try {
    const { limit, startAfterId } = req.query;
    const videos = await adminService.listAllVideos({ limit, startAfterId });
    ok(res, videos);
  } catch (err) {
    console.error('[admin.listAllVideos]', err.message);
    fail(res, err.message);
  }
}




async function deleteAnyVideo(req, res) {
  try {
    await adminService.deleteAnyVideo(req.params.id);
    ok(res, null, 'Đã xóa video');
  } catch (err) {
    console.error('[admin.deleteAnyVideo]', err.message);
    fail(res, err.message);
  }
}




async function getStats(req, res) {
  try {
    const stats = await adminService.getStats();
    ok(res, stats);
  } catch (err) {
    console.error('[admin.getStats]', err.message);
    fail(res, err.message);
  }
}

module.exports = { listAllVideos, deleteAnyVideo, getStats };
