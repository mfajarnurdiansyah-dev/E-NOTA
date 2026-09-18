import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Truck, Link, FileText, CheckCircle2 } from 'lucide-react';
import { 
  DeliveryOrder, 
  DeliveryOrderItem, 
  Invoice, 
  Customer, 
  Product, 
  Company, 
  NumberingRule 
} from '../../types';
import { generateDocumentNumber } from '../../services/numbering.service';

interface DeliveryOrderFormModalProps {
  initialData?: DeliveryOrder | null;
  fromInvoice?: Invoice | null;
  company: Company;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  numberingRule: NumberingRule;
  onSave: (data: Partial<DeliveryOrder>, advanceSequence: boolean) => void;
  onClose: () => void;
}

export const DeliveryOrderFormModal: React.FC<DeliveryOrderFormModalProps> = ({
  initialData,
  fromInvoice,
  company,
  customers,
  products,
  invoices,
  numberingRule,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialData?.id);

  // Auto-generate DO number if new
  const generatedNum = !isEditing
    ? generateDocumentNumber(numberingRule, company, new Date(), true).documentNumber
    : initialData?.do_number || '';

  const [doNumber, setDoNumber] = useState<string>(generatedNum);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    fromInvoice?.id || initialData?.invoice_id || ''
  );
  const [customerId, setCustomerId] = useState<string>(
    fromInvoice?.customer_id || initialData?.customer_id || customers[0]?.id || ''
  );
  const [deliveryDate, setDeliveryDate] = useState<string>(
    initialData?.delivery_date || new Date().toISOString().split('T')[0]
  );
  
  // Recipient address
  const selectedCust = customers.find((c) => c.id === customerId);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    initialData?.delivery_address || selectedCust?.address || ''
  );
  const [driverName, setDriverName] = useState<string>(
    initialData?.driver_name || 'Asep Saepuloh'
  );
  const [vehicleNumber, setVehicleNumber] = useState<string>(
    initialData?.vehicle_number ||
      (fromInvoice?.custom_fields?.kendaraan as string) ||
      'F 8892 WY (Truk Engkel)'
  );
  const [receiverName, setReceiverName] = useState<string>(
    initialData?.receiver_name || selectedCust?.customer_name || ''
  );
  const [receiverPhone, setReceiverPhone] = useState<string>(
    initialData?.receiver_phone || selectedCust?.phone || ''
  );
  const [notes, setNotes] = useState<string>(
    initialData?.notes ||
      'Harap periksa kondisi fisik barang, segel karung/dus, dan timbang kembali saat penerimaan.'
  );

  // Initial items: If fromInvoice, populate with invoice items!
  const initialItems: DeliveryOrderItem[] = fromInvoice
    ? fromInvoice.items.map((it) => ({
        id: `doi-${Date.now()}-${it.id}`,
        product_id: it.product_id,
        product_code: it.product_code,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        notes: it.notes || 'Kondisi segar/baik',
      }))
    : initialData?.items || [
        {
          id: `doi-${Date.now()}-1`,
          product_id: products[0]?.id || '',
          product_code: products[0]?.product_code || '',
          description: products[0]?.product_name || 'Barang Kiriman',
          quantity: 10,
          unit: products[0]?.unit || 'KG',
          notes: 'Segel utuh',
        },
      ];

  const [items, setItems] = useState<DeliveryOrderItem[]>(initialItems);

  // When selecting an existing invoice from dropdown
  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (!invId) return;
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setCustomerId(inv.customer_id);
      const cust = customers.find((c) => c.id === inv.customer_id);
      if (cust) {
        setDeliveryAddress(cust.address);
        setReceiverName(cust.customer_name);
        setReceiverPhone(cust.phone);
      }
      setItems(
        inv.items.map((it) => ({
          id: `doi-${Date.now()}-${it.id}`,
          product_id: it.product_id,
          product_code: it.product_code,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          notes: it.notes || 'Kondisi baik',
        }))
      );
    }
  };

  const handleAddItem = () => {
    const p = products[0];
    setItems([
      ...items,
      {
        id: `doi-${Date.now()}-${items.length + 1}`,
        product_id: p?.id || '',
        product_code: p?.product_code || '',
        description: p?.product_name || 'Item Pengiriman',
        quantity: 1,
        unit: p?.unit || 'KG',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('Surat Jalan minimal harus memiliki 1 item barang.');
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (index: number, field: keyof DeliveryOrderItem, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    setItems(copy);
  };

  const handleSave = (status: 'DRAFT' | 'READY' | 'ON_DELIVERY') => {
    if (!customerId) {
      alert('Pilih customer tujuan.');
      return;
    }
    if (!deliveryAddress) {
      alert('Alamat pengiriman wajib diisi.');
      return;
    }
    if (items.length === 0) {
      alert('Minimal 1 item barang.');
      return;
    }

    const linkedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

    const payload: Partial<DeliveryOrder> = {
      do_number: doNumber,
      company_id: company.id,
      invoice_id: selectedInvoiceId || undefined,
      invoice_number: linkedInvoice?.invoice_number || undefined,
      customer_id: customerId,
      delivery_date: deliveryDate,
      delivery_address: deliveryAddress,
      driver_name: driverName,
      vehicle_number: vehicleNumber,
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      items,
      notes,
      status: initialData?.status || status,
      template_id: initialData?.template_id || 'tmpl-do-dotmatrix',
    };

    onSave(payload, !isEditing);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Ubah Surat Jalan (Delivery Order)' : 'Buat Surat Jalan (DO) Baru'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {company.company_name} ({company.company_code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Link to Invoice (Optional) */}
          <div className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sky-900">
              <Link className="w-4 h-4 text-sky-600" />
              <div>
                <span className="font-bold block">Tautkan ke Faktur / Invoice (Opsional):</span>
                <span className="text-[11px] text-sky-700">
                  Otomatis mengisi customer & barang yang akan dikirim
                </span>
              </div>
            </div>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleSelectInvoice(e.target.value)}
              className="p-1.5 border border-sky-300 rounded-lg bg-white font-mono text-xs font-semibold text-slate-800"
            >
              <option value="">-- Buat Mandiri (Tanpa Invoice) --</option>
              {invoices
                .filter((i) => i.company_id === company.id)
                .map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} - {inv.invoice_date}
                  </option>
                ))}
            </select>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Surat Jalan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={doNumber}
                onChange={(e) => setDoNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tujuan / Customer <span className="text-rose-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  const c = customers.find((cust) => cust.id === e.target.value);
                  if (c) {
                    setDeliveryAddress(c.address);
                    setReceiverName(c.customer_name);
                    setReceiverPhone(c.phone);
                  }
                }}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengiriman</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
                placeholder="Jl. Raya Babakan Karet No. 45..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Supir / Driver</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Polisi / Kendaraan</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Penerima di Lokasi</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Daftar Barang yang Dikirim</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold px-3 py-1.5 rounded-lg border border-sky-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Barang</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                    <th className="p-2.5 text-left">Nama / Deskripsi Barang</th>
                    <th className="p-2.5 text-center w-28">Qty Kirim</th>
                    <th className="p-2.5 text-center w-24">Satuan</th>
                    <th className="p-2.5 text-left w-52">Keterangan / Segel</th>
                    <th className="p-2.5 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50/70">
                      <td className="p-2">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-md font-semibold text-slate-900"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'quantity', Number(e.target.value))
                          }
                          className="w-full p-1.5 border border-slate-300 rounded-md text-center font-mono font-bold"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-md text-center font-medium"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          value={it.notes || ''}
                          onChange={(e) => handleUpdateItem(idx, 'notes', e.target.value)}
                          placeholder="Segel baik / packing utuh..."
                          className="w-full p-1.5 border border-slate-200 rounded-md text-slate-600"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan Pengiriman</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('READY')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold"
            >
              Simpan Siap Kirim
            </button>
            <button
              type="button"
              onClick={() => handleSave('ON_DELIVERY')}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Perbarui Surat Jalan' : 'Terbitkan Surat Jalan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
