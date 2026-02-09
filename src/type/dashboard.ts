// types/dashboard.ts

export interface Product {
  id: number;
  name: string;
  category_id: number | null;
  category: string | null;
  visibility: boolean;
  created_at: string; // ISO string
}

export interface ProductByCategory {
  category: string;
  count: number;
}

export interface AddonService {
  id: number;
  name: string;
}

export interface ActiveDiscount {
  discount_id: number;
  target_type: "product" | "hotel" | "grooming" | "addon" | "photoshoot";
  target_id: number;
}

export interface DashboardOverviewResponse {
  total_products: number;
  products_by_category: ProductByCategory[];
  recent_products: Product[];
  addon_services: AddonService[];
  active_discounts: ActiveDiscount[];
}