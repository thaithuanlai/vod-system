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