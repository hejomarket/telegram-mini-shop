import { NextResponse } from 'next/server';
import { getMidtransConfig } from '../../../../lib/midtrans/config';
import { verifyOrderAccessToken } from '../../../../lib/orders/access';
import { CUSTOMER_ORDER_TOKEN_HEADER, serializeCustomerOrder } from '../../../../lib/orders/customer';
import { listOrderEvents } from '../../../../lib/orders/events';
import { serverLog } from '../../../../lib/orders/logger';
import { findOrder, getOrderAccessTokenHash } from '../../../../lib/orders/repository';

type Params = { params: Promise<{ orderNumber: string }> };
const denied = () => NextResponse.json({ success: false, message: 'Pesanan tidak dapat diakses dari perangkat ini.' }, { status: 403 });

export async function GET(request: Request, { params }: Params) {
  try {
    const { orderNumber } = await params;
    if (!/^SOIA-\d{8}-[A-Z0-9]{6}$/.test(orderNumber)) return denied();
    const token = request.headers.get(CUSTOMER_ORDER_TOKEN_HEADER) ?? new URL(request.url).searchParams.get('accessToken') ?? '';
    const tokenHash = await getOrderAccessTokenHash(orderNumber);
    if (!tokenHash || !verifyOrderAccessToken(token, tokenHash)) return denied();
    const { order, mode } = await findOrder(orderNumber);
    if (!order) return denied();
    const events = await listOrderEvents(order.id);
    return NextResponse.json({ success: true, order: serializeCustomerOrder(order, events, getMidtransConfig().isConfigured), mode });
  } catch (error) {
    serverLog('error', 'order.customer.read.failed', { message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ success: false, message: 'Status pesanan belum dapat dimuat. Silakan coba kembali.' }, { status: 500 });
  }
}
