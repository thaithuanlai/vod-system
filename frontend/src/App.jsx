import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';

// Component bảo vệ route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Route chỉ dành cho khách (chưa login)
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/videos" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Routes>
              {/* Public Routes (Guest) */}
              <Route path="/login" element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } />
              <Route path="/register" element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } />

              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/videos" replace />} />
              
              <Route path="/videos" element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              } />

              <Route path="/videos/:id" element={
                <ProtectedRoute>
                  <VideoDetail />
                </ProtectedRoute>
              } />

              <Route path="/upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />

              {/* 404 Fallback */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
                  <div className="text-7xl mb-4 opacity-50">🎬</div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Trang không tồn tại</h2>
                  <p className="text-gray-500 mb-6">Đường dẫn bạn truy cập không hợp lệ.</p>
                  <a href="/videos" className="px-6 py-2 bg-[#E50914] text-white rounded-lg font-medium hover:bg-[#f40612] transition">
                    Về trang chủ
                  </a>
                </div>
              } />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}