import { NextResponse } from 'next/server';
import { getStaffList, createStaff } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getStaffList());
}

export async function POST(req: Request) {
  const body = await req.json();
  const s = createStaff(body);
  return NextResponse.json(s, { status: 201 });
}
