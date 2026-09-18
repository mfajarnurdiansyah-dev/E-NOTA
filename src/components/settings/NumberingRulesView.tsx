import React, { useState } from 'react';
import { Hash, Save, Check, Info } from 'lucide-react';
import { NumberingRule, Company } from '../../types';
import { generateDocumentNumber } from '../../services/numbering.service';

interface NumberingRulesViewProps {
  rules: NumberingRule[];
  company: Company;
  onSaveRule: (rule: NumberingRule) => void;
}

export const NumberingRulesView: React.FC<NumberingRulesViewProps> = ({
  rules,
  company,
  onSaveRule,
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const activeRule = rules.find((r) => r.id === selectedRuleId) || rules[0];

  const [formData, setFormData] = useState<NumberingRule>(activeRule);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedRuleId(id);
    const r = rules.find((x) => x.id === id);
    if (r) setFormData(r);
  };

  const previewResult = generateDocumentNumber(formData, company, new Date(), false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRule(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Konfigurasi Format Penomoran Dokumen</span>
          </h1>
          <p className="text-xs text-slate-500">
            Atur formula nomor faktur dan surat jalan otomatis sesuai format perusahaan.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>Format berhasil disimpan!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Pilih Jenis Dokumen</h3>
            {rules.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r.id)}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  r.id === selectedRuleId
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <div>
                  <div className="text-xs">{r.name || (r.document_type === 'invoice' ? 'Faktur Penjualan (Invoice)' : 'Surat Jalan (DO)')}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{r.pattern || r.format_pattern}</div>
                </div>
                <Hash className="w-4 h-4 opacity-50" />
              </button>
            ))}
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2 text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Daftar Variabel Formula:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800">
              <li><code className="font-mono bg-emerald-100 px-1 rounded-sm">{'{PREFIX}'}</code> : Prefix dokumen</li>
              <li><code className="font-mono bg-emerald-100 px-1 rounded-sm">{'{COMPANY}'}</code> : Kode perusahaan ({company.company_code})</li>
              <li><code className="font-mono bg-emerald-100 px-1 rounded-sm">{'{YEAR}'}</code> : 4 Digit Tahun (2026)</li>
              <li><code className="font-mono bg-emerald-100 px-1 rounded-sm">{'{MONTH}'}</code> : 2 Digit Bulan (09)</li>
              <li><code className="font-mono bg-emerald-100 px-1 rounded-sm">{'{DAY}'}</code> : 2 Digit Tanggal (17)</li>
              <li><code className="font-mono bg-emerald-100 px-1 rounded-sm">{'{SEQUENCE}'}</code> : Nomor urut counter</li>
            </ul>
          </div>
        </div>

        {/* Right Form Editor & Live Preview */}
        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            {/* Live Result Highlight */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simulasi Hasil Nomor Berikutnya:
              </span>
              <div className="font-mono text-xl font-bold text-emerald-400 tracking-wider">
                {previewResult.documentNumber}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Formula aktif: {formData.pattern || formData.format_pattern} (Counter: {formData.current_sequence || formData.current_number})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prefix Dokumen</label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pemisah (Separator)</label>
                <select
                  value={formData.separator || '/'}
                  onChange={(e) => setFormData({ ...formData, separator: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                >
                  <option value="/">Garis Miring (/)</option>
                  <option value="-">Tanda Hubung (-)</option>
                  <option value=".">Titik (.)</option>
                  <option value="">Tanpa Pemisah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pola Format Template (Pattern)
              </label>
              <input
                type="text"
                value={formData.pattern || formData.format_pattern || ''}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value, format_pattern: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Digit Nol (Padding)</label>
                <input
                  type="number"
                  min={3}
                  max={8}
                  value={formData.sequence_length || formData.padding || 4}
                  onChange={(e) => setFormData({ ...formData, sequence_length: Number(e.target.value), padding: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counter Terakhir</label>
                <input
                  type="number"
                  min={1}
                  value={formData.current_sequence || formData.current_number || 1}
                  onChange={(e) => setFormData({ ...formData, current_sequence: Number(e.target.value), current_number: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frekuensi Reset Counter</label>
                <select
                  value={formData.reset_cycle || 'monthly'}
                  onChange={(e) => setFormData({ ...formData, reset_cycle: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="monthly">Bulanan (Reset tiap tgl 1)</option>
                  <option value="yearly">Tahunan (Reset tiap 1 Jan)</option>
                  <option value="never">Tidak Pernah Reset</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Aturan Penomoran</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
