export default function VideoStatusBadge({ status, size = 'md', className = '' }) {
  const configs = {
    READY: {
      label: 'Sẵn sàng',
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      border: 'border-green-500/25',
      dot: 'bg-green-400',
    },
    PROCESSING: {
      label: 'Đang xử lý',
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border-yellow-500/25',
      dot: 'bg-yellow-400',
      animated: true,
    },
    UPLOADING: {
      label: 'Đang tải lên',
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/25',
      dot: 'bg-blue-400',
      animated: true,
    },
    ERROR: {
      label: 'Lỗi',
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/25',
      dot: 'bg-red-400',
    },
  };

  const cfg = configs[status] || configs.ERROR;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border} ${textSize} font-medium backdrop-blur-sm ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.animated ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}
