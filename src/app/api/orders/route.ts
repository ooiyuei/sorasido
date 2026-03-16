import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getOrders());
}

export async function POST(req: Request) {
  const body = await req.json();
  const o = createOrder(body);
  return NextResponse.json(o, { status: 201 });
}
