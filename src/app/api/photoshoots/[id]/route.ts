/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// -------------------------------------------------
// UTIL — SLUGIFY
// -------------------------------------------------
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// -------------------------------------------------
// UTIL — Generate unique slug excluding current ID
// -------------------------------------------------
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
      .from("photoshoot_packages")
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
// PATCH — Update Photoshoot Package
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

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const featuresRaw = formData.get("features") as string; // comma separated
    const image = formData.get("image") as File | null;

    if (!id || !name || !price) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Retrieve old record
    const { data: existing, error: fetchError } = await supabase
      .from("photoshoot_packages")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Photoshoot package not found" },
        { status: 404 }
      );
    }

    let imageUrl = existing.image_url;

    // Convert features string → array
    let features: string[] = [];

    if (featuresRaw) {
      try {
        // If raw is valid JSON array → parse it
        if (featuresRaw.startsWith("[") && featuresRaw.endsWith("]")) {
          features = JSON.parse(featuresRaw);
        } else {
          // fallback: comma separated
          features = featuresRaw.split(",").map((s) => s.trim());
        }
      } catch {
        // fallback jika parsing gagal
        features = featuresRaw.split(",").map((s) => s.trim());
      }
    }

    // Upload new image if provided
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `photoshoot/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("photoshoot-images")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("photoshoot-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      // delete old file
      const oldPath = existing.image_url?.split("/photoshoot-images/")[1];
      if (oldPath) {
        await supabase.storage.from("photoshoot-images").remove([oldPath]);
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(supabase, name, Number(id));

    // Update DB
    const { data, error } = await supabase
      .from("photoshoot_packages")
      .update({
        name,
        price: Number(price),
        features,
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
    console.error("Error updating photoshoot package:", error.message);
    return NextResponse.json(
      { error: "Failed to update photoshoot package" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------
// DELETE — Delete Photoshoot Package
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

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get existing record to remove image
    const { data: pkg, error: fetchError } = await supabase
      .from("photoshoot_packages")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !pkg) {
      return NextResponse.json(
        { message: "Photoshoot package not found" },
        { status: 404 }
      );
    }

    // delete image file
    const filePath = pkg.image_url?.split("/photoshoot-images/")[1];
    if (filePath) {
      await supabase.storage.from("photoshoot-images").remove([filePath]);
    }

    // delete record
    const { error } = await supabase
      .from("photoshoot_packages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Photoshoot package deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting photoshoot package:", error.message);
    return NextResponse.json(
      { error: "Failed to delete photoshoot package" },
      { status: 500 }
    );
  }
}
