import { Order, OrderItem } from '../entities/order';
import { OrderAuditLog } from '../entities/order_audit_log';
import { DiningTable } from '../entities/table';

export interface IOrderRepository {
  // Orders
  getOrders(cafeId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  
  // Tables
  getTables(cafeId: string): Promise<DiningTable[]>;
  getTableById(id: string): Promise<DiningTable | null>;
  updateTable(id: string, updates: Partial<DiningTable>): Promise<void>;
  
  // Audit
  getAuditLogs(cafeId: string): Promise<OrderAuditLog[]>;
}
