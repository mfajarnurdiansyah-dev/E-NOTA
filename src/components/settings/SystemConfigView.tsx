import React, { useState } from 'react';
import { Settings, Percent, CreditCard, Scale, Tag, Plus, Trash2, Check } from 'lucide-react';
import { TaxConfig, PaymentMethodConfig, UnitConfig, CategoryConfig } from '../../types';

interface SystemConfigViewProps {
  taxConfigs: TaxConfig[];
  paymentMethods: PaymentMethodConfig[];
  units: UnitConfig[];
  categories: CategoryConfig[];
  onUpdateTaxes: (taxes: TaxConfig[]) => void;
  onUpdatePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  onUpdateUnits: (units: UnitConfig[]) => void;
  onUpdateCategories: (categories: CategoryConfig[]) => void;
}

export const SystemConfigView: React.FC<SystemConfigViewProps> = ({
  taxConfigs,
  paymentMethods,
  units,
  categories,
  onUpdateTaxes,
  onUpdatePaymentMethods,
  onUpdateUnits,
  onUpdateCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'taxes' | 'payments' | 'units' | 'categories'>('taxes');

  // New Tax Form
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxRate, setNewTaxRate] = useState(11);

  // New Payment Form
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentType, setNewPaymentType] = useState('BANK_TRANSFER');

  // New Unit Form
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitName, setNewUnitName] = useState('');

  // New Category Form
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName) return;
    const added: TaxConfig = {
      id: `tax-${Date.now()}`,
      name: newTaxName,
      code: newTaxName.toUpperCase().replace(/\s+/g, '_'),
      rate: Number(newTaxRate),
      calculation_type: 'exclude',
      is_default: false,
      active: true,
    };
    onUpdateTaxes([...taxConfigs, added]);
    setNewTaxName('');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentName) return;
    const added: PaymentMethodConfig = {
      id: `pm-${Date.now()}`,
      name: newPaymentName,
      type: newPaymentType as any,
      active: true,
    };
    onUpdatePaymentMethods([...paymentMethods, added]);
    setNewPaymentName('');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitCode) return;
    const added: UnitConfig = {
      id: `unit-${Date.now()}`,
      code: newUnitCode.toUpperCase(),
      name: newUnitName || newUnitCode,
      active: true,
    };
    onUpdateUnits([...units, added]);
    setNewUnitCode('');
    setNewUnitName('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const added: CategoryConfig = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      active: true,
    };
    onUpdateCategories([...categories, added]);
    setNewCategoryName('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Konfigurasi & Parameter Sistem</span>
        </h1>
        <p className="text-xs text-slate-500">
          Kelola tarif pajak (PPN), metode pembayaran, satuan unit transaksi, dan kategori produk.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('taxes')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'taxes'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Pajak (PPN & Tarif)</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Metode Pembayaran</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'units'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Satuan Unit (UoM)</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'categories'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Kategori Produk</span>
        </button>
      </div>

      {/* Content for active tab */}
      {activeTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400">Daftar Tarif Pajak Aktif</h3>
            <div className="divide-y divide-slate-100">
              {taxConfigs.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{t.name}</span>
                    {t.is_default && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Default Sistem
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800">{t.rate}%</span>
                    <button
                      onClick={() => onUpdateTaxes(taxConfigs.filter((x) => x.id !== t.id))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddTax} className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-bold text-slate-800">+ Tambah Tarif Pajak Baru</h4>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pajak</label>
              <input
                type="text"
                placeholder="Contoh: PPN 12% (UU HPP)"
                value={newTaxName}
                onChange={(e) => setNewTaxName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tarif Pajak (%)</label>
              <input
                type="number"
                value={newTaxRate}
                onChange={(e) => setNewTaxRate(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              Simpan Pajak
            </button>
          </form>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400">Daftar Metode Pembayaran</h3>
            <div className="divide-y divide-slate-100">
              {paymentMethods.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">({p.type})</span>
                  </div>
                  <button
                    onClick={() => onUpdatePaymentMethods(paymentMethods.filter((x) => x.id !== p.id))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddPayment} className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-bold text-slate-800">+ Tambah Metode Pembayaran</h4>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Metode</label>
              <input
                type="text"
                placeholder="Contoh: QRIS Dinamis"
                value={newPaymentName}
                onChange={(e) => setNewPaymentName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Tipe</label>
              <select
                value={newPaymentType}
                onChange={(e) => setNewPaymentType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="BANK_TRANSFER">Transfer Bank</option>
                <option value="CASH">Tunai / Cash</option>
                <option value="GIRO">Giro / Bilyet</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              Simpan Metode
            </button>
          </form>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400">Satuan Unit Transaksi (UoM)</h3>
            <div className="divide-y divide-slate-100">
              {units.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">
                      {u.code}
                    </span>
                    <span className="ml-2 text-slate-600">{u.name}</span>
                  </div>
                  <button
                    onClick={() => onUpdateUnits(units.filter((x) => x.id !== u.id))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddUnit} className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-bold text-slate-800">+ Tambah Satuan Unit Baru</h4>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Satuan (Singkat)</label>
              <input
                type="text"
                placeholder="Contoh: BUNDLE"
                value={newUnitCode}
                onChange={(e) => setNewUnitCode(e.target.value.toUpperCase())}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Satuan</label>
              <input
                type="text"
                placeholder="Contoh: Ikatan / Bundle"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              Simpan Satuan
            </button>
          </form>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400">Daftar Kategori Produk</h3>
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <button
                    onClick={() => onUpdateCategories(categories.filter((x) => x.id !== c.id))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddCategory} className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-bold text-slate-800">+ Tambah Kategori Baru</h4>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Rempah & Bumbu"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              Simpan Kategori
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
