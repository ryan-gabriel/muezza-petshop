export interface AddonService {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  created_at: string;
  updated_at: string;
  slug: string;
}
