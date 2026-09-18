/**
 * SQL Migration & RLS Policy Generator
 * Generates Supabase/PostgreSQL schema conforming to PRD Section 50, 51, 52, 53
 */

export function generatePostgreSqlMigration(): string {
  return `-- ====================================================================
-- APLIKASI MANAJEMEN INVOICE & SURAT JALAN
-- FULLY CUSTOMIZABLE • CONFIGURATION-DRIVEN • MULTI-COMPANY
-- Supabase / PostgreSQL Schema & Row Level Security (RLS) Policies
-- Generated based on PRD Requirements
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Companies Table (PRD Section 7)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    logo TEXT,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(100),
    npwp VARCHAR(50),
    nib VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account VARCHAR(100),
    account_name VARCHAR(150),
    invoice_prefix VARCHAR(50) DEFAULT 'INV',
    delivery_order_prefix VARCHAR(50) DEFAULT 'SJ',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles & Users Table (PRD Section 4)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Roles & Permissions (PRD Section 5 & 6)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 5. Company Users Association (Multi-Company Membership & Access Control)
CREATE TABLE IF NOT EXISTS public.company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- 6. Master Customers (PRD Section 8)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_code VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    npwp VARCHAR(50),
    credit_limit NUMERIC(15,2) DEFAULT 0,
    payment_term INT DEFAULT 30,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, customer_code)
);

-- 7. Master Products (PRD Section 9)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'PCS',
    purchase_price NUMERIC(15,2) DEFAULT 0,
    selling_price NUMERIC(15,2) DEFAULT 0,
    taxable BOOLEAN DEFAULT TRUE,
    tax_rate NUMERIC(5,2) DEFAULT 11.00,
    description TEXT,
    stock NUMERIC(15,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, product_code)
);

-- 8. Document Templates & Versions (PRD Section 18, 22, 24)
CREATE TABLE IF NOT EXISTS public.document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'invoice' | 'delivery_order'
    paper_size VARCHAR(50) DEFAULT 'A4', -- 'A4' | 'DOT_MATRIX_210X80'
    orientation VARCHAR(20) DEFAULT 'portrait',
    style_theme VARCHAR(50) DEFAULT 'formal',
    version INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'PUBLISHED',
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Numbering Sequences (PRD Section 26)
CREATE TABLE IF NOT EXISTS public.numbering_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    pattern VARCHAR(255) NOT NULL,
    prefix VARCHAR(50),
    current_sequence BIGINT DEFAULT 0,
    sequence_length INT DEFAULT 4,
    reset_cycle VARCHAR(50) DEFAULT 'yearly',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Invoices & Invoice Items (PRD Section 10, 11, 12, 13)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount NUMERIC(15,2) DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'nominal',
    discount_amount NUMERIC(15,2) DEFAULT 0,
    dpp NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 11.00,
    tax_amount NUMERIC(15,2) DEFAULT 0,
    grand_total NUMERIC(15,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'DRAFT',
    notes TEXT,
    terms TEXT,
    template_id UUID REFERENCES public.document_templates(id),
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_code VARCHAR(50),
    description TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL DEFAULT 'PCS',
    price NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount NUMERIC(15,2) DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'nominal',
    tax_rate NUMERIC(5,2) DEFAULT 0,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes TEXT
);

-- 11. Delivery Orders / Surat Jalan (PRD Section 14, 15, 16, 17)
CREATE TABLE IF NOT EXISTS public.delivery_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    do_number VARCHAR(100) NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    driver_name VARCHAR(150),
    vehicle_number VARCHAR(50),
    receiver_name VARCHAR(150),
    receiver_phone VARCHAR(50),
    notes TEXT,
    status VARCHAR(30) DEFAULT 'DRAFT',
    template_id UUID REFERENCES public.document_templates(id),
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, do_number)
);

CREATE TABLE IF NOT EXISTS public.delivery_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_code VARCHAR(50),
    description TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL DEFAULT 'PCS',
    notes TEXT
);

-- 12. Payments (PRD Section 31, 32)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    payment_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs (PRD Section 37)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id VARCHAR(100),
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Indexes for Performance (PRD Section 51)
CREATE INDEX IF NOT EXISTS idx_invoices_company ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_company ON public.delivery_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_invoice ON public.delivery_orders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (PRD Section 52, 53)
-- Multi-Company Isolation: Company A cannot access Company B data
-- ====================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper function: User company membership check
CREATE OR REPLACE FUNCTION public.user_has_company_access(check_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.user_id = auth.uid()
          AND cu.company_id = check_company_id
          AND cu.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Invoices
CREATE POLICY "Users can only view invoices of their company"
    ON public.invoices FOR SELECT
    USING (public.user_has_company_access(company_id));

CREATE POLICY "Users can insert invoices for their company"
    ON public.invoices FOR INSERT
    WITH CHECK (public.user_has_company_access(company_id));

CREATE POLICY "Users can update invoices for their company"
    ON public.invoices FOR UPDATE
    USING (public.user_has_company_access(company_id));

-- RLS Policy: Delivery Orders
CREATE POLICY "Users can only view delivery orders of their company"
    ON public.delivery_orders FOR SELECT
    USING (public.user_has_company_access(company_id));

CREATE POLICY "Users can insert delivery orders for their company"
    ON public.delivery_orders FOR INSERT
    WITH CHECK (public.user_has_company_access(company_id));
`;
}

export const POSTGRES_SCHEMA_SQL = generatePostgreSqlMigration();
