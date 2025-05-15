import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    
    // This is just a diagnostic endpoint to check if the token is being sent
    return NextResponse.json({
      success: true,
      tokenLength: token.length
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
