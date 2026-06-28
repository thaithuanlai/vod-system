import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../services/videoApi';

// Định dạng file cho phép
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Validate file trước khi chấp nhận
  function validateFile(f) {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'Chỉ hỗ trợ file video (MP4, WebM, MOV, AVI)';
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File quá lớn. Tối đa ${MAX_SIZE_MB}MB`;
    }
    return null;
  }

  // Xử lý chọn file
  function handleFileSelect(selectedFile) {
    setError('');
    setSuccess(null);
    const err = validateFile(selectedFile);
    if (err) {
      setError(err);
      return;
    }
    setFile(selectedFile);
  }

  // Input file change
  function handleInputChange(e) {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  }

  // Drag & Drop handlers
  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }

  // Upload
  async function handleUpload() {
    if (!file) return;
    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadVideo(file, (pct) => setProgress(pct));
      setSuccess(result);
      setFile(null);

      // Chuyển về danh sách video sau 2 giây
      setTimeout(() => navigate('/videos'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }

  // Xóa file đã chọn
  function clearFile() {
    setFile(null);
    setError('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Format file size: 12345678 → "11.8 MB"
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📤 Upload Video</h1>
          <p className="text-gray-500 text-sm mt-1">
            Chọn file video để tải lên hệ thống. Hỗ trợ MP4, WebM, MOV, AVI (tối đa {MAX_SIZE_MB}MB).
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Success State */}
          {success && (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Upload thành công!</h2>
              <p className="text-gray-500 text-sm mb-2">
                Video đang được đưa vào hàng đợi xử lý.
              </p>
              <p className="text-xs text-gray-400">Đang chuyển về danh sách video...</p>
            </div>
          )}

          {/* Upload Form */}
          {!success && (
            <div className="p-6">

              {/* Drop Zone */}
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
                  ${uploading ? 'pointer-events-none opacity-60' : ''}
                  ${dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : file
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={uploading}
                />

                {/* Icon */}
                <div className="text-4xl mb-3">
                  {file ? '🎬' : '📁'}
                </div>

                {file ? (
                  <>
                    <p className="font-medium text-gray-900 break-all">{file.name}</p>
                    <p className="text-gray-500 text-sm mt-1">{formatSize(file.size)}</p>
                    {!uploading && (
                      <button
                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                        className="mt-3 text-sm text-red-500 hover:text-red-600 underline"
                      >
                        Chọn file khác
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-700">
                      Kéo thả file vào đây
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      hoặc click để chọn file
                    </p>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600 font-medium">Đang tải lên...</span>
                    <span className="text-blue-600 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  ❌ {error}
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`
                  w-full mt-5 py-3 rounded-xl font-medium text-sm transition
                  ${!file || uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  }
                `}
              >
                {uploading ? 'Đang upload...' : file ? `Upload "${file.name}"` : 'Chọn file để upload'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-700">
          <p className="font-medium mb-1">ℹ️ Sau khi upload:</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-600 text-xs">
            <li>Video sẽ được tự động xử lý (transcode sang 360p, 720p, 1080p)</li>
            <li>Quá trình xử lý mất khoảng 5-15 phút tùy dung lượng</li>
            <li>Bạn có thể theo dõi trạng thái trong trang "Video của tôi"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
