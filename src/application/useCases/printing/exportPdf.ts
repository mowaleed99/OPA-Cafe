import { DocumentTemplateEngine } from '../../../infrastructure/printing/DocumentTemplateEngine';
import { PdfGeneratorService } from '../../../infrastructure/printing/PdfGeneratorService';
import { useSettingsStore } from '../../store/useSettingsStore';

export async function exportPdfReport(type: 'daily' | 'monthly', reportData: any, filename: string): Promise<string> {
  const settings = useSettingsStore.getState();

  let html = '';
  // Force paper size to A4 for PDFs
  const pdfSettings = { ...settings, paperSize: 'custom' };
  
  // Inject some A4 styles since it's a PDF export
  const a4Styles = `
    <style>
      body { width: 100% !important; max-width: 800px; margin: 0 auto; padding: 40px !important; font-size: 14px !important; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background-color: #f5f5f5; }
    </style>
  `;

  if (type === 'daily') {
    html = DocumentTemplateEngine.generateA4DailyReport(reportData, pdfSettings, settings.currency);
  } else if (type === 'monthly') {
    html = DocumentTemplateEngine.generateA4MonthlyReport(reportData, pdfSettings, settings.currency);
  }

  // Insert A4 styling before closing head
  html = html.replace('</head>', `${a4Styles}</head>`);

  return await PdfGeneratorService.generatePdf(html, {
    filename,
    landscape: false
  });
}
