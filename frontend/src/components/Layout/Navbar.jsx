import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const navLinks = [
    { to: '/videos', label: 'Trang chủ' },
    { to: '/upload', label: 'Tải lên' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        zIndex: 50,
        backgroundColor: scrolled ? 'rgba(10,10,10,0.95)' : 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">

        {/* Left: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link to="/videos" className="text-xl font-black text-[var(--accent)] tracking-tight flex items-center gap-1">
            <span>▶</span> VOD
          </Link>

          <div className="hidden md:flex items-center gap-5 text-sm font-medium">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`transition-colors ${location.pathname === to ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: User */}
        <div className="flex items-center gap-3 relative">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm text-[var(--text-secondary)] group-hover:text-white transition">
              {user?.username}
            </span>
            <svg className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-10 right-0 w-48 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl z-40 py-1.5 animate-scaleIn">
                <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                  <p className="text-[10px] text-[var(--text-muted)]">Đăng nhập với</p>
                  <p className="text-sm font-medium text-white truncate">{user?.email || user?.username}</p>
                </div>
                {/* Mobile nav links */}
                <div className="md:hidden border-b border-[var(--border)] mb-1 pb-1">
                  {navLinks.map(({ to, label }) => (
                    <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition">
                      {label}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition"
                >
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
