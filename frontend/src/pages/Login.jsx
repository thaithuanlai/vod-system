import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { accessToken, user } = response.data;
      login(accessToken, user);
      toast.success('Đăng nhập thành công!');
      navigate('/videos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Cột trái: Hero/Branding (ẩn trên mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-20 bg-gradient-to-br from-[#1a0a0a] via-[#0a0a1a] to-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            <span className="text-[#E50914]">▶</span> VOD SYSTEM
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Nền tảng lưu trữ và phân phối video chất lượng cao với trí tuệ nhân tạo.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E50914]/20 flex items-center justify-center flex-shrink-0 text-xl">🎬</div>
              <div>
                <h3 className="text-white font-semibold text-lg">Xem video mọi lúc, mọi nơi</h3>
                <p className="text-gray-500 text-sm">Hỗ trợ đa nền tảng, mượt mà không độ trễ.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-xl">⚡</div>
              <div>
                <h3 className="text-white font-semibold text-lg">Xử lý tự động</h3>
                <p className="text-gray-500 text-sm">Transcode HLS đa độ phân giải hoàn toàn tự động bằng FFmpeg worker.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-xl">🎯</div>
              <div>
                <h3 className="text-white font-semibold text-lg">Streaming chất lượng cao</h3>
                <p className="text-gray-500 text-sm">Tự động điều chỉnh chất lượng theo tốc độ mạng của bạn.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-20 bg-[#0f0f0f]">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại</h2>
            <p className="text-gray-400">Đăng nhập để tiếp tục truy cập VOD System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Địa chỉ Email"
              type="email"
              name="email"
              placeholder="Nhập email của bạn..."
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="relative">
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[34px] text-gray-500 hover:text-white transition-colors text-sm font-medium"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-8"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-400 text-sm">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-white hover:text-[#E50914] hover:underline transition-colors font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}