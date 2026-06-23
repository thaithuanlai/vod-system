import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

// Format thời gian: "12/06/2025 14:30"
function formatDate(val) {
  if (!val) return '—';
  // Firestore Timestamp có _seconds hoặc toDate()
  const date = val?.toDate ? val.toDate() : val?.seconds ? new Date(val.seconds * 1000) : new Date(val);
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/videos/${video.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Chưa có thumbnail</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
            {video.title || 'Không có tiêu đề'}
          </h3>
          <StatusBadge status={video.status} />
        </div>

        {video.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-2">{video.description}</p>
        )}

        <p className="text-gray-400 text-xs mt-2">📅 {formatDate(video.createdAt)}</p>
      </div>
    </div>
  );
}
