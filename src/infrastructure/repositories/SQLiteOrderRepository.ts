import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order, OrderItem } from '../../domain/entities/order';
import { OrderAuditLog, AuditActionType } from '../../domain/entities/order_audit_log';
import { DiningTable } from '../../domain/entities/table';
import { BaseElectronRepository } from './BaseElectronRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';

export class SQLiteOrderRepository extends BaseElectronRepository<Order> implements IOrderRepository {
  constructor(dbDriver?: IDatabaseDriver) {
    super('orders', dbDriver);
  }

  async getOrders(cafeId: string): Promise<Order[]> {
    const list = await this.dbDriver.findMany('orders', { cafe_id: cafeId }, {
      orderBy: { column: 'created_at', direction: 'desc' }
    });
    return list.filter((o: any) => !o.deleted_at) as Order[];
  }

  async getOrdersByDateRange(cafeId: string, startTime: string, endTime: string): Promise<Order[]> {
    const list = await this.dbDriver.findMany('orders', {
      cafe_id: cafeId,
      created_at: { $gt: startTime, $lte: endTime }
    }, {
      orderBy: { column: 'created_at', direction: 'desc' }
    } as any);
    return list.filter((o: any) => !o.deleted_at) as Order[];
  }

  async getOrderById(id: string): Promise<Order | null> {
    const o = await this.dbDriver.findOne('orders', id);
    if (!o || o.deleted_at) return null;
    return o as Order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const list = await this.dbDriver.findMany('order_items', { order_id: orderId });
    return list.filter((i: any) => !i.deleted_at) as OrderItem[];
  }

  async getOrderItemsByOrderIds(orderIds: string[]): Promise<OrderItem[]> {
    if (!orderIds || orderIds.length === 0) return [];
    const chunks: string[][] = [];
    for (let i = 0; i < orderIds.length; i += 200) {
      chunks.push(orderIds.slice(i, i + 200));
    }
    const results: OrderItem[] = [];
    for (const chunk of chunks) {
      const list = await this.dbDriver.findMany('order_items', {
        order_id: { $in: chunk }
      } as any);
      const valid = list.filter((i: any) => !i.deleted_at) as OrderItem[];
      results.push(...valid);
    }
    return results;
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    const list = await this.dbDriver.findMany('order_items');
    return list.filter((i: any) => !i.deleted_at) as OrderItem[];
  }

  async getTables(cafeId: string): Promise<DiningTable[]> {
    const list = await this.dbDriver.findMany('tables', { cafe_id: cafeId });
    return list
      .filter((t: any) => !t.deleted_at)
      .sort((a: any, b: any) => a.name.localeCompare(b.name)) as DiningTable[];
  }

  async getTableById(id: string): Promise<DiningTable | null> {
    const t = await this.dbDriver.findOne('tables', id);
    if (!t || t.deleted_at) return null;
    return t as DiningTable;
  }

  async updateTable(id: string, updates: Partial<DiningTable>): Promise<void> {
    await this.dbDriver.update('tables', id, updates as any);
  }

  async getAuditLogs(cafeId: string): Promise<OrderAuditLog[]> {
    const list = await this.dbDriver.findMany('order_audit_log', { cafe_id: cafeId });
    return list
      .filter((l: any) => !l.deleted_at)
      .sort((a: any, b: any) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime())
      .map((l: any) => {
        let parsedDetails: any = {};
        try { parsedDetails = JSON.parse(l.details || '{}'); } catch {}
        return {
          ...l,
          action_type: l.action as AuditActionType,
          initiated_by_name: l.performed_by,
          initiated_by_user_id: parsedDetails.initiated_by_user_id,
          approved_by_owner_pin: parsedDetails.approved_by_owner_pin ?? true,
          order_total: parsedDetails.order_total ?? 0,
        } as OrderAuditLog;
      });
  }
}
