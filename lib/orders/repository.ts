import { getRuntimeMode, getSupabaseServerClient } from '../supabase/server';
import { serverLog } from './logger';
import { createOrderAccessToken, hashOrderAccessToken } from './access';
import type { OrderItemSnapshot, PersistedOrder, RuntimeMode } from './types';
import { createOrderEvent } from './events';

type DbOrderItem = { product_id: string; product_name: string; unit_price: number; quantity: number; subtotal: number };
type DbOrder = {
  id: string; order_number: string; customer_name: string; whatsapp: string; email: string | null; address: string; district: string;
  city: string; province: string; postal_code: string; notes: string | null; telegram_user_id: number | null; telegram_username: string | null;
  telegram_first_name: string | null; telegram_last_name: string | null; telegram_language: string | null; subtotal: number; grand_total: number;
  status: PersistedOrder['status']; order_access_token_hash?: string | null; payment_status?: PersistedOrder['paymentStatus']; payment_provider?: string | null; payment_type?: string | null; midtrans_transaction_id?: string | null; midtrans_transaction_status?: string | null; midtrans_fraud_status?: string | null; midtrans_status_code?: string | null; midtrans_status_message?: string | null; midtrans_transaction_time?: string | null; midtrans_settlement_time?: string | null; midtrans_expiry_time?: string | null; midtrans_snap_token?: string | null; midtrans_redirect_url?: string | null; paid_at?: string | null; payment_updated_at?: string | null; payment_attempt_count?: number; courier_name?: string | null; shipping_service?: string | null; tracking_number?: string | null; shipped_at?: string | null; completed_at?: string | null; cancelled_at?: string | null; estimated_delivery_start?: string | null; estimated_delivery_end?: string | null; created_at: string; updated_at: string; order_items?: DbOrderItem[];
};

const demoOrders = new Map<string, PersistedOrder>();

function toDbOrder(order: PersistedOrder) {
  return {
    order_number: order.orderNumber, customer_name: order.customerName, whatsapp: order.whatsapp, email: order.email,
    address: order.address, district: order.district, city: order.city, province: order.province, postal_code: order.postalCode,
    notes: order.notes, telegram_user_id: order.telegramUserId, telegram_username: order.telegramUsername,
    telegram_first_name: order.telegramFirstName, telegram_last_name: order.telegramLastName, telegram_language: order.telegramLanguage,
    subtotal: order.subtotal, grand_total: order.grandTotal, status: order.status, order_access_token_hash: order.accessToken ? hashOrderAccessToken(order.accessToken) : null, payment_status: order.paymentStatus ?? 'unpaid',
  };
}

export async function saveOrder(orderInput: PersistedOrder): Promise<{ order: PersistedOrder; mode: RuntimeMode }> {
  const accessToken = orderInput.accessToken ?? createOrderAccessToken();
  const order = { ...orderInput, accessToken, paymentStatus: orderInput.paymentStatus ?? 'unpaid' };
  const mode = getRuntimeMode();
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    demoOrders.set(order.orderNumber, order);
    serverLog('info', 'order.demo.saved', { orderNumber: order.orderNumber });
    return { order, mode: 'demo' };
  }

  const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert(toDbOrder(order)).select('id, created_at, updated_at').single();
  if (orderError || !insertedOrder) throw new Error('Failed to create order');

  const orderItems = order.items.map((item) => ({
    order_id: insertedOrder.id, product_id: item.productId, product_name: item.productName,
    unit_price: item.unitPrice, quantity: item.quantity, subtotal: item.subtotal,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw new Error('Failed to create order items');

  const persisted = { ...order, id: insertedOrder.id, createdAt: insertedOrder.created_at, updatedAt: insertedOrder.updated_at };
  await createOrderEvent({ orderId: insertedOrder.id, eventType: 'order_created', orderStatus: order.status, paymentStatus: order.paymentStatus, title: 'Pesanan Dibuat', description: 'Pesanan diterima oleh sistem.', source: 'system' });
  return { order: persisted, mode };
}

export async function getOrderAccessTokenHash(orderNumber: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.from('orders').select('order_access_token_hash').eq('order_number', orderNumber).maybeSingle();
  return (data as { order_access_token_hash?: string | null } | null)?.order_access_token_hash ?? null;
}

export async function findOrder(orderNumber: string): Promise<{ order: PersistedOrder | null; mode: RuntimeMode }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { order: demoOrders.get(orderNumber) ?? null, mode: 'demo' };

  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('order_number', orderNumber).single();
  if (error || !data) return { order: null, mode: 'supabase' };
  const dbOrder = data as DbOrder;
  return { order: {
    id: dbOrder.id, orderNumber: dbOrder.order_number, customerName: dbOrder.customer_name, whatsapp: dbOrder.whatsapp, email: dbOrder.email,
    address: dbOrder.address, district: dbOrder.district, city: dbOrder.city, province: dbOrder.province, postalCode: dbOrder.postal_code,
    notes: dbOrder.notes, telegramUserId: dbOrder.telegram_user_id, telegramUsername: dbOrder.telegram_username,
    telegramFirstName: dbOrder.telegram_first_name, telegramLastName: dbOrder.telegram_last_name, telegramLanguage: dbOrder.telegram_language,
    subtotal: dbOrder.subtotal, grandTotal: dbOrder.grand_total, status: dbOrder.status, paymentStatus: dbOrder.payment_status ?? 'unpaid', paymentProvider: dbOrder.payment_provider ?? null, paymentType: dbOrder.payment_type ?? null, midtransTransactionId: dbOrder.midtrans_transaction_id ?? null, midtransTransactionStatus: dbOrder.midtrans_transaction_status ?? null, midtransFraudStatus: dbOrder.midtrans_fraud_status ?? null, midtransStatusCode: dbOrder.midtrans_status_code ?? null, midtransStatusMessage: dbOrder.midtrans_status_message ?? null, midtransTransactionTime: dbOrder.midtrans_transaction_time ?? null, midtransSettlementTime: dbOrder.midtrans_settlement_time ?? null, midtransExpiryTime: dbOrder.midtrans_expiry_time ?? null, midtransSnapToken: dbOrder.midtrans_snap_token ?? null, midtransRedirectUrl: dbOrder.midtrans_redirect_url ?? null, paidAt: dbOrder.paid_at ?? null, paymentUpdatedAt: dbOrder.payment_updated_at ?? null, paymentAttemptCount: dbOrder.payment_attempt_count ?? 0, courierName: dbOrder.courier_name ?? null, shippingService: dbOrder.shipping_service ?? null, trackingNumber: dbOrder.tracking_number ?? null, shippedAt: dbOrder.shipped_at ?? null, completedAt: dbOrder.completed_at ?? null, cancelledAt: dbOrder.cancelled_at ?? null, estimatedDeliveryStart: dbOrder.estimated_delivery_start ?? null, estimatedDeliveryEnd: dbOrder.estimated_delivery_end ?? null, createdAt: dbOrder.created_at, updatedAt: dbOrder.updated_at,
    items: (dbOrder.order_items ?? []).map<OrderItemSnapshot>((item) => ({ productId: item.product_id, productName: item.product_name, unitPrice: item.unit_price, quantity: item.quantity, subtotal: item.subtotal })),
  }, mode: 'supabase' };
}
