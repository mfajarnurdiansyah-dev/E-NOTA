import React, { useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, PenLine, User, CheckCircle2 } from 'lucide-react';

interface DocumentSignatureSectionProps {
  warehouseOfficerName: string;
  onWarehouseOfficerNameChange: (val: string) => void;
  warehouseSignatureImage?: string;
  onWarehouseSignatureImageChange: (dataUrl?: string) => void;

  signerName?: string;
  onSignerNameChange?: (val: string) => void;
  signatureImage?: string;
  onSignatureImageChange?: (dataUrl?: string) => void;

  defaultSignerPlaceholder?: string;
  documentType?: 'invoice' | 'delivery_order';
}

/**
 * Resizes uploaded signature image to standard dimensions (max 500px)
 * to maintain crisp rendering while keeping payload lightweight (<50KB)
 * Preserves PNG transparency.
 */
function processSignatureFile(file: File, onComplete: (base64: string) => void) {
  if (!file.type.startsWith('image/')) {
    alert('Harap pilih file gambar (PNG, JPG, atau WEBP)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawData = e.target?.result as string;
    const img = new Image();
    img.onload = () => {
      const maxDim = 500;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const resizedData = canvas.toDataURL(mime, 0.92);
        onComplete(resizedData);
      } else {
        onComplete(rawData);
      }
    };
    img.src = rawData;
  };
  reader.readAsDataURL(file);
}

export const DocumentSignatureSection: React.FC<DocumentSignatureSectionProps> = ({
  warehouseOfficerName,
  onWarehouseOfficerNameChange,
  warehouseSignatureImage,
  onWarehouseSignatureImageChange,
  signerName,
  onSignerNameChange,
  signatureImage,
  onSignatureImageChange,
  defaultSignerPlaceholder = 'Nama Perusahaan / Pimpinan',
  documentType = 'invoice',
}) => {
  const warehouseFileInputRef = useRef<HTMLInputElement>(null);
  const signerFileInputRef = useRef<HTMLInputElement>(null);

  const handleWarehouseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSignatureFile(file, (dataUrl) => {
        onWarehouseSignatureImageChange(dataUrl);
      });
    }
    // reset input so user can re-upload the same file if needed
    if (e.target) e.target.value = '';
  };

  const handleSignerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSignatureFile(file, (dataUrl) => {
        if (onSignatureImageChange) onSignatureImageChange(dataUrl);
      });
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
            <PenLine className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">
              Tanda Tangan & Penanda Tangan Dokumen
            </h4>
            <p className="text-[11px] text-slate-500">
              Kustomisasi nama dan unggah file gambar tanda tangan (PNG/JPG) yang akan dicetak di atas garis tanda tangan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ================= Bagian Gudang ================= */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <label className="font-bold text-slate-800 text-xs">
                {documentType === 'delivery_order' ? 'Petugas Gudang / Driver' : 'Bagian Gudang'}
              </label>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Kolom Tengah</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Nama Petugas:
            </label>
            <input
              type="text"
              value={warehouseOfficerName}
              onChange={(e) => onWarehouseOfficerNameChange(e.target.value)}
              placeholder="Contoh: Budi Santoso / Pak Joko (opsional)"
              className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              * Jika dikosongkan, akan tampil garis titik-titik ( ........................... )
            </p>
          </div>

          {/* Upload Tanda Tangan Gudang */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Gambar Tanda Tangan Petugas:
            </label>

            {warehouseSignatureImage ? (
              <div className="relative border border-emerald-300 bg-emerald-50/30 rounded-lg p-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-16 h-12 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img
                      src={warehouseSignatureImage}
                      alt="Tanda Tangan Gudang"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Tanda Tangan Siap Dicetak
                    </span>
                    <p className="text-[10px] text-slate-500">Tampil tepat di atas garis tanda tangan</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => warehouseFileInputRef.current?.click()}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md text-[11px] font-medium border border-slate-200 transition"
                    title="Ganti Gambar"
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={() => onWarehouseSignatureImageChange(undefined)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md text-[11px] font-medium transition"
                    title="Hapus Tanda Tangan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => warehouseFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 rounded-lg p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700">
                  Unggah Tanda Tangan (PNG / JPG)
                </span>
                <span className="text-[10px] text-slate-400">
                  Disarankan format PNG berlatar transparan
                </span>
              </div>
            )}

            <input
              ref={warehouseFileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleWarehouseFileChange}
            />
          </div>
        </div>

        {/* ================= Hormat Kami ================= */}
        {onSignerNameChange && onSignatureImageChange && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <label className="font-bold text-slate-800 text-xs">
                  Hormat Kami (Penerbit / Penjual)
                </label>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Kolom Kanan</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Nama Penanda Tangan / Jabatan:
              </label>
              <input
                type="text"
                value={signerName || ''}
                onChange={(e) => onSignerNameChange(e.target.value)}
                placeholder={`Default: ${defaultSignerPlaceholder}`}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * Jika dikosongkan, otomatis menggunakan nama perusahaan / rekening
              </p>
            </div>

            {/* Upload Tanda Tangan Hormat Kami */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                Gambar Tanda Tangan Hormat Kami:
              </label>

              {signatureImage ? (
                <div className="relative border border-emerald-300 bg-emerald-50/30 rounded-lg p-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-16 h-12 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                      <img
                        src={signatureImage}
                        alt="Tanda Tangan Hormat Kami"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Tanda Tangan Siap Dicetak
                      </span>
                      <p className="text-[10px] text-slate-500">Tampil tepat di atas garis tanda tangan</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => signerFileInputRef.current?.click()}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md text-[11px] font-medium border border-slate-200 transition"
                      title="Ganti Gambar"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={() => onSignatureImageChange(undefined)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md text-[11px] font-medium transition"
                      title="Hapus Tanda Tangan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => signerFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 rounded-lg p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">
                    Unggah Tanda Tangan (PNG / JPG)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Disarankan format PNG berlatar transparan
                  </span>
                </div>
              )}

              <input
                ref={signerFileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleSignerFileChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
