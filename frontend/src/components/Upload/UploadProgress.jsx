import Spinner from '../UI/Spinner';

export default function UploadProgress({ status, progress, fileName, fileSize }) {
  if (status === 'idle' || status === 'error') return null;

  const formatSize = (bytes) => {
    if (!bytes) return '0 MB';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const loadedSize = fileSize ? (fileSize * (progress / 100)) : 0;

  if (status === 'uploading') {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mt-6 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#E50914]/20 flex items-center justify-center text-xl">
            ⬆️
          </div>
          <div>
            <h4 className="text-white font-medium">Đang tải lên...</h4>
            <p className="text-gray-400 text-sm truncate max-w-xs">{fileName}</p>
          </div>
          <div className="ml-auto text-xl font-bold text-[#E50914]">
            {progress}%
          </div>
        </div>

        <div className="w-full bg-[#2a2a2a] rounded-full h-3 mb-2 overflow-hidden">
          <div 
            className="bg-[#E50914] h-3 rounded-full transition-all duration-300 relative overflow-hidden" 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </div>
        </div>
        
        <div className="text-right text-xs text-gray-500 font-mono">
          {formatSize(loadedSize)} / {formatSize(fileSize)}
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mt-6 animate-fadeInUp text-center">
        <div className="flex justify-center mb-4">
          <Spinner size="lg" />
        </div>
        <h4 className="text-white font-medium text-lg mb-2">Đang xử lý video...</h4>
        <p className="text-gray-400 text-sm mb-1">
          Hệ thống đang tự động trích xuất thumbnail và tạo các luồng stream HLS (360p, 720p, 1080p).
        </p>
        <p className="text-gray-500 text-xs italic">
          Quá trình này thường mất từ 2-5 phút tùy thuộc vào độ dài video.
        </p>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mt-6 animate-fadeInUp text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✅
        </div>
        <h4 className="text-green-400 font-bold text-lg mb-2">Video đã sẵn sàng!</h4>
        <p className="text-green-500/70 text-sm">
          Đang chuyển hướng về trang chi tiết video...
        </p>
      </div>
    );
  }

  return null;
}
