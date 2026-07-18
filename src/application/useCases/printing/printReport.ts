import { DocumentTemplateEngine } from '../../../infrastructure/printing/DocumentTemplateEngine';
import { PrinterService } from '../../../infrastructure/printing/PrinterService';
import { useSettingsStore } from '../../store/useSettingsStore';

export async function printReport(type: 'daily' | 'monthly', reportData: any, title?: string): Promise<boolean> {
  const settings = useSettingsStore.getState();

  let html = '';
  if (type === 'daily') {
    html = DocumentTemplateEngine.generateDailyReport(reportData, settings, settings.currency, title);
  } else if (type === 'monthly') {
    html = DocumentTemplateEngine.generateMonthlyReport(reportData, settings, settings.currency, title);
  }

  const deviceName = settings.defaultPrinter || undefined;
  return await PrinterService.printHtml(html, {
    deviceName,
    copies: 1
  });
}
