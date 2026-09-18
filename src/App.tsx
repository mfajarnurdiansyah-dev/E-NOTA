import React, { useState } from 'react';
import { StorageService } from './services/storage.service';
import { 
  Company, 
  Invoice, 
  DeliveryOrder, 
  Customer, 
  Product, 
  User,
  Role, 
  Permission, 
  NumberingRule, 
  DocumentTemplate, 
  PrinterProfile,
  TaxConfig, 
  PaymentMethodConfig, 
  UnitConfig, 
  CategoryConfig,
  DocumentStatus,
  DeliveryStatus,
  Payment
} from './types';

// Layout Components
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavSection } from './components/common/Sidebar';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceFormModal } from './components/invoices/InvoiceFormModal';
import { PaymentModal } from './components/invoices/PaymentModal';
import { DeliveryOrderList } from './components/delivery/DeliveryOrderList';
import { DeliveryOrderFormModal } from './components/delivery/DeliveryOrderFormModal';
import { CustomersManager } from './components/master/CustomersManager';
import { ProductsManager } from './components/master/ProductsManager';
import { CompaniesManager } from './components/master/CompaniesManager';
import { TemplateBuilderView } from './components/templates/TemplateBuilderView';
import { NumberingRulesView } from './components/settings/NumberingRulesView';
import { SystemConfigView } from './components/settings/SystemConfigView';
import { RolesPermissionsView } from './components/settings/RolesPermissionsView';
import { DatabaseSchemaView } from './components/settings/DatabaseSchemaView';
import { PrintPreviewModal } from './components/print/PrintPreviewModal';
import { ReportsView } from './components/reports/ReportsView';
import { AuthView } from './components/auth/AuthView';
import { formatRupiah, formatDateIndo } from './services/calculation.service';
import { CreditCard, FileSpreadsheet, Plus, Printer, TrendingUp, CheckCircle } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');

  // Master Data & App State
  const [companies, setCompanies] = useState<Company[]>(StorageService.getCompanies());
  const [activeCompanyId, setActiveCompanyId] = useState<string>(
    StorageService.getActiveCompanyId()
  );

  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [authSession, setAuthSession] = useState<{ userId: string; loginAt: string } | null>(
    () => StorageService.getAuthSession()
  );
  const [currentUserId, setCurrentUserId] = useState<string>(
    () => StorageService.getAuthSession()?.userId || StorageService.getCurrentUserId()
  );

  const [roles, setRoles] = useState<Role[]>(StorageService.getRoles());
  const [activeRoleId, setActiveRoleId] = useState<string>(
    StorageService.getActiveRoleId()
  );
  const [permissions] = useState<Permission[]>(StorageService.getPermissions());

  const [invoices, setInvoices] = useState<Invoice[]>(StorageService.getInvoices());
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(
    StorageService.getDeliveryOrders()
  );
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [numberingRules, setNumberingRules] = useState<NumberingRule[]>(
    StorageService.getNumberingRules()
  );
  const [templates, setTemplates] = useState<DocumentTemplate[]>(
    StorageService.getTemplates()
  );
  const [printers] = useState<PrinterProfile[]>(StorageService.getPrinters());
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>(
    StorageService.getTaxConfigs()
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(
    StorageService.getPaymentMethods()
  );
  const [units, setUnits] = useState<UnitConfig[]>(StorageService.getUnits());
  const [categories, setCategories] = useState<CategoryConfig[]>(
    StorageService.getCategories()
  );
  const [payments, setPayments] = useState<Payment[]>(StorageService.getPayments());

  // Modals State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);

  const [isDOModalOpen, setIsDOModalOpen] = useState(false);
  const [editingDO, setEditingDO] = useState<DeliveryOrder | null>(null);
  const [doFromInvoice, setDoFromInvoice] = useState<Invoice | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocument, setPrintDocument] = useState<Invoice | DeliveryOrder | null>(null);
  const [printType, setPrintType] = useState<'invoice' | 'delivery_order'>('invoice');

  // Derived active objects
  const activeCompany =
    companies.find((c) => c.id === activeCompanyId) || companies[0];
  const currentUser =
    users.find((u) => u.id === currentUserId) || users[0];
  const activeRole =
    roles.find((r) => r.id === activeRoleId) ||
    roles.find((r) => r.id === currentUser.role_id) ||
    roles[0];

  // RBAC Permission Checker
  const hasPermission = (permissionCode: string) => {
    if (!activeRole) return true;
    if (
      activeRole.name.toLowerCase().includes('super admin') ||
      activeRole.code === 'super_admin'
    ) {
      return true;
    }
    const codes = activeRole.permission_codes || activeRole.permissions || [];
    return codes.includes(permissionCode);
  };

  // Company Switcher
  const handleSelectCompany = (id: string) => {
    setActiveCompanyId(id);
    StorageService.setActiveCompanyId(id);
  };

  // User Switcher (Navbar)
  const handleSelectUser = (id: string) => {
    setCurrentUserId(id);
    StorageService.setCurrentUserId(id);
    const selectedUser = users.find((u) => u.id === id);
    if (selectedUser?.role_id) {
      setActiveRoleId(selectedUser.role_id);
      StorageService.setActiveRoleId(selectedUser.role_id);
    }
  };

  // Role Switcher
  const handleSelectRole = (id: string) => {
    setActiveRoleId(id);
    StorageService.setActiveRoleId(id);
  };

  // ==================== AUTH HANDLERS ====================
  const handleLogin = (loggedInUser: User) => {
    const session = { userId: loggedInUser.id, loginAt: new Date().toISOString() };
    StorageService.setAuthSession(session);
    setAuthSession(session);
    setCurrentUserId(loggedInUser.id);
    StorageService.setCurrentUserId(loggedInUser.id);
    setActiveRoleId(loggedInUser.role_id);
    StorageService.setActiveRoleId(loggedInUser.role_id);

    if (
      loggedInUser.company_ids &&
      loggedInUser.company_ids.length > 0 &&
      !loggedInUser.company_ids.includes(activeCompanyId)
    ) {
      setActiveCompanyId(loggedInUser.company_ids[0]);
      StorageService.setActiveCompanyId(loggedInUser.company_ids[0]);
    }
  };

  const handleRegister = (newUser: User, newRole?: Role) => {
    if (newRole) {
      const nextRoles = [...roles, newRole];
      setRoles(nextRoles);
      StorageService.saveRoles(nextRoles);
    }
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    StorageService.saveUsers(nextUsers);

    handleLogin(newUser);
  };

  const handleLogout = () => {
    StorageService.clearAuthSession();
    setAuthSession(null);
  };

  const handleAddUserInsideApp = (newUser: User) => {
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    StorageService.saveUsers(nextUsers);
  };

  const handleAddRoleInsideApp = (newRole: Role) => {
    const nextRoles = [...roles, newRole];
    setRoles(nextRoles);
    StorageService.saveRoles(nextRoles);
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      return;
    }
    const nextUsers = users.filter((u) => u.id !== userId);
    setUsers(nextUsers);
    StorageService.saveUsers(nextUsers);

    // If the active user deletes their own account, log out to the auth gate
    if (currentUserId === userId) {
      handleLogout();
    }
  };

  // ==================== INVOICE HANDLERS ====================
  const handleSaveInvoice = (invoiceData: Partial<Invoice>, advanceSequence: boolean) => {
    let updatedInvoices: Invoice[];
    if (editingInvoice) {
      updatedInvoices = invoices.map((inv) =>
        inv.id === editingInvoice.id
          ? ({ ...inv, ...invoiceData, updated_at: new Date().toISOString() } as Invoice)
          : inv
      );
    } else {
      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...invoiceData,
      } as Invoice;
      updatedInvoices = [newInv, ...invoices];

      if (advanceSequence) {
        const invRule = numberingRules.find((r) => r.document_type === 'invoice');
        if (invRule) {
          const updatedRules = numberingRules.map((r) =>
            r.id === invRule.id
              ? {
                  ...r,
                  current_sequence: (r.current_sequence || 0) + 1,
                  current_number: (r.current_number || r.current_sequence || 0) + 1,
                }
              : r
          );
          setNumberingRules(updatedRules);
          StorageService.saveNumberingRules(updatedRules);
        }
      }
    }

    setInvoices(updatedInvoices);
    StorageService.saveInvoices(updatedInvoices);
    setIsInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Yakin ingin menghapus invoice ini?')) {
      const updated = invoices.filter((i) => i.id !== id);
      setInvoices(updated);
      StorageService.saveInvoices(updated);
    }
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const dupNumber = `${invoice.invoice_number}-COPY`;
    const newInv: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoice_number: dupNumber,
      status: 'DRAFT',
      paid_amount: 0,
      invoice_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    StorageService.saveInvoices(updated);
  };

  const handleUpdateInvoiceStatus = (id: string, newStatus: DocumentStatus) => {
    const updated = invoices.map((i) =>
      i.id === id ? { ...i, status: newStatus, updated_at: new Date().toISOString() } : i
    );
    setInvoices(updated);
    StorageService.saveInvoices(updated);
  };

  // Payment Recording
  const handleSavePayment = (paymentData: {
    amount: number;
    payment_method: string;
    reference_number: string;
    notes: string;
    payment_date: string;
  }) => {
    if (!paymentTargetInvoice) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      company_id: activeCompany.id,
      invoice_id: paymentTargetInvoice.id,
      invoice_number: paymentTargetInvoice.invoice_number,
      payment_number: `PAY/${Date.now().toString().slice(-6)}`,
      customer_id: paymentTargetInvoice.customer_id,
      payment_date: paymentData.payment_date,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number,
      notes: paymentData.notes,
      created_by: currentUser.name,
      created_at: new Date().toISOString(),
    };

    const newPayments = [newPayment, ...payments];
    setPayments(newPayments);
    StorageService.savePayments(newPayments);

    // Update Invoice paid_amount and status
    const newPaidAmount = paymentTargetInvoice.paid_amount + paymentData.amount;
    const isFullyPaid = newPaidAmount >= paymentTargetInvoice.grand_total;
    const newStatus: DocumentStatus = isFullyPaid ? 'PAID' : 'PARTIAL_PAID';

    const updatedInvoices = invoices.map((inv) =>
      inv.id === paymentTargetInvoice.id
        ? {
            ...inv,
            paid_amount: newPaidAmount,
            status: newStatus,
            updated_at: new Date().toISOString(),
          }
        : inv
    );

    setInvoices(updatedInvoices);
    StorageService.saveInvoices(updatedInvoices);
    setIsPaymentModalOpen(false);
    setPaymentTargetInvoice(null);
  };

  // Create Surat Jalan from Invoice
  const handleCreateDOFromInvoice = (invoice: Invoice) => {
    setDoFromInvoice(invoice);
    setEditingDO(null);
    setIsDOModalOpen(true);
  };

  // ==================== DELIVERY ORDER HANDLERS ====================
  const handleSaveDO = (doData: Partial<DeliveryOrder>, advanceSequence: boolean) => {
    let updatedDOs: DeliveryOrder[];
    if (editingDO) {
      updatedDOs = deliveryOrders.map((d) =>
        d.id === editingDO.id
          ? ({ ...d, ...doData, updated_at: new Date().toISOString() } as DeliveryOrder)
          : d
      );
    } else {
      const newDO: DeliveryOrder = {
        id: `do-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...doData,
      } as DeliveryOrder;
      updatedDOs = [newDO, ...deliveryOrders];

      if (advanceSequence) {
        const doRule = numberingRules.find((r) => r.document_type === 'delivery_order');
        if (doRule) {
          const updatedRules = numberingRules.map((r) =>
            r.id === doRule.id
              ? {
                  ...r,
                  current_sequence: (r.current_sequence || 0) + 1,
                  current_number: (r.current_number || r.current_sequence || 0) + 1,
                }
              : r
          );
          setNumberingRules(updatedRules);
          StorageService.saveNumberingRules(updatedRules);
        }
      }
    }

    setDeliveryOrders(updatedDOs);
    StorageService.saveDeliveryOrders(updatedDOs);
    setIsDOModalOpen(false);
    setEditingDO(null);
    setDoFromInvoice(null);
  };

  const handleDeleteDO = (id: string) => {
    if (window.confirm('Hapus Surat Jalan ini?')) {
      const updated = deliveryOrders.filter((d) => d.id !== id);
      setDeliveryOrders(updated);
      StorageService.saveDeliveryOrders(updated);
    }
  };

  const handleUpdateDOStatus = (id: string, newStatus: DeliveryStatus) => {
    const updated = deliveryOrders.map((d) =>
      d.id === id ? { ...d, status: newStatus, updated_at: new Date().toISOString() } : d
    );
    setDeliveryOrders(updated);
    StorageService.saveDeliveryOrders(updated);
  };

  // Print Preview triggers
  const handleOpenPrintInvoice = (inv: Invoice) => {
    setPrintDocument(inv);
    setPrintType('invoice');
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintDO = (doData: DeliveryOrder) => {
    setPrintDocument(doData);
    setPrintType('delivery_order');
    setIsPrintModalOpen(true);
  };

  // Company management save
  const handleSaveCompany = (comp: Company) => {
    const exists = companies.some((c) => c.id === comp.id);
    const updated = exists
      ? companies.map((c) => (c.id === comp.id ? comp : c))
      : [...companies, comp];
    setCompanies(updated);
    StorageService.saveCompanies(updated);
  };

  // Customer management save
  const handleSaveCustomer = (cust: Customer) => {
    const exists = customers.some((c) => c.id === cust.id);
    const updated = exists
      ? customers.map((c) => (c.id === cust.id ? cust : c))
      : [...customers, cust];
    setCustomers(updated);
    StorageService.saveCustomers(updated);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Hapus customer ini?')) {
      const updated = customers.filter((c) => c.id !== id);
      setCustomers(updated);
      StorageService.saveCustomers(updated);
    }
  };

  // Product management save
  const handleSaveProduct = (prod: Product) => {
    const exists = products.some((p) => p.id === prod.id);
    const updated = exists
      ? products.map((p) => (p.id === prod.id ? prod : p))
      : [...products, prod];
    setProducts(updated);
    StorageService.saveProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Hapus produk ini?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      StorageService.saveProducts(updated);
    }
  };

  // Numbering rule save
  const handleSaveNumberingRule = (rule: NumberingRule) => {
    const updated = numberingRules.map((r) => (r.id === rule.id ? rule : r));
    setNumberingRules(updated);
    StorageService.saveNumberingRules(updated);
  };

  // Template save
  const handleSaveTemplate = (template: DocumentTemplate) => {
    const updated = templates.map((t) => (t.id === template.id ? template : t));
    setTemplates(updated);
    StorageService.saveTemplates(updated);
  };

  // Role permissions save
  const handleUpdateRolePermissions = (roleId: string, permissionCodes: string[]) => {
    const updated = roles.map((r) =>
      r.id === roleId ? { ...r, permission_codes: permissionCodes } : r
    );
    setRoles(updated);
    StorageService.saveRoles(updated);
  };

  // System config updates
  const handleUpdateTaxes = (newTaxes: TaxConfig[]) => {
    setTaxConfigs(newTaxes);
    StorageService.saveTaxConfigs(newTaxes);
  };

  const handleUpdatePaymentMethods = (newMethods: PaymentMethodConfig[]) => {
    setPaymentMethods(newMethods);
    StorageService.savePaymentMethods(newMethods);
  };

  const handleUpdateUnits = (newUnits: UnitConfig[]) => {
    setUnits(newUnits);
    StorageService.saveUnits(newUnits);
  };

  const handleUpdateCategories = (newCats: CategoryConfig[]) => {
    setCategories(newCats);
    StorageService.saveCategories(newCats);
  };

  // Filter records by active company
  const companyInvoices = invoices.filter((i) => i.company_id === activeCompany.id);
  const companyDOs = deliveryOrders.filter((d) => d.company_id === activeCompany.id);
  const companyPayments = payments.filter((p) => p.company_id === activeCompany.id);
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  // Check if session is authenticated (Gate application access)
  if (!authSession || !currentUser) {
    return (
      <AuthView
        roles={roles}
        companies={companies}
        users={users}
        onLoginSuccess={handleLogin}
        onRegisterSuccess={handleRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Navigation Bar */}
      <Navbar
        companies={companies}
        activeCompany={activeCompany}
        onSelectCompany={handleSelectCompany}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onOpenQuickInvoice={() => {
          setEditingInvoice(null);
          setIsInvoiceModalOpen(true);
        }}
        onOpenQuickDelivery={() => {
          setEditingDO(null);
          setDoFromInvoice(null);
          setIsDOModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main App Body with Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          hasPermission={hasPermission}
          currentUser={currentUser}
          activeRole={activeRole}
          onLogout={handleLogout}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentSection === 'dashboard' && (
              <DashboardView
                invoices={invoices}
                deliveryOrders={deliveryOrders}
                customers={customers}
                company={activeCompany}
                onNavigate={(sec) => setCurrentSection(sec as NavSection)}
                onOpenCreateInvoice={() => {
                  setEditingInvoice(null);
                  setIsInvoiceModalOpen(true);
                }}
                onOpenCreateDO={() => {
                  setEditingDO(null);
                  setDoFromInvoice(null);
                  setIsDOModalOpen(true);
                }}
                onOpenPrintInvoice={handleOpenPrintInvoice}
                onOpenPrintDO={handleOpenPrintDO}
              />
            )}

            {currentSection === 'invoices' && (
              <InvoiceList
                invoices={invoices}
                customers={customers}
                company={activeCompany}
                hasPermission={hasPermission}
                onOpenCreate={() => {
                  setEditingInvoice(null);
                  setIsInvoiceModalOpen(true);
                }}
                onOpenEdit={(inv) => {
                  setEditingInvoice(inv);
                  setIsInvoiceModalOpen(true);
                }}
                onOpenPrint={handleOpenPrintInvoice}
                onOpenPayment={(inv) => {
                  setPaymentTargetInvoice(inv);
                  setIsPaymentModalOpen(true);
                }}
                onCreateDeliveryOrder={handleCreateDOFromInvoice}
                onDuplicate={handleDuplicateInvoice}
                onDelete={handleDeleteInvoice}
                onUpdateStatus={handleUpdateInvoiceStatus}
              />
            )}

            {currentSection === 'delivery_orders' && (
              <DeliveryOrderList
                deliveryOrders={deliveryOrders}
                customers={customers}
                company={activeCompany}
                hasPermission={hasPermission}
                onOpenCreate={() => {
                  setEditingDO(null);
                  setDoFromInvoice(null);
                  setIsDOModalOpen(true);
                }}
                onOpenEdit={(doData) => {
                  setEditingDO(doData);
                  setDoFromInvoice(null);
                  setIsDOModalOpen(true);
                }}
                onOpenPrint={handleOpenPrintDO}
                onDelete={handleDeleteDO}
                onUpdateStatus={handleUpdateDOStatus}
              />
            )}

            {/* Payments List View */}
            {currentSection === 'payments' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span>Riwayat Penerimaan Pembayaran</span>
                    </h1>
                    <p className="text-xs text-slate-500">
                      Semua transaksi pelunasan piutang faktur untuk {activeCompany.company_name}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-4">No. Bukti Bayar</th>
                          <th className="py-3 px-4">Tanggal</th>
                          <th className="py-3 px-4">No. Faktur</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Metode Bayar</th>
                          <th className="py-3 px-4">Ref / Keterangan</th>
                          <th className="py-3 px-4 text-right">Jumlah Dibayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {companyPayments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              Belum ada pembayaran yang dicatat.
                            </td>
                          </tr>
                        ) : (
                          companyPayments.map((p) => {
                            const cust = customerMap.get(p.customer_id);
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                  {p.payment_number || p.id}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {formatDateIndo(p.payment_date)}
                                </td>
                                <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                                  {p.invoice_number || '-'}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-800">
                                  {cust?.customer_name || '-'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                    {p.payment_method}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-500">
                                  {p.reference_number ? `Ref: ${p.reference_number}` : ''}{' '}
                                  {p.notes ? `(${p.notes})` : ''}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                                  {formatRupiah(p.amount)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reports & Piutang View */}
            {currentSection === 'reports' && (
              <ReportsView
                company={activeCompany}
                customers={customers}
                invoices={invoices}
                payments={payments}
              />
            )}

            {currentSection === 'customers' && (
              <CustomersManager
                customers={customers}
                invoices={invoices}
                payments={payments}
                company={activeCompany}
                onSaveCustomer={handleSaveCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {currentSection === 'products' && (
              <ProductsManager
                products={products}
                company={activeCompany}
                units={units}
                categories={categories}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentSection === 'companies' && (
              <CompaniesManager
                companies={companies}
                activeCompanyId={activeCompanyId}
                onSelectActiveCompany={handleSelectCompany}
                onSaveCompany={handleSaveCompany}
              />
            )}

            {(currentSection === 'templates' || (currentSection as string) === 'template_builder') && (
              <TemplateBuilderView
                templates={templates}
                company={activeCompany}
                onSaveTemplate={handleSaveTemplate}
              />
            )}

            {currentSection === 'numbering_rules' && (
              <NumberingRulesView
                rules={numberingRules}
                company={activeCompany}
                onSaveRule={handleSaveNumberingRule}
              />
            )}

            {currentSection === 'settings' && (
              <SystemConfigView
                taxConfigs={taxConfigs}
                paymentMethods={paymentMethods}
                units={units}
                categories={categories}
                onUpdateTaxes={handleUpdateTaxes}
                onUpdatePaymentMethods={handleUpdatePaymentMethods}
                onUpdateUnits={handleUpdateUnits}
                onUpdateCategories={handleUpdateCategories}
              />
            )}

            {currentSection === 'roles_permissions' && (
              <RolesPermissionsView
                roles={roles}
                permissions={permissions}
                currentRoleId={activeRoleId}
                currentUserId={currentUserId}
                onSelectRole={handleSelectRole}
                onUpdateRolePermissions={handleUpdateRolePermissions}
                users={users}
                companies={companies}
                onAddUser={handleAddUserInsideApp}
                onDeleteUser={handleDeleteUser}
                onAddRole={handleAddRoleInsideApp}
              />
            )}

            {currentSection === 'database_schema' && <DatabaseSchemaView />}
          </div>
        </main>
      </div>

      {/* Invoice Create / Edit Modal */}
      {isInvoiceModalOpen && (
        <InvoiceFormModal
          initialData={editingInvoice}
          company={activeCompany}
          customers={customers}
          products={products}
          taxConfigs={taxConfigs}
          units={units}
          numberingRule={
            numberingRules.find((r) => r.document_type === 'invoice') || numberingRules[0]
          }
          onSave={handleSaveInvoice}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setEditingInvoice(null);
          }}
        />
      )}

      {/* Payment Recording Modal */}
      {isPaymentModalOpen && paymentTargetInvoice && (
        <PaymentModal
          invoice={paymentTargetInvoice}
          customer={customers.find((c) => c.id === paymentTargetInvoice.customer_id)}
          paymentMethods={paymentMethods}
          onSavePayment={handleSavePayment}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentTargetInvoice(null);
          }}
        />
      )}

      {/* Delivery Order Create / Edit Modal */}
      {isDOModalOpen && (
        <DeliveryOrderFormModal
          initialData={editingDO}
          fromInvoice={doFromInvoice}
          company={activeCompany}
          customers={customers}
          products={products}
          invoices={invoices}
          numberingRule={
            numberingRules.find((r) => r.document_type === 'delivery_order') ||
            numberingRules[1] ||
            numberingRules[0]
          }
          onSave={handleSaveDO}
          onClose={() => {
            setIsDOModalOpen(false);
            setEditingDO(null);
            setDoFromInvoice(null);
          }}
        />
      )}

      {/* Print Preview & PDF Modal (A4 & Dot Matrix 210x80mm) */}
      {isPrintModalOpen && printDocument && (
        <PrintPreviewModal
          documentType={printType}
          invoice={printType === 'invoice' ? (printDocument as Invoice) : undefined}
          deliveryOrder={printType === 'delivery_order' ? (printDocument as DeliveryOrder) : undefined}
          company={activeCompany}
          customer={customers.find((c) => c.id === printDocument.customer_id)}
          templates={templates}
          printerProfiles={printers}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintDocument(null);
          }}
        />
      )}
    </div>
  );
}
