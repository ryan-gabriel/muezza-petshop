export interface Discount {
  id: number;
  title: string;
  description?: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  target_type?: string;
  target_id?: number;
  target_name?: string;
}
