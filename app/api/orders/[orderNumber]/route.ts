import { NextResponse } from 'next/server';
import { findOrder, getOrderAccessTokenHash } from '../../../../lib/orders/repository';
import { verifyOrderAccessToken } from '../../../../lib/orders/access';
import { serverLog } from '../../../../lib/orders/logger';

type Params = { params: Promise<{ orderNumber: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { orderNumber } = await params;
    if (!/^SOIA-\d{8}-[A-Z0-9]{6}$/.test(orderNumber)) {
      return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
    }
    const { order, mode } = await findOrder(orderNumber);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found', mode }, { status: 404 });
    const tokenHash = await getOrderAccessTokenHash(orderNumber);
    const token = new URL(request.url).searchParams.get('accessToken') ?? '';
    if (tokenHash && !verifyOrderAccessToken(token, tokenHash)) {
      return NextResponse.json({ success: false, message: 'Order access denied' }, { status: 403 });
    }
    const { adminNotes: _adminNotes, id: _id, telegramUserId: _telegramUserId, telegramUsername: _telegramUsername, telegramFirstName: _telegramFirstName, telegramLastName: _telegramLastName, telegramLanguage: _telegramLanguage, ...safeOrder } = order;
    return NextResponse.json({ success: true, order: safeOrder, mode });
  } catch (error) {
    serverLog('error', 'order.read.failed', { message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ success: false, message: 'Unable to read order' }, { status: 500 });
  }
}
