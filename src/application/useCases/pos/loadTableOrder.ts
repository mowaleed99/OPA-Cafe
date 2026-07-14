import { orderRepository, productRepository } from '../../../infrastructure/repositories/index';
import { useCartStore } from '../../store/useCartStore';

export async function loadTableOrder(orderId: string): Promise<void> {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const orderItems = await orderRepository.getOrderItems(orderId);

  const cartItems = [];
  for (const item of orderItems) {
    const product = await productRepository.getProductById(item.product_id);
    if (product) {
      cartItems.push({
        product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        note: '',
      });
    }
  }

  useCartStore.getState().setItems(cartItems);
  useCartStore.getState().setTableId(order.table_id || null);
  useCartStore.getState().setActiveOrderId(order.id);
}
