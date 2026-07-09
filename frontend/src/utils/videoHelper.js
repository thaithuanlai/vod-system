










export const cleanVideoTitle = (title, maxLength = 50) => {
  if (!title || typeof title !== 'string') {
    return 'Video không có tiêu đề';
  }

  const raw = title.trim();




  const uuidLikePattern = /^[0-9a-fA-F]{6,}[\s\-_][0-9a-fA-F]{3,}/;
  const isUUIDLike = uuidLikePattern.test(raw);

  if (isUUIDLike) {


    const initials = raw.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    return initials ? `Video [${initials}]` : 'Video không có tiêu đề';
  }


  const cleaned = raw
    .replace(/\.[^/.]+$/, '')      
    .replace(/[-_]/g, ' ')         
    .replace(/\s+/g, ' ')          
    .trim();

  if (!cleaned) return 'Video không có tiêu đề';


  const capitalized = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');


  if (capitalized.length > maxLength) {
    return capitalized.slice(0, maxLength - 3).trimEnd() + '...';
  }

  return capitalized;
};




export const formatCount = (count = 0) => {
  const n = Number(count) || 0;
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
  return `${(n / 1000000).toFixed(n % 1000000 >= 100000 ? 1 : 0)}M`;
};




export const getTitleInitials = (title = '') => {
  const clean = cleanVideoTitle(title);
  if (clean === 'Video không có tiêu đề') return '▶';


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
