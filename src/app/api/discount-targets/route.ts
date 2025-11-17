import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const search = searchParams.get("search") || "";

  if (!type) {
    return NextResponse.json(
      { message: "Missing target type" },
      { status: 400 }
    );
  }

  const tableMap: Record<string, string> = {
    product: "products",
    hotel: "pet_hotel_rooms",
    grooming: "grooming_services",
    addon: "addon_services",
    photoshoot: "photoshoot_packages",
  };

  const table = tableMap[type];
  if (!table) {
    return NextResponse.json(
      { message: "Invalid target type" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from(table)
    .select("id, name")
    .ilike("name", `%${search}%`)

  if (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch targets" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
