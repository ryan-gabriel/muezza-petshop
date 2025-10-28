// middleware.js
import { NextResponse } from "next/server";
import { createClient } from "./utils/supabase/middleware";

export async function middleware(request) {
  const { supabase, response } = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // 🚫 Belum login → ke /login
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Sudah login tapi buka /login → ke dashboard
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // lanjutkan request + response yang mengandung cookies baru
  return response;
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
