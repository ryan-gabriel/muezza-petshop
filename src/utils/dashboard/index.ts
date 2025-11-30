import { DashboardOverviewResponse } from "@/type/dashboard";

export async function getDashboardOverview(): Promise<DashboardOverviewResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = new URL(`${baseUrl}/api/dashboard/overview`);

    const res = await fetch(url.toString(), {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard overview: ${res.statusText}`);
    }

    const data: DashboardOverviewResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return null;
  }
}
