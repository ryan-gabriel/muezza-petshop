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
      .from("pet_hotel_rooms")
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
// PATCH — Update Pet Hotel Room
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
    const description = formData.get("description") as string;
    const price_per_night = formData.get("price_per_night") as string;
    const image = formData.get("image") as File | null;

    if (!id || !name || !price_per_night) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Retrieve old record
    const { data: existing, error: fetchError } = await supabase
      .from("pet_hotel_rooms")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Pet hotel room not found" },
        { status: 404 }
      );
    }

    let imageUrl = existing.image_url;

    // Upload new image if provided
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `pet-hotel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pet-hotel-images")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("pet-hotel-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      // delete old file
      const oldPath = existing.image_url?.split("/pet-hotel-images/")[1];
      if (oldPath) {
        await supabase.storage.from("pet-hotel-images").remove([oldPath]);
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(supabase, name, Number(id));

    // Update DB
    const { data, error } = await supabase
      .from("pet_hotel_rooms")
      .update({
        name,
        description,
        price_per_night: Number(price_per_night),
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
    console.error("Error updating pet hotel room:", error.message);
    return NextResponse.json(
      { error: "Failed to update pet hotel room" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------
// DELETE — Delete Pet Hotel Room
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
    const { data: room, error: fetchError } = await supabase
      .from("pet_hotel_rooms")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !room) {
      return NextResponse.json(
        { message: "Pet hotel room not found" },
        { status: 404 }
      );
    }

    // delete image file
    const filePath = room.image_url?.split("/pet-hotel-images/")[1];
    if (filePath) {
      await supabase.storage.from("pet-hotel-images").remove([filePath]);
    }

    // delete record
    const { error } = await supabase
      .from("pet_hotel_rooms")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Pet hotel room deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting pet hotel room:", error.message);
    return NextResponse.json(
      { error: "Failed to delete pet hotel room" },
      { status: 500 }
    );
  }
}
