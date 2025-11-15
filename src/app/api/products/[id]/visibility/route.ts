import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // 🔐 Ambil user logged in
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ambil ID produk
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Missing product ID" },
        { status: 400 }
      );
    }

    // Ambil body
    const body = await req.json();
    const { visibility } = body;

    // Validasi
    if (visibility === undefined || visibility === null) {
      return NextResponse.json(
        { message: "Visibility value is required" },
        { status: 400 }
      );
    }

    // Update visibility saja
    const { data, error } = await supabase
      .from("products")
      .update({
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating product visibility:", error.message);
    return NextResponse.json(
      { error: "Failed to update product visibility" },
      { status: 500 }
    );
  }
}
