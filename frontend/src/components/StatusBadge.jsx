// Badge hiển thị trạng thái video với màu sắc khác nhau
const STATUS_CONFIG = {
  UPLOADING:   { label: 'Đang upload',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  PROCESSING:  { label: 'Đang xử lý',   bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  READY:       { label: 'Sẵn sàng',     bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  ERROR:       { label: 'Lỗi',          bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Không rõ',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
