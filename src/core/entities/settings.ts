export interface Settings {
  id: string;
  cafe_id: string;
  cafe_name: string;
  logo_url?: string | null;
  currency: string;
  tax_rate: number;
  print_settings: Record<string, unknown>;
}
