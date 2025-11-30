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
      .from("addon_services")
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
        { message: "Tidak memiliki izin (Unauthorized)." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;

    // Validation
    if (!name || !price) {
      return NextResponse.json(
        { message: "Field yang wajib diisi tidak lengkap." },
        { status: 400 }
      );
    }

    // Ensure record exists
    const { data: existing, error: fetchError } = await supabase
      .from("addon_services")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Layanan tambahan tidak ditemukan." },
        { status: 404 }
      );
    }

    const slug = await generateUniqueSlug(supabase, name, Number(id));

    // Update
    const { data, error } = await supabase
      .from("addon_services")
      .update({
        name,
        description,
        price: Number(price),
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error updating addon service:", error.message);
    return NextResponse.json(
      { error: "Gagal memperbarui layanan tambahan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        { message: "Tidak memiliki izin (Unauthorized)." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check existence
    const { data: existing, error: fetchError } = await supabase
      .from("addon_services")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Layanan tambahan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Delete
    const { error: deleteError } = await supabase
      .from("addon_services")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: "Layanan tambahan berhasil dihapus." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting addon service:", error.message);
    return NextResponse.json(
      { error: "Gagal menghapus layanan tambahan." },
      { status: 500 }
    );
  }
}
