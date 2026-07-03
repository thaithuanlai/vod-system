import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength calculation
  const strength = useMemo(() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 1;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s += 1;
    if (/\d/.test(p)) s += 1;
    if (/[^A-Za-z0-9]/.test(p)) s += 1;
    return s;
  }, [formData.password]);

  const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid = 
    formData.username.length >= 3 && 
    formData.email.includes('@') && 
    formData.password.length >= 8 && 
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      // 1. Đăng ký
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // 2. Tự động đăng nhập sau khi đăng ký thành công
      const loginRes = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      const { accessToken, user } = loginRes.data;
      login(accessToken, user);
      
      toast.success('Đăng ký thành công! Chào mừng bạn đến với VOD System.');
      navigate('/videos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Cột trái: Hero/Branding (ẩn trên mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-20 bg-gradient-to-tr from-[#1a0a0a] via-[#0a0a1a] to-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Tham gia VOD System ngay hôm nay để trải nghiệm nền tảng quản lý video tốt nhất.
          </p>
          
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <h3 className="text-white font-medium mb-3">Quyền lợi thành viên:</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">✅ Upload video không giới hạn số lượng</li>
              <li className="flex items-center gap-2">✅ Tự động tạo stream đa phân giải (360p-1080p)</li>
              <li className="flex items-center gap-2">✅ Tốc độ tải siêu nhanh với HLS</li>
              <li className="flex items-center gap-2">✅ Theo dõi trạng thái realtime</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cột phải: Register Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-20 bg-[#0f0f0f] py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Đăng ký</h2>
            <p className="text-gray-400">Điền thông tin bên dưới để tạo tài khoản</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên hiển thị"
              type="text"
              name="username"
              placeholder="VD: nguyenvan_a"
              value={formData.username}
              onChange={handleChange}
              error={formData.username && formData.username.length < 3 ? 'Tên phải dài ít nhất 3 ký tự' : ''}
              required
            />

            <Input
              label="Địa chỉ Email"
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="relative">
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Ít nhất 8 ký tự..."
                value={formData.password}
                onChange={handleChange}
                error={formData.password && formData.password.length < 8 ? 'Mật khẩu phải dài ít nhất 8 ký tự' : ''}
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

            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <div className="pt-1 pb-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Độ mạnh mật khẩu:</span>
                  <span className={`font-medium ${strength > 0 ? strengthColors[strength - 1].replace('bg-', 'text-') : 'text-gray-500'}`}>
                    {strength > 0 ? strengthLabels[strength - 1] : 'Rất yếu'}
                  </span>
                </div>
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map(level => (
                    <div 
                      key={level} 
                      className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? strengthColors[strength - 1] : 'bg-[#2a2a2a]'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Xác nhận mật khẩu"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu..."
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formData.confirmPassword && !passwordsMatch ? 'Mật khẩu không khớp' : ''}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-6"
              loading={loading}
              disabled={!isFormValid}
            >
              Tạo tài khoản
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-400 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-white hover:text-[#E50914] hover:underline transition-colors font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}