
const activityService = require('../services/activity.service');

const ok = (res, data, message = 'OK') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

function getUserId(req) {
  return req.headers['x-user-id'];
}




async function upsertProgress(req, res) {
  try {
    const { positionSeconds, durationSeconds } = req.body;
    await activityService.upsertProgress(getUserId(req), req.params.videoId, { positionSeconds, durationSeconds });
    ok(res, null, 'Đã lưu tiến độ xem');
  } catch (err) {
    console.error('[upsertProgress]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getProgress(req, res) {
  try {
    const progress = await activityService.getProgress(getUserId(req), req.params.videoId);
    ok(res, progress);
  } catch (err) {
    console.error('[getProgress]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getContinueWatching(req, res) {
  try {
    const { limit } = req.query;
    const items = await activityService.getContinueWatching(getUserId(req), limit);
    ok(res, items);
  } catch (err) {
    console.error('[getContinueWatching]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getFavoriteStatus(req, res) {
  try {
    const result = await activityService.getFavoriteStatus(getUserId(req), req.params.videoId);
    ok(res, result);
  } catch (err) {
    console.error('[getFavoriteStatus]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function toggleFavorite(req, res) {
  try {
    const result = await activityService.toggleFavorite(getUserId(req), req.params.videoId);
    ok(res, result);
  } catch (err) {
    console.error('[toggleFavorite]', err.message);
    fail(res, err.message, err.status || 500);
  }
}




async function getFavorites(req, res) {
  try {
    const items = await activityService.getFavorites(getUserId(req));
    ok(res, items);
  } catch (err) {
    console.error('[getFavorites]', err.message);
    fail(res, err.message, err.status || 500);
  }
}

module.exports = {
  upsertProgress,
  getProgress,
  getContinueWatching,
  getFavoriteStatus,
  toggleFavorite,
  getFavorites,
};
