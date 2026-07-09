import { useEffect, useState } from 'react';
import { videoAPI } from '../services/api';
import VideoCard from '../components/Video/VideoCard';
import SkeletonCard from '../components/UI/SkeletonCard';
import Button from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await videoAPI.getFavorites();
        if (!res.data.success) throw new Error(res.data.message);
        if (!cancelled) setItems(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải danh sách yêu thích');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reloadToken]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => setReloadToken(t => t + 1)}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Yêu thích</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4 opacity-50">⭐</div>
          <h3 className="text-base font-semibold text-white mb-1.5">Chưa có video yêu thích nào</h3>
          <p className="text-sm text-gray-600 mb-5 max-w-xs">Nhấn "Thêm vào yêu thích" trên trang chi tiết video để lưu lại đây</p>
          <Button onClick={() => navigate('/discover')}>Khám phá video</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <VideoCard key={item.videoId} video={item.video} />
          ))}
        </div>
      )}
    </div>
  );
}
