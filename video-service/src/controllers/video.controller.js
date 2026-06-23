// Controller - nhận request, gọi service, trả response
const videoService = require('../services/video.service');

// Helper: trả response thống nhất
const ok = (res, data, message = 'OK') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

/**
 * GET /videos?userId=...&limit=...
 */
async function listVideos(req, res) {
  try {
    const { userId, limit } = req.query;
    const videos = await videoService.listVideos({ userId, limit });
    ok(res, videos);
  } catch (err) {
    console.error('[listVideos]', err.message);
    fail(res, err.message);
  }
}

/**
 * GET /videos/:id
 */
async function getVideo(req, res) {
  try {
    const video = await videoService.getVideoById(req.params.id);
    if (!video) return fail(res, 'Video không tìm thấy', 404);
    ok(res, video);
  } catch (err) {
    console.error('[getVideo]', err.message);
    fail(res, err.message);
  }
}

/**
 * POST /videos
 */
async function createVideo(req, res) {
  try {
    const video = await videoService.createVideo(req.body);
    res.status(201).json({ success: true, message: 'Tạo video thành công', data: video });
  } catch (err) {
    console.error('[createVideo]', err.message);
    fail(res, err.message);
  }
}

/**
 * PATCH /videos/:id
 */
async function updateVideo(req, res) {
  try {
    const video = await videoService.updateVideo(req.params.id, req.body);
    ok(res, video, 'Cập nhật thành công');
  } catch (err) {
    console.error('[updateVideo]', err.message);
    fail(res, err.message);
  }
}

/**
 * DELETE /videos/:id
 */
async function deleteVideo(req, res) {
  try {
    await videoService.deleteVideo(req.params.id);
    ok(res, null, 'Xóa video thành công');
  } catch (err) {
    console.error('[deleteVideo]', err.message);
    fail(res, err.message);
  }
}

module.exports = { listVideos, getVideo, createVideo, updateVideo, deleteVideo };
