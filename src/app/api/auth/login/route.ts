import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // The session is automatically set in cookies by the Supabase client
  return NextResponse.json({ user: data.user }, { status: 200 });
}