import { orderRepository } from '../../../infrastructure/repositories/index';
import { DocumentTemplateEngine } from '../../../infrastructure/printing/DocumentTemplateEngine';
import { PrinterService } from '../../../infrastructure/printing/PrinterService';
import { useSettingsStore } from '../../store/useSettingsStore';

export async function printReceipt(orderId: string, cafeId: string): Promise<boolean> {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const items = await orderRepository.getOrderItems(orderId);
  const settings = useSettingsStore.getState();

  const html = DocumentTemplateEngine.generateReceipt(order, items, settings, settings.currency);

  const copies = settings.receiptCopies || 1;
  const deviceName = settings.defaultPrinter || undefined;

  return await PrinterService.printHtml(html, {
    deviceName,
    copies
  });
}
