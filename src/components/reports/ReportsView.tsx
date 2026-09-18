import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Users, 
  CreditCard,
  Building2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Company, Customer, Invoice, Payment } from '../../types';
import { formatRupiah, formatDateIndo, formatNumber } from '../../services/calculation.service';
import { exportElementToPdf } from '../../services/pdf.service';

interface ReportsViewProps {
  company: Company;
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  company,
  customers,
  invoices,
  payments,
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'receivables' | 'payments'>('sales');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filter invoices for current company
  const companyInvoices = invoices.filter((i) => i.company_id === company.id);
  const companyCustomers = customers.filter((c) => c.company_id === company.id);
  const companyPayments = payments.filter((p) => p.company_id === company.id);

  // Filter based on controls
  const filteredInvoices = companyInvoices.filter((inv) => {
    if (selectedCustomerId !== 'all' && inv.customer_id !== selectedCustomerId) {
      return false;
    }
    if (dateRange.startDate && inv.invoice_date < dateRange.startDate) {
      return false;
    }
    if (dateRange.endDate && inv.invoice_date > dateRange.endDate) {
      return false;
    }
    return true;
  });

  const filteredPayments = companyPayments.filter((pmt) => {
    if (selectedCustomerId !== 'all' && pmt.customer_id !== selectedCustomerId) {
      return false;
    }
    if (dateRange.startDate && pmt.payment_date < dateRange.startDate) {
      return false;
    }
    if (dateRange.endDate && pmt.payment_date > dateRange.endDate) {
      return false;
    }
    return true;
  });

  // Aggregates
  const totalGrossSales = filteredInvoices.reduce((acc, i) => acc + i.subtotal, 0);
  const totalTaxAmount = filteredInvoices.reduce((acc, i) => acc + i.tax_amount, 0);
  const totalDiscountAmount = filteredInvoices.reduce((acc, i) => acc + i.discount_amount, 0);
  const totalNetSales = filteredInvoices.reduce((acc, i) => acc + i.grand_total, 0);
  const totalPaid = filteredInvoices.reduce((acc, i) => acc + i.paid_amount, 0);
  const totalOutstanding = Math.max(0, totalNetSales - totalPaid);

  // Receivables per customer summary
  const customerReceivables = companyCustomers
    .map((cust) => {
      const custInvoices = companyInvoices.filter((i) => i.customer_id === cust.id);
      const totalBilled = custInvoices.reduce((acc, i) => acc + i.grand_total, 0);
      const totalCustomerPaid = custInvoices.reduce((acc, i) => acc + i.paid_amount, 0);
      const outstanding = Math.max(0, totalBilled - totalCustomerPaid);
      const unpaidInvoicesCount = custInvoices.filter((i) => i.status !== 'PAID').length;

      return {
        customer: cust,
        totalInvoices: custInvoices.length,
        unpaidInvoicesCount,
        totalBilled,
        totalCustomerPaid,
        outstanding,
      };
    })
    .filter((item) => {
      if (selectedCustomerId !== 'all') {
        return item.customer.id === selectedCustomerId;
      }
      return true;
    })
    .sort((a, b) => b.outstanding - a.outstanding);

  const exportDocumentRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    if (!exportDocumentRef.current) return;
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const tabTitle = 
        activeTab === 'sales' 
          ? 'Laporan_Penjualan' 
          : activeTab === 'receivables' 
          ? 'Buku_Piutang' 
          : 'Laporan_Penerimaan_Kas';
      const cleanComp = company.company_code.replace(/[\/\\?%*:|"<>]/g, '-');
      const filename = `${tabTitle}_${cleanComp}_${dateStr}.pdf`;

      await exportElementToPdf(exportDocumentRef.current, filename, 'A4', 'portrait');
    } catch (err) {
      console.error('Error exporting PDF report:', err);
      alert('Gagal menghasilkan PDF laporan. Silakan coba kembali.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!exportDocumentRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Laporan - ${company.company_name}</title>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body class="bg-white p-4">
          ${exportDocumentRef.current.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(() => { window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Laporan Rekapitulasi & Buku Piutang</span>
          </h1>
          <p className="text-xs text-slate-500">
            Analisis transaksi penjualan, pemantauan piutang, dan penerimaan kas • {company.company_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Preview Cetak</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Memproses PDF...' : 'Export Laporan PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'sales'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Penjualan
            </button>
            <button
              onClick={() => setActiveTab('receivables')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'receivables'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buku Piutang Customer
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Penerimaan Kas
            </button>
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white text-slate-800 focus:outline-emerald-500"
            >
              <option value="all">Semua Customer ({companyCustomers.length})</option>
              {companyCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Periode:</span>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800"
          />
          {(dateRange.startDate || dateRange.endDate || selectedCustomerId !== 'all') && (
            <button
              onClick={() => {
                setDateRange({ startDate: '', endDate: '' });
                setSelectedCustomerId('all');
              }}
              className="text-[11px] text-rose-600 hover:underline ml-1 font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>Total Nilai Transaksi (Kotor)</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatRupiah(totalGrossSales)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dari {filteredInvoices.length} faktur yang tercatat
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>PPN Terpungut (11%)</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-700">
            {formatRupiah(totalTaxAmount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Potongan diskon: {formatRupiah(totalDiscountAmount)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>Kas Masuk / Terbayar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600">
            {formatRupiah(totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
            {totalNetSales > 0 ? `${((totalPaid / totalNetSales) * 100).toFixed(1)}% tertagih` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>Sisa Piutang Berjalan</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">
            {formatRupiah(totalOutstanding)}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-semibold">
            Saldo jatuh tempo & outstanding
          </div>
        </div>
      </div>

      {/* Visible Interactive View in Application */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab 1: Rekap Penjualan */}
        {activeTab === 'sales' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-sm text-slate-900">Rincian Faktur Penjualan</h2>
              <span className="text-xs text-slate-500 font-mono">
                {filteredInvoices.length} transaksi ditampilkan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No. Invoice</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">PPN</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Terbayar</th>
                    <th className="py-3 px-4 text-right">Sisa Piutang</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Tidak ada transaksi faktur yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const cust = companyCustomers.find((c) => c.id === inv.customer_id);
                      const outstanding = Math.max(0, inv.grand_total - inv.paid_amount);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {inv.invoice_number}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {formatDateIndo(inv.invoice_date)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {cust?.customer_name || '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {formatRupiah(inv.subtotal)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sky-700">
                            {formatRupiah(inv.tax_amount)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatRupiah(inv.grand_total)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-700">
                            {formatRupiah(inv.paid_amount)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                            {formatRupiah(outstanding)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inv.status === 'PARTIAL_PAID'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {inv.status === 'PAID'
                                ? 'LUNAS'
                                : inv.status === 'PARTIAL_PAID'
                                ? 'SEBAGIAN'
                                : 'BELUM BAYAR'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredInvoices.length > 0 && (
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right uppercase text-[10px]">
                        Total Ringkasan:
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{formatRupiah(totalGrossSales)}</td>
                      <td className="py-3 px-4 text-right font-mono text-sky-700">{formatRupiah(totalTaxAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatRupiah(totalNetSales)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatRupiah(totalPaid)}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">{formatRupiah(totalOutstanding)}</td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Buku Piutang Customer */}
        {activeTab === 'receivables' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-sm text-slate-900">Buku Besar Saldo Piutang Per Customer</h2>
              <span className="text-xs text-slate-500 font-mono">
                {customerReceivables.length} customer
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Kode & Nama Customer</th>
                    <th className="py-3 px-4">Kota & Telepon</th>
                    <th className="py-3 px-4 text-right">Plafon Kredit</th>
                    <th className="py-3 px-4 text-center">Faktur Open</th>
                    <th className="py-3 px-4 text-right">Total Tagihan</th>
                    <th className="py-3 px-4 text-right">Total Terbayar</th>
                    <th className="py-3 px-4 text-right">Saldo Piutang (Sisa)</th>
                    <th className="py-3 px-4 text-center">Kredit Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerReceivables.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tidak ada data customer yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    customerReceivables.map(({ customer: cust, totalInvoices, unpaidInvoicesCount, totalBilled, totalCustomerPaid, outstanding }) => {
                      const creditRatio = cust.credit_limit > 0 ? (outstanding / cust.credit_limit) * 100 : 0;
                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md mr-1.5">
                              {cust.customer_code}
                            </span>
                            <span className="font-bold text-slate-900">{cust.customer_name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {cust.city} • {cust.phone}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {formatRupiah(cust.credit_limit)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              unpaidInvoicesCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {unpaidInvoicesCount} / {totalInvoices}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {formatRupiah(totalBilled)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-700">
                            {formatRupiah(totalCustomerPaid)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                            {formatRupiah(outstanding)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                creditRatio >= 90
                                  ? 'bg-rose-100 text-rose-800'
                                  : creditRatio >= 60
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {creditRatio.toFixed(0)}% Limit
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Penerimaan Kas */}
        {activeTab === 'payments' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-sm text-slate-900">Buku Pembayaran & Penerimaan Kas</h2>
              <span className="text-xs text-slate-500 font-mono">
                {filteredPayments.length} transaksi penerimaan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No. Bukti Kas</th>
                    <th className="py-3 px-4">Tanggal Terima</th>
                    <th className="py-3 px-4">Faktur Terkait</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Metode Bayar</th>
                    <th className="py-3 px-4">Keterangan / Ref</th>
                    <th className="py-3 px-4 text-right">Nominal Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Tidak ada transaksi pembayaran yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const cust = companyCustomers.find((c) => c.id === p.customer_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {p.payment_number || p.id}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {formatDateIndo(p.payment_date)}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                            {p.invoice_number || '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {cust?.customer_name || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {p.payment_method}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {p.reference_number ? `Ref: ${p.reference_number}` : ''}{' '}
                            {p.notes ? `(${p.notes})` : ''}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            {formatRupiah(p.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredPayments.length > 0 && (
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={6} className="py-3 px-4 text-right uppercase text-[10px]">
                        Total Kas Diterima:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        {formatRupiah(filteredPayments.reduce((acc, p) => acc + p.amount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Hidden/Printable DOM Element specifically structured for Clean A4 PDF Export */}
      <div className="hidden">
        <div
          ref={exportDocumentRef}
          className="bg-white text-slate-900 p-8 w-[210mm] min-h-[297mm] font-sans mx-auto text-xs"
          style={{ width: '210mm', backgroundColor: '#ffffff' }}
        >
          {/* Header Kop Dokumen Resmi */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                LAPORAN KEUANGAN & OPERASIONAL
              </div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
                {company.company_name}
              </h1>
              <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                {company.address}, {company.city}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Telp: {company.phone} • Email: {company.email} • Rekening: {company.bank_name} ({company.bank_account})
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white font-black px-3 py-1 text-xs uppercase rounded-xs">
                {activeTab === 'sales'
                  ? 'REKAP PENJUALAN'
                  : activeTab === 'receivables'
                  ? 'BUKU BESAR PIUTANG'
                  : 'BUKU PENERIMAAN KAS'}
              </div>
              <div className="text-[9.5px] text-slate-500 font-mono mt-1">
                Dicetak: {formatDateIndo(new Date().toISOString().slice(0, 10))}
              </div>
              <div className="text-[9px] text-slate-500">
                Filter: {selectedCustomerId === 'all' ? 'Semua Customer' : companyCustomers.find(c => c.id === selectedCustomerId)?.customer_name}
              </div>
              {(dateRange.startDate || dateRange.endDate) && (
                <div className="text-[9px] text-slate-500">
                  Periode: {dateRange.startDate || 'Awal'} s/d {dateRange.endDate || 'Sekarang'}
                </div>
              )}
            </div>
          </div>

          {/* KPI Mini-Row in PDF */}
          <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">Total Nilai Faktur</div>
              <div className="text-xs font-mono font-bold text-slate-900">{formatRupiah(totalNetSales)}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">PPN Terpungut</div>
              <div className="text-xs font-mono font-bold text-slate-700">{formatRupiah(totalTaxAmount)}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">Pelunasan Masuk</div>
              <div className="text-xs font-mono font-bold text-emerald-700">{formatRupiah(totalPaid)}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">Sisa Piutang Berjalan</div>
              <div className="text-xs font-mono font-bold text-rose-700">{formatRupiah(totalOutstanding)}</div>
            </div>
          </div>

          {/* Table Data inside PDF */}
          {activeTab === 'sales' && (
            <div>
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase">
                    <th className="py-1.5 px-2 text-left">No. Invoice</th>
                    <th className="py-1.5 px-2 text-left">Tgl</th>
                    <th className="py-1.5 px-2 text-left">Customer</th>
                    <th className="py-1.5 px-2 text-right">Subtotal</th>
                    <th className="py-1.5 px-2 text-right">PPN</th>
                    <th className="py-1.5 px-2 text-right">Grand Total</th>
                    <th className="py-1.5 px-2 text-right">Terbayar</th>
                    <th className="py-1.5 px-2 text-right">Sisa Piutang</th>
                    <th className="py-1.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, idx) => {
                    const cust = companyCustomers.find((c) => c.id === inv.customer_id);
                    const outstanding = Math.max(0, inv.grand_total - inv.paid_amount);
                    return (
                      <tr
                        key={inv.id}
                        className={`border-b border-slate-200 ${
                          idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                        }`}
                      >
                        <td className="py-1 px-2 font-mono font-bold">{inv.invoice_number}</td>
                        <td className="py-1 px-2 text-slate-600">{inv.invoice_date}</td>
                        <td className="py-1 px-2 font-semibold">{cust?.customer_name || '-'}</td>
                        <td className="py-1 px-2 text-right font-mono">{formatRupiah(inv.subtotal)}</td>
                        <td className="py-1 px-2 text-right font-mono">{formatRupiah(inv.tax_amount)}</td>
                        <td className="py-1 px-2 text-right font-mono font-bold">{formatRupiah(inv.grand_total)}</td>
                        <td className="py-1 px-2 text-right font-mono text-emerald-800">{formatRupiah(inv.paid_amount)}</td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-rose-700">{formatRupiah(outstanding)}</td>
                        <td className="py-1 px-2 text-center font-bold">
                          {inv.status === 'PAID' ? 'LUNAS' : inv.status === 'PARTIAL_PAID' ? 'PARSIAL' : 'BELUM'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 bg-slate-100 font-bold text-slate-900">
                    <td colSpan={3} className="py-1.5 px-2 text-right uppercase">TOTAL REKAPITULASI:</td>
                    <td className="py-1.5 px-2 text-right font-mono">{formatRupiah(totalGrossSales)}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{formatRupiah(totalTaxAmount)}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{formatRupiah(totalNetSales)}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-800">{formatRupiah(totalPaid)}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-rose-700">{formatRupiah(totalOutstanding)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {activeTab === 'receivables' && (
            <div>
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase">
                    <th className="py-1.5 px-2 text-left">Kode & Customer</th>
                    <th className="py-1.5 px-2 text-left">Kota / Kontak</th>
                    <th className="py-1.5 px-2 text-right">Plafon Kredit</th>
                    <th className="py-1.5 px-2 text-center">Faktur Open</th>
                    <th className="py-1.5 px-2 text-right">Total Tagihan</th>
                    <th className="py-1.5 px-2 text-right">Total Terbayar</th>
                    <th className="py-1.5 px-2 text-right">Sisa Piutang (Saldo)</th>
                  </tr>
                </thead>
                <tbody>
                  {customerReceivables.map((row, idx) => (
                    <tr
                      key={row.customer.id}
                      className={`border-b border-slate-200 ${
                        idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                      }`}
                    >
                      <td className="py-1 px-2 font-bold">
                        <span className="font-mono text-[8px] bg-slate-100 px-1 py-0.2 mr-1">
                          {row.customer.customer_code}
                        </span>
                        {row.customer.customer_name}
                      </td>
                      <td className="py-1 px-2 text-slate-600">{row.customer.city}</td>
                      <td className="py-1 px-2 text-right font-mono">{formatRupiah(row.customer.credit_limit)}</td>
                      <td className="py-1 px-2 text-center font-mono">{row.unpaidInvoicesCount} dari {row.totalInvoices}</td>
                      <td className="py-1 px-2 text-right font-mono">{formatRupiah(row.totalBilled)}</td>
                      <td className="py-1 px-2 text-right font-mono text-emerald-800">{formatRupiah(row.totalCustomerPaid)}</td>
                      <td className="py-1 px-2 text-right font-mono font-bold text-rose-700">{formatRupiah(row.outstanding)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 bg-slate-100 font-bold text-slate-900">
                    <td colSpan={4} className="py-1.5 px-2 text-right uppercase">TOTAL SALDO PIUTANG:</td>
                    <td className="py-1.5 px-2 text-right font-mono">
                      {formatRupiah(customerReceivables.reduce((a, b) => a + b.totalBilled, 0))}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-800">
                      {formatRupiah(customerReceivables.reduce((a, b) => a + b.totalCustomerPaid, 0))}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-rose-700">
                      {formatRupiah(customerReceivables.reduce((a, b) => a + b.outstanding, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase">
                    <th className="py-1.5 px-2 text-left">No. Bukti Kas</th>
                    <th className="py-1.5 px-2 text-left">Tgl Kas</th>
                    <th className="py-1.5 px-2 text-left">No. Faktur</th>
                    <th className="py-1.5 px-2 text-left">Customer</th>
                    <th className="py-1.5 px-2 text-left">Metode</th>
                    <th className="py-1.5 px-2 text-left">Keterangan</th>
                    <th className="py-1.5 px-2 text-right">Nominal Masuk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, idx) => {
                    const cust = companyCustomers.find((c) => c.id === p.customer_id);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-200 ${
                          idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                        }`}
                      >
                        <td className="py-1 px-2 font-mono font-bold">{p.payment_number || p.id}</td>
                        <td className="py-1 px-2 text-slate-600">{p.payment_date}</td>
                        <td className="py-1 px-2 font-mono">{p.invoice_number || '-'}</td>
                        <td className="py-1 px-2 font-semibold">{cust?.customer_name || '-'}</td>
                        <td className="py-1 px-2">{p.payment_method}</td>
                        <td className="py-1 px-2 text-slate-500">{p.reference_number || p.notes || '-'}</td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-emerald-800">
                          {formatRupiah(p.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 bg-slate-100 font-bold text-slate-900">
                    <td colSpan={6} className="py-1.5 px-2 text-right uppercase">TOTAL KAS DITERIMA:</td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-800">
                      {formatRupiah(filteredPayments.reduce((acc, p) => acc + p.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Footer & Tanda Tangan Pengesahan Laporan */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-[9px]">
            <div className="text-slate-500">
              <p>Laporan ini dicetak secara otomatis dari Aplikasi Faktur & Surat Jalan.</p>
              <p>Segala ketidaksesuaian data dapat dikonfirmasikan ke bagian Keuangan.</p>
            </div>

            <div className="flex gap-12 text-center">
              <div>
                <div className="text-slate-500 mb-8">Dibuat Oleh,</div>
                <div className="font-bold border-b border-slate-400 pb-1 px-4 min-w-[100px]">
                  ( Keuangan / Kasir )
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-8">Disetujui Oleh,</div>
                <div className="font-bold border-b border-slate-400 pb-1 px-4 min-w-[100px]">
                  ( Pimpinan / Manajer )
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Cetak / Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Pratinjau Cetak Laporan - {company.company_name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Langsung</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Memproses...' : 'Unduh PDF'}</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
              <div className="bg-white shadow-md p-8 w-[210mm] min-h-[297mm] text-xs">
                {/* Header Kop Preview */}
                <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black uppercase text-slate-900">
                      {company.company_name}
                    </h2>
                    <p className="text-[10px] text-slate-600">
                      {company.address}, {company.city} • Telp: {company.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {activeTab === 'sales' ? 'Rekap Penjualan' : activeTab === 'receivables' ? 'Buku Piutang' : 'Penerimaan Kas'}
                    </span>
                    <div className="text-[9px] text-slate-400 mt-1">
                      Tgl Cetak: {formatDateIndo(new Date().toISOString().slice(0, 10))}
                    </div>
                  </div>
                </div>

                {/* Content snippet */}
                <div className="text-[10px] text-slate-600 mb-4 bg-slate-50 p-2.5 rounded border border-slate-200">
                  Ringkasan: Total Transaksi <span className="font-bold text-slate-900">{formatRupiah(totalNetSales)}</span>, 
                  Terbayar <span className="font-bold text-emerald-700">{formatRupiah(totalPaid)}</span>, 
                  Sisa Saldo Piutang <span className="font-bold text-rose-600">{formatRupiah(totalOutstanding)}</span>.
                </div>

                <div className="text-[10px] text-slate-500 italic text-center py-4">
                  (Dokumen siap diekspor menjadi PDF beresolusi tajam sesuai tata letak A4 resmi)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
