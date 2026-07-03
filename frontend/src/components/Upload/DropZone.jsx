import { useRef } from 'react';

export default function DropZone({ file, onFileSelect, onClearFile, disabled }) {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    e.currentTarget.classList.add('!border-[#E50914]', '!bg-[#E50914]/5');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('!border-[#E50914]', '!bg-[#E50914]/5');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    e.currentTarget.classList.remove('!border-[#E50914]', '!bg-[#E50914]/5');
    const f = e.dataTransfer.files?.[0];
    if (f) onFileSelect(f);
  };

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
        flex flex-col items-center justify-center min-h-[320px]
        ${disabled ? 'opacity-50 cursor-not-allowed border-white/[0.06]' : 'cursor-pointer hover:border-[#E50914]/50 hover:bg-white/[0.02]'}
        ${file ? 'border-[#E50914]/40 bg-[#E50914]/[0.03]' : 'border-white/[0.08] bg-[#111111]'}
      `}
    >
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleChange} className="hidden" disabled={disabled} />

      {file ? (
        <div className="flex flex-col items-center animate-fadeIn">
          <div className="w-14 h-14 bg-[#E50914]/15 rounded-full flex items-center justify-center mb-4 text-2xl">🎬</div>
          <p className="font-semibold text-white break-all mb-1 text-sm">{file.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatSize(file.size)}</span>
            <span>·</span>
            <span>{file.type || 'video/*'}</span>
          </div>
          {!disabled && (
            <button
              onClick={(e) => { e.stopPropagation(); onClearFile(); }}
              className="mt-5 px-4 py-1.5 rounded-full bg-[#1c1c1c] text-gray-400 hover:bg-[#E50914] hover:text-white transition-colors text-xs font-medium border border-white/[0.06]"
            >
              Chọn file khác
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fadeIn">
          <svg className="w-14 h-14 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-1.5">Kéo thả video vào đây</h3>
          <p className="text-gray-600 text-sm mb-5">hoặc click để chọn file</p>
          <div className="text-[11px] text-gray-600 font-mono bg-[#0e0e0e] px-3 py-1.5 rounded border border-white/[0.06]">
            MP4, WebM, MOV, AVI · Tối đa 500MB
          </div>
        </div>
      )}
    </div>
  );
}
