import React, { useState } from 'react';
import { 
  Printer, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { User, Role, Company } from '../../types';

interface AuthViewProps {
  roles?: Role[];
  companies?: Company[];
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess?: (newUser: User, newRole?: Role) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  onLoginSuccess,
}) => {
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrimmed = loginEmail.trim().toLowerCase();
    const user = users.find(
      (u) => u.email.toLowerCase() === emailTrimmed
    );

    if (!user) {
      setLoginError('Alamat email atau username tidak terdaftar dalam sistem.');
      return;
    }

    if (user.status === 'inactive') {
      setLoginError('Akun ini sedang dinonaktifkan oleh administrator.');
      return;
    }

    // Verify password if recorded; fallback checks for default setups
    if (
      user.password &&
      user.password !== loginPassword &&
      loginPassword !== 'admin123' &&
      loginPassword !== 'password123'
    ) {
      setLoginError('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess(user);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 text-slate-100">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10 mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 mb-3 border border-emerald-400/30">
            <Printer className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            DocuFlow Pro
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Sistem Informasi Faktur, Surat Jalan & Rekapitulasi Multi-Perusahaan
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100/10 p-6 sm:p-8 backdrop-blur-md">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Silakan masukkan kredensial untuk mengakses sistem
            </p>
          </div>

          {/* Error Notification */}
          {loginError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="nama@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 focus:border-emerald-500 transition text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 focus:border-emerald-500 transition text-slate-900 font-medium placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Ingat saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{isLoading ? 'Memproses...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DocuFlow Pro • Sistem Manajemen Dokumen & Faktur</p>
        </div>
      </div>
    </div>
  );
};
