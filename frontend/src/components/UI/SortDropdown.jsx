import { useState } from 'react';

const OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Xem nhiều nhất' },
];

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find(o => o.value === value) || OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-sm text-white hover:border-white/20 transition-all"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m5-9l4 4m0 0l4-4m-4 4V4" />
        </svg>
        {current.label}
        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 right-0 w-44 bg-[#141414] border border-white/10 rounded-xl shadow-2xl z-40 py-1 animate-scaleIn">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                  opt.value === value ? 'text-[#E50914] bg-[#E50914]/10 font-medium' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
