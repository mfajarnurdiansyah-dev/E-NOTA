import React, { useState } from 'react';
import { Database, Copy, Check, Download, Server, Shield, Layers } from 'lucide-react';
import { POSTGRES_SCHEMA_SQL } from '../../services/migration.service';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([POSTGRES_SCHEMA_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_invoice_delivery_order.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Skema Database Relasional (DDL SQL)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Skrip DDL PostgreSQL & Supabase lengkap dengan multi-tenant <code className="font-mono bg-slate-100 px-1 rounded-sm">company_id</code>, isolasi RLS, index performa, dan trigger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin SQL'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File .sql</span>
          </button>
        </div>
      </div>

      {/* Feature cards for architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Multi-Tenancy RLS</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Setiap tabel utama memiliki kunci asing <code className="font-mono text-emerald-700">company_id</code> untuk isolasi data antar entitas bisnis.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Kompatibel PostgreSQL & Supabase</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Mendukung tipe data JSONB fleksibel untuk custom fields faktur dan aturan koordinat cetak dot matrix.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Integritas Relasional Penuh</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              ON DELETE CASCADE pada rincian item, dan ON DELETE RESTRICT pada customer & produk aktif.
            </p>
          </div>
        </div>
      </div>

      {/* SQL Code Box */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg text-slate-200">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400 ml-2">schema_postgres.sql</span>
          </div>
          <span className="text-slate-500 text-[10px]">PostgreSQL 14+ / Supabase DDL</span>
        </div>

        <pre className="p-4 overflow-x-auto text-[11px] font-mono text-emerald-400 leading-relaxed max-h-[500px]">
          <code>{POSTGRES_SCHEMA_SQL}</code>
        </pre>
      </div>
    </div>
  );
};
