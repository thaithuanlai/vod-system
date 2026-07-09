import { useEffect, useState } from 'react';
import { videoAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function FavoriteButton({ videoId }) {
  const { toast } = useToast();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    videoAPI.getFavoriteStatus(videoId).then(res => {
      if (!cancelled && res.data.success) setFavorited(res.data.data.favorited);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [videoId]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const prev = favorited;
    setFavorited(!prev);
    try {
      const res = await videoAPI.toggleFavorite(videoId);
      if (res.data.success) {
        setFavorited(res.data.data.favorited);
        toast.success(res.data.data.favorited ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích');
      }
    } catch {
      setFavorited(prev);
      toast.error('Không thể cập nhật yêu thích');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
        favorited ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-[#141414] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]'
      }`}
    >
      <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {favorited ? 'Đã lưu vào yêu thích' : 'Thêm vào yêu thích'}
    </button>
  );
}
