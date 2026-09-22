import {
  Company,
  User,
  Role,
  Permission,
  Customer,
  Product,
  Invoice,
  DeliveryOrder,
  Payment,
  DocumentTemplate,
  PrinterProfile,
  NumberingRule,
  CustomField,
  TaxConfig,
  UnitConfig,
  CategoryConfig,
  PaymentMethodConfig,
  FeatureToggle,
  AuditLog,
} from '../types';

const STORAGE_KEYS = {
  COMPANIES: 'inv_do_companies',
  USERS: 'inv_do_users',
  CURRENT_USER_ID: 'inv_do_current_user_id',
  ACTIVE_COMPANY_ID: 'inv_do_active_company_id',
  AUTH_SESSION: 'inv_do_auth_session',
  ROLES: 'inv_do_roles',
  PERMISSIONS: 'inv_do_permissions',
  CUSTOMERS: 'inv_do_customers',
  PRODUCTS: 'inv_do_products',
  INVOICES: 'inv_do_invoices',
  DELIVERY_ORDERS: 'inv_do_delivery_orders',
  PAYMENTS: 'inv_do_payments',
  TEMPLATES: 'inv_do_templates',
  PRINTERS: 'inv_do_printers',
  NUMBERING_RULES: 'inv_do_numbering_rules',
  CUSTOM_FIELDS: 'inv_do_custom_fields',
  TAX_CONFIGS: 'inv_do_tax_configs',
  UNITS: 'inv_do_units',
  CATEGORIES: 'inv_do_categories',
  PAYMENT_METHODS: 'inv_do_payment_methods',
  FEATURE_TOGGLES: 'inv_do_feature_toggles',
  AUDIT_LOGS: 'inv_do_audit_logs',
};

// Seed Data
const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    company_code: 'SUGIH',
    company_name: 'SPPG Sugih Babakan Karet',
    address: 'Jl. Raya Babakan Karet No. 45, Karangtengah',
    city: 'Cianjur',
    phone: '0263-228910',
    email: 'kontak@sppg-sugih.id',
    website: 'https://sppg-sugih.id',
    NIB: '9120003456789',
    bank_name: 'Bank Rakyat Indonesia (BRI)',
    bank_account: '0123-01-001234-53-8',
    account_name: 'SPPG Sugih Babakan Karet',
    invoice_prefix: 'SUGIH/INV',
    delivery_order_prefix: 'SUGIH/SJ',
    status: 'active',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'comp-2',
    company_code: 'BDP',
    company_name: 'PT Berkah Distribusi Pangan',
    address: 'Kawasan Pergudangan Pluit Blok C No. 12',
    city: 'Jakarta Utara',
    phone: '021-6691234',
    email: 'info@berkahdistribusi.co.id',
    website: 'https://berkahdistribusi.co.id',
    NIB: '8120009876543',
    bank_name: 'Bank Mandiri',
    bank_account: '120-00-1122334-5',
    account_name: 'PT Berkah Distribusi Pangan',
    invoice_prefix: 'BDP/INV',
    delivery_order_prefix: 'BDP/SJ',
    status: 'active',
    created_at: '2026-02-15T09:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'comp-3',
    company_code: 'AFN',
    company_name: 'CV Agro Fresh Nusantara',
    address: 'Jl. Raya Lembang No. 188, Cisarua',
    city: 'Bandung Barat',
    phone: '022-2785566',
    email: 'sales@agrofresh.id',
    website: 'https://agrofresh.id',
    NIB: '7120001122334',
    bank_name: 'Bank Central Asia (BCA)',
    bank_account: '8100-889977',
    account_name: 'CV Agro Fresh Nusantara',
    invoice_prefix: 'AFN/INV',
    delivery_order_prefix: 'AFN/SJ',
    status: 'active',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
];

const INITIAL_PERMISSIONS: Permission[] = [
  // Invoice permissions
  { id: 'p-1', code: 'invoice.view', name: 'Lihat Invoice', module: 'invoice', description: 'Melihat daftar dan rincian invoice' },
  { id: 'p-2', code: 'invoice.create', name: 'Buat Invoice', module: 'invoice', description: 'Membuat invoice baru' },
  { id: 'p-3', code: 'invoice.edit', name: 'Ubah Invoice', module: 'invoice', description: 'Mengubah invoice draft atau pending' },
  { id: 'p-4', code: 'invoice.delete', name: 'Hapus Invoice', module: 'invoice', description: 'Menghapus data invoice' },
  { id: 'p-5', code: 'invoice.approve', name: 'Approve / Reject Invoice', module: 'invoice', description: 'Menyetujui atau menolak invoice' },
  { id: 'p-6', code: 'invoice.print', name: 'Cetak Dokumen Invoice', module: 'invoice', description: 'Mencetak invoice A4 & dot matrix' },
  { id: 'p-7', code: 'invoice.export', name: 'Export PDF & Excel', module: 'invoice', description: 'Mengunduh file PDF atau Excel' },
  
  // Delivery order permissions
  { id: 'p-8', code: 'delivery_order.view', name: 'Lihat Surat Jalan', module: 'delivery_order', description: 'Melihat daftar surat jalan' },
  { id: 'p-9', code: 'delivery_order.create', name: 'Buat Surat Jalan', module: 'delivery_order', description: 'Membuat surat jalan baru' },
  { id: 'p-10', code: 'delivery_order.edit', name: 'Ubah Surat Jalan', module: 'delivery_order', description: 'Mengubah data surat jalan' },
  { id: 'p-11', code: 'delivery_order.delete', name: 'Hapus Surat Jalan', module: 'delivery_order', description: 'Menghapus surat jalan' },
  { id: 'p-12', code: 'delivery_order.print', name: 'Cetak Surat Jalan', module: 'delivery_order', description: 'Mencetak surat jalan A4 & dot matrix' },
  
  // Customer & Product
  { id: 'p-13', code: 'customer.manage', name: 'Kelola Customer', module: 'customer', description: 'Tambah, ubah, dan hapus master customer' },
  { id: 'p-14', code: 'product.manage', name: 'Kelola Produk', module: 'product', description: 'Tambah, ubah, dan hapus master produk' },
  
  // Payment
  { id: 'p-15', code: 'payment.create', name: 'Input Pembayaran', module: 'payment', description: 'Mencatat penerimaan pembayaran invoice' },
  { id: 'p-16', code: 'payment.view', name: 'Lihat Pembayaran', module: 'payment', description: 'Melihat riwayat pembayaran' },
  
  // Reports
  { id: 'p-17', code: 'report.view', name: 'Lihat Laporan', module: 'report', description: 'Mengakses laporan penjualan & piutang' },
  
  // Settings & Configuration
  { id: 'p-18', code: 'settings.manage', name: 'Pusat Konfigurasi', module: 'settings', description: 'Mengatur role, printer, numbering, dll' },
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'role-superadmin',
    name: 'Super Admin',
    description: 'Akses penuh ke semua fitur dan konfigurasi multi-company',
    is_system: true,
    permission_codes: INITIAL_PERMISSIONS.map((p) => p.code),
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-finance',
    name: 'Finance / Keuangan',
    description: 'Mengelola tagihan, invoice, pembayaran, dan laporan',
    is_system: false,
    permission_codes: [
      'invoice.view',
      'invoice.create',
      'invoice.edit',
      'invoice.approve',
      'invoice.print',
      'invoice.export',
      'customer.manage',
      'payment.create',
      'payment.view',
      'report.view',
    ],
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-admingudang',
    name: 'Admin Gudang / Logistik',
    description: 'Mengelola pengiriman, surat jalan, dan cetak continuous dot matrix',
    is_system: false,
    permission_codes: [
      'delivery_order.view',
      'delivery_order.create',
      'delivery_order.edit',
      'delivery_order.print',
      'invoice.view',
      'invoice.print',
      'product.manage',
    ],
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-sales',
    name: 'Sales / Kasir',
    description: 'Membuat pesanan dan membuat draft invoice untuk customer',
    is_system: false,
    permission_codes: [
      'invoice.view',
      'invoice.create',
      'invoice.print',
      'customer.manage',
      'delivery_order.view',
    ],
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-driver',
    name: 'Driver / Kurir',
    description: 'Melihat dan mencetak Surat Jalan untuk pengiriman barang',
    is_system: false,
    permission_codes: ['delivery_order.view', 'delivery_order.print'],
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Fajar Nurdiansyah',
    email: 'm.fajarnurdiansyah@gmail.com',
    phone: '0812-3456-7890',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    password: 'admin123',
    role_id: 'role-superadmin',
    role_name: 'Super Admin',
    company_ids: ['comp-1', 'comp-2', 'comp-3'],
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    last_login: '2026-09-17T08:50:00Z',
  },
  {
    id: 'user-2',
    name: 'Siti Rahmawati (Finance)',
    email: 'finance@sppg-sugih.id',
    phone: '0857-1122-3344',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    password: 'password123',
    role_id: 'role-finance',
    role_name: 'Finance / Keuangan',
    company_ids: ['comp-1'],
    status: 'active',
    created_at: '2026-02-01T00:00:00Z',
    last_login: '2026-09-17T07:30:00Z',
  },
  {
    id: 'user-3',
    name: 'Budi Santoso (Logistik & Gudang)',
    email: 'gudang@sppg-sugih.id',
    phone: '0813-9988-7766',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    password: 'password123',
    role_id: 'role-admingudang',
    role_name: 'Admin Gudang / Logistik',
    company_ids: ['comp-1', 'comp-2'],
    status: 'active',
    created_at: '2026-02-10T00:00:00Z',
    last_login: '2026-09-16T14:20:00Z',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    company_id: 'comp-1',
    customer_code: 'CUST-001',
    customer_name: 'Koperasi Mitra Tani Sejahtera',
    phone: '0263-261234',
    email: 'mitratani@koperasi.id',
    address: 'Jl. Pasirhayam No. 88, Cilaku',
    city: 'Cianjur',
    credit_limit: 50000000,
    payment_term: 14,
    notes: 'Prioritas pengiriman pagi sebelum jam 09.00',
    status: 'active',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'cust-2',
    company_id: 'comp-1',
    customer_code: 'CUST-002',
    customer_name: 'Supermarket Mega Fresh Cianjur',
    phone: '0263-224488',
    email: 'procurement@megafresh.co.id',
    address: 'Jl. Dr. Muwardi (By Pass) No. 102',
    city: 'Cianjur',
    credit_limit: 100000000,
    payment_term: 30,
    notes: 'Wajib lampirkan 3 lembar Surat Jalan cap toko',
    status: 'active',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'cust-3',
    company_id: 'comp-1',
    customer_code: 'CUST-003',
    customer_name: 'Rumah Makan Sunda Sawargi',
    phone: '0812-9988-1122',
    email: 'sawargi.resto@gmail.com',
    address: 'Jl. Raya Sukabumi KM 5, Gekbrong',
    city: 'Cianjur',
    credit_limit: 15000000,
    payment_term: 7,
    notes: 'Pengiriman sayuran segar setiap hari Selasa & Jumat',
    status: 'active',
    created_at: '2026-02-05T11:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'cust-4',
    company_id: 'comp-2',
    customer_code: 'CUST-004',
    customer_name: 'PT Ritel Jaya Makmur',
    phone: '021-5544332',
    email: 'purchasing@riteljaya.co.id',
    address: 'Komp. Ruko Daan Mogot Permai No. 18',
    city: 'Jakarta Barat',
    credit_limit: 75000000,
    payment_term: 21,
    status: 'active',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    company_id: 'comp-1',
    product_code: 'SAYUR-001',
    product_name: 'Wortel Brastagi Segar Super',
    category: 'Sayuran',
    unit: 'KG',
    purchase_price: 11000,
    selling_price: 15500,
    taxable: false,
    tax_rate: 0,
    stock: 450,
    active: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'prod-2',
    company_id: 'comp-1',
    product_code: 'SAYUR-002',
    product_name: 'Kentang Granola Dieng Grade A',
    category: 'Sayuran',
    unit: 'KG',
    purchase_price: 14000,
    selling_price: 18500,
    taxable: false,
    tax_rate: 0,
    stock: 600,
    active: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'prod-3',
    company_id: 'comp-1',
    product_code: 'BUAH-001',
    product_name: 'Alpukat Mentega Cianjur Super',
    category: 'Buah-Buahan',
    unit: 'KG',
    purchase_price: 24000,
    selling_price: 32000,
    taxable: false,
    tax_rate: 0,
    stock: 220,
    active: true,
    created_at: '2026-01-12T08:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'prod-4',
    company_id: 'comp-1',
    product_code: 'BUAH-002',
    product_name: 'Jeruk Sunkist Navel Manis',
    category: 'Buah-Buahan',
    unit: 'DUS',
    purchase_price: 260000,
    selling_price: 325000,
    taxable: true,
    tax_rate: 11,
    stock: 45,
    active: true,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
  {
    id: 'prod-5',
    company_id: 'comp-1',
    product_code: 'KEMAS-001',
    product_name: 'Keranjang Plastik Panen Buah 50L',
    category: 'Kemasan & Sarana',
    unit: 'PCS',
    purchase_price: 45000,
    selling_price: 65000,
    taxable: true,
    tax_rate: 11,
    stock: 120,
    active: true,
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-09-17T08:00:00Z',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'SUGIH/INV/2026/09/0001',
    company_id: 'comp-1',
    customer_id: 'cust-2',
    invoice_date: '2026-09-15',
    due_date: '2026-10-15',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        product_code: 'SAYUR-001',
        description: 'Wortel Brastagi Segar Super (Karung 50kg)',
        quantity: 150,
        unit: 'KG',
        price: 15500,
        discount: 0,
        discount_type: 'nominal',
        tax_rate: 0,
        subtotal: 2325000,
        notes: 'Pilihan kualitas ekspor',
      },
      {
        id: 'item-2',
        product_id: 'prod-2',
        product_code: 'SAYUR-002',
        description: 'Kentang Granola Dieng Grade A',
        quantity: 200,
        unit: 'KG',
        price: 18500,
        discount: 5,
        discount_type: 'percent',
        tax_rate: 0,
        subtotal: 3515000,
        notes: 'Ukuran seragam 8-10 pcs/kg',
      },
      {
        id: 'item-3',
        product_id: 'prod-4',
        product_code: 'BUAH-002',
        description: 'Jeruk Sunkist Navel Manis (15kg/dus)',
        quantity: 10,
        unit: 'DUS',
        price: 325000,
        discount: 0,
        discount_type: 'nominal',
        tax_rate: 11,
        subtotal: 3250000,
      },
    ],
    subtotal: 9090000,
    discount: 0,
    discount_type: 'nominal',
    discount_amount: 0,
    dpp: 9090000,
    tax_rate: 11,
    tax_amount: 357500, // calculated from taxable item
    grand_total: 9447500,
    paid_amount: 5000000,
    status: 'PARTIAL_PAID',
    notes: 'Terima kasih atas kerjasama Anda. Barang yang sudah dibeli telah dicek sesuai standar.',
    terms: 'Pembayaran transfer hanya sah jika ditujukan ke rekening resmi BRI an SPPG Sugih Babakan Karet.',
    template_id: 'tmpl-a4-formal',
    warehouse_officer_name: 'Budi Santoso',
    signer_name: 'H. Asep Sugiharto',
    custom_fields: {
      po_number: 'PO-MF-2026/09/88',
      kendaraan: 'F 8892 WY',
    },
    created_by: 'user-1',
    created_at: '2026-09-15T09:30:00Z',
    updated_at: '2026-09-16T11:00:00Z',
    approved_by: 'user-1',
    approved_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'inv-2',
    invoice_number: 'SUGIH/INV/2026/09/0002',
    company_id: 'comp-1',
    customer_id: 'cust-1',
    invoice_date: '2026-09-16',
    due_date: '2026-09-30',
    items: [
      {
        id: 'item-4',
        product_id: 'prod-3',
        product_code: 'BUAH-001',
        description: 'Alpukat Mentega Cianjur Super',
        quantity: 100,
        unit: 'KG',
        price: 32000,
        discount: 0,
        discount_type: 'nominal',
        tax_rate: 0,
        subtotal: 3200000,
      },
    ],
    subtotal: 3200000,
    discount: 50000,
    discount_type: 'nominal',
    discount_amount: 50000,
    dpp: 3150000,
    tax_rate: 0,
    tax_amount: 0,
    grand_total: 3150000,
    paid_amount: 3150000,
    status: 'PAID',
    notes: 'Lunas via transfer BCA.',
    template_id: 'tmpl-dotmatrix-formal',
    created_by: 'user-1',
    created_at: '2026-09-16T08:15:00Z',
    updated_at: '2026-09-16T16:00:00Z',
  },
  {
    id: 'inv-3',
    invoice_number: 'SUGIH/INV/2026/09/0003',
    company_id: 'comp-1',
    customer_id: 'cust-3',
    invoice_date: '2026-09-17',
    due_date: '2026-09-24',
    items: [
      {
        id: 'item-5',
        product_id: 'prod-1',
        product_code: 'SAYUR-001',
        description: 'Wortel Brastagi Segar Super',
        quantity: 50,
        unit: 'KG',
        price: 15500,
        discount: 0,
        discount_type: 'nominal',
        tax_rate: 0,
        subtotal: 775000,
      },
      {
        id: 'item-6',
        product_id: 'prod-2',
        product_code: 'SAYUR-002',
        description: 'Kentang Granola Dieng Grade A',
        quantity: 60,
        unit: 'KG',
        price: 18500,
        discount: 0,
        discount_type: 'nominal',
        tax_rate: 0,
        subtotal: 1110000,
      },
    ],
    subtotal: 1885000,
    discount: 0,
    discount_type: 'nominal',
    discount_amount: 0,
    dpp: 1885000,
    tax_rate: 0,
    tax_amount: 0,
    grand_total: 1885000,
    paid_amount: 0,
    status: 'SENT',
    notes: 'Pengiriman pesanan rutin mingguan.',
    template_id: 'tmpl-a4-formal',
    created_by: 'user-2',
    created_at: '2026-09-17T07:45:00Z',
    updated_at: '2026-09-17T07:45:00Z',
  },
];

const INITIAL_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: 'do-1',
    do_number: 'SUGIH/SJ/2026/09/0001',
    company_id: 'comp-1',
    invoice_id: 'inv-1',
    invoice_number: 'SUGIH/INV/2026/09/0001',
    customer_id: 'cust-2',
    delivery_date: '2026-09-15',
    delivery_address: 'Jl. Dr. Muwardi (By Pass) No. 102, Cianjur',
    driver_name: 'Asep Saepuloh',
    vehicle_number: 'F 8892 WY (Truk Engkel)',
    receiver_name: 'Hendra Setiawan (Kepala Gudang)',
    receiver_phone: '0812-7788-9900',
    items: [
      {
        id: 'doi-1',
        product_id: 'prod-1',
        product_code: 'SAYUR-001',
        description: 'Wortel Brastagi Segar Super (Karung 50kg)',
        quantity: 150,
        unit: 'KG',
        notes: 'Segel karung utuh no. 410-412',
      },
      {
        id: 'doi-2',
        product_id: 'prod-2',
        product_code: 'SAYUR-002',
        description: 'Kentang Granola Dieng Grade A',
        quantity: 200,
        unit: 'KG',
        notes: '4 karung @ 50kg',
      },
      {
        id: 'doi-3',
        product_id: 'prod-4',
        product_code: 'BUAH-002',
        description: 'Jeruk Sunkist Navel Manis (15kg/dus)',
        quantity: 10,
        unit: 'DUS',
        notes: 'Kondisi dus rapi tidak penyok',
      },
    ],
    notes: 'Harap periksa kondisi fisik dan timbang kembali saat penerimaan.',
    warehouse_officer_name: 'Budi Santoso',
    status: 'DELIVERED',
    template_id: 'tmpl-do-dotmatrix',
    created_by: 'user-3',
    created_at: '2026-09-15T08:30:00Z',
    updated_at: '2026-09-15T14:10:00Z',
  },
  {
    id: 'do-2',
    do_number: 'SUGIH/SJ/2026/09/0002',
    company_id: 'comp-1',
    invoice_id: 'inv-3',
    invoice_number: 'SUGIH/INV/2026/09/0003',
    customer_id: 'cust-3',
    delivery_date: '2026-09-17',
    delivery_address: 'Jl. Raya Sukabumi KM 5, Gekbrong, Cianjur',
    driver_name: 'Dadan Supriatna',
    vehicle_number: 'D 8123 AB (Pick Up L300)',
    receiver_name: 'Kang Dudung (Chef RM Sawargi)',
    receiver_phone: '0852-1133-5577',
    items: [
      {
        id: 'doi-4',
        product_id: 'prod-1',
        product_code: 'SAYUR-001',
        description: 'Wortel Brastagi Segar Super',
        quantity: 50,
        unit: 'KG',
        notes: 'Pilihan basah/segar baru panen',
      },
      {
        id: 'doi-5',
        product_id: 'prod-2',
        product_code: 'SAYUR-002',
        description: 'Kentang Granola Dieng Grade A',
        quantity: 60,
        unit: 'KG',
      },
    ],
    notes: 'Barang sedang dalam perjalanan menuju lokasi restoran.',
    status: 'ON_DELIVERY',
    template_id: 'tmpl-do-a4',
    created_by: 'user-3',
    created_at: '2026-09-17T08:15:00Z',
    updated_at: '2026-09-17T08:20:00Z',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    invoice_id: 'inv-1',
    invoice_number: 'SUGIH/INV/2026/09/0001',
    company_id: 'comp-1',
    customer_id: 'cust-2',
    payment_date: '2026-09-16',
    amount: 5000000,
    payment_method: 'Transfer Mandiri',
    reference_number: 'TRF-MDR-99281726',
    notes: 'Pembayaran termin 1 (DP)',
    created_by: 'user-2',
    created_at: '2026-09-16T11:00:00Z',
  },
  {
    id: 'pay-2',
    invoice_id: 'inv-2',
    invoice_number: 'SUGIH/INV/2026/09/0002',
    company_id: 'comp-1',
    customer_id: 'cust-1',
    payment_date: '2026-09-16',
    amount: 3150000,
    payment_method: 'Transfer BCA',
    reference_number: 'BCA-7711228833',
    notes: 'Pelunasan invoice penuh',
    created_by: 'user-1',
    created_at: '2026-09-16T16:00:00Z',
  },
];

const INITIAL_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tmpl-a4-formal',
    name: 'Invoice A4 Formal Klasik (210 × 297 mm)',
    document_type: 'invoice',
    paper_size: 'A4',
    orientation: 'portrait',
    style_theme: 'formal',
    version: 1,
    status: 'PUBLISHED',
    is_default: true,
    elements: [
      { id: 'el-1', element_type: 'header', label: 'Header Judul', visible: true, order: 1 },
      { id: 'el-2', element_type: 'logo', label: 'Logo Perusahaan', visible: true, order: 2 },
      { id: 'el-3', element_type: 'company_info', label: 'Info & Legalitas Perusahaan', visible: true, order: 3 },
      { id: 'el-4', element_type: 'customer_info', label: 'Data Customer / Tagihan Kepada', visible: true, order: 4 },
      { id: 'el-5', element_type: 'meta_info', label: 'Nomor, Tanggal & Jatuh Tempo', visible: true, order: 5 },
      { id: 'el-6', element_type: 'items_table', label: 'Tabel Rincian Barang / Jasa', visible: true, order: 6 },
      { id: 'el-7', element_type: 'totals', label: 'Subtotal, Diskon, Pajak & Grand Total', visible: true, order: 7 },
      { id: 'el-8', element_type: 'bank_info', label: 'Instruksi Pembayaran Rekening Bank', visible: true, order: 8 },
      { id: 'el-9', element_type: 'notes', label: 'Catatan & Syarat Ketentuan', visible: true, order: 9 },
      { id: 'el-10', element_type: 'signatures', label: 'Kotak Tanda Tangan & Pengesahan', visible: true, order: 10 },
      { id: 'el-11', element_type: 'footer', label: 'Catatan Kaki', visible: true, order: 11 },
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-dotmatrix-formal',
    name: 'Invoice Dot Matrix Kertas Rangkap (210 × 80 mm Landscape)',
    document_type: 'invoice',
    paper_size: 'DOT_MATRIX_210X80',
    orientation: 'landscape',
    style_theme: 'carbon_copy',
    version: 1,
    status: 'PUBLISHED',
    is_default: false,
    elements: [
      { id: 'dm-1', element_type: 'company_info', label: 'Header Dot Matrix', visible: true, order: 1 },
      { id: 'dm-2', element_type: 'customer_info', label: 'Customer & No Dokumen', visible: true, order: 2 },
      { id: 'dm-3', element_type: 'items_table', label: 'Daftar Barang Monospace', visible: true, order: 3 },
      { id: 'dm-4', element_type: 'totals', label: 'Totalan & Terbilang', visible: true, order: 4 },
      { id: 'dm-5', element_type: 'signatures', label: 'Kolom Tanda Tangan Ringkas', visible: true, order: 5 },
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-do-a4',
    name: 'Surat Jalan A4 Standar (210 × 297 mm)',
    document_type: 'delivery_order',
    paper_size: 'A4',
    orientation: 'portrait',
    style_theme: 'distributor',
    version: 1,
    status: 'PUBLISHED',
    is_default: true,
    elements: [
      { id: 'do-el-1', element_type: 'header', label: 'Kop Surat Jalan', visible: true, order: 1 },
      { id: 'do-el-2', element_type: 'meta_info', label: 'Nomor SJ & Pengiriman', visible: true, order: 2 },
      { id: 'do-el-3', element_type: 'customer_info', label: 'Alamat & Penerima', visible: true, order: 3 },
      { id: 'do-el-4', element_type: 'items_table', label: 'Tabel Barang & Satuan', visible: true, order: 4 },
      { id: 'do-el-5', element_type: 'signatures', label: 'Tanda Tangan Pengirim, Sopir & Penerima', visible: true, order: 5 },
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-do-dotmatrix',
    name: 'Surat Jalan Dot Matrix (210 × 80 mm Landscape)',
    document_type: 'delivery_order',
    paper_size: 'DOT_MATRIX_210X80',
    orientation: 'landscape',
    style_theme: 'carbon_copy',
    version: 1,
    status: 'PUBLISHED',
    is_default: false,
    elements: [
      { id: 'do-dm-1', element_type: 'company_info', label: 'Header Monospace', visible: true, order: 1 },
      { id: 'do-dm-2', element_type: 'items_table', label: 'Tabel Pengiriman', visible: true, order: 2 },
      { id: 'do-dm-3', element_type: 'signatures', label: '3 Kolom Tanda Tangan', visible: true, order: 3 },
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_PRINTER_PROFILES: PrinterProfile[] = [
  {
    id: 'print-1',
    printer_name: 'Epson LX-300+ / LQ-310 (Kertas Wartel 210×80mm)',
    printer_model: 'Epson LX-300+ II / LQ-310 Dot Matrix',
    printer_type: 'dot_matrix',
    paper_width_mm: 210,
    paper_height_mm: 80,
    orientation: 'landscape',
    margin_top_mm: 2,
    margin_right_mm: 5,
    margin_bottom_mm: 2,
    margin_left_mm: 5,
    font_size_pt: 9,
    line_height: 1.2,
    copies: 3,
    is_default: true,
    active: true,
  },
  {
    id: 'print-2',
    printer_name: 'Epson LX-310 Continuous Form',
    printer_model: 'Epson LX-310 9-pin Impact',
    printer_type: 'dot_matrix',
    paper_width_mm: 210,
    paper_height_mm: 80,
    orientation: 'landscape',
    margin_top_mm: 3,
    margin_right_mm: 4,
    margin_bottom_mm: 3,
    margin_left_mm: 4,
    font_size_pt: 9.5,
    line_height: 1.25,
    copies: 2,
    is_default: false,
    active: true,
  },
  {
    id: 'print-3',
    printer_name: 'Kantor Pusat - Laser A4 (210×297mm)',
    printer_model: 'HP LaserJet Pro MFP / Canon Laser',
    printer_type: 'laser',
    paper_width_mm: 210,
    paper_height_mm: 297,
    orientation: 'portrait',
    margin_top_mm: 12,
    margin_right_mm: 15,
    margin_bottom_mm: 12,
    margin_left_mm: 15,
    font_size_pt: 10,
    line_height: 1.4,
    copies: 1,
    is_default: false,
    active: true,
  },
];

const INITIAL_NUMBERING_RULES: NumberingRule[] = [
  {
    id: 'nr-1',
    document_type: 'invoice',
    pattern: '{PREFIX}/{YEAR}/{MONTH}/{SEQUENCE}',
    prefix: 'INV',
    current_sequence: 3,
    sequence_length: 4,
    reset_cycle: 'yearly',
  },
  {
    id: 'nr-2',
    document_type: 'delivery_order',
    pattern: '{PREFIX}/{YEAR}/{MONTH}/{SEQUENCE}',
    prefix: 'SJ',
    current_sequence: 2,
    sequence_length: 4,
    reset_cycle: 'yearly',
  },
];

const INITIAL_CUSTOM_FIELDS: CustomField[] = [
  {
    id: 'cf-1',
    module: 'invoice',
    field_key: 'po_number',
    field_label: 'Nomor Purchase Order (PO)',
    field_type: 'text',
    required: false,
    show_in_print: true,
  },
  {
    id: 'cf-2',
    module: 'invoice',
    field_key: 'kendaraan',
    field_label: 'No. Polisi Kendaraan',
    field_type: 'text',
    required: false,
    show_in_print: true,
  },
  {
    id: 'cf-3',
    module: 'delivery_order',
    field_key: 'nama_pic',
    field_label: 'Nama PIC Lapangan',
    field_type: 'text',
    required: false,
    show_in_print: true,
  },
];

const INITIAL_TAX_CONFIGS: TaxConfig[] = [
  { id: 'tax-1', name: 'PPN 11%', code: 'PPN11', rate: 11, calculation_type: 'exclude', is_default: true, active: true },
  { id: 'tax-2', name: 'PPN 12%', code: 'PPN12', rate: 12, calculation_type: 'exclude', is_default: false, active: true },
  { id: 'tax-3', name: 'Non PPN / Bebas Pajak', code: 'NON_PPN', rate: 0, calculation_type: 'exclude', is_default: false, active: true },
];

const INITIAL_UNITS: UnitConfig[] = [
  { id: 'u-1', code: 'KG', name: 'Kilogram (KG)', active: true },
  { id: 'u-2', code: 'DUS', name: 'Dus / Karton', active: true },
  { id: 'u-3', code: 'BOX', name: 'Box Plastik', active: true },
  { id: 'u-4', code: 'PCS', name: 'Pieces (PCS)', active: true },
  { id: 'u-5', code: 'IKAT', name: 'Ikat', active: true },
  { id: 'u-6', code: 'PACK', name: 'Pack', active: true },
  { id: 'u-7', code: 'LITER', name: 'Liter', active: true },
  { id: 'u-8', code: 'GRAM', name: 'Gram', active: true },
];

const INITIAL_CATEGORIES: CategoryConfig[] = [
  { id: 'cat-1', name: 'Sayuran', description: 'Sayuran segar hasil bumi', active: true },
  { id: 'cat-2', name: 'Buah-Buahan', description: 'Buah lokal dan impor', active: true },
  { id: 'cat-3', name: 'Sembako', description: 'Bahan pokok pangan', active: true },
  { id: 'cat-4', name: 'Kemasan & Sarana', description: 'Perlengkapan panen dan distribusi', active: true },
  { id: 'cat-5', name: 'Lainnya', description: 'Kategori umum', active: true },
];

const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'pm-1', name: 'Transfer Bank BRI', type: 'transfer', bank_details: '0123-01-001234-53-8 an SPPG Sugih Babakan Karet', active: true },
  { id: 'pm-2', name: 'Transfer Bank BCA', type: 'transfer', bank_details: '8100-889977 an CV Agro Fresh Nusantara', active: true },
  { id: 'pm-3', name: 'Transfer Bank Mandiri', type: 'transfer', bank_details: '120-00-1122334-5 an PT Berkah Distribusi Pangan', active: true },
  { id: 'pm-4', name: 'Tunai / Cash on Delivery (COD)', type: 'cash', active: true },
  { id: 'pm-5', name: 'QRIS Statis Toko', type: 'qris', active: true },
];

const INITIAL_FEATURE_TOGGLES: FeatureToggle[] = [
  { key: 'enable_invoice', label: 'Modul Invoice', description: 'Mengaktifkan pembuatan, perhitungan, dan cetak invoice', enabled: true },
  { key: 'enable_delivery_order', label: 'Modul Surat Jalan / Delivery Order', description: 'Mengaktifkan pembuatan surat jalan mandiri maupun dari invoice', enabled: true },
  { key: 'enable_payment', label: 'Modul Pembayaran & Piutang', description: 'Mencatat pelunasan bertahap dan memantau outstanding', enabled: true },
  { key: 'enable_reports', label: 'Laporan Penjualan & Buku Piutang', description: 'Menampilkan analitik penjualan dan customer statement', enabled: true },
  { key: 'enable_dot_matrix', label: 'Cetak Continuous Form Dot Matrix (210×80mm)', description: 'Mendukung cetak nota kecil / kertas tembus 3 rangkap Epson LX-300+', enabled: true },
  { key: 'enable_custom_fields', label: 'Custom Fields Dinamis', description: 'Menambahkan field PO, PIC, dan No Polisi pada dokumen', enabled: true },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user_name: 'Fajar Nurdiansyah',
    action: 'CREATE_INVOICE',
    module: 'invoice',
    record_id: 'SUGIH/INV/2026/09/0001',
    details: 'Membuat invoice untuk Supermarket Mega Fresh senilai Rp 9.447.500',
    timestamp: '2026-09-15T09:30:00Z',
  },
  {
    id: 'log-2',
    user_name: 'Budi Santoso',
    action: 'CREATE_DELIVERY_ORDER',
    module: 'delivery_order',
    record_id: 'SUGIH/SJ/2026/09/0001',
    details: 'Menerbitkan Surat Jalan berdasarkan Invoice SUGIH/INV/2026/09/0001',
    timestamp: '2026-09-15T08:30:00Z',
  },
  {
    id: 'log-3',
    user_name: 'Siti Rahmawati',
    action: 'RECORD_PAYMENT',
    module: 'payment',
    record_id: 'SUGIH/INV/2026/09/0001',
    details: 'Menerima pembayaran transfer Rp 5.000.000',
    timestamp: '2026-09-16T11:00:00Z',
  },
];

// Generic LocalStorage helper
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage key "${key}":`, e);
  }
}

export const StorageService = {
  // Companies
  getCompanies: (): Company[] => {
    const list = loadFromStorage(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    return list.map((c) => {
      const sanitized = { ...c };
      delete sanitized.logo;
      delete sanitized.NPWP;
      return sanitized as Company;
    });
  },
  saveCompanies: (data: Company[]) => saveToStorage(STORAGE_KEYS.COMPANIES, data),
  getActiveCompanyId: (): string => loadFromStorage(STORAGE_KEYS.ACTIVE_COMPANY_ID, 'comp-1'),
  setActiveCompanyId: (id: string) => saveToStorage(STORAGE_KEYS.ACTIVE_COMPANY_ID, id),
  
  // Users & Auth
  getUsers: (): User[] => loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUsers: (data: User[]) => saveToStorage(STORAGE_KEYS.USERS, data),
  deleteUser: (id: string): User[] => {
    const existing = loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const updated = existing.filter((u) => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, updated);
    return updated;
  },
  getCurrentUserId: (): string => loadFromStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user-1'),
  setCurrentUserId: (id: string) => saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, id),
  getAuthSession: (): { userId: string; loginAt: string } | null => {
    return loadFromStorage<{ userId: string; loginAt: string } | null>(
      STORAGE_KEYS.AUTH_SESSION,
      null
    );
  },
  setAuthSession: (session: { userId: string; loginAt: string } | null) => {
    saveToStorage(STORAGE_KEYS.AUTH_SESSION, session);
  },
  clearAuthSession: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } catch {
      // ignore
    }
  },

  // Roles & Permissions
  getRoles: (): Role[] => loadFromStorage(STORAGE_KEYS.ROLES, INITIAL_ROLES),
  saveRoles: (data: Role[]) => saveToStorage(STORAGE_KEYS.ROLES, data),
  getActiveRoleId: (): string => loadFromStorage('app_active_role_id', 'role-superadmin'),
  setActiveRoleId: (id: string) => saveToStorage('app_active_role_id', id),
  getPermissions: (): Permission[] => loadFromStorage(STORAGE_KEYS.PERMISSIONS, INITIAL_PERMISSIONS),
  savePermissions: (data: Permission[]) => saveToStorage(STORAGE_KEYS.PERMISSIONS, data),

  // Customers
  getCustomers: (): Customer[] => {
    const list = loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return list.map((c) => {
      const sanitized = { ...c };
      delete sanitized.NPWP;
      return sanitized as Customer;
    });
  },
  saveCustomers: (data: Customer[]) => saveToStorage(STORAGE_KEYS.CUSTOMERS, data),

  // Products
  getProducts: (): Product[] => loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (data: Product[]) => saveToStorage(STORAGE_KEYS.PRODUCTS, data),

  // Invoices
  getInvoices: (): Invoice[] => loadFromStorage(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoices: (data: Invoice[]) => saveToStorage(STORAGE_KEYS.INVOICES, data),

  // Delivery Orders
  getDeliveryOrders: (): DeliveryOrder[] => loadFromStorage(STORAGE_KEYS.DELIVERY_ORDERS, INITIAL_DELIVERY_ORDERS),
  saveDeliveryOrders: (data: DeliveryOrder[]) => saveToStorage(STORAGE_KEYS.DELIVERY_ORDERS, data),

  // Payments
  getPayments: (): Payment[] => loadFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (data: Payment[]) => saveToStorage(STORAGE_KEYS.PAYMENTS, data),

  // Templates
  getTemplates: (): DocumentTemplate[] => loadFromStorage(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES),
  saveTemplates: (data: DocumentTemplate[]) => saveToStorage(STORAGE_KEYS.TEMPLATES, data),

  // Printers
  getPrinters: (): PrinterProfile[] => loadFromStorage(STORAGE_KEYS.PRINTERS, INITIAL_PRINTER_PROFILES),
  savePrinters: (data: PrinterProfile[]) => saveToStorage(STORAGE_KEYS.PRINTERS, data),

  // Numbering Rules
  getNumberingRules: (): NumberingRule[] => loadFromStorage(STORAGE_KEYS.NUMBERING_RULES, INITIAL_NUMBERING_RULES),
  saveNumberingRules: (data: NumberingRule[]) => saveToStorage(STORAGE_KEYS.NUMBERING_RULES, data),

  // Custom Fields
  getCustomFields: (): CustomField[] => loadFromStorage(STORAGE_KEYS.CUSTOM_FIELDS, INITIAL_CUSTOM_FIELDS),
  saveCustomFields: (data: CustomField[]) => saveToStorage(STORAGE_KEYS.CUSTOM_FIELDS, data),

  // Tax, Units, Categories, Payment Methods
  getTaxConfigs: (): TaxConfig[] => loadFromStorage(STORAGE_KEYS.TAX_CONFIGS, INITIAL_TAX_CONFIGS),
  saveTaxConfigs: (data: TaxConfig[]) => saveToStorage(STORAGE_KEYS.TAX_CONFIGS, data),

  getUnits: (): UnitConfig[] => loadFromStorage(STORAGE_KEYS.UNITS, INITIAL_UNITS),
  saveUnits: (data: UnitConfig[]) => saveToStorage(STORAGE_KEYS.UNITS, data),

  getCategories: (): CategoryConfig[] => loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  saveCategories: (data: CategoryConfig[]) => saveToStorage(STORAGE_KEYS.CATEGORIES, data),

  getPaymentMethods: (): PaymentMethodConfig[] => loadFromStorage(STORAGE_KEYS.PAYMENT_METHODS, INITIAL_PAYMENT_METHODS),
  savePaymentMethods: (data: PaymentMethodConfig[]) => saveToStorage(STORAGE_KEYS.PAYMENT_METHODS, data),

  getFeatureToggles: (): FeatureToggle[] => loadFromStorage(STORAGE_KEYS.FEATURE_TOGGLES, INITIAL_FEATURE_TOGGLES),
  saveFeatureToggles: (data: FeatureToggle[]) => saveToStorage(STORAGE_KEYS.FEATURE_TOGGLES, data),

  // Audit Logs
  getAuditLogs: (): AuditLog[] => loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs].slice(0, 100)); // keep last 100
  },

  // Export full snapshot
  exportFullSnapshot: () => {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      companies: StorageService.getCompanies(),
      users: StorageService.getUsers(),
      roles: StorageService.getRoles(),
      permissions: StorageService.getPermissions(),
      customers: StorageService.getCustomers(),
      products: StorageService.getProducts(),
      invoices: StorageService.getInvoices(),
      delivery_orders: StorageService.getDeliveryOrders(),
      payments: StorageService.getPayments(),
      templates: StorageService.getTemplates(),
      printers: StorageService.getPrinters(),
      numbering_rules: StorageService.getNumberingRules(),
      custom_fields: StorageService.getCustomFields(),
      tax_configs: StorageService.getTaxConfigs(),
      units: StorageService.getUnits(),
      categories: StorageService.getCategories(),
      payment_methods: StorageService.getPaymentMethods(),
      feature_toggles: StorageService.getFeatureToggles(),
    };
  },

  // Import snapshot
  importFullSnapshot: (snapshot: any) => {
    if (snapshot.companies) StorageService.saveCompanies(snapshot.companies);
    if (snapshot.users) StorageService.saveUsers(snapshot.users);
    if (snapshot.roles) StorageService.saveRoles(snapshot.roles);
    if (snapshot.permissions) StorageService.savePermissions(snapshot.permissions);
    if (snapshot.customers) StorageService.saveCustomers(snapshot.customers);
    if (snapshot.products) StorageService.saveProducts(snapshot.products);
    if (snapshot.invoices) StorageService.saveInvoices(snapshot.invoices);
    if (snapshot.delivery_orders) StorageService.saveDeliveryOrders(snapshot.delivery_orders);
    if (snapshot.payments) StorageService.savePayments(snapshot.payments);
    if (snapshot.templates) StorageService.saveTemplates(snapshot.templates);
    if (snapshot.printers) StorageService.savePrinters(snapshot.printers);
    if (snapshot.numbering_rules) StorageService.saveNumberingRules(snapshot.numbering_rules);
    if (snapshot.custom_fields) StorageService.saveCustomFields(snapshot.custom_fields);
    if (snapshot.tax_configs) StorageService.saveTaxConfigs(snapshot.tax_configs);
    if (snapshot.units) StorageService.saveUnits(snapshot.units);
    if (snapshot.categories) StorageService.saveCategories(snapshot.categories);
    if (snapshot.payment_methods) StorageService.savePaymentMethods(snapshot.payment_methods);
    if (snapshot.feature_toggles) StorageService.saveFeatureToggles(snapshot.feature_toggles);
  },

  // Reset to default
  resetToDefaults: () => {
    localStorage.clear();
  },
};
