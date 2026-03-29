import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "";

export function validateApiAuth(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${SITE_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // auth passed
}
