import { create } from 'zustand';

interface SettingsState {
  language: 'ar' | 'en';
  cafeName: string;
  currency: string;
  printPaperSize: 'A4' | '80mm' | '58mm';
  cashierPermissions: string[];
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  autoBackupTime: string;
  lastBackupDate: string | null;
  ownerPinHash: string | null;
  defaultPrinter: string | null;
  paperSize: '58mm' | '80mm' | 'custom';
  autoPrintReceipts: boolean;
  receiptCopies: number;
  reportDefaultOutput: 'thermal' | 'pdf';
  receiptTemplateConfig: {
    showLogo: boolean;
    showCashier: boolean;
    showDiscount: boolean;
    footerMessage: string;
  };
  setLanguage: (lang: 'ar' | 'en') => void;
  setCafeName: (name: string) => void;
  setCurrency: (currency: string) => void;
  setCashierPermissions: (permissions: string[]) => void;
  setOwnerPinHash: (hash: string | null) => void;
  loadSettings: (settings: Partial<SettingsState>) => void;
  updateSettings: (cafeId: string, updates: any) => Promise<void> | void;
  setPrintSettings: (settings: Partial<Pick<SettingsState, 'defaultPrinter' | 'paperSize' | 'autoPrintReceipts' | 'receiptCopies' | 'reportDefaultOutput' | 'receiptTemplateConfig'>>) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  language: 'ar',
  cafeName: 'OPA Cafe',
  currency: 'EGP',
  printPaperSize: 'A4',
  cashierPermissions: ['pos', 'tables', 'invoices_sales'],
  autoBackupEnabled: false,
  autoBackupFrequency: 'daily',
  autoBackupTime: '02:00',
  lastBackupDate: null,
  ownerPinHash: null,
  defaultPrinter: null,
  paperSize: '80mm',
  autoPrintReceipts: false,
  receiptCopies: 1,
  reportDefaultOutput: 'thermal',
  receiptTemplateConfig: {
    showLogo: true,
    showCashier: true,
    showDiscount: true,
    footerMessage: 'Thank you for your visit!',
  },
  setLanguage: (lang) => set({ language: lang }),
  setCafeName: (name) => set({ cafeName: name }),
  setCurrency: (currency) => set({ currency }),
  setCashierPermissions: (permissions) => set({ cashierPermissions: permissions }),
  setOwnerPinHash: (hash) => set({ ownerPinHash: hash }),
  loadSettings: (settings) => set((state) => ({ ...state, ...settings })),
  updateSettings: (cafeId, updates) => {
    import('../useCases/settings/manageSettings').then(m => m.updateSettings(cafeId, updates));
  },
  setPrintSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));

