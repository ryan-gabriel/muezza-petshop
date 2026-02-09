/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const clientMode = searchParams.get("client") === "true";
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const categorySlug =
      searchParams.get("category")?.trim().toLowerCase() || "";

    // =====================================================
    // CLIENT MODE
    // =====================================================
    if (clientMode) {
      try {
        const { data: categories, error: catErr } = await supabase
          .from("product_categories")
          .select("id, name, slug")
          .order("name", { ascending: true });

        if (catErr)
          return NextResponse.json(
            {
              error: true,
              message: "Gagal memuat kategori.",
              detail: catErr.message,
            },
            { status: 500 }
          );

        const results = [];
        const discountList = [];

        for (const c of categories) {
          let query = supabase
            .from("products")
            .select("id, name, image_url, slug, created_at")
            .eq("category_id", c.id)
            .limit(3)
            .order("created_at", { ascending: false });

          if (search) {
            query = query.or(`name.ilike.%${search}%`);
          }

          const { data: products, error: prodErr } = await query;

          if (prodErr)
            return NextResponse.json(
              {
                error: true,
                message: `Gagal memuat produk untuk kategori ${c.name}.`,
                detail: prodErr.message,
              },
              { status: 500 }
            );

          const enrichedProducts = [];

          for (const p of products) {
            const { data: targets, error: targetErr } = await supabase
              .from("discount_targets")
              .select("discount_id")
              .eq("target_type", "product")
              .eq("target_id", p.id);

            if (targetErr)
              return NextResponse.json(
                {
                  error: true,
                  message: `Gagal memuat diskon produk ${p.name}.`,
                  detail: targetErr.message,
                },
                { status: 500 }
              );

            if (!targets || targets.length === 0) {
              enrichedProducts.push({ ...p, discounts: [] });
              continue;
            }

            const today = new Date().toISOString().slice(0, 10);
            const activeDiscounts = [];

            for (const t of targets) {
              const { data: discount, error: discErr } = await supabase
                .from("discounts")
                .select("*")
                .eq("id", t.discount_id)
                .lte("start_date", today)
                .gte("end_date", today)
                .maybeSingle();

              if (discErr) continue;
              if (!discount) continue;

              activeDiscounts.push(discount);

              discountList.push({
                product: {
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  image_url: p.image_url,
                },
                discount,
              });
            }

            enrichedProducts.push({ ...p, discounts: activeDiscounts });
          }

          results.push({
            category: c.name,
            slug: c.slug,
            products: enrichedProducts,
          });
        }

        return NextResponse.json(
          { error: false, products: results, discounts: discountList },
          { status: 200 }
        );
      } catch (err: any) {
        return NextResponse.json(
          {
            error: true,
            message: "Terjadi kesalahan saat memuat data client mode.",
            detail: err.message,
          },
          { status: 500 }
        );
      }
    }

    // NEW: CHECK FEATURED MODE
    const isFeatured = searchParams.get("is_featured") === "true";

    // =====================================================
    // FEATURED MODE (NO PAGINATION)
    // =====================================================
    if (isFeatured) {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(id, name, slug)")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          {
            error: true,
            message: "Gagal memuat produk featured.",
            detail: error.message,
          },
          { status: 500 }
        );
      }

      const productsWithDiscount = [];

      for (const p of data || []) {
        const { data: target } = await supabase
          .from("discount_targets")
          .select("discount_id")
          .eq("target_type", "product")
          .eq("target_id", p.id)
          .maybeSingle();

        let discount = null;

        if (target?.discount_id) {
          const { data: d } = await supabase
            .from("discounts")
            .select("*")
            .eq("id", target.discount_id)
            .eq("is_active", true)
            .maybeSingle();

          if (d) discount = d;
        }

        productsWithDiscount.push({ ...p, discount });
      }

      const serialized = productsWithDiscount.map((p) => ({
        ...p,
        created_at: p.created_at?.toISOString?.() ?? p.created_at,
        updated_at: p.updated_at?.toISOString?.() ?? p.updated_at,
        discount: p.discount
          ? {
            ...p.discount,
            created_at:
              p.discount.created_at?.toISOString?.() ?? p.discount.created_at,
            updated_at:
              p.discount.updated_at?.toISOString?.() ?? p.discount.updated_at,
          }
          : null,
      }));

      return NextResponse.json(serialized, { status: 200 });
    }

    // =====================================================
    // ADMIN MODE
    // =====================================================

    try {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let categoryId: number | null = null;

      if (categorySlug) {
        const { data: cat, error: catErr } = await supabase
          .from("product_categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();

        if (catErr)
          return NextResponse.json(
            {
              error: true,
              message: "Gagal memuat kategori.",
              detail: catErr.message,
            },
            { status: 500 }
          );

        if (!cat)
          return NextResponse.json(
            { error: true, message: "Kategori tidak ditemukan." },
            { status: 404 }
          );

        categoryId = cat.id;
      }

      let query = supabase
        .from("products")
        .select("*, product_categories(id, name, slug)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (search) {
        query = query.or(`name.ilike.%${search}%`);
      }

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error, count } = await query;

      if (error)
        return NextResponse.json(
          {
            error: true,
            message: "Gagal memuat daftar produk.",
            detail: error.message,
          },
          { status: 500 }
        );

      const productsWithDiscount = [];

      for (const p of data || []) {
        const { data: target } = await supabase
          .from("discount_targets")
          .select("discount_id")
          .eq("target_type", "product")
          .eq("target_id", p.id)
          .maybeSingle();

        let discount = null;

        if (target?.discount_id) {
          const { data: d } = await supabase
            .from("discounts")
            .select("*")
            .eq("id", target.discount_id)
            .eq("is_active", true)
            .maybeSingle();

          if (d) discount = d;
        }

        productsWithDiscount.push({ ...p, discount });
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      return NextResponse.json(
        {
          error: false,
          count: count || 0,
          totalPages,
          next: page < totalPages ? page + 1 : null,
          previous: page > 1 ? page - 1 : null,
          results: productsWithDiscount,
        },
        { status: 200 }
      );
    } catch (err: any) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal memuat data produk.",
          detail: err.message,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan tak terduga pada server.",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // =============================
    // 1. CEK AUTH USER
    // =============================
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: true,
          message: "Akses ditolak. Anda harus login terlebih dahulu.",
          detail: authError?.message || null,
        },
        { status: 401 }
      );
    }

    // =============================
    // 2. AMBIL FORM DATA
    // =============================
    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const category_id = Number(formData.get("category"));
    const is_featured = Boolean(formData.get("is_featured"));
    const image = formData.get("image");

    // =============================
    // 3. VALIDASI FIELD
    // =============================
    const missingFields: string[] = [];

    if (!name) missingFields.push("nama produk");
    if (!category_id) missingFields.push("kategori");
    if (!image || !(image instanceof File)) {
      missingFields.push("gambar produk");
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: true,
          message: "Data yang dibutuhkan belum lengkap.",
          detail: `Field yang kurang: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Pada titik ini, image sudah aman menjadi File
    const file = image as File;

    // =============================
    // 4. GENERATE SLUG UNIK
    // =============================
    let slug = generateSlug(name as string);
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const { data: exists } = await supabase
        .from("products")
        .select("id")
        .eq("slug", uniqueSlug)
        .maybeSingle();

      if (!exists) break;
      uniqueSlug = `${slug}-${counter++}`;
    }

    slug = uniqueSlug;

    // =============================
    // 5. UPLOAD GAMBAR
    // =============================
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal mengunggah gambar.",
          detail: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // =============================
    // 6. SIMPAN PRODUK KE DATABASE
    // =============================
    const { data, error } = await supabase
      .from("products")
      .insert([
        { name, category_id, image_url: imageUrl, slug, is_featured },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal menyimpan produk ke database.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    // =============================
    // 7. SUCCESS RESPONSE
    // =============================
    return NextResponse.json(
      {
        error: false,
        message: "Produk berhasil dibuat.",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan pada server.",
        detail: error?.message || null,
      },
      { status: 500 }
    );
  }
}
