import { enqueueSync } from '../../sync/syncQueue';
import { useSettingsStore } from '../../store/useSettingsStore';
import { settingsRepository } from '../../../infrastructure/repositories/index';
import { AppSettings } from '../../../domain/repositories/ISettingsRepository';

export async function fetchSettings(cafeId: string) {
  try {
    const settings = await settingsRepository.getSettings(cafeId);

    if (settings) {
      useSettingsStore.getState().loadSettings({
        language: settings.language as 'ar' | 'en',
        cafeName: settings.cafe_name,
        currency: settings.currency || 'EGP',
        printPaperSize: (settings.print_paper_size as 'A4' | '80mm' | '58mm') || 'A4',
        cashierPermissions: typeof settings.cashier_permissions === 'string' 
          ? JSON.parse(settings.cashier_permissions) 
          : (settings.cashier_permissions || ['pos', 'tables', 'invoices_sales']),
        ownerPinHash: settings.owner_pin_hash ?? null,
        defaultPrinter: settings.default_printer ?? null,
        paperSize: (settings.paper_size as '58mm' | '80mm' | 'custom') || '80mm',
        autoPrintReceipts: Boolean(settings.auto_print_receipts),
        receiptCopies: settings.receipt_copies || 1,
        reportDefaultOutput: (settings.report_default_output as 'thermal' | 'pdf') || 'thermal',
        receiptTemplateConfig: settings.receipt_template_config 
          ? JSON.parse(settings.receipt_template_config)
          : { showLogo: true, showCashier: true, showDiscount: true, footerMessage: 'Thank you for your visit!' },
      });
    } else {
      const defaultSettings: AppSettings = {
        id: crypto.randomUUID(),
        cafe_id: cafeId,
        language: 'ar',
        cafe_name: 'OPA Cafe',
        currency: 'EGP',
        print_paper_size: 'A4',
        cashier_permissions: JSON.stringify(['pos', 'tables', 'invoices_sales']),
        owner_pin_hash: null,
        default_printer: null,
        paper_size: '80mm',
        auto_print_receipts: false,
        receipt_copies: 1,
        report_default_output: 'thermal',
        receipt_template_config: JSON.stringify({ showLogo: true, showCashier: true, showDiscount: true, footerMessage: 'Thank you for your visit!' }),
      };
      await settingsRepository.createSettings(defaultSettings);
      await enqueueSync('insert', 'settings', defaultSettings as unknown as Record<string, unknown>);
      
      useSettingsStore.getState().loadSettings({
        language: 'ar',
        cafeName: 'OPA Cafe',
        currency: 'EGP',
        printPaperSize: 'A4',
        cashierPermissions: ['pos', 'tables', 'invoices_sales'],
        ownerPinHash: null,
        defaultPrinter: null,
        paperSize: '80mm',
        autoPrintReceipts: false,
        receiptCopies: 1,
        reportDefaultOutput: 'thermal',
        receiptTemplateConfig: { showLogo: true, showCashier: true, showDiscount: true, footerMessage: 'Thank you for your visit!' },
      });
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error);
  }
}

export async function updateSettings(cafeId: string, updates: Partial<{
  language: string;
  cafe_name: string;
  currency?: string;
  print_paper_size?: string;
  cashier_permissions?: string[];
  owner_pin_hash?: string | null;
  default_printer?: string | null;
  paper_size?: string;
  auto_print_receipts?: boolean;
  receipt_copies?: number;
  report_default_output?: string;
  receipt_template_config?: any; // object that we stringify
}>) {
  try {
    const existing = await settingsRepository.getSettings(cafeId);

    if (existing) {
      const parsedUpdates: any = { ...updates };
      if (updates.cashier_permissions) {
        parsedUpdates.cashier_permissions = JSON.stringify(updates.cashier_permissions);
      }
      if (updates.receipt_template_config) {
        parsedUpdates.receipt_template_config = JSON.stringify(updates.receipt_template_config);
      }
      const updated = { ...existing, ...parsedUpdates };
      await settingsRepository.updateSettings(existing.id, parsedUpdates);
      await enqueueSync('update', 'settings', updated as Record<string, unknown>);
    }
  } catch (error) {
    console.error('Failed to update settings:', error);
  }
}

