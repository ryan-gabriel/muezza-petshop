export interface AddonService {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  created_at: string;
  updated_at: string;
  slug: string;
}
