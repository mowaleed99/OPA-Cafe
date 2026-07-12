export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  cafe_id: string;
  category_id: string;
  name: string;
  price: number;
  cost: number;
  image_url?: string | null;
  status: ProductStatus;
  track_stock: boolean;
  inventory_item_id?: string | null;
  created_at: string;
}
