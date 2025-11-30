/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function generateUniqueSlug(
  supabase: any,
  name: string,
  currentId: number
) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from("grooming_services")
      .select("id")
      .eq("slug", slug)
      .neq("id", currentId)
      .maybeSingle();

    if (!data) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// -------------------------------------------------
// PATCH — Update Grooming Service
// -------------------------------------------------
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

    // Auth
    if (authError || !user) {
      return NextResponse.json(
        { message: "Anda tidak memiliki izin untuk mengakses layanan ini." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const image = formData.get("image") as File | null;

    // Required field validation
    if (!id || !name || !price) {
      return NextResponse.json(
        { message: "Beberapa field wajib belum diisi." },
        { status: 400 }
      );
    }

    // Retrieve old data
    const { data: existing, error: fetchError } = await supabase
      .from("grooming_services")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Layanan grooming tidak ditemukan." },
        { status: 404 }
      );
    }

    let imageUrl = existing.image_url;

    // Upload new image if provided
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `grooming/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("grooming-images")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("grooming-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      // Delete old image if exists
      const oldPath = existing.image_url?.split("/grooming-images/")[1];
      if (oldPath) {
        await supabase.storage.from("grooming-images").remove([oldPath]);
      }
    }

    // Generate slug
    const slug = await generateUniqueSlug(supabase, name, Number(id));

    // Update database
    const { data, error } = await supabase
      .from("grooming_services")
      .update({
        name,
        description,
        price: Number(price),
        slug,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error updating grooming service:", error.message);
    return NextResponse.json(
      { error: "Gagal memperbarui layanan grooming." },
      { status: 500 }
    );
  }
}

// -------------------------------------------------
// DELETE — Delete Grooming Service
// -------------------------------------------------
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

    // Auth
    if (authError || !user) {
      return NextResponse.json(
        { message: "Anda tidak memiliki izin untuk mengakses layanan ini." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak ditemukan pada permintaan." },
        { status: 400 }
      );
    }

    // Retrieve data to delete image
    const { data: grooming, error: fetchError } = await supabase
      .from("grooming_services")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !grooming) {
      return NextResponse.json(
        { message: "Layanan grooming tidak ditemukan." },
        { status: 404 }
      );
    }

    // Delete image file if exists
    const filePath = grooming.image_url?.split("/grooming-images/")[1];
    if (filePath) {
      await supabase.storage.from("grooming-images").remove([filePath]);
    }

    // Delete database row
    const { error } = await supabase
      .from("grooming_services")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Layanan grooming berhasil dihapus." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting grooming service:", error.message);
    return NextResponse.json(
      { error: "Gagal menghapus layanan grooming." },
      { status: 500 }
    );
  }
}
