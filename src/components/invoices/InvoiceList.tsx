import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  CreditCard,
  Truck,
  Copy,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Invoice, Customer, Company, DocumentStatus } from '../../types';
import { formatRupiah, formatDateIndo } from '../../services/calculation.service';

interface InvoiceListProps {
  invoices: Invoice[];
  customers: Customer[];
  company: Company;
  hasPermission: (code: string) => boolean;
  onOpenCreate: () => void;
  onOpenEdit: (invoice: Invoice) => void;
  onOpenPrint: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
  onCreateDeliveryOrder: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: DocumentStatus) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  customers,
  company,
  hasPermission,
  onOpenCreate,
  onOpenEdit,
  onOpenPrint,
  onOpenPayment,
  onCreateDeliveryOrder,
  onDuplicate,
  onDelete,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Customer map
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  // Filter invoices for current company and filters
  const filtered = invoices.filter((inv) => {
    if (inv.company_id !== company.id) return false;
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    
    if (searchTerm) {
      const custName = customerMap.get(inv.customer_id)?.customer_name?.toLowerCase() || '';
      const invNum = inv.invoice_number.toLowerCase();
      const term = searchTerm.toLowerCase();
      if (!custName.includes(term) && !invNum.includes(term)) return false;
    }
    return true;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">LUNAS</span>;
      case 'PARTIAL_PAID':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">DIBAYAR SEBAGIAN</span>;
      case 'SENT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">TERKIRIM</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">DISETUJUI</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">MENUNGGU</span>;
      case 'OVERDUE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">JATUH TEMPO</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">DIBATALKAN</span>;
      case 'DRAFT':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Faktur & Invoice Tagihan</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              {company.company_code}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Kelola faktur penjualan, perhitungan PPN/diskon, pencatatan pembayaran, dan cetak A4/Dot Matrix.
          </p>
        </div>

        {hasPermission('invoice.create') && (
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Invoice Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor invoice atau nama customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {['ALL', 'PENDING', 'APPROVED', 'SENT', 'PARTIAL_PAID', 'PAID', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th className="px-4 py-3">No. Invoice & Tanggal</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Nilai Total</th>
                <th className="px-4 py-3 text-right">Sudah Dibayar</th>
                <th className="px-4 py-3 text-right">Sisa Piutang</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">Tidak ada faktur invoice ditemukan</p>
                    <p className="text-[11px]">Silakan ubah filter atau buat invoice baru.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const customer = customerMap.get(inv.customer_id);
                  const outstanding = Math.max(0, inv.grand_total - inv.paid_amount);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                      {/* Invoice Number & Date */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{inv.invoice_number}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Tgl: {formatDateIndo(inv.invoice_date)}</span>
                        </div>
                        {inv.due_date && (
                          <div className="text-[10px] text-slate-400">
                            Jatuh tempo: {formatDateIndo(inv.due_date)}
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{customer?.customer_name || '-'}</div>
                        <div className="text-[11px] text-slate-500">{customer?.city || '-'}</div>
                        {inv.custom_fields?.po_number && (
                          <div className="text-[10px] text-indigo-600 font-mono">
                            PO: {inv.custom_fields.po_number}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(inv.grand_total)}
                      </td>

                      {/* Paid */}
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">
                        {formatRupiah(inv.paid_amount)}
                      </td>

                      {/* Outstanding */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                        {formatRupiah(outstanding)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(inv.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Cetak & PDF Hub */}
                          <button
                            onClick={() => onOpenPrint(inv)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Print Preview & PDF (A4 & Dot Matrix 210x80mm)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Buat Surat Jalan dari Invoice (PRD Req) */}
                          {hasPermission('delivery_order.create') && (
                            <button
                              onClick={() => onCreateDeliveryOrder(inv)}
                              className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                              title="Buat Surat Jalan dari Invoice ini"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Input Pembayaran */}
                          {hasPermission('payment.create') && outstanding > 0 && (
                            <button
                              onClick={() => onOpenPayment(inv)}
                              className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                              title="Catat Pembayaran Masuk"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {/* Duplicate */}
                          {hasPermission('invoice.create') && (
                            <button
                              onClick={() => onDuplicate(inv)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              title="Duplikat Faktur"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit */}
                          {hasPermission('invoice.edit') && (
                            <button
                              onClick={() => onOpenEdit(inv)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Ubah Faktur"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          {hasPermission('invoice.delete') && (
                            <button
                              onClick={() => onDelete(inv.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Faktur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
