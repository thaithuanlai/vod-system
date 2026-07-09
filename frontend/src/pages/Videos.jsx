import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cleanVideoTitle } from '../utils/videoHelper';
import VideoCard from '../components/Video/VideoCard';
import HeroBanner from '../components/Video/HeroBanner';
import ContinueWatchingRow from '../components/Video/ContinueWatchingRow';
import SkeletonCard from '../components/UI/SkeletonCard';
import Button from '../components/UI/Button';

const PAGE_SIZE = 12;
const POLL_INTERVAL_MS = 10000;

export default function Videos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadVideos = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await videoAPI.getAll({ userId: user?.id, limit });
      if (res.data.success) setVideos(res.data.data);
      else throw new Error(res.data.message);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách video');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [limit, user?.id]);

  useEffect(() => { loadVideos(true); }, [loadVideos]);

  useEffect(() => {
    const hasActive = videos.some(v => v.status === 'PROCESSING' || v.status === 'UPLOADING');
    if (!hasActive) return;
    const timer = setInterval(() => loadVideos(false), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [videos, loadVideos]);

  const featuredVideo = useMemo(() => videos.find(v => v.status === 'READY') || null, [videos]);

  const filteredVideos = useMemo(() => {
    let result = videos;
    if (filter === 'READY') result = result.filter(v => v.status === 'READY');
    else if (filter === 'PROCESSING') result = result.filter(v => ['PROCESSING', 'UPLOADING'].includes(v.status));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => cleanVideoTitle(v.title).toLowerCase().includes(q));
    }
    return result;
  }, [videos, filter, searchQuery]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => loadVideos(true)}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6">
      {/* Hero */}
      {!loading && featuredVideo && filter === 'ALL' && !searchQuery && (
        <HeroBanner video={featuredVideo} />
      )}

      {!loading && filter === 'ALL' && !searchQuery && <ContinueWatchingRow />}

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16 mt-12" style={{ marginBottom: '80px' }}>
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          Video của bạn
          <span className="text-sm font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {filteredVideos.length}
          </span>
        </h2>

        {/* Controls: Search + Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm video..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:border-white/30 focus:bg-[#1a1a1a] transition-all outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center p-1 bg-[#141414] rounded-xl border border-white/10 w-full sm:w-auto">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'READY', label: 'Đã xử lý' },
              { key: 'PROCESSING', label: 'Đang xử lý' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === key
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Polling notice */}
      {videos.some(v => v.status === 'PROCESSING' || v.status === 'UPLOADING') && (
        <div className="flex items-center gap-2.5 bg-[#141414] border border-white/[0.06] p-2.5 rounded-lg mb-5 max-w-max">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          <span className="text-xs text-gray-400">Đang tự động làm mới...</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeInUp">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-2xl bg-[#161616] border border-white/[0.06] flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E50914] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">+</span>
            </div>
          </div>
          <h3 className="text-base font-semibold text-white mb-1.5">
            {searchQuery ? 'Không tìm thấy' : 'Chưa có video nào'}
          </h3>
          <p className="text-sm text-gray-600 mb-5 max-w-xs">
            {searchQuery ? `Không có video nào khớp "${searchQuery}"` : 'Tải lên video đầu tiên để bắt đầu'}
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate('/upload')} className="gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Tải lên video
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredVideos.map(video => (
              <VideoCard key={video.id || video.videoId} video={video} />
            ))}
          </div>
          {filteredVideos.length >= limit && filter === 'ALL' && !searchQuery && (
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => setLimit(l => l + PAGE_SIZE)}>Tải thêm video</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
