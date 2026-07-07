import { create } from 'zustand';

interface SettingsState {
  language: 'ar' | 'en';
  cafeName: string;
  printPaperSize: 'A4' | '80mm' | '58mm';
  setLanguage: (lang: 'ar' | 'en') => void;
  setCafeName: (name: string) => void;
  setPrintPaperSize: (size: 'A4' | '80mm' | '58mm') => void;
  loadSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  language: 'ar',
  cafeName: 'OPA Cafe',
  printPaperSize: 'A4',
  setLanguage: (lang) => set({ language: lang }),
  setCafeName: (name) => set({ cafeName: name }),
  setPrintPaperSize: (size) => set({ printPaperSize: size }),
  loadSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));
