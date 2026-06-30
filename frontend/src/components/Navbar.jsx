import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/videos" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
          <span className="text-2xl">🎬</span>
          <span>VOD System</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            to="/videos"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              pathname.startsWith('/videos')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📹 Video của tôi
          </Link>
          <Link
            to="/upload"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/upload'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📤 Upload
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  )
}
