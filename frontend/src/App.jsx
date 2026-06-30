import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';

// Protected Route component từ nhánh HEAD để bảo vệ các route bên trong
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar /> {/* Hiển thị thanh điều hướng sau khi đăng nhập */}
      {children}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Các Route Public không cần token */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Các Route cần Bảo mật - Chỉ cho phép truy cập sau khi login */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/videos" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />

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
  );
}