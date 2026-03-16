import { NextResponse } from 'next/server';
import { getSalesRecords, getSalesRecordsByMonth } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  if (month) {
    return NextResponse.json(getSalesRecordsByMonth(month));
  }
  return NextResponse.json(getSalesRecords());
}
