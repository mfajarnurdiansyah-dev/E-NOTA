import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Printer,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  RotateCcw
} from 'lucide-react';
import { DeliveryOrder, Customer, Company, DeliveryStatus } from '../../types';
import { formatDateIndo } from '../../services/calculation.service';

interface DeliveryOrderListProps {
  deliveryOrders: DeliveryOrder[];
  customers: Customer[];
  company: Company;
  hasPermission: (code: string) => boolean;
  onOpenCreate: () => void;
  onOpenEdit: (doData: DeliveryOrder) => void;
  onOpenPrint: (doData: DeliveryOrder) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: DeliveryStatus) => void;
}

export const DeliveryOrderList: React.FC<DeliveryOrderListProps> = ({
  deliveryOrders,
  customers,
  company,
  hasPermission,
  onOpenCreate,
  onOpenEdit,
  onOpenPrint,
  onDelete,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const filtered = deliveryOrders.filter((doItem) => {
    if (doItem.company_id !== company.id) return false;
    if (statusFilter !== 'ALL' && doItem.status !== statusFilter) return false;

    if (searchTerm) {
      const custName = customerMap.get(doItem.customer_id)?.customer_name?.toLowerCase() || '';
      const num = doItem.do_number.toLowerCase();
      const driver = doItem.driver_name.toLowerCase();
      const term = searchTerm.toLowerCase();
      if (!custName.includes(term) && !num.includes(term) && !driver.includes(term)) return false;
    }
    return true;
  });

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>DITERIMA</span>
          </span>
        );
      case 'ON_DELIVERY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1 w-fit">
            <Truck className="w-3 h-3" />
            <span>DIKIRIM</span>
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>SIAP KIRIM</span>
          </span>
        );
      case 'RETURNED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
            <RotateCcw className="w-3 h-3" />
            <span>RETUR</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Surat Jalan & Delivery Order</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
              {company.company_code}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Penerbitan surat jalan, penugasan armada & supir, serta cetak langsung format Dot Matrix (210×80mm).
          </p>
        </div>

        {hasPermission('delivery_order.create') && (
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Surat Jalan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor SJ, customer, atau nama supir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-sky-600"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {['ALL', 'READY', 'ON_DELIVERY', 'DELIVERED', 'RETURNED', 'DRAFT'].map((st) => (
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

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th className="px-4 py-3">No. Surat Jalan & Tanggal</th>
                <th className="px-4 py-3">Customer & Alamat</th>
                <th className="px-4 py-3">Armada & Supir</th>
                <th className="px-4 py-3 text-center">Jumlah Item</th>
                <th className="px-4 py-3 text-center">Status Kirim</th>
                <th className="px-4 py-3 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">Tidak ada surat jalan ditemukan</p>
                    <p className="text-[11px]">Silakan buat surat jalan baru atau pilih invoice.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((doItem) => {
                  const customer = customerMap.get(doItem.customer_id);

                  return (
                    <tr key={doItem.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{doItem.do_number}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Tgl: {formatDateIndo(doItem.delivery_date)}</span>
                        </div>
                        {doItem.invoice_number && (
                          <div className="text-[10px] text-sky-700 font-mono font-medium">
                            Ref: {doItem.invoice_number}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-bold text-slate-900">{customer?.customer_name || '-'}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={doItem.delivery_address}>
                          {doItem.delivery_address}
                        </div>
                        {doItem.receiver_name && (
                          <div className="text-[10px] text-slate-600">
                            Penerima: {doItem.receiver_name}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{doItem.driver_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{doItem.vehicle_number}</div>
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {doItem.items.length} Item
                      </td>

                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(doItem.status)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick change status to DELIVERED */}
                          {doItem.status !== 'DELIVERED' && (
                            <button
                              onClick={() => onUpdateStatus(doItem.id, 'DELIVERED')}
                              className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200 transition flex items-center gap-1"
                              title="Tandai Diterima"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Selesai</span>
                            </button>
                          )}

                          {/* Print preview */}
                          <button
                            onClick={() => onOpenPrint(doItem)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                            title="Print Preview & PDF (Dot Matrix 210x80mm & A4)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          {hasPermission('delivery_order.edit') && (
                            <button
                              onClick={() => onOpenEdit(doItem)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Ubah Surat Jalan"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          {hasPermission('delivery_order.delete') && (
                            <button
                              onClick={() => onDelete(doItem.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Surat Jalan"
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
