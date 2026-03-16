import { NextResponse } from 'next/server';
import { getSets, createSet } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getSets());
}

export async function POST(req: Request) {
  const body = await req.json();
  const s = createSet(body);
  return NextResponse.json(s, { status: 201 });
}
