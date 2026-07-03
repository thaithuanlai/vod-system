import { useEffect, useRef, useState } from 'react';

/**
 * HLS Video Player — Dark Theme với Quality Selector
 * Tự động fallback về native <video> nếu trình duyệt hỗ trợ HLS sẵn (Safari)
 */
export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;

    // Safari native HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    // hls.js
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
        const parsed = data.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
          label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}kbps`,
        }));
        setLevels(parsed);
        setCurrentLevel(-1);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('[HLS] Fatal error:', data);
          setError('Không thể tải video. Vui lòng thử lại.');
          hls.destroy();
        }
      });
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Keyboard shortcuts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleKeydown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case 'ArrowLeft':
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case 'f':
        case 'F':
          if (document.fullscreenElement) document.exitFullscreen();
          else video.requestFullscreen?.();
          break;
        case 'm':
        case 'M':
          video.muted = !video.muted;
          break;
        case '?':
          setShowShortcuts(prev => !prev);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  const changeQuality = (levelIndex) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setCurrentLevel(levelIndex);
    setShowQualityMenu(false);
  };

  if (error) {
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] flex flex-col items-center justify-center rounded-xl border border-[var(--border)]">
        <span className="text-4xl mb-4">⚠️</span>
        <p className="text-red-400 text-sm font-medium">{error}</p>
      </div>
    );
  }

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause' },
    { key: '← →', action: 'Tua -10s / +10s' },
    { key: '↑ ↓', action: 'Âm lượng +/- 10%' },
    { key: 'F', action: 'Toàn màn hình' },
    { key: 'M', action: 'Tắt / Bật tiếng' },
    { key: '?', action: 'Hiện / Ẩn phím tắt' },
  ];

  return (
    <div className="w-full relative group" onClick={() => setShowQualityMenu(false)}>
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video bg-black rounded-xl object-contain outline-none"
        playsInline
        poster={poster}
      />

      {/* Quality Selector */}
      {levels.length > 1 && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setShowQualityMenu(prev => !prev); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-lg border border-white/10 transition-all"
            title="Chất lượng video"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {currentLevel === -1 ? 'Auto' : levels.find(q => q.index === currentLevel)?.label || 'Auto'}
          </button>

          {showQualityMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-36 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 animate-scaleIn" onClick={e => e.stopPropagation()}>
              <div className="py-1">
                <button
                  onClick={() => changeQuality(-1)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${currentLevel === -1 ? 'text-[var(--accent)] bg-[var(--accent-dim)] font-medium' : 'text-white/80 hover:bg-white/10'}`}
                >
                  Auto {currentLevel === -1 && <span className="float-right">✓</span>}
                </button>
                {[...levels].sort((a, b) => b.height - a.height).map((level) => (
                  <button
                    key={level.index}
                    onClick={() => changeQuality(level.index)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${currentLevel === level.index ? 'text-[var(--accent)] bg-[var(--accent-dim)] font-medium' : 'text-white/80 hover:bg-white/10'}`}
                  >
                    {level.label}
                    {level.height >= 1080 && <span className="ml-1.5 text-[10px] text-yellow-400 font-bold">HD</span>}
                    {currentLevel === level.index && <span className="float-right text-[var(--accent)]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30 animate-fadeIn rounded-xl" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 min-w-[260px]" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">⌨️ Phím tắt</h3>
            <div className="space-y-2.5">
              {shortcuts.map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between gap-6">
                  <kbd className="px-2 py-0.5 bg-[var(--bg-hover)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)] font-mono min-w-[50px] text-center">
                    {key}
                  </kbd>
                  <span className="text-xs text-[var(--text-muted)]">{action}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-4 text-center">Nhấn ? hoặc click để đóng</p>
          </div>
        </div>
      )}

      {/* Shortcut hint */}
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button onClick={() => setShowShortcuts(true)} className="text-[10px] text-white/40 hover:text-white/70 transition-colors bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
          ? Phím tắt
        </button>
      </div>
    </div>
  );
}
