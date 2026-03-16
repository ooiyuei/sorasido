import { NextResponse } from 'next/server';
import { getReservations, createReservation } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getReservations());
}

export async function POST(req: Request) {
  const body = await req.json();
  const r = createReservation(body);
  return NextResponse.json(r, { status: 201 });
}
