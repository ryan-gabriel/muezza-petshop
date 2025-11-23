import { Branch } from "@/type/branch";

// lib/getBranches.ts
export async function getBranches(): Promise<Branch[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/branches`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch branches: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}
