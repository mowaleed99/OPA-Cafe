import { db } from '../../../infrastructure/database/db';
import type { OrderAuditLog } from '../../../core/entities/order_audit_log';

interface AuditLogFilters {
  from?: string;   // ISO date string YYYY-MM-DD
  to?: string;     // ISO date string YYYY-MM-DD
  userId?: string; // Filter by initiated_by_user_id
}

export async function getAuditLog(
  cafeId: string,
  filters: AuditLogFilters = {}
): Promise<OrderAuditLog[]> {
  let entries = await db.order_audit_log
    .where('cafe_id')
    .equals(cafeId)
    .reverse()
    .sortBy('created_at');

  // Apply date filters
  if (filters.from) {
    const fromDate = filters.from + 'T00:00:00.000Z';
    entries = entries.filter(e => e.created_at >= fromDate);
  }
  if (filters.to) {
    const toDate = filters.to + 'T23:59:59.999Z';
    entries = entries.filter(e => e.created_at <= toDate);
  }

  // Apply user filter
  if (filters.userId) {
    entries = entries.filter(e => e.initiated_by_user_id === filters.userId);
  }

  return entries;
}
