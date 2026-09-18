import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Search, FileText, CreditCard, ChevronRight } from 'lucide-react';
import { Customer, Invoice, Payment, Company } from '../../types';
import { formatRupiah, formatDateIndo } from '../../services/calculation.service';

interface CustomersManagerProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  company: Company;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({
  customers,
  invoices,
  payments,
  company,
  onSaveCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStatementCust, setSelectedStatementCust] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<Partial<Customer>>({});

  const filtered = customers.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData(cust);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingCustomer(null);
    setFormData({
      id: `cust-${Date.now()}`,
      company_id: company.id,
      customer_code: `CUST-${(customers.length + 1).toString().padStart(3, '0')}`,
      customer_name: '',
      phone: '',
      email: '',
      address: '',
      city: company.city || 'Cianjur',
      credit_limit: 25000000,
      payment_term: 14,
      notes: '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_code) {
      alert('Nama dan kode customer wajib diisi.');
      return;
    }
    onSaveCustomer(formData as Customer);
    setEditingCustomer(null);
    setIsCreating(false);
  };

  // Customer Statement Ledger calculation
  const getCustomerStats = (custId: string) => {
    const custInvoices = invoices.filter((i) => i.customer_id === custId);
    const totalInvoiced = custInvoices.reduce((acc, i) => acc + i.grand_total, 0);
    const totalPaid = custInvoices.reduce((acc, i) => acc + i.paid_amount, 0);
    const outstanding = Math.max(0, totalInvoiced - totalPaid);
    return {
      invoiceCount: custInvoices.length,
      totalInvoiced,
      totalPaid,
      outstanding,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Master Data Customer / Pelanggan</span>
          </h1>
          <p className="text-xs text-slate-500">
            Daftar rekanan pembeli, plafon kredit limit, termin pembayaran, serta buku pembantu piutang.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Customer Baru</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode, nama customer, atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: {filtered.length} Pelanggan Terdaftar
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="px-4 py-3">Kode & Nama Customer</th>
              <th className="px-4 py-3">Alamat & Kontak</th>
              <th className="px-4 py-3 text-right">Limit Kredit (Plafon)</th>
              <th className="px-4 py-3 text-center">Termin (Hari)</th>
              <th className="px-4 py-3 text-right">Saldo Piutang</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((cust) => {
              const stats = getCustomerStats(cust.id);

              return (
                <tr key={cust.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                      {cust.customer_code}
                    </span>
                    <div className="font-bold text-slate-900 mt-1">{cust.customer_name}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-700 max-w-xs line-clamp-1">{cust.address}</div>
                    <div className="text-[11px] text-slate-500">
                      {cust.city} • {cust.phone}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-mono text-slate-700">
                    {formatRupiah(cust.credit_limit)}
                  </td>

                  <td className="px-4 py-3 text-center font-bold text-slate-700">
                    {cust.payment_term} Hari
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                    {formatRupiah(stats.outstanding)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedStatementCust(cust)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        title="Buku Piutang / Customer Statement"
                      >
                        Kartu Piutang
                      </button>
                      <button
                        onClick={() => handleEdit(cust)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(cust.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer Statement (Kartu Piutang) Modal */}
      {selectedStatementCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Buku Pembantu Piutang (Customer Statement)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedStatementCust.customer_name} ({selectedStatementCust.customer_code})
                </p>
              </div>
              <button
                onClick={() => setSelectedStatementCust(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Stats Summary */}
              {(() => {
                const stats = getCustomerStats(selectedStatementCust.id);
                return (
                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-medium">Total Nilai Faktur:</span>
                      <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {formatRupiah(stats.totalInvoiced)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Total Pembayaran Diterima:</span>
                      <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                        {formatRupiah(stats.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Sisa Piutang (Outstanding):</span>
                      <p className="text-base font-bold font-mono text-rose-600 mt-0.5">
                        {formatRupiah(stats.outstanding)}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Transactions Ledger */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Riwayat Faktur Penjualan</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="p-2.5">No. Invoice</th>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5 text-right">Debit (Tagihan)</th>
                        <th className="p-2.5 text-right">Kredit (Terbayar)</th>
                        <th className="p-2.5 text-right">Sisa Saldo</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices
                        .filter((i) => i.customer_id === selectedStatementCust.id)
                        .map((inv) => (
                          <tr key={inv.id}>
                            <td className="p-2.5 font-mono font-bold text-slate-900">
                              {inv.invoice_number}
                            </td>
                            <td className="p-2.5 text-slate-600">{formatDateIndo(inv.invoice_date)}</td>
                            <td className="p-2.5 text-right font-mono font-semibold">
                              {formatRupiah(inv.grand_total)}
                            </td>
                            <td className="p-2.5 text-right font-mono text-emerald-700">
                              {formatRupiah(inv.paid_amount)}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-rose-600">
                              {formatRupiah(Math.max(0, inv.grand_total - inv.paid_amount))}
                            </td>
                            <td className="p-2.5 text-center font-bold text-[10px]">
                              {inv.status}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Customer Modal */}
      {(editingCustomer || isCreating) && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-sm">
                {isCreating ? 'Tambah Customer Baru' : 'Ubah Data Customer'}
              </h3>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setIsCreating(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Customer</label>
                  <input
                    type="text"
                    value={formData.customer_code || ''}
                    onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Customer</label>
                  <input
                    type="text"
                    value={formData.customer_name || ''}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Pengiriman / Penagihan</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Kota</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Telepon / HP</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plafon Limit Kredit (Rp)</label>
                  <input
                    type="number"
                    value={formData.credit_limit || 0}
                    onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Termin Pembayaran (Hari)</label>
                  <input
                    type="number"
                    value={formData.payment_term || 14}
                    onChange={(e) => setFormData({ ...formData, payment_term: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Khusus Pengiriman</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustomer(null);
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
                  Simpan Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
