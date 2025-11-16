export interface GroomingService {
  id: number;
  name: string;
  description?: string | null;
  image_url: string;
  created_at?: string;
  updated_at?: string;
  price: number;
}
