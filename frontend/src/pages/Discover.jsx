import { useCallback, useEffect, useRef, useState } from 'react';
import { videoAPI } from '../services/api';
import useDebounce from '../hooks/useDebounce';
import VideoCard from '../components/Video/VideoCard';
import SkeletonCard from '../components/UI/SkeletonCard';
import SortDropdown from '../components/UI/SortDropdown';
import ViewToggle from '../components/UI/ViewToggle';
import Spinner from '../components/UI/Spinner';
import Button from '../components/UI/Button';

const PAGE_SIZE = 16;

export default function Discover() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState('newest');
  const [layout, setLayout] = useState(() => localStorage.getItem('discoverLayout') || 'grid');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [reloadToken, setReloadToken] = useState(0);
  const sentinelRef = useRef(null);

  const changeLayout = (v) => {
    setLayout(v);
    localStorage.setItem('discoverLayout', v);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadFirstPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await videoAPI.getAll({ scope: 'all', sort, search: search || undefined, limit: PAGE_SIZE });
        if (!res.data.success) throw new Error(res.data.message);
        if (!cancelled) {
          setVideos(res.data.data);
          setHasMore(res.data.data.length === PAGE_SIZE);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải danh sách video');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadFirstPage();
    return () => { cancelled = true; };
  }, [sort, search, reloadToken]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || videos.length === 0) return;
    setLoadingMore(true);
    try {
      const lastId = videos[videos.length - 1].id;
      const res = await videoAPI.getAll({ scope: 'all', sort, search: search || undefined, limit: PAGE_SIZE, startAfterId: lastId });
      if (res.data.success) {
        setVideos(prev => [...prev, ...res.data.data]);
        setHasMore(res.data.data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error('Lỗi tải thêm video:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [videos, sort, search, hasMore, loadingMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '400px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Khám phá</h1>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm video..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:border-white/30 focus:bg-[#1a1a1a] transition-all outline-none"
            />
          </div>
          <SortDropdown value={sort} onChange={setSort} />
          <ViewToggle value={layout} onChange={changeLayout} />
        </div>
      </div>

      {loading ? (
        <div className={layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-3'}>
          {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4 opacity-50">🔍</div>
          <h3 className="text-base font-semibold text-white mb-1.5">
            {search ? 'Không tìm thấy' : 'Chưa có video công khai nào'}
          </h3>
          <p className="text-sm text-gray-600 max-w-xs">
            {search ? `Không có video nào khớp "${search}"` : 'Hãy quay lại sau khi có video mới được xử lý xong'}
          </p>
        </div>
      ) : (
        <>
          <div className={layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-3'}>
            {videos.map(video => (
              <VideoCard key={video.id || video.videoId} video={video} layout={layout} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-4">
            {loadingMore && <Spinner size="md" />}
            {!hasMore && videos.length > 0 && (
              <p className="text-xs text-gray-600">Đã hiển thị tất cả video</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
