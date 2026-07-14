export type AuditActionType = 'void' | 'refund';

export interface OrderAuditLog {
  id: string;
  cafe_id: string;
  order_id: string;
  action_type: AuditActionType;
  initiated_by_user_id: string;   // cashier who clicked void/refund
  initiated_by_name: string;      // denormalized for display
  approved_by_owner_pin: boolean; // always true — PIN required to authorize
  reason?: string | null;
  order_total: number;            // snapshot of order total at time of action
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
