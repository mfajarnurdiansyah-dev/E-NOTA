import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Plus, 
  Save, 
  Printer, 
  Sliders, 
  Check, 
  History, 
  FileText,
  Copy,
  ChevronDown
} from 'lucide-react';
import { DocumentTemplate, Company } from '../../types';

interface TemplateBuilderViewProps {
  templates: DocumentTemplate[];
  company: Company;
  onSaveTemplate: (template: DocumentTemplate) => void;
}

export const TemplateBuilderView: React.FC<TemplateBuilderViewProps> = ({
  templates,
  company,
  onSaveTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [elements, setElements] = useState(activeTemplate?.elements || []);
  const [styleTheme, setStyleTheme] = useState(activeTemplate?.style_theme || 'formal');
  const [version, setVersion] = useState(activeTemplate?.version || 1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync elements when selecting another template
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setElements(tmpl.elements);
      setStyleTheme(tmpl.style_theme);
      setVersion(tmpl.version);
    }
  };

  const handleToggleElement = (id: string) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el))
    );
  };

  const handleSave = () => {
    if (!activeTemplate) return;
    const updated: DocumentTemplate = {
      ...activeTemplate,
      style_theme: styleTheme,
      version: version + 1, // Auto version increment on publish (PRD Section 24)
      status: 'PUBLISHED',
      elements,
      updated_at: new Date().toISOString(),
    };
    onSaveTemplate(updated);
    setVersion(version + 1);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Document Template & Layout Builder</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kustomisasi visual komponen cetak invoice & surat jalan, versioning dokumen (v{version}), dan format kertas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Template v{version} Tersimpan & Terbit!</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Terbitkan Versi Baru (Publish v{version + 1})</span>
          </button>
        </div>
      </div>

      {/* Template Selector Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-emerald-600" />
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Pilih Template yang Diedit
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-transparent font-bold text-sm text-slate-900 focus:outline-hidden cursor-pointer"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.paper_size} • v{t.version})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span className="text-slate-500">Ukuran:</span>
            <span className="font-bold text-slate-800">{activeTemplate?.paper_size}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span className="text-slate-500">Versi Aktif:</span>
            <span className="font-mono font-bold text-indigo-700">v{version}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-700">{activeTemplate?.status}</span>
          </div>
        </div>
      </div>

      {/* Two-Column Editor Layout: Left Controls, Right Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Element Toggles & Styling */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Elemen & Blok Dokumen</span>
              </h3>
              <span className="text-xs text-slate-400">Aktifkan / Sembunyikan</span>
            </div>

            <div className="space-y-2">
              {elements.map((el) => (
                <div
                  key={el.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    el.visible
                      ? 'bg-slate-50/80 border-slate-200 text-slate-900'
                      : 'bg-slate-100/40 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono text-[10px] text-slate-500 font-bold">
                      {el.order}
                    </span>
                    <span className="text-xs font-semibold">{el.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleElement(el.id)}
                    className={`p-1.5 rounded-lg transition ${
                      el.visible
                        ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                        : 'text-slate-400 hover:text-slate-600 bg-slate-200'
                    }`}
                    title={el.visible ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {el.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Style Theme Picker */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                Tema Desain & Typography
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    { key: 'formal', label: 'Formal Klasik' },
                    { key: 'modern', label: 'Modern Minimalis' },
                    { key: 'distributor', label: 'Distributor Padat' },
                    { key: 'carbon_copy', label: 'Carbon Copy Matrix' },
                  ] as const
                ).map((th) => (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => setStyleTheme(th.key)}
                    className={`p-2 rounded-xl border text-left font-medium transition ${
                      styleTheme === th.key
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Canvas */}
        <div className="lg:col-span-7 bg-slate-100 p-6 rounded-2xl border border-slate-200 flex justify-center">
          <div
            className={`bg-white shadow-md border border-slate-300 rounded-sm p-6 text-xs transition duration-300 ${
              activeTemplate?.paper_size === 'DOT_MATRIX_210X80'
                ? 'w-full max-w-[620px] font-mono text-[10px] leading-tight border-emerald-300'
                : 'w-full max-w-[480px] min-h-[580px] flex flex-col justify-between'
            }`}
          >
            {/* Header / Logo */}
            {elements.find((e) => e.element_type === 'header' || e.element_type === 'company_info')?.visible && (
              <div className="border-b-2 border-slate-800 pb-3 mb-3 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase">
                    {company.company_name}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {company.address}, {company.city}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 uppercase">
                    {activeTemplate?.document_type === 'invoice' ? 'INVOICE' : 'SURAT JALAN'}
                  </span>
                  <p className="text-[10px] font-mono text-slate-500">NO: INV/2026/09/XXXX</p>
                </div>
              </div>
            )}

            {/* Customer Box */}
            {elements.find((e) => e.element_type === 'customer_info')?.visible && (
              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 mb-3 text-[10px]">
                <span className="font-bold text-slate-500 uppercase">Kepada Yth:</span>
                <p className="font-bold text-slate-800">Supermarket Mega Fresh Cianjur</p>
                <p className="text-slate-600">Jl. Dr. Muwardi No. 102, Cianjur</p>
              </div>
            )}

            {/* Items Table Mockup */}
            {elements.find((e) => e.element_type === 'items_table')?.visible && (
              <div className="border border-slate-200 rounded-md overflow-hidden mb-3">
                <div className="bg-slate-100 p-1.5 font-bold text-[10px] flex justify-between">
                  <span>Nama Barang</span>
                  <span>Qty</span>
                  <span>Total</span>
                </div>
                <div className="p-1.5 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Wortel Brastagi Segar</span>
                    <span>150 KG</span>
                    <span className="font-mono">Rp 2.325.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kentang Granola Dieng</span>
                    <span>200 KG</span>
                    <span className="font-mono">Rp 3.515.000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Totals & Bank Info */}
            {elements.find((e) => e.element_type === 'totals')?.visible && (
              <div className="text-right text-[10px] border-t border-slate-300 pt-2 mb-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">Rp 5.840.000</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800">
                  <span>Grand Total:</span>
                  <span className="font-mono">Rp 5.840.000</span>
                </div>
              </div>
            )}

            {/* Signatures */}
            {elements.find((e) => e.element_type === 'signatures')?.visible && (
              <div className="grid grid-cols-3 gap-2 text-center text-[9px] border-t border-dashed border-slate-300 pt-2 text-slate-500">
                <div>Penerima</div>
                <div>Pengirim / Sopir</div>
                <div>Hormat Kami</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
