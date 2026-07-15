import { orderRepository } from '../../../infrastructure/repositories/index';
import type { OrderAuditLog } from '../../../domain/entities/order_audit_log';

interface AuditLogFilters {
  from?: string;   // ISO date string YYYY-MM-DD
  to?: string;     // ISO date string YYYY-MM-DD
  userId?: string; // Filter by initiated_by_user_id
}

export async function getAuditLog(
  cafeId: string,
  filters: AuditLogFilters = {}
): Promise<OrderAuditLog[]> {
  let entries = await orderRepository.getAuditLogs(cafeId);

  // Apply date filters
  if (filters.from) {
    const fromDate = filters.from + 'T00:00:00.000Z';
    entries = entries.filter(e => (e.timestamp || e.created_at) >= fromDate);
  }
  if (filters.to) {
    const toDate = filters.to + 'T23:59:59.999Z';
    entries = entries.filter(e => (e.timestamp || e.created_at) <= toDate);
  }

  // Apply user filter (matches on initiated_by_user_id extracted from details, or performed_by name)
  if (filters.userId) {
    entries = entries.filter(e => e.initiated_by_user_id === filters.userId);
  }

  return entries;
}
