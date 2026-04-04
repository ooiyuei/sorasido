import { NextRequest, NextResponse } from 'next/server';
import { getVariety, updateVariety, deleteVariety } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = getVariety(id);
  if (!v) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(v);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const body = await req.json();
  const v = updateVariety(id, body);
  if (!v) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(v);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const ok = deleteVariety(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
