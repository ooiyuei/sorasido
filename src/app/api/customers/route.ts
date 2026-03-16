import { NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getCustomers());
}

export async function POST(req: Request) {
  const body = await req.json();
  const c = createCustomer(body);
  return NextResponse.json(c, { status: 201 });
}
