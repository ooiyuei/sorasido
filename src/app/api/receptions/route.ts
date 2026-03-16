import { NextResponse } from 'next/server';
import { getReceptions, createReception } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getReceptions());
}

export async function POST(req: Request) {
  const body = await req.json();
  const r = createReception(body);
  return NextResponse.json(r, { status: 201 });
}
