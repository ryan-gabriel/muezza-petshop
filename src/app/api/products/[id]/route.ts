/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses.",
          detail: authError?.message || "Unauthorized user",
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category_id = Number(formData.get("category"));
    const is_featured = Boolean(formData.get("is_featured"));
    const image = formData.get("image") as File | null;

    const { id } = await params;

    // VALIDASI DATA
    const missing: string[] = [];
    if (!id) missing.push("id");
    if (!name) missing.push("nama produk");
    if (!category_id) missing.push("kategori");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap.",
          detail: `Field yang belum diisi: ${missing.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Ambil produk lama
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan.",
          detail: fetchError?.message,
        },
        { status: 404 }
      );
    }

    let imageUrl = existingProduct.image_url;

    // Jika ada upload gambar baru
    if (image) {
      try {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, image, { upsert: false });

        if (uploadError) {
          return NextResponse.json(
            {
              success: false,
              message: "Gagal mengupload gambar.",
              detail: uploadError.message,
            },
            { status: 500 }
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;

        // Hapus file lama
        const oldPath = existingProduct.image_url?.split("/product-images/")[1];
        if (oldPath) {
          await supabase.storage.from("product-images").remove([oldPath]);
        }
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            message: "Terjadi kesalahan saat mengolah gambar.",
            detail: err.message,
          },
          { status: 500 }
        );
      }
    }

    // Update produk
    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        category_id,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
        is_featured,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal memperbarui produk.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil diperbarui.",
        data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses.",
          detail: authError?.message || "Unauthorized user",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID produk tidak diberikan.",
          detail: "Parameter id diperlukan.",
        },
        { status: 400 }
      );
    }

    // Ambil produk untuk hapus gambar
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan.",
          detail: fetchError?.message,
        },
        { status: 404 }
      );
    }

    // Hapus file dari storage
    const filePath = product.image_url?.split("/product-images/")[1];
    if (filePath) {
      await supabase.storage.from("product-images").remove([filePath]);
    }

    // Hapus dari database
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal menghapus produk.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil dihapus.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
