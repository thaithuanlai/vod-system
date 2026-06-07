import { useEffect, useRef, useState } from 'react';

/**
 * HLS Video Player dùng hls.js
 * Tự động fallback về native <video> nếu trình duyệt hỗ trợ HLS sẵn (Safari)
 */
export default function HlsPlayer({ src }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]);       // Các quality levels
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;

    // Nếu trình duyệt hỗ trợ HLS native (Safari) → dùng thẳng
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    // Dùng hls.js cho các trình duyệt còn lại
    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) {
        setError('Trình duyệt không hỗ trợ HLS');
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setLevels(data.levels);
        video.play().catch(() => {}); // autoplay có thể bị chặn
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('[HLS] Fatal error:', data);
          setError('Không thể tải video. Vui lòng thử lại.');
          hls.destroy();
        }
      });
    });

    // Cleanup khi component unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Đổi quality level
  function handleQualityChange(e) {
    const level = Number(e.target.value);
    setCurrentLevel(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center rounded-xl">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video bg-black rounded-xl"
        playsInline
      />

      {/* Quality selector - chỉ hiện khi có nhiều hơn 1 level */}
      {levels.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Chất lượng:</span>
          <select
            value={currentLevel}
            onChange={handleQualityChange}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={-1}>Tự động</option>
            {levels.map((level, index) => (
              <option key={index} value={index}>
                {level.height ? `${level.height}p` : `Level ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
