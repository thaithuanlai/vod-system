import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../UI/Button';
import VideoStatusBadge from './VideoStatusBadge';
import { cleanVideoTitle } from '../../utils/videoHelper';

const BANNER_GRADIENTS = [
  ['#1a0533', '#0d0221'],
  ['#0d1b2a', '#1b4332'],
  ['#1a0a00', '#3d0000'],
  ['#0a0a2e', '#16213e'],
  ['#1a1a00', '#2d4a00'],
  ['#2d0033', '#0d0033'],
];

export default function HeroBanner({ video }) {
  const [imgError, setImgError] = useState(false);
  if (!video) return null;

  const cleanTitle = cleanVideoTitle(video.title, 80);
  const hasValidThumbnail = video.thumbnailUrl && !imgError;
  const gIdx = (video.title?.charCodeAt(0) || 0) % BANNER_GRADIENTS.length;
  const [c1, c2] = BANNER_GRADIENTS[gIdx];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-16 shadow-2xl group min-h-[360px] md:min-h-[420px]">
      {/* Background */}
      <div className="absolute inset-0">
        {hasValidThumbnail ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full relative" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
            <div className="absolute top-10 right-20 w-48 h-48 rounded-full bg-white/[0.04]" />
            <div className="absolute bottom-0 left-10 w-36 h-36 rounded-full bg-white/[0.03]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 max-w-3xl z-10">
        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded text-[11px] font-bold text-white/90 tracking-widest uppercase border border-white/20 w-fit mb-4">
          Mới nhất
        </span>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-[1.15]">
          {cleanTitle}
        </h1>
        {video.description && (
          <p className="text-gray-400 text-sm mb-5 line-clamp-2 max-w-lg">{video.description}</p>
        )}
        <div className="flex items-center gap-3">
          <Link to={`/videos/${video.id || video.videoId}`}>
            <Button size="md" className="gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
              Xem ngay
            </Button>
          </Link>
          <VideoStatusBadge status={video.status} />
        </div>
      </div>
    </div>
  );
}
