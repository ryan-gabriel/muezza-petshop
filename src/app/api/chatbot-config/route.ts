import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET: Ambil prompt saat ini
export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("chatbot_config")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return NextResponse.json({ prompt_text: "" }, { status: 200 }); // Return empty if not found
  }
}

// POST: Simpan/Update prompt
export async function POST(req: Request) {
  const supabase = await createClient();
  
  // Cek Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { prompt_text } = await req.json();

  // Cek apakah sudah ada data
  const { data: existing } = await supabase
    .from("chatbot_config")
    .select("id")
    .limit(1)
    .single();

  let error;
  
  if (existing) {
    // Update jika ada
    const { error: updateError } = await supabase
      .from("chatbot_config")
      .update({ prompt_text, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    error = updateError;
  } else {
    // Insert jika belum ada
    const { error: insertError } = await supabase
      .from("chatbot_config")
      .insert([{ prompt_text }]);
    error = insertError;
  }

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Prompt berhasil disimpan" });
}