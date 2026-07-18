import { orderRepository, productRepository } from '../../../infrastructure/repositories/index';
import { DocumentTemplateEngine } from '../../../infrastructure/printing/DocumentTemplateEngine';
import { PrinterService } from '../../../infrastructure/printing/PrinterService';
import { useSettingsStore } from '../../store/useSettingsStore';

export async function printReceipt(orderId: string, cafeId: string): Promise<boolean> {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const items = await orderRepository.getOrderItems(orderId);
  const products = await productRepository.getProducts(cafeId);
  const itemsWithNames = items.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return { ...item, product_name: product ? product.name : item.product_id };
  });

  const settings = useSettingsStore.getState();

  const html = DocumentTemplateEngine.generateReceipt(order, itemsWithNames as any, settings, settings.currency);

  const copies = settings.receiptCopies || 1;
  const deviceName = settings.defaultPrinter || undefined;

  return await PrinterService.printHtml(html, {
    deviceName,
    copies
  });
}
