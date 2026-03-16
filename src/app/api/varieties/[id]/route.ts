import { NextResponse } from 'next/server';
import { getVariety, updateVariety, deleteVariety } from '@/lib/store';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = getVariety(id);
  if (!v) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(v);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const v = updateVariety(id, body);
  if (!v) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(v);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = deleteVariety(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
