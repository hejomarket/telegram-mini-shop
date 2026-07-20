import { NextResponse } from 'next/server';
import { getPublicMidtransConfig } from '../../../../../lib/midtrans/config';
export async function GET(){ return NextResponse.json(getPublicMidtransConfig()); }
