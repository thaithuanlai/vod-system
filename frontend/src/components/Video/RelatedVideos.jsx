import { useEffect, useState } from 'react';
import { videoAPI } from '../../services/api';
import VideoCard from './VideoCard';

export default function RelatedVideos({ videoId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await videoAPI.getRelated(videoId, 8);
        if (!cancelled && res.data.success) setVideos(res.data.data);
      } catch {
        // silent — related videos are a non-critical enhancement
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [videoId]);

  if (loading || videos.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Video liên quan</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map(v => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
