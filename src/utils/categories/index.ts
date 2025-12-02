import { ProductCategory } from "@/type/productCategory";

export async function getCategories(
  search?: string
): Promise<ProductCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Build URL dengan search param jika ada
    const url = new URL(`${baseUrl}/api/product-categories`);
    if (search) url.searchParams.append("search", search);

    const res = await fetch(url.toString(), {});

    if (!res.ok)
      throw new Error(`Failed to fetch categories: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}
