export type DocumentStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SENT'
  | 'PARTIAL_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type DeliveryStatus =
  | 'DRAFT'
  | 'READY'
  | 'ON_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export interface Company {
  id: string;
  company_code: string;
  company_name: string;
  logo?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  NPWP?: string;
  NIB: string;
  bank_name: string;
  bank_account: string;
  account_name: string;
  invoice_prefix: string;
  delivery_order_prefix: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  password?: string;
  role_id: string;
  role_name?: string;
  company_ids: string[];
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

export interface Permission {
  id: string;
  code: string; // e.g., 'invoice.create', 'delivery_order.print'
  name: string;
  module: 'invoice' | 'delivery_order' | 'customer' | 'product' | 'payment' | 'report' | 'settings';
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code?: string;
  description: string;
  is_system?: boolean;
  permission_codes: string[];
  permissions?: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  customer_code: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  NPWP?: string;
  credit_limit: number;
  payment_term: number; // in days
  notes?: string;
  status: 'active' | 'inactive';
  custom_fields?: Record<string, string | number>;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  product_code: string;
  product_name: string;
  category: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  taxable: boolean;
  tax_rate: number; // percentage, e.g. 11 for 11%
  description?: string;
  stock?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_code: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number; // amount or percentage
  discount_type: 'nominal' | 'percent';
  tax_rate: number;
  subtotal: number;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  company_id: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discount_type: 'nominal' | 'percent';
  discount_amount: number;
  dpp: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  status: DocumentStatus;
  notes?: string;
  terms?: string;
  template_id: string;
  custom_fields?: Record<string, string | number>;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface DeliveryOrderItem {
  id: string;
  product_id: string;
  product_code: string;
  description: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface DeliveryOrder {
  id: string;
  do_number: string;
  company_id: string;
  invoice_id?: string;
  invoice_number?: string;
  customer_id: string;
  delivery_date: string;
  delivery_address: string;
  driver_name: string;
  vehicle_number: string;
  receiver_name?: string;
  receiver_phone?: string;
  items: DeliveryOrderItem[];
  notes?: string;
  status: DeliveryStatus;
  template_id: string;
  custom_fields?: Record<string, string | number>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  invoice_number?: string;
  payment_number?: string;
  company_id: string;
  customer_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface TemplateElement {
  id: string;
  element_type: 
    | 'header'
    | 'logo'
    | 'company_info'
    | 'customer_info'
    | 'meta_info'
    | 'items_table'
    | 'totals'
    | 'bank_info'
    | 'notes'
    | 'signatures'
    | 'qr_code'
    | 'footer';
  label: string;
  visible: boolean;
  order: number;
  font_size?: 'sm' | 'base' | 'lg' | 'xs';
  align?: 'left' | 'center' | 'right';
  custom_text?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  document_type: 'invoice' | 'delivery_order';
  paper_size: 'A4' | 'DOT_MATRIX_210X80';
  orientation: 'portrait' | 'landscape';
  style_theme: 'formal' | 'modern' | 'distributor' | 'simple' | 'carbon_copy';
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  elements: TemplateElement[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrinterProfile {
  id: string;
  printer_name: string;
  printer_model: string;
  printer_type: 'dot_matrix' | 'laser' | 'thermal';
  paper_width_mm: number;
  paper_height_mm: number;
  orientation: 'portrait' | 'landscape';
  margin_top_mm: number;
  margin_right_mm: number;
  margin_bottom_mm: number;
  margin_left_mm: number;
  font_size_pt: number;
  line_height: number;
  copies: number;
  is_default: boolean;
  active: boolean;
}

export interface NumberingRule {
  id: string;
  name?: string;
  company_id?: string;
  document_type: 'invoice' | 'delivery_order';
  pattern: string; // e.g. "{PREFIX}/{YEAR}/{MONTH}/{SEQUENCE}"
  format_pattern?: string;
  prefix: string;
  current_sequence: number;
  current_number?: number;
  sequence_length: number; // e.g. 4 for 0001
  padding?: number;
  reset_cycle: 'yearly' | 'monthly' | 'never';
  reset_frequency?: 'YEARLY' | 'MONTHLY' | 'DAILY' | 'NEVER';
  separator?: string;
}

export interface CustomField {
  id: string;
  module: 'invoice' | 'delivery_order' | 'customer' | 'product' | 'payment';
  field_key: string;
  field_label: string;
  field_type: 'text' | 'number' | 'date' | 'select';
  options?: string[]; // for select type
  required: boolean;
  show_in_print: boolean;
}

export interface TaxConfig {
  id: string;
  name: string;
  code?: string;
  rate: number;
  calculation_type?: 'include' | 'exclude';
  is_default: boolean;
  active: boolean;
}

export interface UnitConfig {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'cash' | 'transfer' | 'qris' | 'other';
  bank_details?: string;
  active: boolean;
}

export interface FeatureToggle {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  module: string;
  record_id: string;
  details: string;
  timestamp: string;
}
