import { DocumentTemplateEngine } from '../../../infrastructure/printing/DocumentTemplateEngine';
import { PrinterService } from '../../../infrastructure/printing/PrinterService';
import { useSettingsStore } from '../../store/useSettingsStore';

export async function printReport(type: 'daily' | 'monthly', reportData: any): Promise<boolean> {
  const settings = useSettingsStore.getState();

  let html = '';
  if (type === 'daily') {
    html = DocumentTemplateEngine.generateDailyReport(reportData, settings, settings.currency);
  } else if (type === 'monthly') {
    html = DocumentTemplateEngine.generateMonthlyReport(reportData, settings, settings.currency);
  }

  const deviceName = settings.defaultPrinter || undefined;
  return await PrinterService.printHtml(html, {
    deviceName,
    copies: 1
  });
}
