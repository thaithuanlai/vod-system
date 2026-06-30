import { useEffect, useState, useCallback } from 'react';
import { fetchVideos } from '../services/videoApi';
import VideoCard from '../components/VideoCard';

// Lấy userId từ localStorage (được lưu khi login)
function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id;
  } catch { return undefined; }
}

const PAGE_SIZE = 12;
const POLL_INTERVAL_MS = 10000; // 10 giây

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const loadVideos = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const data = await fetchVideos(getUserId(), limit);
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Load lần đầu
  useEffect(() => {
    loadVideos(true);
  }, [loadVideos]);

  // Auto-refresh khi có video đang PROCESSING / UPLOADING
  useEffect(() => {
    const hasActive = videos.some(v => v.status === 'PROCESSING' || v.status === 'UPLOADING');
    if (!hasActive) return;

    const timer = setInterval(() => {
      loadVideos(false); // refresh thầm lặng, không show loading
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [videos, loadVideos]);

  // ---- RENDER ----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải danh sách video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Có lỗi xảy ra</h2>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => loadVideos(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📹 Video của tôi</h1>
            <p className="text-gray-500 text-sm mt-0.5">{videos.length} video</p>
          </div>
          <button
            onClick={() => loadVideos(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* Auto-refresh notice */}
        {videos.some(v => v.status === 'PROCESSING' || v.status === 'UPLOADING') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 mb-5 text-yellow-700 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Có video đang xử lý — tự động làm mới mỗi 10 giây
          </div>
        )}

        {/* Empty state */}
        {videos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-lg font-medium text-gray-600">Chưa có video nào</p>
            <p className="text-sm mt-1">Upload video đầu tiên của bạn!</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {/* Load more */}
            {videos.length >= limit && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setLimit(l => l + PAGE_SIZE)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Xem thêm
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
