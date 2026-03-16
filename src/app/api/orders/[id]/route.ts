import { NextResponse } from 'next/server';
import { getOrder, updateOrder, deleteOrder } from '@/lib/store';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = getOrder(id);
  if (!o) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(o);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const o = updateOrder(id, body);
  if (!o) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(o);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = deleteOrder(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
