import { NextResponse } from 'next/server';
import { getReservation, updateReservation, deleteReservation } from '@/lib/store';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getReservation(id);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const r = updateReservation(id, body);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = deleteReservation(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
