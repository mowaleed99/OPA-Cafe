export interface AppSettings {
  id: string;
  cafe_id: string;
  language: string;
  cafe_name: string;
  currency: string;
  print_paper_size: string;
  cashier_permissions: string; // JSON string
  owner_pin_hash: string | null;
  deleted_at?: string;
}

export interface ISettingsRepository {
  getSettings(cafeId: string): Promise<AppSettings | null>;
  createSettings(settings: AppSettings): Promise<void>;
  updateSettings(id: string, updates: Partial<AppSettings>): Promise<void>;
}
