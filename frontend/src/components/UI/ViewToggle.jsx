export default function ViewToggle({ value, onChange }) {
  return (
    <div className="flex items-center p-1 bg-[#141414] rounded-xl border border-white/10">
      <button
        onClick={() => onChange('grid')}
        title="Dạng lưới"
        className={`p-2 rounded-lg transition-all ${value === 'grid' ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onClick={() => onChange('list')}
        title="Dạng danh sách"
        className={`p-2 rounded-lg transition-all ${value === 'list' ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
