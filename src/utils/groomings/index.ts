import { GroomingClient } from "@/type/grooming";

export async function getGroomingsClient(): Promise<GroomingClient[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/groomings?client=true`, {
      method: "GET",
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch groomings: ${err}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getGroomingsClient error:", error);
    throw error;
  }
}
