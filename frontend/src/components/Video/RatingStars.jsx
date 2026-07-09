import { useState } from 'react';
import { videoAPI } from '../../services/api';

export default function RatingStars({ videoId, avgRating = 0, ratingCount = 0 }) {
  const [avg, setAvg] = useState(avgRating);
  const [count, setCount] = useState(ratingCount);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (stars) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await videoAPI.rateVideo(videoId, stars);
      if (res.data.success) {
        setMyRating(stars);
        setAvg(res.data.data.avgRating);
        setCount(res.data.data.ratingCount);
      }
    } catch {
      // silent — rating is a non-critical enhancement
    } finally {
      setSubmitting(false);
    }
  };

  const displayValue = hoverRating || myRating;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            disabled={submitting}
            className="text-xl leading-none transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <span className={displayValue >= star ? 'text-yellow-400' : 'text-gray-700'}>★</span>
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {avg > 0 ? avg.toFixed(1) : '—'} ({count} đánh giá)
      </span>
    </div>
  );
}
