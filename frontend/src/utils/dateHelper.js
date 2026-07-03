/**
 * Date Helper — Xử lý mọi format ngày tháng từ Firestore
 * Firestore có thể trả về:
 *   - Timestamp object: { seconds: 1234567890, nanoseconds: 0 }
 *   - { _seconds, _nanoseconds }
 *   - ISO string: "2025-06-01T10:00:00.000Z"
 *   - Unix timestamp (number): 1234567890
 *   - null / undefined
 */

export const parseDate = (value) => {
  if (!value) return null;

  // Firestore Timestamp object (cả 2 dạng)
  if (value?.seconds !== undefined) {
    return new Date(value.seconds * 1000);
  }
  if (value?._seconds !== undefined) {
    return new Date(value._seconds * 1000);
  }

  // Nếu là number (unix timestamp)
  if (typeof value === 'number') {
    // Nếu < 10 tỷ thì là seconds, > thì là milliseconds
    return new Date(value < 1e12 ? value * 1000 : value);
  }

  // ISO string hoặc bất kỳ string nào
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date;
};

export const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return 'Không xác định';

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (value) => {
  const date = parseDate(value);
  if (!date) return '';

  const now = new Date();
  const diff = now - date; // milliseconds
  if (diff < 0) return 'Vừa xong';

  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);

  if (minutes < 1)  return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24)   return `${hours} giờ trước`;
  if (days < 7)     return `${days} ngày trước`;
  if (days < 30)    return `${Math.floor(days / 7)} tuần trước`;
  if (days < 365)   return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
};

export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
