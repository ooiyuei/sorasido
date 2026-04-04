import { NextRequest, NextResponse } from 'next/server';
import { getCustomer, updateCustomer, archiveCustomer } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCustomer(id);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(c);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const body = await req.json();
  const c = updateCustomer(id, body);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(c);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const ok = archiveCustomer(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
