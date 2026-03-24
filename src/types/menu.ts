export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  created_at: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface SaleRecord {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  payment_method: string;
  created_at: string;
}
