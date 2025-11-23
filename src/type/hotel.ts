import { Discount } from "./discount";

export type PetHotelRoom = {
  id: number;
  name: string;
  description: string | null;
  price_per_night: number;
  image_url: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export interface HotelClient extends PetHotelRoom {
  discount: Discount | null;
}
