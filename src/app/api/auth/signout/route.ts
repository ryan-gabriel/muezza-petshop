import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase signOut error:", error.message);
      return NextResponse.json(
        { message: "Failed to sign out", error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in /api/auth/signout:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
