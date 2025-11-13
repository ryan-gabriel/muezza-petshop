export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category: number;
  created_at: string;
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
