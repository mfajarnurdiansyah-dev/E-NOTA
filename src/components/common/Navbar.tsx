import React from 'react';
import { 
  Building2, 
  User as UserIcon, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  Printer,
  Plus,
  LogOut
} from 'lucide-react';
import { Company, User } from '../../types';

interface NavbarProps {
  companies: Company[];
  activeCompany: Company;
  onSelectCompany: (companyId: string) => void;
  users: User[];
  currentUser: User;
  onSelectUser: (userId: string) => void;
  onOpenQuickInvoice: () => void;
  onOpenQuickDelivery: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companies,
  activeCompany,
  onSelectCompany,
  users,
  currentUser,
  onSelectUser,
  onOpenQuickInvoice,
  onOpenQuickDelivery,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand & Company Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none block">
                DocuFlow Pro
              </span>
              <span className="text-xs text-emerald-700 font-medium tracking-wide">
                Invoice & Surat Jalan Multi-Company
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Company Selector Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 transition cursor-pointer">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium leading-none">Perusahaan Aktif</p>
                <select
                  aria-label="Perusahaan Aktif"
                  value={activeCompany.id}
                  onChange={(e) => onSelectCompany(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-hidden cursor-pointer pr-4"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.company_code})
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & RBAC User Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenQuickInvoice}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Invoice Baru</span>
            </button>
            <button
              onClick={onOpenQuickDelivery}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Surat Jalan</span>
            </button>
          </div>

          {/* RBAC Persona Switcher (Allows testing roles easily) */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg p-1">
            <div className="hidden md:flex items-center gap-1.5 px-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-600">Role:</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                {currentUser.role_name || 'Super Admin'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Ganti Pengguna & Role"
                value={currentUser.id}
                onChange={(e) => onSelectUser(e.target.value)}
                className="text-xs bg-white font-medium text-slate-800 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-hidden cursor-pointer"
                title="Simulasi Akun Pengguna & Role (RBAC)"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Keluar dari akun Anda"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
