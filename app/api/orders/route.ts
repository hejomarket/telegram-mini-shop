import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { buildOrder, OrderError } from '../../../lib/orders/helpers';
import { serverLog } from '../../../lib/orders/logger';
import { saveOrder } from '../../../lib/orders/repository';
import { createOrderSchema } from '../../../lib/orders/validation';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = createOrderSchema.parse(json);
    const order = await buildOrder(payload);
    const result = await saveOrder(order);
    return NextResponse.json({ success: true, orderNumber: result.order.orderNumber, orderAccessToken: result.order.accessToken, mode: result.mode }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
    }
    if (error instanceof OrderError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    serverLog('error', 'order.create.failed', { message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ success: false, message: 'Unable to create order' }, { status: 500 });
  }
}
