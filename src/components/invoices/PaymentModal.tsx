import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { Invoice, PaymentMethodConfig, Customer } from '../../types';
import { formatRupiah, formatDateIndo } from '../../services/calculation.service';

interface PaymentModalProps {
  invoice: Invoice;
  customer?: Customer;
  paymentMethods: PaymentMethodConfig[];
  onSavePayment: (data: {
    amount: number;
    payment_method: string;
    reference_number: string;
    notes: string;
    payment_date: string;
  }) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  customer,
  paymentMethods,
  onSavePayment,
  onClose,
}) => {
  const outstanding = Math.max(0, invoice.grand_total - invoice.paid_amount);
  const [amount, setAmount] = useState<number>(outstanding);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    paymentMethods[0]?.name || 'Transfer Bank'
  );
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('Pelunasan invoice');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Nominal pembayaran harus lebih dari 0.');
      return;
    }
    onSavePayment({
      amount: Number(amount),
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      notes,
      payment_date: paymentDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Catat Penerimaan Pembayaran</h3>
              <p className="text-xs text-slate-500 font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Invoice Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Customer:</span>
              <span className="font-bold text-slate-900">{customer?.customer_name || '-'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Tagihan Invoice:</span>
              <span className="font-bold text-slate-900">{formatRupiah(invoice.grand_total)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sudah Dibayar Sebelumnya:</span>
              <span className="font-semibold text-emerald-700">{formatRupiah(invoice.paid_amount)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-rose-600 font-bold text-sm">
              <span>Sisa Piutang (Outstanding):</span>
              <span>{formatRupiah(outstanding)}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jumlah Pembayaran Masuk (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={outstanding}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full pl-3 pr-20 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm focus:outline-emerald-600"
              />
              <button
                type="button"
                onClick={() => setAmount(outstanding)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-1 rounded-md transition"
              >
                Bayar Penuh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Bayar</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Bukti Transfer / Ref (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: TRF-BCA-9812739"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pembayaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
