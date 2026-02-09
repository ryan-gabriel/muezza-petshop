import { Discount } from "./discount";

export type PetHotelRoom = {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export interface HotelClient extends PetHotelRoom {
  discount: Discount | null;
}
