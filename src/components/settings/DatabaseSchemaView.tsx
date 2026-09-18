import React, { useState } from 'react';
import { Database, Copy, Check, Download, Server, Shield, Layers, Cloud, RefreshCw, CheckCircle2, Monitor } from 'lucide-react';
import { POSTGRES_SCHEMA_SQL } from '../../services/migration.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSyncToCloud = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      const companies = StorageService.getCompanies();
      const users = StorageService.getUsers();
      const roles = StorageService.getRoles();
      const customers = StorageService.getCustomers();
      const products = StorageService.getProducts();
      const invoices = StorageService.getInvoices();
      const deliveryOrders = StorageService.getDeliveryOrders();
      const numberingRules = StorageService.getNumberingRules();
      const templates = StorageService.getTemplates();

      // Push all to Firestore in parallel batches
      await Promise.all([
        ...companies.map((c) => FirestoreService.saveCompany(c)),
        ...users.map((u) => FirestoreService.saveUser(u)),
        ...roles.map((r) => FirestoreService.saveRole(r)),
        ...customers.map((c) => FirestoreService.saveCustomer(c)),
        ...products.map((p) => FirestoreService.saveProduct(p)),
        ...invoices.map((inv) => FirestoreService.saveInvoice(inv)),
        ...deliveryOrders.map((d) => FirestoreService.saveDeliveryOrder(d)),
        ...numberingRules.map((nr) => FirestoreService.saveNumberingRule(nr)),
      ]);

      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

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

      {/* Cloud Database (Firebase Firestore) Real-time Sync Status Card */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Database Cloud Aktif (Firebase Firestore)</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Multi-Device Sync Online
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Data faktur, surat jalan, produk, pelanggan, dan pembayaran tersimpan di database cloud Google Cloud Firestore. Anda dapat membuka URL Vercel aplikasi ini dari <strong>berbagai komputer dan smartphone yang berbeda</strong>, dan seluruh data akan selalu tersinkronisasi secara otomatis dan real-time.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={handleSyncToCloud}
              disabled={syncing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sedang Menyinkronkan...' : syncSuccess ? 'Berhasil Disinkronkan!' : 'Sinkronkan Ulang ke Cloud'}</span>
            </button>
          </div>
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
