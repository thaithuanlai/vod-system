<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Videos from './pages/Videos'
import VideoDetail from './pages/VideoDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Redirect trang chủ về /videos */}
          <Route path="/" element={<Navigate to="/videos" replace />} />

          {/* Danh sách video - T36 */}
          <Route path="/videos" element={<Videos />} />

          {/* Chi tiết + player video - T37 */}
          <Route path="/videos/:id" element={<VideoDetail />} />

          {/* 404 fallback */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
              <div className="text-7xl mb-4">🎬</div>
              <h2 className="text-xl font-semibold text-gray-600">Trang không tìm thấy</h2>
              <a href="/videos" className="mt-4 text-blue-500 hover:underline text-sm">
                Về trang danh sách video
              </a>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
>>>>>>> develop
