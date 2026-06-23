import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">VOD System</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>
      <div className="container mx-auto mt-10 p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            Xin chào, {user?.username}! 👋
          </h2>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-500 mt-4">
            Chào mừng đến với hệ thống VOD!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;