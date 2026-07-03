import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../services/api';
import { useToast } from '../context/ToastContext';
import DropZone from '../components/Upload/DropZone';
import UploadProgress from '../components/Upload/UploadProgress';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const MAX_SIZE_MB = 500;

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({ title: '', description: '' });
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [fileError, setFileError] = useState('');

  const handleFileSelect = (selectedFile) => {
    setFileError('');
    if (!ALLOWED_TYPES.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      setFileError('Định dạng không hỗ trợ. Chỉ chấp nhận: MP4, WebM, MOV, AVI, MKV');
      return;
    }
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File quá lớn. Tối đa ${MAX_SIZE_MB}MB`);
      return;
    }
    setFile(selectedFile);
    if (!metadata.title) {
      setMetadata(prev => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() }));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);
    try {
      await uploadVideo(file, metadata, (pct) => {
        setProgress(pct);
        if (pct === 100) setStatus('processing');
      });
      setStatus('ready');
      toast.success('Upload video thành công!');
      setTimeout(() => navigate('/videos'), 3000);
    } catch (err) {
      setStatus('error');
      toast.error(err.message || 'Lỗi trong quá trình upload');
    }
  };

  const isUploading = status !== 'idle' && status !== 'error';

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      {/* Page Header - đã có margin top từ Layout */}
      <div className="py-6 border-b border-white/[0.06] mb-6">
        <h1 className="text-xl font-bold text-white">Tải lên Video</h1>
        <p className="text-sm text-gray-500 mt-1">Hỗ trợ MP4, WebM, MOV, AVI · Tối đa {MAX_SIZE_MB}MB</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-12">
        {/* Form + Info — 2/5 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#141414] rounded-xl border border-white/[0.06] p-5">
            <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Thông tin video</h2>
            <div className="space-y-4">
              <Input
                label="Tiêu đề"
                placeholder="Nhập tiêu đề video..."
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                disabled={isUploading}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Mô tả</label>
                <textarea
                  className="w-full bg-[#1c1c1c] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914]/60 min-h-[100px] resize-y transition-colors"
                  placeholder="Mô tả ngắn về video..."
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-300 mb-1.5">Quy trình xử lý</p>
                <ul className="space-y-1">
                  {['Chuyển đổi sang HLS (360p/720p/1080p)', 'Tự động trích xuất thumbnail', 'Thời gian xử lý: 2–5 phút'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-blue-300/70">
                      <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Dropzone — 3/5 */}
        <div className="lg:col-span-3">
          {!isUploading ? (
            <>
              <DropZone file={file} onFileSelect={handleFileSelect} onClearFile={() => { setFile(null); setFileError(''); }} />
              {fileError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  ❌ {fileError}
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <Button size="lg" disabled={!file || !!fileError} onClick={handleUpload} className="w-full sm:w-auto min-w-[180px]">
                  Tải lên ngay
                </Button>
              </div>
            </>
          ) : (
            <UploadProgress status={status} progress={progress} fileName={file?.name} fileSize={file?.size} />
          )}
        </div>
      </div>
    </div>
  );
}
