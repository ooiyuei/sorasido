import { NextRequest, NextResponse } from 'next/server';
import { settleReception } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const body = await req.json();
  const r = settleReception(id, body);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}
