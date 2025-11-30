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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const category_id = Number(formData.get("category"));
    const description = formData.get("description") as string;
    const image = formData.get("image") as File | null;
    const { id } = await params;

    if (!id || !name || !price || !category_id || !description) {
      return NextResponse.json(
        { message: "Missing required fields" },
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
        { message: "Product not found" },
        { status: 404 }
      );
    }

    let imageUrl = existingProduct.image_url;

    // Jika upload gambar baru
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, image, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      // Hapus file lama (opsional)
      const oldPath = existingProduct.image_url?.split("/product-images/")[1];
      if (oldPath) {
        await supabase.storage.from("product-images").remove([oldPath]);
      }
    }

    // Update produk
    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        price,
        category_id,
        description,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating product:", error.message);
    return NextResponse.json(
      { error: "Failed to update product" },
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing product ID" },
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
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Hapus file dari storage jika ada
    const filePath = product.image_url?.split("/product-images/")[1];
    if (filePath) {
      await supabase.storage.from("product-images").remove([filePath]);
    }

    // Hapus dari database
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error deleting product:", error.message);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
