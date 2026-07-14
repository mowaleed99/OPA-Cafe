export interface Settings {
  id: string;
  cafe_id: string;
  cafe_name: string;
  logo_url?: string | null;
  language: string;
  print_paper_size: string;
  cashier_permissions?: string[];
  currency?: string;
  owner_pin_hash?: string | null;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
