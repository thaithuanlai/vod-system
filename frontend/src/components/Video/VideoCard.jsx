import { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoStatusBadge from './VideoStatusBadge';
import { formatRelativeTime, formatDuration } from '../../utils/dateHelper';
import { cleanVideoTitle, getTitleInitials, formatCount } from '../../utils/videoHelper';

const GRADIENT_PAIRS = [
  ['#1e1b4b', '#312e81'],
  ['#1c1917', '#292524'],
  ['#0f172a', '#1e293b'],
  ['#1a0a00', '#431407'],
  ['#042f2e', '#134e4a'],
  ['#1e1b4b', '#4a044e'],
];

function Thumbnail({ video, hasThumbnail, setImgError, cleanTitle, initials, c1, c2, duration }) {
  return (
    <div className="relative aspect-video overflow-hidden">
      {hasThumbnail ? (
        <img
          src={video.thumbnailUrl}
          alt={cleanTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center relative"
          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/[0.03]" />
          <span className="relative text-3xl font-black text-white/20 tracking-wider select-none">
            {initials}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>

      {duration && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[11px] text-white font-medium">
          {duration}
        </div>
      )}

      <div className="absolute top-2 right-2">
        <VideoStatusBadge status={video.status} size="sm" />
      </div>
    </div>
  );
}

export default function VideoCard({ video, layout = 'grid' }) {
  const [imgError, setImgError] = useState(false);
  if (!video) return null;

  const cleanTitle = cleanVideoTitle(video.title);
  const initials = getTitleInitials(video.title);
  const gIdx = (video.title?.charCodeAt(0) || 65) % GRADIENT_PAIRS.length;
  const [c1, c2] = GRADIENT_PAIRS[gIdx];
  const hasThumbnail = video.thumbnailUrl && !imgError;
  const duration = formatDuration(video.duration);

  const stats = [];
  if (video.viewCount !== undefined) stats.push(`${formatCount(video.viewCount)} lượt xem`);
  if (video.likeCount) stats.push(`${formatCount(video.likeCount)} thích`);

  if (layout === 'list') {
    return (
      <Link
        to={`/videos/${video.id || video.videoId}`}
        className="group flex gap-4 rounded-xl overflow-hidden bg-[#161616] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 p-2"
      >
        <div className="w-48 flex-shrink-0 rounded-lg overflow-hidden">
          <Thumbnail video={video} hasThumbnail={hasThumbnail} setImgError={setImgError} cleanTitle={cleanTitle} initials={initials} c1={c1} c2={c2} duration={duration} />
        </div>
        <div className="py-1 min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-white leading-tight line-clamp-2 mb-1.5">
            {cleanTitle}
          </h3>
          {video.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">{video.description}</p>
          )}
          <p className="text-[11px] text-gray-500">
            {stats.join(' • ')}{stats.length > 0 && ' • '}{formatRelativeTime(video.createdAt || video.created_at)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/videos/${video.id || video.videoId}`}
      className="group block rounded-xl overflow-hidden bg-[#161616] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
    >
      <Thumbnail video={video} hasThumbnail={hasThumbnail} setImgError={setImgError} cleanTitle={cleanTitle} initials={initials} c1={c1} c2={c2} duration={duration} />

      <div className="p-3">
        <h3 className="font-semibold text-[13px] text-white leading-tight line-clamp-2 mb-1">
          {cleanTitle}
        </h3>
        <p className="text-[11px] text-gray-500">
          {stats.length > 0 ? `${stats.join(' • ')} • ` : ''}{formatRelativeTime(video.createdAt || video.created_at)}
        </p>
      </div>
    </Link>
  );
}
