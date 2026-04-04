import { NextRequest, NextResponse } from 'next/server';
import { getReceptions, createReception } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET() {
  return NextResponse.json(getReceptions());
}

export async function POST(req: NextRequest) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const body = await req.json();
  const r = createReception(body);
  return NextResponse.json(r, { status: 201 });
}
