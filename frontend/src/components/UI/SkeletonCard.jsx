export default function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#161616',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Thumbnail skeleton */}
      <div
        style={{
          width: '100%',
          paddingTop: '56.25%', /* aspect ratio 16:9 */
          position: 'relative',
          background: 'linear-gradient(90deg, #1c1c1c 25%, #2a2a2a 50%, #1c1c1c 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}
      />

      {/* Text skeletons */}
      <div style={{ padding: '12px' }}>
        {/* Title line 1 */}
        <div
          style={{
            height: '14px',
            width: '80%',
            borderRadius: '6px',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #1c1c1c 25%, #2a2a2a 50%, #1c1c1c 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
            animationDelay: '0.1s',
          }}
        />
        {/* Title line 2 */}
        <div
          style={{
            height: '14px',
            width: '55%',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #1c1c1c 25%, #2a2a2a 50%, #1c1c1c 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
            animationDelay: '0.2s',
          }}
        />
      </div>
    </div>
  );
}
