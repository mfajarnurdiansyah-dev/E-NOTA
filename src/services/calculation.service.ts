/**
 * Arithmetic & Currency Calculation Service
 * Conforms to PRD Section 12 & 32
 * Uses exact decimal math, avoids floating point drift
 */

export function calculateItemSubtotal(
  quantity: number,
  price: number,
  discount: number = 0,
  discount_type: 'nominal' | 'percent' = 'nominal'
): number {
  const base = Math.round(quantity * price);
  if (discount <= 0) return base;
  
  let discAmount = 0;
  if (discount_type === 'percent') {
    discAmount = Math.round((base * discount) / 100);
  } else {
    discAmount = Math.round(discount);
  }
  return Math.max(0, base - discAmount);
}

export function calculateInvoiceTotals(
  items: Array<{
    quantity: number;
    price: number;
    discount?: number;
    discount_type?: 'nominal' | 'percent';
  }>,
  invoiceDiscount: number = 0,
  invoiceDiscountType: 'nominal' | 'percent' = 'nominal',
  taxRatePercent: number = 11
): {
  subtotal: number;
  discountAmount: number;
  dpp: number;
  taxAmount: number;
  grandTotal: number;
} {
  const subtotal = items.reduce((acc, item) => {
    const itemSubtotal = calculateItemSubtotal(
      item.quantity,
      item.price,
      item.discount || 0,
      item.discount_type || 'nominal'
    );
    return acc + itemSubtotal;
  }, 0);

  let discountAmount = 0;
  if (invoiceDiscount > 0) {
    if (invoiceDiscountType === 'percent') {
      discountAmount = Math.round((subtotal * invoiceDiscount) / 100);
    } else {
      discountAmount = Math.round(invoiceDiscount);
    }
  }

  const dpp = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxRatePercent > 0 ? Math.round((dpp * taxRatePercent) / 100) : 0;
  const grandTotal = dpp + taxAmount;

  return {
    subtotal,
    discountAmount,
    dpp,
    taxAmount,
    grandTotal,
  };
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Konversi angka ke kalimat terbilang Indonesia
 * e.g., 1250000 -> "Satu Juta Dua Ratus Lima Puluh Ribu Rupiah"
 */
export function terbilang(n: number): string {
  if (n <= 0) return 'Nol Rupiah';
  
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function toWords(num: number): string {
    if (num < 12) {
      return bilangan[num];
    } else if (num < 20) {
      return toWords(num - 10) + ' Belas';
    } else if (num < 100) {
      return toWords(Math.floor(num / 10)) + ' Puluh ' + toWords(num % 10);
    } else if (num < 200) {
      return 'Seratus ' + toWords(num - 100);
    } else if (num < 1000) {
      return toWords(Math.floor(num / 100)) + ' Ratus ' + toWords(num % 100);
    } else if (num < 2000) {
      return 'Seribu ' + toWords(num - 1000);
    } else if (num < 1000000) {
      return toWords(Math.floor(num / 1000)) + ' Ribu ' + toWords(num % 1000);
    } else if (num < 1000000000) {
      return toWords(Math.floor(num / 1000000)) + ' Juta ' + toWords(num % 1000000);
    } else if (num < 1000000000000) {
      return toWords(Math.floor(num / 1000000000)) + ' Miliar ' + toWords(num % 1000000000);
    }
    return '';
  }

  const result = toWords(Math.floor(n)).replace(/\s+/g, ' ').trim();
  return result + ' Rupiah';
}
