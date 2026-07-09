import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({ baseURL: API_URL });


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};


export const videoAPI = {
  getAll:   (params) => api.get('/videos', { params }),
  getById:  (id)     => api.get(`/videos/${id}`),
  delete:   (id)     => api.delete(`/videos/${id}`),

  recordView:     (id)              => api.post(`/videos/${id}/view`),
  getRelated:     (id, limit)       => api.get(`/videos/${id}/related`, { params: { limit } }),

  toggleLike:     (id)              => api.post(`/videos/${id}/like`),
  getLikeStatus:  (id)              => api.get(`/videos/${id}/like-status`),

  getComments:    (id, params)      => api.get(`/videos/${id}/comments`, { params }),
  postComment:    (id, data)        => api.post(`/videos/${id}/comments`, data),
  deleteComment:  (id, commentId)   => api.delete(`/videos/${id}/comments/${commentId}`),

  rateVideo:      (id, stars)       => api.post(`/videos/${id}/rating`, { stars }),

  updateProgress: (id, data)        => api.put(`/users/me/progress/${id}`, data),
  getProgress:    (id)              => api.get(`/users/me/progress/${id}`),
  getContinueWatching: (limit)      => api.get('/users/me/continue-watching', { params: { limit } }),

  toggleFavorite:     (id) => api.post(`/users/me/favorites/${id}`),
  getFavoriteStatus:  (id) => api.get(`/users/me/favorites/${id}/status`),
  getFavorites:       ()   => api.get('/users/me/favorites'),
};

export const adminAPI = {
  getUsers:    ()            => api.get('/admin/users'),
  patchUser:   (id, data)    => api.patch(`/admin/users/${id}`, data),
  getVideos:   (params)      => api.get('/admin/videos', { params }),
  deleteVideo: (id)          => api.delete(`/admin/videos/${id}`),
  getStats:    ()            => api.get('/admin/stats'),
};


export const uploadVideo = (file, metadata, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('video', file);
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.description) formData.append('description', metadata.description);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText).message)); }
        catch { reject(new Error('Upload thất bại')); }
      }
    };

    xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));

    xhr.open('POST', `${API_URL}/upload`);
    const token = localStorage.getItem('token');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};

export default api;