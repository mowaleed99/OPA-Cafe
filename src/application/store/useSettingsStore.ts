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
  setLanguage: (lang: 'ar' | 'en') => void;
  setCafeName: (name: string) => void;
  setCurrency: (currency: string) => void;
  setPrintPaperSize: (size: 'A4' | '80mm' | '58mm') => void;
  setCashierPermissions: (permissions: string[]) => void;
  setOwnerPinHash: (hash: string | null) => void;
  loadSettings: (settings: Partial<SettingsState>) => void;
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
  setLanguage: (lang) => set({ language: lang }),
  setCafeName: (name) => set({ cafeName: name }),
  setCurrency: (currency) => set({ currency }),
  setPrintPaperSize: (size) => set({ printPaperSize: size }),
  setCashierPermissions: (permissions) => set({ cashierPermissions: permissions }),
  setOwnerPinHash: (hash) => set({ ownerPinHash: hash }),
  loadSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));

