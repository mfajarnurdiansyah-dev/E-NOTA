import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Users, 
  Lock, 
  Key, 
  Plus, 
  UserPlus, 
  Shield, 
  Building2, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Trash2,
  AlertTriangle 
} from 'lucide-react';
import { Role, Permission, User, Company } from '../../types';

interface RolesPermissionsViewProps {
  roles: Role[];
  permissions: Permission[];
  currentRoleId: string;
  currentUserId?: string;
  onSelectRole: (roleId: string) => void;
  onUpdateRolePermissions: (roleId: string, permissionCodes: string[]) => void;
  users?: User[];
  companies?: Company[];
  onAddUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onAddRole?: (role: Role) => void;
}

export const RolesPermissionsView: React.FC<RolesPermissionsViewProps> = ({
  roles,
  permissions,
  currentRoleId,
  currentUserId,
  onSelectRole,
  onUpdateRolePermissions,
  users = [],
  companies = [],
  onAddUser,
  onDeleteUser,
  onAddRole,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'users'>('matrix');
  const [selectedRoleToEdit, setSelectedRoleToEdit] = useState<string>(
    roles[0]?.id || ''
  );

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // New User Form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserRoleId, setNewUserRoleId] = useState(roles[0]?.id || '');
  const [newUserCompanyIds, setNewUserCompanyIds] = useState<string[]>(
    companies.map((c) => c.id)
  );
  const [userError, setUserError] = useState<string | null>(null);

  // New Role Form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleSelectedPerms, setNewRoleSelectedPerms] = useState<string[]>([
    'invoice.view',
    'invoice.create',
    'delivery_order.view',
  ]);
  const [roleError, setRoleError] = useState<string | null>(null);

  const activeRole = roles.find((r) => r.id === selectedRoleToEdit) || roles[0];

  const handleTogglePermission = (permCode: string) => {
    if (!activeRole) return;
    const currentCodes = activeRole.permission_codes || [];
    const nextCodes = currentCodes.includes(permCode)
      ? currentCodes.filter((c: string) => c !== permCode)
      : [...currentCodes, permCode];

    onUpdateRolePermissions(activeRole.id, nextCodes);
  };

  // Handle Add User Submit
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    if (!newUserName.trim()) {
      setUserError('Nama lengkap pengguna wajib diisi.');
      return;
    }
    if (!newUserEmail.trim() || !newUserEmail.includes('@')) {
      setUserError('Alamat email valid wajib diisi.');
      return;
    }

    const assignedRole = roles.find((r) => r.id === newUserRoleId);

    const createdUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      phone: newUserPhone.trim() || '0812-0000-0000',
      password: newUserPassword || 'password123',
      role_id: newUserRoleId,
      role_name: assignedRole?.name || 'Staff Operasional',
      company_ids: newUserCompanyIds.length > 0 ? newUserCompanyIds : companies.map((c) => c.id),
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };

    if (onAddUser) {
      onAddUser(createdUser);
    }

    // Reset & close
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserPassword('password123');
    setShowAddUserModal(false);
  };

  // Handle Add Role Submit
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleError(null);

    if (!newRoleName.trim()) {
      setRoleError('Nama peran (role) wajib diisi.');
      return;
    }

    const createdRole: Role = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Peran kustom operasional',
      permission_codes: newRoleSelectedPerms,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    if (onAddRole) {
      onAddRole(createdRole);
    }

    setSelectedRoleToEdit(createdRole.id);
    setNewRoleName('');
    setNewRoleDesc('');
    setShowAddRoleModal(false);
  };

  const toggleNewRolePerm = (code: string) => {
    setNewRoleSelectedPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleUserCompany = (compId: string) => {
    setNewUserCompanyIds((prev) =>
      prev.includes(compId) ? prev.filter((id) => id !== compId) : [...prev, compId]
    );
  };

  // Group permissions by module
  const modules = Array.from(new Set(permissions.map((p) => p.module)));

  return (
    <div className="space-y-4">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Manajemen Akun, Peran & Hak Akses (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kelola akun pengguna, tentukan peran hak akses dan matriks izin per modul sistem.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onAddUser && (
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Buat Akun Pengguna</span>
            </button>
          )}

          {onAddRole && (
            <button
              type="button"
              onClick={() => setShowAddRoleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Role Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-emerald-600" />
          <span>Matriks Hak Akses Peran ({roles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span>Daftar Akun Pengguna & Role ({users.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: ROLE PERMISSION MATRIX ==================== */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Roles List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase text-slate-400">Daftar Peran (Roles)</h3>
                {onAddRole && (
                  <button
                    type="button"
                    onClick={() => setShowAddRoleModal(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    + Role Baru
                  </button>
                )}
              </div>

              {roles.map((r) => {
                const isSelected = r.id === selectedRoleToEdit;
                const isCurrentSessionRole = r.id === currentRoleId;

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoleToEdit(r.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{r.name}</span>
                      {isCurrentSessionRole && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white">
                          Sesi Anda
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                      <span>{r.permission_codes?.length || 0} Hak Akses Diberikan</span>
                      <span className="text-slate-500 font-sans">
                        {users.filter((u) => u.role_id === r.id).length} Pengguna
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold block text-slate-800 mb-1">Ganti Peran Sesi Pengujian:</span>
              <p className="text-slate-500 text-[11px] mb-3">
                Uji coba bagaimana tampilan UI beradaptasi sesuai hak akses peran terpilih.
              </p>
              <button
                type="button"
                onClick={() => onSelectRole(activeRole.id)}
                disabled={activeRole.id === currentRoleId}
                className={`w-full py-2 rounded-xl font-semibold text-xs transition ${
                  activeRole.id === currentRoleId
                    ? 'bg-slate-200 text-slate-400 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {activeRole.id === currentRoleId ? 'Sedang Digunakan' : `Beralih ke ${activeRole.name}`}
              </button>
            </div>
          </div>

          {/* Right Permission Matrix */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Matriks Hak Akses: {activeRole.name}
                </h3>
                <p className="text-xs text-slate-500">{activeRole.description}</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                {activeRole.permission_codes?.length || 0} / {permissions.length} Diizinkan
              </span>
            </div>

            <div className="space-y-5">
              {modules.map((mod) => {
                const modulePerms = permissions.filter((p) => p.module === mod);

                return (
                  <div key={mod} className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Modul: {mod.replace('_', ' ')}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modulePerms.map((p) => {
                        const isGranted = (activeRole.permission_codes || []).includes(p.code);

                        return (
                          <div
                            key={p.code}
                            onClick={() => handleTogglePermission(p.code)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                              isGranted
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                                : 'bg-slate-50/60 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs">{p.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{p.code}</div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                                isGranted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {isGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: USER ACCOUNTS & ROLES LIST ==================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Akun Pengguna & Penugasan Role</h3>
              <p className="text-xs text-slate-500">
                Pengguna terdaftar dalam sistem DocuFlow Pro beserta hak akses perannya.
              </p>
            </div>
            {onAddUser && (
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Buat Akun</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((u) => {
              const userRole = roles.find((r) => r.id === u.role_id);
              const userCompanies = companies.filter((c) => u.company_ids?.includes(c.id));

              return (
                <div key={u.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 text-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{u.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {userRole?.name || u.role_name || 'Staff'}
                        </span>
                        {u.id === currentUserId && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Akun Anda
                          </span>
                        )}
                        {u.status === 'active' ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-green-50 text-green-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-slate-100 text-slate-500">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Company Access Badges & Actions */}
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                    {/* Company Access Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 mr-1">Cabang:</span>
                      {userCompanies.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {c.company_code}
                        </span>
                      ))}
                    </div>

                    {/* Delete Account Button */}
                    {onDeleteUser && (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        title={
                          u.id === currentUserId
                            ? 'Hapus akun Anda sendiri (Akan logout otomatis)'
                            : `Hapus akun ${u.name}`
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== MODAL 1: BUAT AKUN PENGGUNA BARU ==================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Buat Akun Pengguna Baru</h3>
                  <p className="text-[11px] text-slate-500">Tambahkan akun dan tentukan peran serta hak aksesnya.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {userError}
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nama lengkap staf..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="nama@perusahaan.id"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Sementara <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-500 text-slate-900 font-mono"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tentukan Peran / Role <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={newUserRoleId}
                  onChange={(e) => setNewUserRoleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-emerald-500 text-slate-900"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.description})
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Access */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Akses Perusahaan / Cabang</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {companies.map((c) => {
                    const isChecked = newUserCompanyIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`p-2 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50 text-slate-900 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleUserCompany(c.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="truncate">{c.company_code}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                >
                  Simpan & Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: BUAT ROLE BARU ==================== */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Buat Peran / Role Baru</h3>
                  <p className="text-[11px] text-slate-500">Definisikan nama peran baru dan pilih hak akses perizinannya.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {roleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {roleError}
              </div>
            )}

            <form onSubmit={handleCreateRoleSubmit} className="space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Peran (Role Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="contoh: Manajer Penjualan / Koordinator Lapangan"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Tanggung Jawab
                </label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Deskripsi singkat fungsi role..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Pilih Hak Akses Diizinkan ({newRoleSelectedPerms.length} dipilih)</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (newRoleSelectedPerms.length === permissions.length) {
                        setNewRoleSelectedPerms([]);
                      } else {
                        setNewRoleSelectedPerms(permissions.map((p) => p.code));
                      }
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold"
                  >
                    {newRoleSelectedPerms.length === permissions.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                  {permissions.map((p) => {
                    const isChecked = newRoleSelectedPerms.includes(p.code);
                    return (
                      <label
                        key={p.code}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center gap-2 ${
                          isChecked
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-950 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleNewRolePerm(p.code)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <div className="truncate">
                          <div className="truncate font-semibold">{p.name}</div>
                          <div className="text-[9px] font-mono text-slate-400 truncate">{p.code}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
                >
                  Simpan & Buat Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: KONFIRMASI HAPUS AKUN ==================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Akun Pengguna?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tindakan ini permanen. Akun ini tidak akan dapat login lagi ke sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target User Info Summary */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Nama:</span>
                <span className="font-bold text-slate-900">{userToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Alamat Email:</span>
                <span className="font-mono text-slate-700 font-semibold">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Peran / Hak Akses:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                  {roles.find((r) => r.id === userToDelete.role_id)?.name || userToDelete.role_name || 'Staff'}
                </span>
              </div>
            </div>

            {/* Warning if current active user */}
            {userToDelete.id === currentUserId && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Ini adalah akun Anda yang sedang aktif saat ini. Menghapus akun ini akan otomatis mengakhiri sesi Anda dan mengarahkan kembali ke halaman login.
                </span>
              </div>
            )}

            {/* Block if only 1 user remains in system */}
            {users.length <= 1 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                Sistem tidak dapat menghapus akun ini karena merupakan satu-satunya akun pengguna yang tersisa.
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={users.length <= 1}
                onClick={() => {
                  if (onDeleteUser && userToDelete) {
                    onDeleteUser(userToDelete.id);
                    setUserToDelete(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
