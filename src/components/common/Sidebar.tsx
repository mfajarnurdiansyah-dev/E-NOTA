import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  FileText,
  Truck,
  CreditCard,
  Printer,
  FileSpreadsheet,
  Settings,
  Shield,
  Layers,
  Sparkles,
  Database,
  Hash,
  LogOut,
  UserCheck
} from 'lucide-react';
import { User, Role } from '../../types';

export type NavSection =
  | 'dashboard'
  | 'companies'
  | 'customers'
  | 'products'
  | 'invoices'
  | 'delivery_orders'
  | 'payments'
  | 'templates'
  | 'reports'
  | 'settings'
  | 'numbering_rules'
  | 'roles_permissions'
  | 'database_schema';

interface MenuItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: boolean;
  badge?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  hasPermission: (permissionCode: string) => boolean;
  currentUser?: User;
  activeRole?: Role;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  hasPermission,
  currentUser,
  activeRole,
  onLogout,
}) => {
  const menuGroups: MenuGroup[] = [
    {
      title: 'UTAMA',
      items: [
        {
          id: 'dashboard' as NavSection,
          label: 'Dashboard',
          icon: LayoutDashboard,
          permission: true,
        },
      ],
    },
    {
      title: 'TRANSAKSI',
      items: [
        {
          id: 'invoices' as NavSection,
          label: 'Invoice Tagihan',
          icon: FileText,
          permission: hasPermission('invoice.view'),
          badge: 'A4 & Dot Matrix',
        },
        {
          id: 'delivery_orders' as NavSection,
          label: 'Surat Jalan (DO)',
          icon: Truck,
          permission: hasPermission('delivery_order.view'),
          badge: '210×80mm',
        },
        {
          id: 'payments' as NavSection,
          label: 'Penerimaan Pembayaran',
          icon: CreditCard,
          permission: hasPermission('payment.view'),
        },
      ],
    },
    {
      title: 'MASTER DATA',
      items: [
        {
          id: 'companies' as NavSection,
          label: 'Perusahaan',
          icon: Building2,
          permission: true,
        },
        {
          id: 'customers' as NavSection,
          label: 'Data Customer',
          icon: Users,
          permission: hasPermission('customer.manage'),
        },
        {
          id: 'products' as NavSection,
          label: 'Produk & Satuan',
          icon: Package,
          permission: hasPermission('product.manage'),
        },
      ],
    },
    {
      title: 'DOKUMEN & LAPORAN',
      items: [
        {
          id: 'templates' as NavSection,
          label: 'Template & Layout',
          icon: Layers,
          permission: hasPermission('settings.manage') || hasPermission('invoice.print'),
        },
        {
          id: 'reports' as NavSection,
          label: 'Laporan & Piutang',
          icon: FileSpreadsheet,
          permission: hasPermission('report.view'),
        },
      ],
    },
    {
      title: 'PENGATURAN',
      items: [
        {
          id: 'settings' as NavSection,
          label: 'Pusat Konfigurasi',
          icon: Settings,
          permission: hasPermission('settings.manage') || true,
        },
        {
          id: 'numbering_rules' as NavSection,
          label: 'Format Penomoran',
          icon: Hash,
          permission: hasPermission('settings.manage') || true,
        },
        {
          id: 'roles_permissions' as NavSection,
          label: 'Hak Akses & Role',
          icon: Shield,
          permission: hasPermission('settings.manage') || true,
        },
        {
          id: 'database_schema' as NavSection,
          label: 'Skema Database SQL',
          icon: Database,
          permission: hasPermission('settings.manage') || true,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 shrink-0 min-h-[calc(100vh-53px)] flex flex-col justify-between border-r border-slate-800">
      <div className="p-3 space-y-6">
        {menuGroups.map((group, idx) => {
          const visibleItems = group.items.filter((item) => item.permission);
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSection(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                          isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-emerald-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom User Info & Dot Matrix badge */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {currentUser && (
          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold truncate leading-tight mt-0.5">
                  {activeRole?.name || currentUser.role_name || 'Pengguna'}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar (Logout)"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/40">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] mb-0.5">
            <Printer className="w-3.5 h-3.5" />
            <span>Printer Dot Matrix Ready</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Continuous form 210×80 mm landscape & A4.
          </p>
        </div>
      </div>
    </aside>
  );
};
