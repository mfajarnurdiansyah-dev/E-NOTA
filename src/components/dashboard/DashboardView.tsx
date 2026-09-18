import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Clock, 
  Truck, 
  FileText, 
  ArrowUpRight, 
  AlertTriangle,
  Printer,
  ChevronRight,
  TrendingUp,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Invoice, DeliveryOrder, Customer, Company } from '../../types';
import { formatRupiah, formatDateIndo } from '../../services/calculation.service';

interface DashboardViewProps {
  invoices: Invoice[];
  deliveryOrders: DeliveryOrder[];
  customers: Customer[];
  company: Company;
  onNavigate: (section: string) => void;
  onOpenCreateInvoice: () => void;
  onOpenCreateDO: () => void;
  onOpenPrintInvoice: (invoice: Invoice) => void;
  onOpenPrintDO: (doData: DeliveryOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  deliveryOrders,
  customers,
  company,
  onNavigate,
  onOpenCreateInvoice,
  onOpenCreateDO,
  onOpenPrintInvoice,
  onOpenPrintDO,
}) => {
  // Filter for company
  const companyInvoices = invoices.filter((i) => i.company_id === company.id);
  const companyDOs = deliveryOrders.filter((d) => d.company_id === company.id);

  // Financial metrics
  const totalOmset = companyInvoices.reduce((acc, i) => acc + i.grand_total, 0);
  const totalPaid = companyInvoices.reduce((acc, i) => acc + i.paid_amount, 0);
  const totalOutstanding = Math.max(0, totalOmset - totalPaid);
  const completedDeliveries = companyDOs.filter((d) => d.status === 'DELIVERED').length;

  const customerMap = new Map(customers.map((c) => [c.id, c]));

  // Invoices needing attention (unpaid or overdue)
  const pendingInvoices = companyInvoices
    .filter((i) => i.grand_total > i.paid_amount)
    .slice(0, 5);

  // Recent delivery orders
  const recentDOs = companyDOs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
            <Building2 className="w-4 h-4" />
            <span>{company.company_name} ({company.company_code})</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">
            Ringkasan Operasional & Keuangan
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Sistem terintegrasi invoice, surat jalan, cetak A4/Dot Matrix 210×80mm, dan isolasi multi-perusahaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 bg-slate-700/80 hover:bg-slate-750 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 border border-slate-600/50"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Laporan & Export PDF</span>
          </button>
          <button
            onClick={onOpenCreateInvoice}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Buat Invoice</span>
          </button>
          <button
            onClick={onOpenCreateDO}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>+ Buat Surat Jalan</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Nilai Faktur</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatRupiah(totalOmset)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>{companyInvoices.length} Faktur Penjualan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Penerimaan Kas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatRupiah(totalPaid)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((totalPaid / (totalOmset || 1)) * 100).toFixed(1)}% Tagihan Telah Lunas
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Sisa Piutang Dagang</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">
            {formatRupiah(totalOutstanding)}
          </div>
          <div className="text-[11px] text-rose-600/80 font-medium mt-1">
            {pendingInvoices.length} Faktur Perlu Penagihan
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pengiriman Selesai</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-sky-900">
            {completedDeliveries} / {companyDOs.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Surat Jalan Berhasil Diterima
          </div>
        </div>
      </div>

      {/* Two Column Grid: Pending Invoices & Recent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Invoices / Piutang Belum Lunas */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Faktur Belum Lunas (Piutang)</h3>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {pendingInvoices.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                Semua faktur telah lunas dibayar.
              </div>
            ) : (
              pendingInvoices.map((inv) => {
                const customer = customerMap.get(inv.customer_id);
                const outstanding = Math.max(0, inv.grand_total - inv.paid_amount);

                return (
                  <div
                    key={inv.id}
                    className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">{inv.invoice_number}</div>
                      <div className="text-slate-600 font-medium mt-0.5">
                        {customer?.customer_name || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Jatuh tempo: {formatDateIndo(inv.due_date || inv.invoice_date)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-600">
                        {formatRupiah(outstanding)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total: {formatRupiah(inv.grand_total)}
                      </div>
                      <button
                        onClick={() => onOpenPrintInvoice(inv)}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-sm">Status Pengiriman Surat Jalan</h3>
            </div>
            <button
              onClick={() => onNavigate('delivery_orders')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentDOs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                Belum ada surat jalan diterbitkan.
              </div>
            ) : (
              recentDOs.map((d) => {
                const customer = customerMap.get(d.customer_id);

                return (
                  <div
                    key={d.id}
                    className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">{d.do_number}</div>
                      <div className="text-slate-600 font-medium mt-0.5">
                        {customer?.customer_name || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Supir: {d.driver_name} ({d.vehicle_number})
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {d.status === 'DELIVERED' ? 'DITERIMA' : d.status}
                      </span>
                      <div className="mt-1">
                        <button
                          onClick={() => onOpenPrintDO(d)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-sky-700 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Cetak 210x80</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
