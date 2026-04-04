import { NextRequest, NextResponse } from 'next/server';
import { getSets, createSet } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET() {
  return NextResponse.json(getSets());
}

export async function POST(req: NextRequest) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const body = await req.json();
  const s = createSet(body);
  return NextResponse.json(s, { status: 201 });
}
