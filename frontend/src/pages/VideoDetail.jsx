import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVideoById } from '../services/videoApi';
import StatusBadge from '../components/StatusBadge';
import HlsPlayer from '../components/HlsPlayer';

const STREAMING_URL = import.meta.env.VITE_STREAMING_SERVICE_URL || 'http://localhost:3005';

// Format ngày giờ
function formatDate(val) {
  if (!val) return '—';
  const date = val?.toDate ? val.toDate() : val?.seconds ? new Date(val.seconds * 1000) : new Date(val);
  return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
}

// Format thời lượng: 125 → "2:05"
function formatDuration(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVideoById(id);
        if (!cancelled) setVideo(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải thông tin video...</p>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Có lỗi xảy ra</h2>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/videos')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!video) return null;

  const hlsSrc = `${STREAMING_URL}/stream/${video.videoId || video.id}/master.m3u8`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate('/videos')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-5 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </button>

        {/* Video Player hoặc trạng thái */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Player area */}
          {video.status === 'READY' ? (
            <div className="p-4 bg-black">
              <HlsPlayer src={hlsSrc} />
            </div>
          ) : video.status === 'PROCESSING' ? (
            <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-yellow-300 font-medium">Đang xử lý video...</p>
              <p className="text-gray-400 text-sm">Vui lòng quay lại sau ít phút</p>
            </div>
          ) : video.status === 'UPLOADING' ? (
            <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-300 font-medium">Đang upload video...</p>
            </div>
          ) : video.status === 'ERROR' ? (
            <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center gap-3">
              <div className="text-5xl">❌</div>
              <p className="text-red-400 font-medium">Xử lý video thất bại</p>
              {video.errorMessage && (
                <p className="text-gray-400 text-sm max-w-md text-center">{video.errorMessage}</p>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <p className="text-gray-400">Trạng thái không xác định</p>
            </div>
          )}

          {/* Info section */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{video.title}</h1>
              <StatusBadge status={video.status} />
            </div>

            {video.description && (
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{video.description}</p>
            )}

            {/* Metadata */}
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Ngày tạo</span>
                <p className="text-gray-700 font-medium mt-0.5">{formatDate(video.createdAt)}</p>
              </div>
              {video.duration > 0 && (
                <div>
                  <span className="text-gray-400">Thời lượng</span>
                  <p className="text-gray-700 font-medium mt-0.5">{formatDuration(video.duration)}</p>
                </div>
              )}
              {video.processedAt && (
                <div>
                  <span className="text-gray-400">Xử lý xong lúc</span>
                  <p className="text-gray-700 font-medium mt-0.5">{formatDate(video.processedAt)}</p>
                </div>
              )}
              <div>
                <span className="text-gray-400">Video ID</span>
                <p className="text-gray-500 font-mono text-xs mt-0.5 break-all">{video.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
