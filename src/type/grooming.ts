import { Discount } from "./discount";

export interface GroomingService {
  id: number;
  name: string;
  description?: string | null;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface GroomingClient extends GroomingService {
  discount: Discount | null;
}
