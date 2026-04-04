import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET() {
  return NextResponse.json(getCustomers());
}

export async function POST(req: NextRequest) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const body = await req.json();
  const c = createCustomer(body);
  return NextResponse.json(c, { status: 201 });
}
