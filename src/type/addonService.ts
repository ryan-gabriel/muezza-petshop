import { Discount } from "./discount";

export interface AddonService {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  slug: string;
}

export interface AddonServiceClient extends AddonService {
  discount: Discount | null;
}
