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
  title: string,
  currentId: number
) {
  const baseSlug = slugify(title);
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

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const image = formData.get("image") as File | null;

    if (!title || !price) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("addon_services")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Addon service not found" },
        { status: 404 }
      );
    }

    let imageUrl = existing.image_url;

    if (image) {
      const ext = image.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `addon-services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("addon-service-images")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("addon-service-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      const oldPath = existing.image_url?.split("/addon-service-images/")[1];
      if (oldPath) {
        await supabase.storage.from("addon-service-images").remove([oldPath]);
      }
    }

    const slug = await generateUniqueSlug(supabase, title, Number(id));

    const { data, error } = await supabase
      .from("addon_services")
      .update({
        title,
        description,
        price: Number(price),
        image_url: imageUrl,
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
      { error: "Failed to update addon service" },
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

    // AUTH CHECK
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch existing data including image
    const { data: existing, error: fetchError } = await supabase
      .from("addon_services")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Addon service not found" },
        { status: 404 }
      );
    }

    // DELETE IMAGE from storage
    if (existing.image_url) {
      const oldPath = existing.image_url.split("/addon-service-images/")[1];

      if (oldPath) {
        await supabase.storage.from("addon-service-images").remove([oldPath]);
      }
    }

    // DELETE RECORD
    const { error: deleteError } = await supabase
      .from("addon_services")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: "Addon service deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting addon service:", error.message);
    return NextResponse.json(
      { error: "Failed to delete addon service" },
      { status: 500 }
    );
  }
}
