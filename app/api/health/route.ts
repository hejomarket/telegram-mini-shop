import { NextResponse } from 'next/server';
import { getRuntimeMode } from '../../../lib/supabase/server';

export async function GET() {
  return NextResponse.json({ success: true, status: 'ok', mode: getRuntimeMode() });
}
