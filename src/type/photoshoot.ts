import { Discount } from "./discount";

export type PhotoshootPackage = {
  id: number;
  name: string;
  features: string[];
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export interface PhotoshootPackageClient extends PhotoshootPackage {
  discount: Discount | null;
}
