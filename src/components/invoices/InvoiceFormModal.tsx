import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Calculator, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  Invoice, 
  InvoiceItem, 
  Customer, 
  Product, 
  Company, 
  TaxConfig, 
  UnitConfig, 
  NumberingRule 
} from '../../types';
import { 
  calculateInvoiceTotals, 
  calculateItemSubtotal, 
  formatRupiah, 
  terbilang 
} from '../../services/calculation.service';
import { generateDocumentNumber } from '../../services/numbering.service';
import { DocumentSignatureSection } from '../common/DocumentSignatureSection';

interface InvoiceFormModalProps {
  initialData?: Invoice | null;
  company: Company;
  customers: Customer[];
  products: Product[];
  taxConfigs: TaxConfig[];
  units: UnitConfig[];
  numberingRule: NumberingRule;
  onSave: (invoiceData: Partial<Invoice>, advanceSequence: boolean) => void;
  onClose: () => void;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  initialData,
  company,
  customers,
  products,
  taxConfigs,
  units,
  numberingRule,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialData?.id);

  // Auto-generate invoice number if new
  const generatedNum = !isEditing
    ? generateDocumentNumber(numberingRule, company, new Date(), true).documentNumber
    : initialData?.invoice_number || '';

  const [invoiceNumber, setInvoiceNumber] = useState<string>(generatedNum);
  const [customerId, setCustomerId] = useState<string>(
    initialData?.customer_id || customers[0]?.id || ''
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    initialData?.invoice_date || new Date().toISOString().split('T')[0]
  );
  
  // Default due date = +30 days
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);
  const [dueDate, setDueDate] = useState<string>(
    initialData?.due_date || defaultDueDate.toISOString().split('T')[0]
  );

  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items || [
      {
        id: `item-${Date.now()}-1`,
        product_id: products[0]?.id || '',
        product_code: products[0]?.product_code || '',
        description: products[0]?.product_name || 'Produk Pesanan',
        quantity: 10,
        unit: products[0]?.unit || 'KG',
        price: products[0]?.selling_price || 15000,
        discount: 0,
        discount_type: 'nominal',
        tax_rate: products[0]?.tax_rate || 0,
        subtotal: (products[0]?.selling_price || 15000) * 10,
        notes: '',
      },
    ]
  );

  const [discount, setDiscount] = useState<number>(initialData?.discount || 0);
  const [discountType, setDiscountType] = useState<'nominal' | 'percent'>(
    initialData?.discount_type || 'nominal'
  );
  const [taxRate, setTaxRate] = useState<number>(
    initialData?.tax_rate !== undefined ? initialData.tax_rate : 11
  );
  const [notes, setNotes] = useState<string>(
    initialData?.notes ||
      'Terima kasih atas kepercayaan Anda. Pembayaran hanya sah jika ditransfer ke rekening resmi perusahaan.'
  );
  const [poNumber, setPoNumber] = useState<string>(
    (initialData?.custom_fields?.po_number as string) || ''
  );
  const [kendaraan, setKendaraan] = useState<string>(
    (initialData?.custom_fields?.kendaraan as string) || ''
  );

  // Signatures & Signer custom names
  const [warehouseOfficerName, setWarehouseOfficerName] = useState<string>(
    initialData?.warehouse_officer_name || ''
  );
  const [warehouseSignatureImage, setWarehouseSignatureImage] = useState<string | undefined>(
    initialData?.warehouse_signature_image || undefined
  );
  const [signerName, setSignerName] = useState<string>(
    initialData?.signer_name || ''
  );
  const [signatureImage, setSignatureImage] = useState<string | undefined>(
    initialData?.signature_image || undefined
  );

  // Recalculate totals
  const totals = calculateInvoiceTotals(items, discount, discountType, taxRate);

  // Add Item row
  const handleAddItem = () => {
    const firstProd = products[0];
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      product_id: firstProd?.id || '',
      product_code: firstProd?.product_code || '',
      description: firstProd?.product_name || 'Produk Baru',
      quantity: 1,
      unit: firstProd?.unit || 'KG',
      price: firstProd?.selling_price || 0,
      discount: 0,
      discount_type: 'nominal',
      tax_rate: firstProd?.tax_rate || 0,
      subtotal: firstProd?.selling_price || 0,
    };
    setItems([...items, newItem]);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('Invoice minimal harus memiliki 1 item barang.');
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  // Select Product in row
  const handleSelectProduct = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    const newItems = [...items];
    const current = newItems[index];
    const sub = calculateItemSubtotal(
      Number(current.quantity) || 0,
      prod.selling_price,
      current.discount,
      current.discount_type
    );

    newItems[index] = {
      ...current,
      product_id: prod.id,
      product_code: prod.product_code,
      description: prod.product_name,
      unit: prod.unit,
      price: prod.selling_price,
      tax_rate: prod.tax_rate,
      subtotal: sub,
    };
    setItems(newItems);
  };

  // Update item field
  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    item.subtotal = calculateItemSubtotal(
      Number(item.quantity) || 0,
      Number(item.price) || 0,
      Number(item.discount) || 0,
      item.discount_type
    );
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSave = (status: 'DRAFT' | 'PENDING' | 'APPROVED') => {
    if (!customerId) {
      alert('Silakan pilih customer terlebih dahulu.');
      return;
    }
    if (items.length === 0) {
      alert('Minimal masukkan 1 baris item barang.');
      return;
    }

    const payload: Partial<Invoice> = {
      invoice_number: invoiceNumber,
      company_id: company.id,
      customer_id: customerId,
      invoice_date: invoiceDate,
      due_date: dueDate,
      items,
      subtotal: totals.subtotal,
      discount,
      discount_type: discountType,
      discount_amount: totals.discountAmount,
      dpp: totals.dpp,
      tax_rate: taxRate,
      tax_amount: totals.taxAmount,
      grand_total: totals.grandTotal,
      paid_amount: initialData?.paid_amount || 0,
      status: initialData?.status || status,
      notes,
      template_id: initialData?.template_id || 'tmpl-a4-formal',
      warehouse_officer_name: warehouseOfficerName.trim() || undefined,
      warehouse_signature_image: warehouseSignatureImage || undefined,
      signer_name: signerName.trim() || undefined,
      signature_image: signatureImage || undefined,
      custom_fields: {
        po_number: poNumber,
        kendaraan,
      },
    };

    onSave(payload, !isEditing);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Ubah Faktur / Invoice' : 'Buat Faktur / Invoice Baru'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Perusahaan: {company.company_name} ({company.company_code})
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

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Top Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer / Pembeli <span className="text-rose-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name} ({c.customer_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Invoice <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Invoice</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jatuh Tempo</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-medium text-rose-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor PO (Opsional)</label>
              <input
                type="text"
                placeholder="PO-2026/09/..."
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Polisi Armada</label>
              <input
                type="text"
                placeholder="F 8892 WY"
                value={kendaraan}
                onChange={(e) => setKendaraan(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Rincian Barang / Jasa</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Produk</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                    <th className="p-2.5 text-left w-64">Produk / Barang</th>
                    <th className="p-2.5 text-center w-24">Qty</th>
                    <th className="p-2.5 text-center w-20">Satuan</th>
                    <th className="p-2.5 text-right w-32">Harga Satuan (Rp)</th>
                    <th className="p-2.5 text-center w-24">Diskon</th>
                    <th className="p-2.5 text-right w-36">Subtotal (Rp)</th>
                    <th className="p-2.5 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-2">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleSelectProduct(idx, e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-md bg-white font-semibold text-slate-900 mb-1"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} ({p.product_code})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          placeholder="Deskripsi spesifik item..."
                          className="w-full p-1 text-[11px] border border-slate-200 rounded-md text-slate-600"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateItem(idx, 'quantity', val === '' ? 0 : parseFloat(val) || 0);
                          }}
                          placeholder="0"
                          className="w-full p-1.5 border border-slate-300 rounded-md text-center font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-md bg-white text-center font-medium"
                        >
                          {units.map((u) => (
                            <option key={u.id} value={u.code}>
                              {u.code}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'price', Number(e.target.value))
                          }
                          className="w-full p-1.5 border border-slate-300 rounded-md text-right font-mono font-semibold"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={item.discount}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'discount', Number(e.target.value))
                          }
                          placeholder="0"
                          className="w-full p-1.5 border border-slate-300 rounded-md text-center font-mono"
                        />
                      </td>

                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(item.subtotal)}
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                          title="Hapus baris"
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

          {/* Bottom Calculations & Totals Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Faktur & Syarat Pembayaran
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <p className="font-bold text-emerald-900 mb-0.5">Terbilang:</p>
                <p className="italic text-emerald-800 font-medium">
                  "{terbilang(totals.grandTotal)}"
                </p>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-slate-700">
                <span>Subtotal Barang:</span>
                <span className="font-mono font-bold">{formatRupiah(totals.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700">Diskon Faktur:</span>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="p-1 border border-slate-300 rounded-md bg-white text-[11px]"
                  >
                    <option value="nominal">Nominal (Rp)</option>
                    <option value="percent">Persen (%)</option>
                  </select>
                </div>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 p-1 border border-slate-300 rounded-md text-right font-mono"
                />
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span>Dasar Pengenaan Pajak (DPP):</span>
                <span className="font-mono font-bold">{formatRupiah(totals.dpp)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-700">Tarif Pajak (PPN):</span>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="p-1 border border-slate-300 rounded-md bg-white font-mono font-semibold"
                >
                  <option value={11}>PPN 11%</option>
                  <option value={12}>PPN 12%</option>
                  <option value={0}>Bebas Pajak (0%)</option>
                </select>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span>Nilai Pajak (PPN):</span>
                <span className="font-mono font-semibold">{formatRupiah(totals.taxAmount)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-black">
                <span className="text-slate-900">GRAND TOTAL:</span>
                <span className="font-mono text-emerald-800 text-base">
                  {formatRupiah(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Custom Signature Names & Image Uploads */}
          <DocumentSignatureSection
            warehouseOfficerName={warehouseOfficerName}
            onWarehouseOfficerNameChange={setWarehouseOfficerName}
            warehouseSignatureImage={warehouseSignatureImage}
            onWarehouseSignatureImageChange={setWarehouseSignatureImage}
            signerName={signerName}
            onSignerNameChange={setSignerName}
            signatureImage={signatureImage}
            onSignatureImageChange={setSignatureImage}
            defaultSignerPlaceholder={company.account_name || company.company_name}
            documentType="invoice"
          />
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200/70 rounded-lg font-semibold transition"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('DRAFT')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('PENDING')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Perbarui Invoice' : 'Terbitkan Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
