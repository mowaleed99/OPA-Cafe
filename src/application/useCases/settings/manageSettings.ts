import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import { useSettingsStore } from '../../store/useSettingsStore';

export async function fetchSettings(cafeId: string) {
  try {
    const settings = await db.settings.where('cafe_id').equals(cafeId).first();
    if (settings) {
      // Load into zustand store
      useSettingsStore.getState().loadSettings({
        language: settings.language as 'ar' | 'en',
        cafeName: settings.cafe_name,
        printPaperSize: (settings.print_paper_size as 'A4' | '80mm' | '58mm') || 'A4',
      });
    } else {
      // First time, create default settings record
      const defaultSettings = {
        id: crypto.randomUUID(),
        cafe_id: cafeId,
        language: 'ar',
        cafe_name: 'OPA Cafe',
        print_paper_size: 'A4',
      };
      await db.settings.add(defaultSettings);
      await enqueueSync('insert', 'settings', defaultSettings);
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error);
  }
}

export async function updateSettings(cafeId: string, updates: Partial<{
  language: string;
  cafe_name: string;
  print_paper_size: string;
}>) {
  try {
    const existing = await db.settings.where('cafe_id').equals(cafeId).first();
    if (existing) {
      const updated = { ...existing, ...updates };
      await db.settings.put(updated);
      await enqueueSync('update', 'settings', updated);
    }
  } catch (error) {
    console.error('Failed to update settings:', error);
  }
}
