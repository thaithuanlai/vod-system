import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, actions }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#1f1f1f] border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-sm animate-fadeInUp">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="text-gray-300 text-sm mb-6">
          {children}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center justify-end gap-3 mt-6">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
