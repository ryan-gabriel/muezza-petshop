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
      .from("branches")
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

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const google_map_url = formData.get("google_map_url") as string;
    const image = formData.get("image") as File | null;

    if (!id || !name || !description || !google_map_url) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ambil branch lama
    const { data: existingBranch, error: fetchError } = await supabase
      .from("branches")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existingBranch) {
      return NextResponse.json(
        { message: "Branch not found" },
        { status: 404 }
      );
    }

    let imageUrl = existingBranch.image_url;

    // Upload image baru jika ada
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `branches/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("branch-images")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("branch-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      // Hapus gambar lama
      const oldPath = existingBranch.image_url?.split("/branch-images/")[1];
      if (oldPath) {
        await supabase.storage.from("branch-images").remove([oldPath]);
      }
    }

    // 🔥 Generate slug baru + unique
    const slug = await generateUniqueSlug(supabase, name, Number(id));

    // Update DB
    const { data, error } = await supabase
      .from("branches")
      .update({
        name,
        slug,
        description,
        google_map_url,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error updating branch:", error.message);
    return NextResponse.json(
      { error: "Failed to update branch" },
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
        { message: "Missing branch ID" },
        { status: 400 }
      );
    }

    // Ambil branch untuk hapus gambar
    const { data: branch, error: fetchError } = await supabase
      .from("branches")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !branch) {
      return NextResponse.json(
        { message: "Branch not found" },
        { status: 404 }
      );
    }

    // Hapus gambar dari storage
    const filePath = branch.image_url?.split("/branch-images/")[1];
    if (filePath) {
      await supabase.storage.from("branch-images").remove([filePath]);
    }

    // Hapus row
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json(
      { message: "Branch deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting branch:", error.message);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}
