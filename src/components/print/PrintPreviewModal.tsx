import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Layers, 
  Maximize2, 
  Minimize2,
  Check, 
  FileText,
  FileCheck,
  Building,
  Calendar,
  Truck,
  Hash,
  Type
} from 'lucide-react';
import { 
  Invoice, 
  DeliveryOrder, 
  Company, 
  Customer, 
  DocumentTemplate, 
  PrinterProfile 
} from '../../types';
import { formatRupiah, formatNumber, formatDateIndo, terbilang } from '../../services/calculation.service';
import { exportElementToPdf } from '../../services/pdf.service';

export type PrintFontFamily = 
  | 'draft' 
  | 'roman' 
  | 'roman_condensed' 
  | 'sans_serif' 
  | 'arial' 
  | 'times_new_roman';

export interface FontOptionConfig {
  id: PrintFontFamily;
  label: string;
  sublabel: string;
  cssFamily: string;
  letterSpacing: string;
  lineHeight: string;
  isDotMatrixNative?: boolean;
}

export const FONT_OPTIONS_CONFIG: Record<PrintFontFamily, FontOptionConfig> = {
  draft: {
    id: 'draft',
    label: 'Draft',
    sublabel: 'High-speed matrix draft (VT323 / Dot Matrix)',
    cssFamily: "'VT323', 'Space Mono', 'Courier Prime', monospace",
    letterSpacing: '-0.2px',
    lineHeight: '1.2',
    isDotMatrixNative: true,
  },
  roman: {
    id: 'roman',
    label: 'Roman',
    sublabel: 'Standard LQ 10 CPI (Courier Prime / Courier New)',
    cssFamily: "'Courier Prime', 'Courier New', Courier, monospace",
    letterSpacing: '0px',
    lineHeight: '1.25',
    isDotMatrixNative: true,
  },
  roman_condensed: {
    id: 'roman_condensed',
    label: 'Roman Condensed',
    sublabel: '17 CPI Dense pitch (Share Tech Mono / Condensed)',
    cssFamily: "'Share Tech Mono', 'Courier Prime', 'Space Mono', monospace",
    letterSpacing: '-0.8px',
    lineHeight: '1.15',
    isDotMatrixNative: true,
  },
  sans_serif: {
    id: 'sans_serif',
    label: 'Sans Serif',
    sublabel: 'Modern Clean (Plus Jakarta Sans / System)',
    cssFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    letterSpacing: '-0.1px',
    lineHeight: '1.3',
  },
  arial: {
    id: 'arial',
    label: 'Arial',
    sublabel: 'Standard Universal Sans (Arial / Helvetica)',
    cssFamily: "Arial, Helvetica, 'Liberation Sans', sans-serif",
    letterSpacing: '0px',
    lineHeight: '1.3',
  },
  times_new_roman: {
    id: 'times_new_roman',
    label: 'Times New Roman',
    sublabel: 'Formal Serif (Times New Roman / Times)',
    cssFamily: "'Times New Roman', Times, 'Liberation Serif', serif",
    letterSpacing: '0px',
    lineHeight: '1.3',
  },
};

interface PrintPreviewModalProps {
  documentType: 'invoice' | 'delivery_order';
  invoice?: Invoice;
  deliveryOrder?: DeliveryOrder;
  company: Company;
  customer?: Customer;
  templates: DocumentTemplate[];
  printerProfiles: PrinterProfile[];
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  documentType,
  invoice,
  deliveryOrder,
  company,
  customer,
  templates,
  printerProfiles,
  onClose,
}) => {
  // Paper mode toggle: A4 vs Dot Matrix (210x80mm)
  const defaultPaper = documentType === 'delivery_order' ? 'DOT_MATRIX_210X80' : 'A4';
  const [paperFormat, setPaperFormat] = useState<'A4' | 'DOT_MATRIX_210X80'>(defaultPaper);

  // Font family selector state (Draft, Roman, Roman Condensed, Sans Serif, Arial, Times New Roman)
  const [selectedFont, setSelectedFont] = useState<PrintFontFamily>(
    defaultPaper === 'DOT_MATRIX_210X80' ? 'roman' : 'sans_serif'
  );
  
  // Compact Single-Page A4 Mode (Auto-activated if items count >= 8)
  const itemsCount = (invoice?.items || deliveryOrder?.items || []).length;
  const [isCompactMode, setIsCompactMode] = useState<boolean>(itemsCount >= 8);

  // Dot matrix pagination state: max items per continuous 80mm page (default: 8 as requested)
  const [dotMatrixItemsPerPage, setDotMatrixItemsPerPage] = useState<number>(8);

  // Raw items array for pagination
  const rawItems = documentType === 'invoice' ? (invoice?.items || []) : (deliveryOrder?.items || []);

  // Dynamic chunking for Dot Matrix continuous form (e.g. 13 items -> 3 pages)
  const dotMatrixPages = useMemo(() => {
    if (rawItems.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < rawItems.length; i += dotMatrixItemsPerPage) {
      pages.push(rawItems.slice(i, i + dotMatrixItemsPerPage));
    }
    return pages;
  }, [rawItems, dotMatrixItemsPerPage]);

  // Dot matrix copy sheet simulator: White (Asli), Pink (Copy 1), Yellow (Copy 2)
  const [copyColor, setCopyColor] = useState<'white' | 'pink' | 'yellow'>('white');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  const documentNumber = invoice?.invoice_number || deliveryOrder?.do_number || 'DOKUMEN-001';

  // Trigger browser print with isolated iframe to eliminate modal clipping and ensure native vector output
  const handlePrint = () => {
    if (!printContentRef.current) {
      window.print();
      return;
    }

    const isDotMatrix = paperFormat === 'DOT_MATRIX_210X80';

    // Create an invisible iframe for true isolated printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all head stylesheets so Tailwind classes render faithfully
    const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${documentNumber}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Share+Tech+Mono&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=VT323&display=swap" rel="stylesheet">
        ${headStyles}
        <style>
          @page {
            size: ${isDotMatrix ? '210mm 80mm landscape' : 'A4 portrait'};
            margin: ${isDotMatrix ? '0mm' : isCompactMode ? '6mm 10mm' : '10mm 15mm'};
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: ${FONT_OPTIONS_CONFIG[selectedFont].cssFamily} !important;
            letter-spacing: ${FONT_OPTIONS_CONFIG[selectedFont].letterSpacing} !important;
            font-size: ${isDotMatrix ? '9.5px' : isCompactMode ? '9.5pt' : '11pt'};
            line-height: ${isCompactMode ? '1.2' : FONT_OPTIONS_CONFIG[selectedFont].lineHeight};
          }
          /* Ensure font applies across all text containers, tables, and signatures */
          body * {
            font-family: inherit !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: always !important;
          }

          /* Dot matrix continuous form page-break rules */
          .dotmatrix-page, .dotmatrix-print-page {
            width: 210mm !important;
            height: 80mm !important;
            max-height: 80mm !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 2.5mm 4mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            background: white !important;
          }
          .dotmatrix-page:last-child, .dotmatrix-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          /* Compact Mode Injection for Single Page Fitting */
          ${isCompactMode ? `
            .print-compact table th, .print-compact table td {
              padding: 3px 6px !important;
              font-size: 8.5pt !important;
              line-height: 1.15 !important;
            }
            .print-compact .doc-header {
              padding-bottom: 5px !important;
              margin-bottom: 5px !important;
            }
            .print-compact .doc-info-box {
              padding: 6px 8px !important;
              margin-bottom: 6px !important;
              font-size: 8.5pt !important;
            }
            .print-compact .doc-totals {
              margin-top: 6px !important;
              padding-top: 6px !important;
              font-size: 8.5pt !important;
            }
            .print-compact .doc-signatures {
              margin-top: 6px !important;
              padding-top: 2px !important;
            }
            .print-compact .sig-space {
              height: 36px !important;
            }
          ` : ''}
        </style>
      </head>
      <body>
        <div class="${isCompactMode ? 'print-compact' : ''}" style="padding: ${isDotMatrix ? '0' : '0'};">
          ${printContentRef.current.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 400);
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!printContentRef.current) return;
    try {
      setIsExportingPdf(true);
      const filename = `${documentType === 'invoice' ? 'Invoice' : 'SuratJalan'}_${documentNumber.replace(/[\/\\?%*:|"<>]/g, '-')}.pdf`;
      await exportElementToPdf(
        printContentRef.current,
        filename,
        paperFormat,
        paperFormat === 'DOT_MATRIX_210X80' ? 'landscape' : 'portrait'
      );
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Gagal membuat PDF. Anda juga dapat menggunakan tombol Cetak -> Save as PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const copyColorsTheme = {
    white: {
      bg: 'bg-white',
      border: 'border-slate-300',
      label: 'Lembar 1 (Asli - Putih)',
      stamp: 'ASLI',
      stampColor: 'text-slate-500 border-slate-400',
    },
    pink: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      label: 'Lembar 2 (Copy Arsip - Merah Muda)',
      stamp: 'COPY GUDANG',
      stampColor: 'text-rose-500 border-rose-300',
    },
    yellow: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      label: 'Lembar 3 (Copy Tagihan - Kuning)',
      stamp: 'COPY FINANCE',
      stampColor: 'text-amber-600 border-amber-300',
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col border border-slate-200">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Print Preview & PDF Hub
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {documentNumber} • {company.company_name}
              </p>
            </div>
          </div>

          {/* Paper Size Switcher Tabs & Mode Padat */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setPaperFormat('A4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                paperFormat === 'A4'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>A4 Portrait (210×297 mm)</span>
            </button>
            <button
              onClick={() => setPaperFormat('DOT_MATRIX_210X80')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                paperFormat === 'DOT_MATRIX_210X80'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dot Matrix 210×80 mm (Epson Continuous)</span>
            </button>
          </div>

          {/* Compact Single Page Toggle (Available on A4) */}
          {paperFormat === 'A4' && (
            <button
              onClick={() => setIsCompactMode(!isCompactMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isCompactMode
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Merapatkan padding dan teks agar 13+ item muat dalam 1 halaman A4 tanpa terpotong"
            >
              <Minimize2 className={`w-3.5 h-3.5 ${isCompactMode ? 'text-amber-700' : 'text-slate-400'}`} />
              <span>Mode Padat (Fit 1 Hal): {isCompactMode ? 'AKTIF' : 'NON-AKTIF'}</span>
            </button>
          )}

          {/* Font Family Selector (Draft, Roman, Roman Condensed, Sans Serif, Arial, Times New Roman) */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
            <Type className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap hidden sm:inline">
              Font:
            </span>
            <select
              id="font-family-selector"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value as PrintFontFamily)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer pr-1 py-0.5"
              title="Pilih jenis huruf untuk cetak faktur / surat jalan (Dot Matrix & A4)"
            >
              {Object.values(FONT_OPTIONS_CONFIG).map((font) => (
                <option key={font.id} value={font.id} className="py-1">
                  {font.label} {font.isDotMatrixNative ? '• Dot Matrix' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Memproses PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-toolbar for Dot Matrix: Copies & Pagination Controls */}
        {paperFormat === 'DOT_MATRIX_210X80' && (
          <div className="px-5 py-2 bg-emerald-50/90 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-950">
                  Simulasi Kertas:
                </span>
                <div className="flex items-center gap-1">
                  {(['white', 'pink', 'yellow'] as const).map((colorKey) => (
                    <button
                      key={colorKey}
                      onClick={() => setCopyColor(colorKey)}
                      className={`px-2 py-0.5 rounded-md font-medium text-[11px] border transition cursor-pointer ${
                        copyColor === colorKey
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs font-bold'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {copyColorsTheme[colorKey].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Items Pagination Per Sheet */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-emerald-200">
                <span className="font-semibold text-emerald-950">
                  Maks Item / Lembar:
                </span>
                <div className="flex items-center gap-1">
                  {[6, 8, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setDotMatrixItemsPerPage(num)}
                      className={`px-2 h-6 rounded-md text-[11px] font-bold border transition cursor-pointer flex items-center justify-center ${
                        dotMatrixItemsPerPage === num
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {num} baris
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[11px] rounded-md font-semibold border border-emerald-200">
                {rawItems.length} Item terbagi dalam {dotMatrixPages.length} Halaman Continuous
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden lg:inline">
                (Ukuran: 210 × 80 mm)
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Document Canvas Preview Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/70 flex justify-center">
          {paperFormat === 'A4' ? (
            /* ========================================================================= */
            /* A4 FORMAT (210 x 297 mm PORTRAIT)                                         */
            /* ========================================================================= */
            <div
              ref={printContentRef}
              className={`a4-print-page bg-white shadow-lg border border-slate-200 rounded-sm w-[210mm] min-h-[297mm] ${
                isCompactMode ? 'p-6 print-compact' : 'p-10'
              } text-slate-900 text-xs flex flex-col justify-between`}
              style={{
                fontFamily: FONT_OPTIONS_CONFIG[selectedFont].cssFamily,
                letterSpacing: FONT_OPTIONS_CONFIG[selectedFont].letterSpacing,
              }}
            >
              <div>
                {/* Header Kop Perusahaan */}
                <div
                  className={`doc-header flex justify-between items-start border-b-2 border-slate-900 ${
                    isCompactMode ? 'pb-2.5 mb-2.5' : 'pb-5 mb-5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div>
                      <h1
                        className={`${
                          isCompactMode ? 'text-base' : 'text-lg'
                        } font-black text-slate-900 uppercase tracking-tight`}
                      >
                        {company.company_name}
                      </h1>
                      <p className="text-slate-600 text-[10px] leading-tight max-w-sm mt-0.5">
                        {company.address}, {company.city}
                      </p>
                      <p className="text-slate-500 text-[9.5px] mt-0.5">
                        Telp: {company.phone} • Email: {company.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block ${
                        isCompactMode ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
                      } bg-slate-900 text-white font-black tracking-wider uppercase rounded-xs`}
                    >
                      {documentType === 'invoice' ? 'FAKTUR / INVOICE' : 'SURAT JALAN'}
                    </span>
                    <p
                      className={`font-mono font-bold ${
                        isCompactMode ? 'text-xs mt-1' : 'text-sm mt-2'
                      } text-slate-900`}
                    >
                      {documentNumber}
                    </p>
                    <p className="text-slate-500 text-[10px]">
                      Tanggal:{' '}
                      {formatDateIndo(
                        invoice?.invoice_date || deliveryOrder?.delivery_date || '2026-09-17'
                      )}
                    </p>
                    {invoice?.due_date && (
                      <p className="text-rose-600 font-semibold text-[10px]">
                        Jatuh Tempo: {formatDateIndo(invoice.due_date)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Recipient / Customer Info */}
                <div
                  className={`doc-info-box grid grid-cols-2 ${
                    isCompactMode ? 'gap-3 p-2.5 mb-3' : 'gap-6 p-3.5 mb-6'
                  } bg-slate-50 rounded-lg border border-slate-200`}
                >
                  <div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                      {documentType === 'invoice' ? 'TAGIHAN KEPADA:' : 'TUJUAN PENGIRIMAN:'}
                    </span>
                    <p className="font-bold text-slate-900 text-xs">
                      {customer?.customer_name || 'Customer Umum'}
                    </p>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                      {deliveryOrder?.delivery_address || customer?.address || '-'}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-0.5">
                      Telp: {deliveryOrder?.receiver_phone || customer?.phone || '-'}
                    </p>
                  </div>

                  {documentType === 'delivery_order' ? (
                    <div>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        DETAIL PENGIRIMAN & ARMADA:
                      </span>
                      <p className="text-slate-700 text-[11px]">
                        <span className="font-semibold">Nama Supir / Driver:</span>{' '}
                        {deliveryOrder?.driver_name || '-'}
                      </p>
                      <p className="text-slate-700 text-[11px]">
                        <span className="font-semibold">No. Polisi / Armada:</span>{' '}
                        {deliveryOrder?.vehicle_number || '-'}
                      </p>
                      <p className="text-slate-700 text-[11px]">
                        <span className="font-semibold">Penerima Barang:</span>{' '}
                        {deliveryOrder?.receiver_name || '-'}
                      </p>
                      {deliveryOrder?.invoice_number && (
                        <p className="text-slate-700 text-[11px]">
                          <span className="font-semibold">Ref. Invoice:</span>{' '}
                          {deliveryOrder.invoice_number}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        INFORMASI LAINNYA:
                      </span>
                      {invoice?.custom_fields?.po_number && (
                        <p className="text-slate-700 text-[11px]">
                          <span className="font-semibold">Nomor PO:</span>{' '}
                          {invoice.custom_fields.po_number}
                        </p>
                      )}
                      {invoice?.custom_fields?.kendaraan && (
                        <p className="text-slate-700 text-[11px]">
                          <span className="font-semibold">No. Kendaraan:</span>{' '}
                          {invoice.custom_fields.kendaraan}
                        </p>
                      )}
                      <p className="text-slate-700 text-[11px]">
                        <span className="font-semibold">Status Pembayaran:</span>{' '}
                        <span className="font-bold text-emerald-700">
                          {invoice?.status || 'PENDING'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <table
                  className={`w-full border-collapse border border-slate-200 ${
                    isCompactMode ? 'mb-3' : 'mb-6'
                  }`}
                >
                  <thead>
                    <tr
                      className={`bg-slate-100 text-slate-800 ${
                        isCompactMode ? 'text-[10px]' : 'text-[11px]'
                      } font-bold uppercase`}
                    >
                      <th
                        className={`border border-slate-300 ${
                          isCompactMode ? 'px-2 py-1' : 'px-3 py-2'
                        } text-center w-8`}
                      >
                        No
                      </th>
                      <th
                        className={`border border-slate-300 ${
                          isCompactMode ? 'px-2 py-1' : 'px-3 py-2'
                        } text-left`}
                      >
                        Nama Barang / Deskripsi
                      </th>
                      <th
                        className={`border border-slate-300 ${
                          isCompactMode ? 'px-2 py-1 w-16' : 'px-3 py-2 w-20'
                        } text-center`}
                      >
                        Qty
                      </th>
                      <th
                        className={`border border-slate-300 ${
                          isCompactMode ? 'px-2 py-1 w-14' : 'px-3 py-2 w-16'
                        } text-center`}
                      >
                        Satuan
                      </th>
                      {documentType === 'invoice' && (
                        <>
                          <th
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 w-24' : 'px-3 py-2 w-28'
                            } text-right`}
                          >
                            Harga (Rp)
                          </th>
                          <th
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 w-20' : 'px-3 py-2 w-24'
                            } text-right`}
                          >
                            Diskon
                          </th>
                          <th
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 w-28' : 'px-3 py-2 w-32'
                            } text-right`}
                          >
                            Total (Rp)
                          </th>
                        </>
                      )}
                      {documentType === 'delivery_order' && (
                        <th
                          className={`border border-slate-300 ${
                            isCompactMode ? 'px-2 py-1 w-36' : 'px-3 py-2 w-48'
                          } text-left`}
                        >
                          Keterangan / Kondisi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {documentType === 'invoice' &&
                      invoice?.items.map((it, idx) => (
                        <tr key={it.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-center font-medium`}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1' : 'px-3 py-2'
                            }`}
                          >
                            <p
                              className={`font-bold text-slate-900 ${
                                isCompactMode ? 'text-[11px] leading-tight' : 'text-xs'
                              }`}
                            >
                              {it.description}
                            </p>
                            {it.product_code && (
                              <p className="text-[9px] text-slate-500 font-mono">
                                {it.product_code}
                              </p>
                            )}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-center font-bold`}
                          >
                            {formatNumber(it.quantity)}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-center text-slate-600`}
                          >
                            {it.unit}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-right font-mono`}
                          >
                            {formatNumber(it.price)}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-right text-slate-600`}
                          >
                            {it.discount > 0
                              ? it.discount_type === 'percent'
                                ? `${it.discount}%`
                                : formatNumber(it.discount)
                              : '-'}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-right font-mono font-bold text-slate-900`}
                          >
                            {formatNumber(it.subtotal)}
                          </td>
                        </tr>
                      ))}

                    {documentType === 'delivery_order' &&
                      deliveryOrder?.items.map((it, idx) => (
                        <tr key={it.id} className="border-b border-slate-200">
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-center`}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[11px]' : 'px-3 py-2'
                            } font-bold text-slate-900`}
                          >
                            {it.description}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-center font-bold`}
                          >
                            {formatNumber(it.quantity)}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-center text-slate-600`}
                          >
                            {it.unit}
                          </td>
                          <td
                            className={`border border-slate-300 ${
                              isCompactMode ? 'px-2 py-1 text-[10px]' : 'px-3 py-2'
                            } text-slate-600`}
                          >
                            {it.notes || 'Kondisi baik, segel utuh'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Invoice Financial Totals */}
                {documentType === 'invoice' && invoice && (
                  <div
                    className={`doc-totals grid grid-cols-12 ${
                      isCompactMode ? 'gap-3 mb-3' : 'gap-6 mb-6'
                    }`}
                  >
                    <div
                      className={`col-span-7 bg-slate-50 ${
                        isCompactMode ? 'p-2.5' : 'p-3.5'
                      } rounded-lg border border-slate-200`}
                    >
                      <p className="text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                        Terbilang:
                      </p>
                      <p className="italic text-[11px] text-slate-800 font-medium leading-tight">
                        "{terbilang(invoice.grand_total)}"
                      </p>

                      <div
                        className={`mt-2 pt-2 border-t border-slate-200 ${
                          isCompactMode ? 'space-y-0.5' : 'space-y-1'
                        }`}
                      >
                        <p className="text-[10px] font-bold text-slate-700">
                          Pembayaran Transfer Bank:
                        </p>
                        <p className="text-[11px] text-slate-800 font-semibold">
                          {company.bank_name}
                        </p>
                        <p className="text-[11px] font-mono font-bold text-emerald-800 tracking-wide">
                          No. Rek: {company.bank_account}
                        </p>
                        <p className="text-[10px] text-slate-600">a.n. {company.account_name}</p>
                      </div>
                    </div>

                    <div
                      className={`col-span-5 ${
                        isCompactMode ? 'space-y-1 text-[11px]' : 'space-y-1.5 text-xs'
                      }`}
                    >
                      <div className="flex justify-between py-0.5 border-b border-slate-200">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-mono font-semibold">
                          {formatRupiah(invoice.subtotal)}
                        </span>
                      </div>
                      {invoice.discount_amount > 0 && (
                        <div className="flex justify-between py-0.5 border-b border-slate-200 text-rose-600">
                          <span>Diskon Faktur:</span>
                          <span className="font-mono">
                            -{formatRupiah(invoice.discount_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-0.5 border-b border-slate-200">
                        <span className="text-slate-600">DPP:</span>
                        <span className="font-mono">{formatRupiah(invoice.dpp)}</span>
                      </div>
                      {invoice.tax_amount > 0 && (
                        <div className="flex justify-between py-0.5 border-b border-slate-200">
                          <span className="text-slate-600">PPN (11%):</span>
                          <span className="font-mono">{formatRupiah(invoice.tax_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-t-2 border-slate-900 font-black text-xs">
                        <span className="text-slate-900 uppercase">Grand Total:</span>
                        <span className="font-mono text-emerald-800">
                          {formatRupiah(invoice.grand_total)}
                        </span>
                      </div>
                      {invoice.paid_amount > 0 && (
                        <div className="flex justify-between py-0.5 border-b border-slate-200 text-emerald-700 font-semibold">
                          <span>Telah Dibayar:</span>
                          <span className="font-mono">{formatRupiah(invoice.paid_amount)}</span>
                        </div>
                      )}
                      {invoice.grand_total - invoice.paid_amount > 0 && (
                        <div className="flex justify-between py-0.5 text-rose-600 font-bold">
                          <span>Sisa Piutang:</span>
                          <span className="font-mono">
                            {formatRupiah(invoice.grand_total - invoice.paid_amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Signatures Box */}
              <div>
                <div
                  className={`doc-signatures grid grid-cols-3 ${
                    isCompactMode ? 'gap-3 mt-2 pt-2' : 'gap-6 mt-4 pt-4'
                  } text-center text-xs border-t border-slate-200`}
                >
                  <div>
                    <p className="text-slate-500 font-medium text-[10px]">Penerima / Customer</p>
                    <div
                      className={`sig-space ${
                        isCompactMode ? 'h-9' : 'h-16'
                      } flex items-end justify-center`}
                    >
                      <div className="w-32 border-b border-dashed border-slate-400"></div>
                    </div>
                    <p className="text-[10px] text-slate-700 font-semibold mt-1">
                      ( {customer?.customer_name?.slice(0, 20) || '...........................'} )
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-[10px]">
                      {documentType === 'delivery_order' ? 'Sopir / Ekspedisi' : 'Bagian Gudang'}
                    </p>
                    <div
                      className={`sig-space ${
                        isCompactMode ? 'h-9' : 'h-16'
                      } flex items-end justify-center`}
                    >
                      <div className="w-32 border-b border-dashed border-slate-400"></div>
                    </div>
                    <p className="text-[10px] text-slate-700 font-semibold mt-1">
                      ( {deliveryOrder?.driver_name || '...........................'} )
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-[10px]">Hormat Kami,</p>
                    <div
                      className={`sig-space ${
                        isCompactMode ? 'h-9' : 'h-16'
                      } flex items-end justify-center`}
                    >
                      <div className="w-32 border-b border-dashed border-slate-400"></div>
                    </div>
                    <p className="text-[10px] text-slate-700 font-semibold mt-1">
                      ( {company.account_name || company.company_name} )
                    </p>
                  </div>
                </div>

                <div className="text-center text-[9px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
                  Dokumen ini sah dan dicetak melalui Sistem DocuFlow Pro • {company.company_name}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* DOT MATRIX FORMAT (210 x 80 mm LANDSCAPE - EPSON LX-300+ / LQ-310)         */
            /* ========================================================================= */
            <div ref={printContentRef} className="flex flex-col gap-6 items-center">
              {dotMatrixPages.map((pageItems, pageIdx) => {
                const isLastPage = pageIdx === dotMatrixPages.length - 1;
                const pageNumber = pageIdx + 1;
                const totalPages = dotMatrixPages.length;
                const startIndex = pageIdx * dotMatrixItemsPerPage;

                return (
                  <div key={pageIdx} className="relative shadow-2xl transition">
                    {/* Simulated Tractor Feed Perforated Edges on both sides */}
                    <div className="absolute -left-3 top-0 bottom-0 w-3 tractor-feed-edge opacity-60 pointer-events-none" />
                    <div className="absolute -right-3 top-0 bottom-0 w-3 tractor-feed-edge opacity-60 pointer-events-none" />

                    <div
                      className={`dotmatrix-page dotmatrix-print-page ${copyColorsTheme[copyColor].bg} border ${copyColorsTheme[copyColor].border} text-slate-900 w-[210mm] h-[80mm] max-h-[80mm] p-2 font-dotmatrix text-[9.5px] leading-tight flex flex-col justify-between overflow-hidden select-text`}
                      style={{
                        fontFamily: FONT_OPTIONS_CONFIG[selectedFont].cssFamily,
                        letterSpacing: FONT_OPTIONS_CONFIG[selectedFont].letterSpacing,
                        lineHeight: FONT_OPTIONS_CONFIG[selectedFont].lineHeight,
                      }}
                    >
                      {/* Header Dot Matrix */}
                      <div>
                        <div className="flex justify-between items-start border-b border-dashed border-slate-700 pb-0.5">
                          <div>
                            <div className="font-bold text-xs uppercase tracking-tight">
                              {company.company_name}
                            </div>
                            <div className="text-[8.5px] text-slate-700">
                              {company.address.slice(0, 42)}, {company.city} • Telp: {company.phone}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-xs uppercase flex items-center justify-end gap-2">
                              <span>{documentType === 'invoice' ? 'FAKTUR PENJUALAN' : 'SURAT JALAN'}</span>
                              <span className="text-[8.5px] px-1 py-0.2 bg-slate-900 text-white font-mono rounded-xs">
                                Hal {pageNumber}/{totalPages}
                              </span>
                            </div>
                            <div className="font-bold text-[9.5px] font-mono">
                              NO: {documentNumber}
                            </div>
                          </div>
                        </div>

                        {/* Customer & Info Row */}
                        <div className="flex justify-between items-center py-0.5 text-[8.5px] border-b border-dashed border-slate-600">
                          <div>
                            <span className="font-bold">KEPADA: </span>
                            <span className="font-bold">{customer?.customer_name?.slice(0, 30)}</span>
                            <span className="ml-1.5 text-slate-700">
                              ({deliveryOrder?.delivery_address?.slice(0, 30) || customer?.city || '-'})
                            </span>
                          </div>
                          <div className="text-right font-mono">
                            <span>TGL: </span>
                            <span className="font-bold">
                              {formatDateIndo(
                                invoice?.invoice_date || deliveryOrder?.delivery_date || '2026-09-17'
                              )}
                            </span>
                            {deliveryOrder?.vehicle_number && (
                              <span className="ml-2 font-bold">ARMADA: {deliveryOrder.vehicle_number}</span>
                            )}
                          </div>
                        </div>

                        {/* Compact Table */}
                        <div className="mt-0.5">
                          <div className="flex border-b border-slate-800 font-bold text-[8.5px] pb-0.5">
                            <div className="w-6 text-center">NO</div>
                            <div className="flex-1">NAMA BARANG</div>
                            <div className="w-12 text-center">QTY</div>
                            <div className="w-10 text-center">SAT</div>
                            {documentType === 'invoice' && (
                              <>
                                <div className="w-20 text-right">HARGA</div>
                                <div className="w-24 text-right">JUMLAH (RP)</div>
                              </>
                            )}
                            {documentType === 'delivery_order' && (
                              <div className="w-36 text-left">KETERANGAN</div>
                            )}
                          </div>

                          {/* Table Body (Dense Monospace) */}
                          <div className="divide-y divide-dashed divide-slate-300">
                            {pageItems.map((it: any, itemIdx: number) => {
                              const globalNo = startIndex + itemIdx + 1;
                              return (
                                <div key={it.id || itemIdx} className="flex py-0.5 text-[8.5px] leading-tight">
                                  <div className="w-6 text-center font-mono">{globalNo}</div>
                                  <div className="flex-1 truncate font-semibold">
                                    {it.description?.slice(0, 38)}
                                  </div>
                                  <div className="w-12 text-center font-bold font-mono">
                                    {formatNumber(it.quantity)}
                                  </div>
                                  <div className="w-10 text-center">{it.unit}</div>
                                  {documentType === 'invoice' && (
                                    <>
                                      <div className="w-20 text-right font-mono">{formatNumber(it.price)}</div>
                                      <div className="w-24 text-right font-mono font-bold">
                                        {formatNumber(it.subtotal)}
                                      </div>
                                    </>
                                  )}
                                  {documentType === 'delivery_order' && (
                                    <div className="w-36 truncate text-slate-700">
                                      {it.notes || 'Baik & Lengkap'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Footer Area: Dynamic between intermediate pages and final page */}
                      {!isLastPage ? (
                        /* Halaman Sebelum Terakhir: Keterangan Bersambung & Area Tanda Tangan dikosongkan */
                        <div className="border-t border-dashed border-slate-700 pt-1 flex flex-col justify-between">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-800 bg-slate-900/5 px-2 py-1 rounded-xs border border-dashed border-slate-400">
                            <span className="italic flex items-center gap-1 text-slate-900 font-extrabold">
                              <span>&gt;&gt;&gt;</span> BERSAMBUNG KE HALAMAN {pageNumber + 1}...
                            </span>
                            <span className="text-[8px] font-mono text-slate-600">
                              (Subtotal, Terbilang & Tanda Tangan di Halaman Terakhir)
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[7.5px] text-slate-500 pt-1 mt-1 border-t border-dotted border-slate-300">
                            <span>* Continuous Form 210×80 mm • Lembar {pageNumber} dari {totalPages}</span>
                            <span className="font-mono italic">-- Kertas belum berakhir --</span>
                            <span className="font-bold uppercase tracking-wider text-slate-700">
                              {copyColorsTheme[copyColor].stamp}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Halaman Terakhir: Terbilang, Total, dan Kolom Tanda Tangan Lengkap */
                        <div>
                          <div className="border-t border-dashed border-slate-700 pt-0.5 flex justify-between items-center text-[8.5px]">
                            <div className="max-w-[125mm] truncate">
                              {documentType === 'invoice' && invoice ? (
                                <span>
                                  <span className="font-bold">Terbilang: </span>
                                  <span className="italic">{terbilang(invoice.grand_total).slice(0, 52)}...</span>
                                </span>
                              ) : (
                                <span>
                                  <span className="font-bold">Sopir: </span>
                                  <span>{deliveryOrder?.driver_name || '-'}</span>
                                  <span className="ml-2 font-bold">Penerima: </span>
                                  <span>{deliveryOrder?.receiver_name || '-'}</span>
                                </span>
                              )}
                            </div>

                            {documentType === 'invoice' && invoice && (
                              <div className="font-bold text-[9.5px] font-mono">
                                TOTAL: {formatRupiah(invoice.grand_total)}
                              </div>
                            )}
                          </div>

                          {/* 3 Signatures Columns */}
                          <div className="grid grid-cols-3 text-center text-[8px] pt-1 mt-0.5 border-t border-dotted border-slate-400">
                            <div>
                              Penerima Barang,
                              <div className="h-5"></div>
                              ( ........................ )
                            </div>
                            <div>
                              Driver / Ekspedisi,
                              <div className="h-5"></div>
                              ( ........................ )
                            </div>
                            <div>
                              Hormat Kami,
                              <div className="h-5"></div>
                              ( {company.company_name.slice(0, 18)} )
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[7.5px] text-slate-500 pt-0.5">
                            <span>* Lembar Putih: Asli | Merah: Arsip Gudang | Kuning: Penagihan</span>
                            <span className="font-bold uppercase tracking-wider text-slate-700">
                              {copyColorsTheme[copyColor].stamp}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Perforation guide line between continuous pages */}
                    {!isLastPage && (
                      <div className="my-2 text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-2 print:hidden">
                        <span className="border-b border-dashed border-slate-300 flex-1"></span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[9px] font-sans">
                          ✂ Batas Sobekan Kertas (Perforation Continuous Form 80 mm)
                        </span>
                        <span className="border-b border-dashed border-slate-300 flex-1"></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
