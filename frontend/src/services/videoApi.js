// Service layer gọi API backend
const VIDEO_SERVICE_URL = import.meta.env.VITE_VIDEO_SERVICE_URL || 'http://localhost:3003';

/**
 * Lấy danh sách video theo userId
 * @param {string} userId
 * @param {number} limit
 */
export async function fetchVideos(userId, limit = 20) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (limit) params.append('limit', limit);

  const res = await fetch(`${VIDEO_SERVICE_URL}/videos?${params}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

/**
 * Lấy chi tiết một video
 * @param {string} videoId
 */
export async function fetchVideoById(videoId) {
  const res = await fetch(`${VIDEO_SERVICE_URL}/videos/${videoId}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}
