/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

async function generateUniqueSlug(
  supabase: any,
  name: string,
  currentId?: number
) {
  const baseSlug = generateSlug(name);

  const { data: existingSlugs } = await supabase
    .from("product_categories")
    .select("id, slug")
    .ilike("slug", `${baseSlug}%`);

  if (!existingSlugs || existingSlugs.length === 0) return baseSlug;

  const slugSet = new Set(
    existingSlugs
      .filter((s: any) => s.id !== currentId)
      .map((s: any) => s.slug)
  );

  let counter = 1;
  let uniqueSlug = baseSlug;

  while (slugSet.has(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: true,
          message: "Tidak memiliki izin untuk mengakses.",
          detail: "User tidak terautentikasi."
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          error: true,
          message: "Data tidak lengkap.",
          detail: "ID kategori wajib diisi."
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, slug, description } = body;

    const missing: string[] = [];
    if (!name) missing.push("nama kategori");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: true,
          message: "Data tidak lengkap.",
          detail: `Field yang belum diisi: ${missing.join(", ")}`
        },
        { status: 400 }
      );
    }

    const finalSlug =
      slug?.trim() ||
      (await generateUniqueSlug(supabase, name, Number(id)));

    const { data, error } = await supabase
      .from("product_categories")
      .update({
        name,
        slug: finalSlug,
        description,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal memperbarui kategori.",
          detail: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan pada server.",
        detail: err.message
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
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: true,
          message: "Tidak memiliki izin untuk mengakses.",
          detail: "User tidak terautentikasi."
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          error: true,
          message: "Data tidak lengkap.",
          detail: "ID kategori wajib diisi."
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal menghapus kategori.",
          detail: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil dihapus."
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan pada server.",
        detail: err.message
      },
      { status: 500 }
    );
  }
}
