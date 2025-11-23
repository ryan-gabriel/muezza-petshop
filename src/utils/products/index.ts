import {
  PaginatedResponse,
  Product,
  ProductClientResponse,
} from "@/type/product";

export async function getPaginatedProducts(
  page = 1,
  pageSize = 10,
  search?: string
): Promise<PaginatedResponse<Product>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Build URL with optional search
    const url = new URL(`${baseUrl}/api/products`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("pageSize", pageSize.toString());
    if (search && search.trim() !== "") {
      url.searchParams.set("search", search.trim());
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 0 }, // disable caching
    });

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
      headers: {
        "Content-Type": "application/json",
      },
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
