export interface PdfOptions {
  filename?: string;
  landscape?: boolean;
}

export class PdfGeneratorService {
  static async generatePdf(html: string, options: PdfOptions = {}): Promise<string> {
    if (!window.electronAPI || !window.electronAPI.exportPdf) {
      console.warn('PDF Export API not available in this environment.');
      throw new Error('PDF Export not supported in browser environment');
    }
    
    try {
      const result = await window.electronAPI.exportPdf(html, options);
      if (result.success && result.filePath) {
        return result.filePath;
      }
      throw new Error('PDF Export failed for unknown reason');
    } catch (e: any) {
      console.error('PDF Export failed:', e);
      throw e;
    }
  }
}
