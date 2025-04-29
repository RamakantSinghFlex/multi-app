import { NextResponse } from "next/server";
import { LANDING_API_URL } from "@/lib/config";

export async function GET() {
  try {
    const response = await fetch(
      "https://ancient-yeti-453713-d0.uk.r.appspot.com/api/pages?limit=10&page=1",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying landing page data:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing page data" },
      { status: 500 }
    );
  }
} 