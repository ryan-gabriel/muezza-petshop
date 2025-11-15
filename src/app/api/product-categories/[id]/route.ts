/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

async function generateUniqueSlug(supabase: any, name: string, currentId?: number) {
  const baseSlug = generateSlug(name);

  // Ambil semua slug yang mirip kecuali kategori yang sedang diupdate
  const { data: existingSlugs } = await supabase
    .from("product_categories")
    .select("id, slug")
    .ilike("slug", `${baseSlug}%`);

  if (!existingSlugs || existingSlugs.length === 0) return baseSlug;

  let counter = 1;
  let uniqueSlug = baseSlug;
  const slugSet = new Set(
    existingSlugs.filter((s: any) => s.id !== currentId).map((s: any) => s.slug)
  );

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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing category ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, slug, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const finalSlug = slug?.trim() || await generateUniqueSlug(supabase, name, Number(id));

    const { data, error } = await supabase
      .from("product_categories")
      .update({
        name,
        slug: finalSlug,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error updating category:", error.message);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
      return NextResponse.json({ message: "Missing category ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting category:", error.message);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
