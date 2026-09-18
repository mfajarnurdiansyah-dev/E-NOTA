import React, { useState } from 'react';
import { 
  Building2, 
  Printer, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { User, Role, Company } from '../../types';

interface AuthViewProps {
  roles: Role[];
  companies: Company[];
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User, newRole?: Role) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  roles,
  companies,
  users,
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'role-superadmin');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(companies.map(c => c.id));
  const [regError, setRegError] = useState<string | null>(null);

  // Custom New Role Creation inside Register
  const [isCreatingCustomRole, setIsCreatingCustomRole] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDesc, setCustomRoleDesc] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrimmed = loginEmail.trim().toLowerCase();
    const user = users.find(
      (u) => u.email.toLowerCase() === emailTrimmed
    );

    if (!user) {
      setLoginError('Email atau username tidak terdaftar dalam sistem.');
      return;
    }

    if (user.status === 'inactive') {
      setLoginError('Akun ini sedang dinonaktifkan oleh administrator.');
      return;
    }

    // If user has a password, verify it; if no password recorded or password123/admin123, accept
    if (user.password && user.password !== loginPassword && loginPassword !== 'admin123' && loginPassword !== 'password123') {
      setLoginError('Kata sandi yang Anda masukkan salah. Coba gunakan: admin123');
      return;
    }

    onLoginSuccess(user);
  };

  // Quick Demo Login Handler
  const handleQuickLogin = (demoUser: User) => {
    setLoginEmail(demoUser.email);
    setLoginPassword(demoUser.password || 'admin123');
    setLoginError(null);
    onLoginSuccess(demoUser);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const nameTrimmed = regName.trim();
    const emailTrimmed = regEmail.trim().toLowerCase();

    if (!nameTrimmed) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }

    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setRegError('Alamat email valid wajib diisi.');
      return;
    }

    // Check duplicate email
    const existing = users.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (existing) {
      setRegError('Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    let finalRoleId = selectedRoleId;
    let newCreatedRole: Role | undefined = undefined;

    // If user created a custom role
    if (isCreatingCustomRole) {
      if (!customRoleName.trim()) {
        setRegError('Nama role kustom wajib diisi.');
        return;
      }
      finalRoleId = `role-${Date.now()}`;
      newCreatedRole = {
        id: finalRoleId,
        name: customRoleName.trim(),
        description: customRoleDesc.trim() || 'Peran kustom yang dibuat saat pendaftaran',
        permission_codes: [
          'invoice.view',
          'invoice.create',
          'invoice.print',
          'delivery_order.view',
          'delivery_order.print',
          'customer.manage',
          'product.manage',
          'report.view'
        ],
        status: 'active',
        created_at: new Date().toISOString(),
      };
    }

    const assignedRole = newCreatedRole || roles.find((r) => r.id === finalRoleId);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: nameTrimmed,
      email: emailTrimmed,
      phone: regPhone.trim() || '0812-0000-0000',
      password: regPassword,
      role_id: finalRoleId,
      role_name: assignedRole?.name || 'Super Admin',
      company_ids: selectedCompanyIds.length > 0 ? selectedCompanyIds : companies.map(c => c.id),
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
    };

    onRegisterSuccess(newUser, newCreatedRole);
  };

  const toggleCompanySelection = (compId: string) => {
    setSelectedCompanyIds((prev) => 
      prev.includes(compId)
        ? prev.filter((id) => id !== compId)
        : [...prev, compId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 text-slate-100">
      {/* Background Decorative Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl z-10">
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
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Masuk ke Sistem</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Buat Akun & Role Baru</span>
            </button>
          </div>

          {/* ===================== TAB 1: LOGIN ===================== */}
          {authMode === 'login' && (
            <div>
              {loginError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Input */}
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
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="contoh: fajar@sppg-sugih.id"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 focus:border-emerald-500 transition text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi (Password)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Default demo: <code className="text-emerald-700 font-bold">admin123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 focus:border-emerald-500 transition text-slate-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium">Ingat saya di browser</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 mt-2"
                >
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Persona Demo Login Badges */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Masuk Cepat Akun Demo (1-Klik)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {users.slice(0, 3).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                          {u.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{u.email}</div>
                      </div>
                      <span className="inline-block mt-1.5 text-[9px] font-bold bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 px-1.5 py-0.5 rounded-md self-start">
                        {u.role_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: REGISTER / BUAT AKUN & ROLE ===================== */}
          {authMode === 'register' && (
            <div>
              {regError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nama pengguna..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 transition text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nomor HP / Telepon
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 transition text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@perusahaan.id"
                      className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 transition text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 transition text-slate-900 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ulangi Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="Ketik ulang..."
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 transition text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* ROLE SELECTION (Key user requirement: "sediakan untuk membuat akun dan rolenya") */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pilih Peran / Hak Akses (Role) <span className="text-rose-500">*</span></span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomRole(!isCreatingCustomRole)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline"
                    >
                      {isCreatingCustomRole ? 'Pilih Role yang Ada' : '+ Buat Role Baru'}
                    </button>
                  </div>

                  {!isCreatingCustomRole ? (
                    <div className="space-y-2">
                      <select
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 transition text-slate-900 cursor-pointer"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.description}
                          </option>
                        ))}
                      </select>

                      {/* Selected role description chip */}
                      {roles.find((r) => r.id === selectedRoleId) && (
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">
                              {roles.find((r) => r.id === selectedRoleId)?.name}:
                            </span>{' '}
                            {roles.find((r) => r.id === selectedRoleId)?.description}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Inline custom role creator */
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2.5">
                      <div className="text-xs font-bold text-slate-900">Definisi Role Kustom Baru:</div>
                      <div>
                        <input
                          type="text"
                          required={isCreatingCustomRole}
                          value={customRoleName}
                          onChange={(e) => setCustomRoleName(e.target.value)}
                          placeholder="Nama Role Baru (misal: Supervisor Operasional)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={customRoleDesc}
                          onChange={(e) => setCustomRoleDesc(e.target.value)}
                          placeholder="Deskripsi tugas role (misal: Menyetujui faktur dan monitor pengiriman)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        * Role kustom otomatis mendapatkan hak akses operasional standar dan dapat dikonfigurasi lebih lanjut di menu RBAC.
                      </p>
                    </div>
                  )}
                </div>

                {/* Company Membership */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Akses Perusahaan / Cabang</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {companies.map((c) => {
                      const isChecked = selectedCompanyIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 font-semibold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompanySelection(c.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <span className="truncate">{c.company_code}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 mt-3"
                >
                  <span>Daftarkan Akun & Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Toggle between mode link footer */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {authMode === 'login' ? (
              <p>
                Belum memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegError(null);
                  }}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Buat Akun Baru & Tentukan Role
                </button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginError(null);
                  }}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Masuk ke Akun Terdaftar
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DocuFlow Pro • Multi-Company Dot Matrix 210×80 & A4 Invoice System</p>
        </div>
      </div>
    </div>
  );
};
