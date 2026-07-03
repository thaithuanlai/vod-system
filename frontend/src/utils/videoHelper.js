/**
 * Video Helper — Làm sạch tên video và tạo initials
 */

/**
 * Nhận diện và làm sạch các dạng filename sau:
 * 1. "snapsave.vn_facebook_6a43de4da1671.mp4" → "Snapsave Vn Facebook"
 * 2. "Ca2cbedc 0db7 4ed4 805d 402dca6aa651 1 all 978" → "Video [CO]"
 * 3. "317609_medium" → "317609 Medium"
 * 4. null / undefined → "Video không có tiêu đề"
 */
export const cleanVideoTitle = (title, maxLength = 50) => {
  if (!title || typeof title !== 'string') {
    return 'Video không có tiêu đề';
  }

  const raw = title.trim();

  // ── Nhận diện UUID pattern ────────────────────────────────────
  // Pattern: chuỗi hex 8+ ký tự, có thể xen kẽ số và chữ a-f
  // Ví dụ: "Ca2cbedc 0db7 4ed4 805d 402dca6aa651"
  const uuidLikePattern = /^[0-9a-fA-F]{6,}[\s\-_][0-9a-fA-F]{3,}/;
  const isUUIDLike = uuidLikePattern.test(raw);

  if (isUUIDLike) {
    // Không thể tạo tên có nghĩa từ UUID
    // Trả về "Video" kèm initials từ 2 ký tự đầu
    const initials = raw.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    return initials ? `Video [${initials}]` : 'Video không có tiêu đề';
  }

  // ── Làm sạch filename thông thường ───────────────────────────
  const cleaned = raw
    .replace(/\.[^/.]+$/, '')      // xóa extension (.mp4, .mov...)
    .replace(/[-_]/g, ' ')         // gạch ngang/dưới → space
    .replace(/\s+/g, ' ')          // nhiều space → 1 space
    .trim();

  if (!cleaned) return 'Video không có tiêu đề';

  // Capitalize chữ cái đầu mỗi từ
  const capitalized = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Cắt nếu quá dài
  if (capitalized.length > maxLength) {
    return capitalized.slice(0, maxLength - 3).trimEnd() + '...';
  }

  return capitalized;
};

/**
 * Lấy 2 ký tự đầu để hiển thị trên thumbnail placeholder
 */
export const getTitleInitials = (title = '') => {
  const clean = cleanVideoTitle(title);
  if (clean === 'Video không có tiêu đề') return '▶';

  // Nếu là dạng "Video [XX]" → lấy XX
  const bracketMatch = clean.match(/\[([A-Z]{1,2})\]/);
  if (bracketMatch) return bracketMatch[1];

  const words = clean.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return '▶';
};
