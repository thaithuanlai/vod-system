// Service layer gọi API backend qua Gateway
// Sử dụng axios instance từ api.js (đã có JWT interceptor)
import api from './api';

/**
 * Lấy danh sách video theo userId
 * @param {string} userId
 * @param {number} limit
 */
export async function fetchVideos(userId, limit = 20) {
  const params = {};
  if (userId) params.userId = userId;
  if (limit) params.limit = limit;

  const res = await api.get('/videos', { params });
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
}

/**
 * Lấy chi tiết một video
 * @param {string} videoId
 */
export async function fetchVideoById(videoId) {
  const res = await api.get(`/videos/${videoId}`);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
}

/**
 * Upload video file qua Gateway
 * @param {File} file - File object từ input
 * @param {function} onProgress - Callback tiến độ: (percent)
 */
export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append('video', file);

  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return res.data;
}

/**
 * Xóa video
 * @param {string} videoId
 */
export async function deleteVideo(videoId) {
  const res = await api.delete(`/videos/${videoId}`);
  return res.data;
}
