import { AddonServiceClient } from "@/type/addonService";

export async function getAddonClient(): Promise<AddonServiceClient[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/addon-services?client=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch addon services: ${err}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getAddonClient error:", error);
    throw error;
  }
}
