import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import { cleanVideoTitle, getTitleInitials } from '../../utils/videoHelper';

const GRADIENT_PAIRS = [
  ['#1e1b4b', '#312e81'],
  ['#1c1917', '#292524'],
  ['#0f172a', '#1e293b'],
  ['#1a0a00', '#431407'],
  ['#042f2e', '#134e4a'],
  ['#1e1b4b', '#4a044e'],
];

function Thumbnail({ video }) {
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = video.thumbnailUrl && !imgError;
  const gIdx = (video.title?.charCodeAt(0) || 65) % GRADIENT_PAIRS.length;
  const [c1, c2] = GRADIENT_PAIRS[gIdx];

  if (!hasThumbnail) {
    return (
      <div
        className="w-full h-full flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        <span className="relative text-xl font-black text-white/20 tracking-wider select-none">
          {getTitleInitials(video.title)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={video.thumbnailUrl}
      alt=""
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}

export default function ContinueWatchingRow() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    videoAPI.getContinueWatching(10).then(res => {
      if (!cancelled && res.data.success) setItems(res.data.data);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-4">Tiếp tục xem</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {items.map(item => {
          const progressPct = item.durationSeconds
            ? Math.min(100, (item.positionSeconds / item.durationSeconds) * 100)
            : 0;
          return (
            <Link
              key={item.videoId}
              to={`/videos/${item.videoId}`}
              className="group flex-shrink-0 w-52 rounded-xl overflow-hidden bg-[#161616] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <div className="relative aspect-video bg-[#0f0f0f] overflow-hidden">
                <Thumbnail video={item.video} />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                  <div className="h-full bg-[#E50914]" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-white line-clamp-2">{cleanVideoTitle(item.video.title)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
