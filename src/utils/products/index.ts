import {
  PaginatedResponse,
  Product,
  ProductClientResponse,
} from "@/type/product";

export async function getPaginatedProducts(
  page = 1,
  pageSize = 10,
  search?: string,
  category?: string
): Promise<PaginatedResponse<Product>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const url = new URL(`${baseUrl}/api/products`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("pageSize", pageSize.toString());

    // 🔍 Search (optional)
    if (search && search.trim() !== "") {
      url.searchParams.set("search", search.trim());
    }

    // 🏷 Category (optional)
    if (category && category.trim() !== "") {
      url.searchParams.set("category", category.trim());
    }

    const res = await fetch(url.toString(), {});

    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);

    const data = await res.json();

    return {
      count: data.count ?? 0,
      totalPages: data.totalPages ?? 0,
      next: data.next ?? null,
      previous: data.previous ?? null,
      results: data.results ?? [],
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return { count: 0, totalPages: 0, next: null, previous: null, results: [] };
  }
}

export async function getProductClient(): Promise<ProductClientResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products?client=true`, {
      method: "GET",
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch products: ${err}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getProductClient error:", error);
    throw error;
  }
}
