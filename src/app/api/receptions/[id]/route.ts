import { NextRequest, NextResponse } from 'next/server';
import { getReception, updateReception, deleteReception } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const r = getReception(id);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const body = await req.json();
  const r = updateReception(id, body);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const ok = deleteReception(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
