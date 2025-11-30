/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Ambil query search (opsional)
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    // ---- Produk ----
    let productsQuery = supabase
      .from("products")
      .select("id,name,category_id,visibility,created_at")
      .order("created_at", { ascending: false });

    if (search) {
      productsQuery = productsQuery.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const { data: productsData, error: productsError } = await productsQuery;
    if (productsError) throw productsError;

    // ---- Kategori ----
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("product_categories")
      .select("id,name");
    if (categoriesError) throw categoriesError;

    // Gabungkan nama kategori ke produk
    const productsWithCategory = productsData?.map((p: any) => ({
      ...p,
      category: categoriesData?.find((c: any) => c.id === p.category_id)?.name || null
    })) || [];

    // Total produk
    const totalProducts = productsWithCategory.length;

    // Produk per kategori
    const productsByCategory = categoriesData?.map((c: any) => ({
      category: c.name,
      count: productsWithCategory.filter((p: any) => p.category_id === c.id).length
    })) || [];

    // Recent products (ambil 5 terbaru)
    const recentProducts = productsWithCategory.slice(0, 5);

    // ---- Addon Services ----
    const { data: addonServices, error: addonError } = await supabase
      .from("addon_services")
      .select("id,name,price");
    if (addonError) throw addonError;

    // ---- Active Discounts ----
    const { data: activeDiscounts, error: discountError } = await supabase
      .from("discount_targets")
      .select("discount_id,target_type,target_id");
    if (discountError) throw discountError;

    return NextResponse.json({
      total_products: totalProducts,
      products_by_category: productsByCategory,
      recent_products: recentProducts,
      addon_services: addonServices || [],
      active_discounts: activeDiscounts || []
    });

  } catch (error: any) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json(
      { error: error?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
