// Encapsulates all schema transformations and normalizations when sending payload
// from local SQLite / Drizzle to remote Supabase cloud schema.
function toSupabasePayload(tableName, payload) {
  const normalized = { ...payload };

  if (tableName === 'expenses') {
    normalized.expense_date ??= normalized.date;
    delete normalized.date;
  }

  if (tableName === 'purchases') {
    normalized.amount_remaining ??= Math.max(
      0,
      Number(normalized.total_amount || 0) - Number(normalized.amount_paid || 0)
    );
  }

  if (tableName === 'order_audit_log') {
    // Older deployed databases use action_type, while the local model uses
    // action. The migration keeps both columns available during the upgrade.
    normalized.action_type ??= normalized.action;

    // The deployed audit table also stores the initiating user separately.
    // Local records keep it inside the JSON `details` field, so unpack it for
    // both newly queued and legacy failed records.
    if (normalized.details) {
      try {
        const details = typeof normalized.details === 'string'
          ? JSON.parse(normalized.details)
          : normalized.details;
        normalized.initiated_by_user_id ??= details?.initiated_by_user_id;
        normalized.initiated_by_name ??= details?.initiated_by_name;
        normalized.order_total ??= details?.order_total;
        normalized.approved_by_owner_pin ??= details?.approved_by_owner_pin;
      } catch {
        // The database will retain the item with a useful error if details is malformed.
      }
    }
    normalized.initiated_by_name ??= normalized.performed_by;
  }

  if (tableName === 'daily_closings') {
    normalized.created_at ??= normalized.closed_at || new Date().toISOString();
  }

  if (tableName === 'daily_closing_items') {
    normalized.created_at ??= new Date().toISOString();
  }

  return normalized;
}

module.exports = {
  toSupabasePayload,
};
