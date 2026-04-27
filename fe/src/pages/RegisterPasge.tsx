// src/pages/SignupPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    const url = import.meta.env.VITE_API_URL;
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${url}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Đăng ký thất bại');
        return;
      }
      navigate('/login');
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-4">
            <Shield size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-wider">DRONE SENTINEL</h1>
          <p className="text-slate-500 text-sm mt-1">JETSON NANO EDGE AI</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Tạo tài khoản</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Nhập username"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Nhập email"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">Xác nhận password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Nhập lại password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;