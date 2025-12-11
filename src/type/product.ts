import { Discount } from "./discount";

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  product_categories: { name: string; slug: string; id: number };
  created_at: string;
  visibility: boolean;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: number;
}

export interface PaginatedResponse<T> {
  count: number;
  totalPages: number;
  next: number | null;
  previous: number | null;
  results: T[];
}

export interface ProductCategoryGroup {
  category: string;
  slug: string;
  description: string;
  products: (Omit<Omit<Product, "visibility">, "product_categories"> & {
    discount: Discount | null;
  })[];
}

export interface DiscountProduct {
  product: Omit<Product, "visibility" | "product_categories" | "description">;
  discount: Discount;
}

export interface ProductClientResponse {
  products: ProductCategoryGroup[];
  discounts: DiscountProduct[];
}

