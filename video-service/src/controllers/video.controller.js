
const videoService = require('../services/video.service');


const ok = (res, data, message = 'OK') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

function getRequester(req) {
  return {
    id: req.headers['x-user-id'],
    email: req.headers['x-user-email'],
    role: req.headers['x-user-role'],
  };
}




async function listVideos(req, res) {
  try {
    const { userId, limit, scope, sort, startAfterId, search } = req.query;
    const videos = await videoService.listVideos({ userId, limit, scope, sort, startAfterId, search });
    ok(res, videos);
  } catch (err) {
    console.error('[listVideos]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getVideo(req, res) {
  try {
    const video = await videoService.getVideoById(req.params.id);
    if (!video) return fail(res, 'Video không tìm thấy', 404);
    ok(res, video);
  } catch (err) {
    console.error('[getVideo]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function createVideo(req, res) {
  try {
    const video = await videoService.createVideo(req.body);
    res.status(201).json({ success: true, message: 'Tạo video thành công', data: video });
  } catch (err) {
    console.error('[createVideo]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function updateVideo(req, res) {
  try {
    const video = await videoService.updateVideo(req.params.id, req.body, getRequester(req));
    ok(res, video, 'Cập nhật thành công');
  } catch (err) {
    console.error('[updateVideo]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function deleteVideo(req, res) {
  try {
    await videoService.deleteVideo(req.params.id, getRequester(req));
    ok(res, null, 'Xóa video thành công');
  } catch (err) {
    console.error('[deleteVideo]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function recordView(req, res) {
  try {
    await videoService.incrementView(req.params.id);
    ok(res, null, 'Đã ghi nhận lượt xem');
  } catch (err) {
    console.error('[recordView]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function toggleLike(req, res) {
  try {
    const requester = getRequester(req);
    const result = await videoService.toggleLike(req.params.id, requester.id);
    ok(res, result);
  } catch (err) {
    console.error('[toggleLike]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getLikeStatus(req, res) {
  try {
    const requester = getRequester(req);
    const result = await videoService.getLikeStatus(req.params.id, requester.id);
    ok(res, result);
  } catch (err) {
    console.error('[getLikeStatus]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function addComment(req, res) {
  try {
    const requester = getRequester(req);
    const { text, username } = req.body;

    if (!text || !text.trim()) {
      return fail(res, 'Nội dung bình luận không được để trống', 400);
    }

    const comment = await videoService.addComment(req.params.id, {
      userId: requester.id,
      username: username || requester.email?.split('@')[0] || 'Người dùng',
      text: text.trim(),
    });
    res.status(201).json({ success: true, message: 'Đã thêm bình luận', data: comment });
  } catch (err) {
    console.error('[addComment]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getComments(req, res) {
  try {
    const { limit, startAfterId } = req.query;
    const comments = await videoService.getComments(req.params.id, { limit, startAfterId });
    ok(res, comments);
  } catch (err) {
    console.error('[getComments]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function deleteComment(req, res) {
  try {
    await videoService.deleteComment(req.params.id, req.params.commentId, getRequester(req));
    ok(res, null, 'Đã xóa bình luận');
  } catch (err) {
    console.error('[deleteComment]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function rateVideo(req, res) {
  try {
    const requester = getRequester(req);
    const { stars } = req.body;
    const starsNum = Number(stars);

    if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
      return fail(res, 'Số sao đánh giá phải là số nguyên từ 1 đến 5', 400);
    }

    const result = await videoService.rateVideo(req.params.id, requester.id, starsNum);
    ok(res, result, 'Đã ghi nhận đánh giá');
  } catch (err) {
    console.error('[rateVideo]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getRelated(req, res) {
  try {
    const { limit } = req.query;
    const related = await videoService.getRelated(req.params.id, limit);
    ok(res, related);
  } catch (err) {
    console.error('[getRelated]', err.message);
    fail(res, err.message, err.status || 500);
  }
}

module.exports = {
  listVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  recordView,
  toggleLike,
  getLikeStatus,
  addComment,
  getComments,
  deleteComment,
  rateVideo,
  getRelated,
};
