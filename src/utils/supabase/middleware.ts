// lib/supabase-server.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export function createClient(request: NextRequest) {
  // Buat response default (untuk update cookies nanti)
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Buat Supabase client
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Return dua hal: client & response
  return { supabase, response };
}
