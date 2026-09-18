import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, Search, Check, AlertCircle } from 'lucide-react';
import { Product, Company, UnitConfig, CategoryConfig } from '../../types';
import { formatRupiah, formatNumber } from '../../services/calculation.service';

interface ProductsManagerProps {
  products: Product[];
  company: Company;
  units: UnitConfig[];
  categories: CategoryConfig[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  company,
  units,
  categories,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({});

  const filtered = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData(prod);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingProduct(null);
    setFormData({
      id: `prod-${Date.now()}`,
      company_id: company.id,
      product_code: `PRD-${(products.length + 1).toString().padStart(3, '0')}`,
      product_name: '',
      category: categories[0]?.name || 'Sayuran',
      unit: units[0]?.code || 'KG',
      purchase_price: 10000,
      selling_price: 15000,
      taxable: false,
      tax_rate: 0,
      stock: 100,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || !formData.product_code) {
      alert('Nama dan kode produk wajib diisi.');
      return;
    }
    onSaveProduct(formData as Product);
    setEditingProduct(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Master Produk & Satuan</span>
          </h1>
          <p className="text-xs text-slate-500">
            Katalog barang/jasa, harga beli & jual standar, satuan (KG, DUS, PCS), dan tarif pajak bawaan.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Produk Baru</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama barang, kode, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: {filtered.length} Item Produk
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="px-4 py-3">Kode & Nama Produk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-center">Satuan</th>
              <th className="px-4 py-3 text-right">Harga Beli</th>
              <th className="px-4 py-3 text-right">Harga Jual Standar</th>
              <th className="px-4 py-3 text-center">Pajak</th>
              <th className="px-4 py-3 text-center">Stok Fisik</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    {prod.product_code}
                  </span>
                  <div className="font-bold text-slate-900 mt-1">{prod.product_name}</div>
                </td>

                <td className="px-4 py-3 text-slate-700 font-medium">
                  {prod.category}
                </td>

                <td className="px-4 py-3 text-center font-bold text-slate-600">
                  {prod.unit}
                </td>

                <td className="px-4 py-3 text-right font-mono text-slate-500">
                  {formatRupiah(prod.purchase_price)}
                </td>

                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                  {formatRupiah(prod.selling_price)}
                </td>

                <td className="px-4 py-3 text-center">
                  {prod.taxable ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      PPN {prod.tax_rate}%
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                      Non PPN
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800">
                  {formatNumber(prod.stock || 0)}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(prod.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Product Modal */}
      {(editingProduct || isCreating) && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-sm">
                {isCreating ? 'Tambah Produk Baru' : 'Ubah Data Produk'}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
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
                  <label className="block font-semibold text-slate-700 mb-1">Kode Produk / Barcode</label>
                  <input
                    type="text"
                    value={formData.product_code || ''}
                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    value={formData.product_name || ''}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan Utama</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.code}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Beli / Pokok (Rp)</label>
                  <input
                    type="number"
                    value={formData.purchase_price || 0}
                    onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual Standar (Rp)</label>
                  <input
                    type="number"
                    value={formData.selling_price || 0}
                    onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="taxableCheck"
                    checked={formData.taxable || false}
                    onChange={(e) => {
                      const isTax = e.target.checked;
                      setFormData({ ...formData, taxable: isTax, tax_rate: isTax ? 11 : 0 });
                    }}
                    className="w-4 h-4 rounded-sm text-emerald-600"
                  />
                  <label htmlFor="taxableCheck" className="font-semibold text-slate-800 cursor-pointer">
                    Kena Pajak PPN
                  </label>
                </div>

                {formData.taxable && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tarif Pajak (%)</label>
                    <input
                      type="number"
                      value={formData.tax_rate || 11}
                      onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Stok Fisik Awal</label>
                <input
                  type="number"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
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
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
