export type AuditActionType = 'void' | 'refund';

export interface OrderAuditLog {
  id: string;
  cafe_id: string;
  order_id: string;
  // DB schema fields (action, performed_by, timestamp, details)
  action: AuditActionType;
  performed_by: string;        // cashier name
  timestamp: string;           // ISO datetime
  reason?: string | null;
  details?: string | null;     // JSON: { initiated_by_user_id, approved_by_owner_pin, order_total }
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;

  // Computed getters for UI compatibility (derived from `details` JSON)
  action_type?: AuditActionType;      // alias for action
  initiated_by_name?: string;         // alias for performed_by
  initiated_by_user_id?: string;      // parsed from details
  approved_by_owner_pin?: boolean;    // parsed from details
  order_total?: number;               // parsed from details
}
