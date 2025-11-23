import { HotelClient } from "@/type/hotel";

export async function getHotelsClient(): Promise<HotelClient[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/hotel?client=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch hotels: ${err}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getHotelsClient error:", error);
    throw error;
  }
}