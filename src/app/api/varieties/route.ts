import { NextRequest, NextResponse } from 'next/server';
import { getVarieties, createVariety } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET() {
  return NextResponse.json(getVarieties());
}

export async function POST(req: NextRequest) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const body = await req.json();
  const v = createVariety(body);
  return NextResponse.json(v, { status: 201 });
}
