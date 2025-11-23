import { PhotoshootPackageClient } from "@/type/photoshoot";

export async function getStudiosClient(): Promise<PhotoshootPackageClient[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/photoshoots?client=true`, {
      method: "GET",
    });
    
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch studios: ${err}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getStudiosClient error:", error);
    throw error;
  }
}