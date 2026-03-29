import { NextRequest, NextResponse } from 'next/server';
import { getSalesRecords, getSalesRecordsByMonth } from '@/lib/store';
import { validateApiAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const authError = validateApiAuth(req);
  if (authError) return authError;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  if (month) {
    return NextResponse.json(getSalesRecordsByMonth(month));
  }
  return NextResponse.json(getSalesRecords());
}
