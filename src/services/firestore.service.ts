import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Invoice,
  DeliveryOrder,
  Customer,
  Product,
  Company,
  User,
  Role,
  Payment,
  NumberingRule,
  DocumentTemplate,
} from '../types';

export const FirestoreCollections = {
  COMPANIES: 'companies',
  USERS: 'users',
  ROLES: 'roles',
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  INVOICES: 'invoices',
  DELIVERY_ORDERS: 'delivery_orders',
  PAYMENTS: 'payments',
  NUMBERING_RULES: 'numbering_rules',
  TEMPLATES: 'templates',
} as const;

function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

export const FirestoreService = {
  // ==================== INVOICES ====================
  subscribeInvoices: (onUpdate: (invoices: Invoice[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.INVOICES),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Invoice);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.INVOICES);
      }
    );
  },

  saveInvoice: async (invoice: Invoice): Promise<void> => {
    try {
      const sanitized = cleanForFirestore(invoice);
      await setDoc(doc(db, FirestoreCollections.INVOICES, invoice.id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.INVOICES}/${invoice.id}`);
    }
  },

  deleteInvoice: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, FirestoreCollections.INVOICES, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${FirestoreCollections.INVOICES}/${id}`);
    }
  },

  // ==================== DELIVERY ORDERS ====================
  subscribeDeliveryOrders: (onUpdate: (orders: DeliveryOrder[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.DELIVERY_ORDERS),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as DeliveryOrder);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.DELIVERY_ORDERS);
      }
    );
  },

  saveDeliveryOrder: async (order: DeliveryOrder): Promise<void> => {
    try {
      const sanitized = cleanForFirestore(order);
      await setDoc(doc(db, FirestoreCollections.DELIVERY_ORDERS, order.id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.DELIVERY_ORDERS}/${order.id}`);
    }
  },

  deleteDeliveryOrder: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, FirestoreCollections.DELIVERY_ORDERS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${FirestoreCollections.DELIVERY_ORDERS}/${id}`);
    }
  },

  // ==================== CUSTOMERS ====================
  subscribeCustomers: (onUpdate: (customers: Customer[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.CUSTOMERS),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Customer);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.CUSTOMERS);
      }
    );
  },

  saveCustomer: async (customer: Customer): Promise<void> => {
    try {
      await setDoc(doc(db, FirestoreCollections.CUSTOMERS, customer.id), customer);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.CUSTOMERS}/${customer.id}`);
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, FirestoreCollections.CUSTOMERS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${FirestoreCollections.CUSTOMERS}/${id}`);
    }
  },

  // ==================== PRODUCTS ====================
  subscribeProducts: (onUpdate: (products: Product[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.PRODUCTS),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Product);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.PRODUCTS);
      }
    );
  },

  saveProduct: async (product: Product): Promise<void> => {
    try {
      await setDoc(doc(db, FirestoreCollections.PRODUCTS, product.id), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.PRODUCTS}/${product.id}`);
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, FirestoreCollections.PRODUCTS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${FirestoreCollections.PRODUCTS}/${id}`);
    }
  },

  // ==================== PAYMENTS ====================
  subscribePayments: (onUpdate: (payments: Payment[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.PAYMENTS),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Payment);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.PAYMENTS);
      }
    );
  },

  savePayment: async (payment: Payment): Promise<void> => {
    try {
      await setDoc(doc(db, FirestoreCollections.PAYMENTS, payment.id), payment);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.PAYMENTS}/${payment.id}`);
    }
  },

  deletePayment: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, FirestoreCollections.PAYMENTS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${FirestoreCollections.PAYMENTS}/${id}`);
    }
  },

  // ==================== COMPANIES ====================
  subscribeCompanies: (onUpdate: (companies: Company[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.COMPANIES),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Company);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.COMPANIES);
      }
    );
  },

  saveCompany: async (company: Company): Promise<void> => {
    try {
      await setDoc(doc(db, FirestoreCollections.COMPANIES, company.id), company);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.COMPANIES}/${company.id}`);
    }
  },

  // ==================== USERS ====================
  subscribeUsers: (onUpdate: (users: User[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.USERS),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as User);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.USERS);
      }
    );
  },

  saveUser: async (user: User): Promise<void> => {
    try {
      await setDoc(doc(db, FirestoreCollections.USERS, user.id), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.USERS}/${user.id}`);
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, FirestoreCollections.USERS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${FirestoreCollections.USERS}/${id}`);
    }
  },

  // ==================== ROLES ====================
  subscribeRoles: (onUpdate: (roles: Role[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.ROLES),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Role);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.ROLES);
      }
    );
  },

  saveRole: async (role: Role): Promise<void> => {
    try {
      await setDoc(doc(db, FirestoreCollections.ROLES, role.id), role);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.ROLES}/${role.id}`);
    }
  },

  // ==================== NUMBERING RULES ====================
  subscribeNumberingRules: (onUpdate: (rules: NumberingRule[]) => void): Unsubscribe => {
    return onSnapshot(
      collection(db, FirestoreCollections.NUMBERING_RULES),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as NumberingRule);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, FirestoreCollections.NUMBERING_RULES);
      }
    );
  },

  saveNumberingRule: async (rule: NumberingRule): Promise<void> => {
    try {
      await setDoc(doc(db, FirestoreCollections.NUMBERING_RULES, rule.id), rule);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${FirestoreCollections.NUMBERING_RULES}/${rule.id}`);
    }
  },

  // ==================== INITIAL CLOUD SEEDING ====================
  // If Firestore is empty on first setup, seed with initial data so all computers see it immediately
  seedFirestoreIfEmpty: async (initialData: {
    companies: Company[];
    users: User[];
    roles: Role[];
    customers: Customer[];
    products: Product[];
    invoices: Invoice[];
    deliveryOrders: DeliveryOrder[];
    numberingRules: NumberingRule[];
    templates: DocumentTemplate[];
  }): Promise<boolean> => {
    try {
      const snap = await getDocs(collection(db, FirestoreCollections.COMPANIES));
      if (!snap.empty) {
        // Already seeded in Firestore
        return false;
      }

      console.log('Seeding initial data into Firestore Cloud Database...');
      const batch = writeBatch(db);

      // Seed Companies
      initialData.companies.forEach((c) => {
        batch.set(doc(db, FirestoreCollections.COMPANIES, c.id), c);
      });

      // Seed Users
      initialData.users.forEach((u) => {
        batch.set(doc(db, FirestoreCollections.USERS, u.id), u);
      });

      // Seed Roles
      initialData.roles.forEach((r) => {
        batch.set(doc(db, FirestoreCollections.ROLES, r.id), r);
      });

      // Seed Customers
      initialData.customers.forEach((cust) => {
        batch.set(doc(db, FirestoreCollections.CUSTOMERS, cust.id), cust);
      });

      // Seed Products
      initialData.products.forEach((p) => {
        batch.set(doc(db, FirestoreCollections.PRODUCTS, p.id), p);
      });

      // Seed Invoices
      initialData.invoices.forEach((inv) => {
        batch.set(doc(db, FirestoreCollections.INVOICES, inv.id), inv);
      });

      // Seed Delivery Orders
      initialData.deliveryOrders.forEach((doDoc) => {
        batch.set(doc(db, FirestoreCollections.DELIVERY_ORDERS, doDoc.id), doDoc);
      });

      // Seed Numbering Rules
      initialData.numberingRules.forEach((rule) => {
        batch.set(doc(db, FirestoreCollections.NUMBERING_RULES, rule.id), rule);
      });

      await batch.commit();
      console.log('Successfully seeded Firestore Cloud Database!');
      return true;
    } catch (err) {
      console.warn('Error during Firestore initial seed (may already be initialized):', err);
      return false;
    }
  },
};
