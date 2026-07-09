import { useEffect, useState } from 'react';
import { videoAPI } from '../../services/api';
import { formatCount } from '../../utils/videoHelper';

export default function LikeButton({ videoId, initialLikeCount = 0 }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    videoAPI.getLikeStatus(videoId).then(res => {
      if (!cancelled && res.data.success) setLiked(res.data.data.liked);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [videoId]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const prevLiked = liked;
    setLiked(!prevLiked);
    setCount(c => c + (prevLiked ? -1 : 1));
    try {
      const res = await videoAPI.toggleLike(videoId);
      if (res.data.success) setLiked(res.data.data.liked);
    } catch {
      setLiked(prevLiked);
      setCount(c => c + (prevLiked ? 1 : -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
        liked ? 'bg-[#E50914]/10 border-[#E50914]/30 text-[#E50914]' : 'bg-[#141414] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]'
      }`}
    >
      <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-7m0 0H5a2 2 0 00-2 2v6a2 2 0 002 2h2" />
      </svg>
      {liked ? 'Đã thích' : 'Thích'} · {formatCount(count)}
    </button>
  );
}
