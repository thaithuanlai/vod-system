export const API_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

export const VIDEO_STATUS = {
  UPLOADING:  'UPLOADING',
  PROCESSING: 'PROCESSING',
  READY:      'READY',
  ERROR:      'ERROR',
};
