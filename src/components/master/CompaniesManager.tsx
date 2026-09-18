import React, { useState } from 'react';
import { Building2, Plus, Edit, Check, Globe, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Company } from '../../types';

interface CompaniesManagerProps {
  companies: Company[];
  activeCompanyId: string;
  onSelectActiveCompany: (id: string) => void;
  onSaveCompany: (company: Company) => void;
}

export const CompaniesManager: React.FC<CompaniesManagerProps> = ({
  companies,
  activeCompanyId,
  onSelectActiveCompany,
  onSaveCompany,
}) => {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Company>>({});

  const handleEdit = (comp: Company) => {
    setEditingCompany(comp);
    setFormData(comp);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingCompany(null);
    setFormData({
      id: `comp-${Date.now()}`,
      company_code: 'NEW',
      company_name: 'Perusahaan Baru',
      address: 'Jl. Raya Pergudangan No. 1',
      city: 'Jakarta',
      phone: '021-1234567',
      email: 'info@perusahaan.co.id',
      website: 'https://perusahaan.co.id',
      NIB: '9120000000000',
      bank_name: 'Bank Mandiri',
      bank_account: '123-00-998877-1',
      account_name: 'PT Perusahaan Baru',
      invoice_prefix: 'NEW/INV',
      delivery_order_prefix: 'NEW/SJ',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.company_code) {
      alert('Nama dan kode perusahaan wajib diisi.');
      return;
    }
    onSaveCompany(formData as Company);
    setEditingCompany(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Multi-Company Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kelola entitas bisnis, rekening bank, dan nomor prefix invoice/surat jalan terisolasi.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Perusahaan</span>
        </button>
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companies.map((comp) => {
          const isActive = comp.id === activeCompanyId;
          return (
            <div
              key={comp.id}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between shadow-xs ${
                isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 font-bold">
                      <Building2 className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase font-mono">
                        {comp.company_code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {comp.company_name}
                      </h3>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
                  <p className="line-clamp-2">{comp.address}, {comp.city}</p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{comp.phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{comp.email}</span>
                  </p>
                  <div className="bg-slate-50 p-2 rounded-lg font-mono text-[11px] mt-2 border border-slate-200/80">
                    <div className="text-slate-500 text-[10px]">Bank: {comp.bank_name}</div>
                    <div className="font-bold text-slate-800">{comp.bank_account}</div>
                    <div className="text-slate-600 text-[10px]">a.n. {comp.account_name}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => onSelectActiveCompany(comp.id)}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {isActive ? 'Sedang Dipakai' : 'Gunakan'}
                </button>
                <button
                  onClick={() => handleEdit(comp)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Ubah Profil</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Company Modal */}
      {(editingCompany || isCreating) && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-sm">
                {isCreating ? 'Tambah Perusahaan Baru' : `Ubah Profil Perusahaan: ${formData.company_name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingCompany(null);
                  setIsCreating(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Perusahaan (Prefix Singkat)</label>
                  <input
                    type="text"
                    value={formData.company_code || ''}
                    onChange={(e) => setFormData({ ...formData, company_code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan / Usaha</label>
                  <input
                    type="text"
                    value={formData.company_name || ''}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor / Gudang</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Telepon</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIB (Nomor Induk Berusaha)</label>
                <input
                  type="text"
                  value={formData.NIB || ''}
                  onChange={(e) => setFormData({ ...formData, NIB: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              {/* Bank Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800">Rekening Resmi Pembayaran</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Bank</label>
                    <input
                      type="text"
                      placeholder="Bank BRI / BCA"
                      value={formData.bank_name || ''}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      value={formData.bank_account || ''}
                      onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Atas Nama (a.n.)</label>
                    <input
                      type="text"
                      value={formData.account_name || ''}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Prefixes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prefix Faktur / Invoice</label>
                  <input
                    type="text"
                    value={formData.invoice_prefix || ''}
                    onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prefix Surat Jalan (SJ)</label>
                  <input
                    type="text"
                    value={formData.delivery_order_prefix || ''}
                    onChange={(e) => setFormData({ ...formData, delivery_order_prefix: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCompany(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan Perusahaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
