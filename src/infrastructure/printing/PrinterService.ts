export interface Printer {
  name: string;
  displayName: string;
  description: string;
  isDefault: boolean;
}

export interface PrintOptions {
  deviceName?: string;
  copies?: number;
}

export class PrinterService {
  static async getPrinters(): Promise<Printer[]> {
    if (!window.electronAPI || !window.electronAPI.getPrinters) {
      console.warn('Printer API not available in this environment.');
      return [];
    }
    return await window.electronAPI.getPrinters();
  }

  static async printHtml(html: string, options: PrintOptions = {}): Promise<boolean> {
    if (!window.electronAPI || !window.electronAPI.printHtml) {
      console.warn('Printer API not available. Cannot print.');
      return false;
    }
    
    try {
      const result = await window.electronAPI.printHtml(html, options);
      return result.success;
    } catch (e) {
      console.error('Print failed:', e);
      throw e;
    }
  }
}
