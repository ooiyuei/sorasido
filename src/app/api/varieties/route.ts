import { NextResponse } from 'next/server';
import { getVarieties, createVariety } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getVarieties());
}

export async function POST(req: Request) {
  const body = await req.json();
  const v = createVariety(body);
  return NextResponse.json(v, { status: 201 });
}
