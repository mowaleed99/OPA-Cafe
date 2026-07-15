import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order, OrderItem } from '../../domain/entities/order';
import { OrderAuditLog, AuditActionType } from '../../domain/entities/order_audit_log';
import { DiningTable } from '../../domain/entities/table';

export class SQLiteOrderRepository implements IOrderRepository {
  async getOrders(cafeId: string): Promise<Order[]> {
    const list = await window.electronAPI.db.findMany('orders', { cafe_id: cafeId });
    return list
      .filter((o: any) => !o.deleted_at)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as Order[];
  }

  async getOrderById(id: string): Promise<Order | null> {
    const o = await window.electronAPI.db.findOne('orders', id);
    if (!o || o.deleted_at) return null;
    return o as Order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const list = await window.electronAPI.db.findMany('order_items', { order_id: orderId });
    return list.filter((i: any) => !i.deleted_at) as OrderItem[];
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    const list = await window.electronAPI.db.findMany('order_items');
    return list.filter((i: any) => !i.deleted_at) as OrderItem[];
  }

  async getTables(cafeId: string): Promise<DiningTable[]> {
    const list = await window.electronAPI.db.findMany('tables', { cafe_id: cafeId });
    return list
      .filter((t: any) => !t.deleted_at)
      .sort((a: any, b: any) => a.name.localeCompare(b.name)) as DiningTable[];
  }

  async getTableById(id: string): Promise<DiningTable | null> {
    const t = await window.electronAPI.db.findOne('tables', id);
    if (!t || t.deleted_at) return null;
    return t as DiningTable;
  }

  async updateTable(id: string, updates: Partial<DiningTable>): Promise<void> {
    await window.electronAPI.db.update('tables', id, updates as any);
  }

  async getAuditLogs(cafeId: string): Promise<OrderAuditLog[]> {
    const list = await window.electronAPI.db.findMany('order_audit_log', { cafe_id: cafeId });
    return list
      .filter((l: any) => !l.deleted_at)
      .sort((a: any, b: any) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime())
      .map((l: any) => {
        // Parse details JSON to extract legacy fields
        let parsedDetails: any = {};
        try { parsedDetails = JSON.parse(l.details || '{}'); } catch {}
        return {
          ...l,
          // Computed/aliased fields for UI compatibility
          action_type: l.action as AuditActionType,
          initiated_by_name: l.performed_by,
          initiated_by_user_id: parsedDetails.initiated_by_user_id,
          approved_by_owner_pin: parsedDetails.approved_by_owner_pin ?? true,
          order_total: parsedDetails.order_total ?? 0,
        } as OrderAuditLog;
      });
  }
}
