import 'server-only';
import { getSupabaseServerClient } from '../supabase/server';
import type { OrderItemSnapshot, OrderStatus, PaymentStatus, PersistedOrder } from '../orders/types';
import { isOrderStatus } from './status';
import { createOrderEvent } from '../orders/events';

const ORDER_NUMBER_RE = /^SOIA-\d{8}-[A-Z0-9]{6}$/;
const listColumns = 'order_number, customer_name, whatsapp, telegram_username, grand_total, status, created_at, subtotal, payment_status, payment_type, paid_at';

type Filters = { q?: string; status?: string; paymentStatus?: string; source?: string; from?: string; to?: string; page?: string | number };
export type OrderListRow = { orderNumber: string; createdAt: string; customerName: string; whatsapp: string; telegramUsername: string | null; grandTotal: number; totalItems: number; status: OrderStatus; paymentStatus: PaymentStatus; paymentType: string | null; paidAt: string | null; source: string };
export type DashboardStats = { total: number; revenue: number; paidRevenue: number; byStatus: Record<OrderStatus, number>; byPaymentStatus: Record<PaymentStatus, number> };

function sourceFor(row: { telegram_username?: string | null }) { return row.telegram_username ? 'telegram' : 'web'; }
function safePage(page: Filters['page']) { const n = Number(page ?? 1); return Number.isInteger(n) && n > 0 ? Math.min(n, 9999) : 1; }
function applyFilters(query: any, filters: Filters) {
  const q = filters.q?.trim();
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,whatsapp.ilike.%${q}%,telegram_username.ilike.%${q}%`);
  if (filters.status && isOrderStatus(filters.status)) query = query.eq('status', filters.status);
  if (filters.paymentStatus) query = query.eq('payment_status', filters.paymentStatus);
  if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) query = query.gte('created_at', `${filters.from}T00:00:00.000Z`);
  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) query = query.lte('created_at', `${filters.to}T23:59:59.999Z`);
  return query;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = { total: 0, revenue: 0, paidRevenue: 0, byStatus: { pending: 0, confirmed: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 }, byPaymentStatus: { unpaid: 0, pending: 0, paid: 0, failed: 0, expired: 0, cancelled: 0, challenged: 0, refunded: 0 } };
  const supabase = getSupabaseServerClient();
  if (!supabase) return empty;
  const { data, error } = await supabase.from('orders').select('status, payment_status, grand_total');
  if (error || !data) throw new Error('Failed to load dashboard');
  return data.reduce((acc, row: any) => {
    if (isOrderStatus(row.status)) acc.byStatus[row.status] += 1;
    acc.total += 1;
    if (row.status !== 'cancelled') acc.revenue += Number(row.grand_total ?? 0);
    if (row.payment_status && acc.byPaymentStatus[row.payment_status as PaymentStatus] !== undefined) acc.byPaymentStatus[row.payment_status as PaymentStatus] += 1;
    if (row.payment_status === 'paid') acc.paidRevenue += Number(row.grand_total ?? 0);
    return acc;
  }, empty);
}

export async function listOrderSources() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from('orders').select('telegram_username').limit(1000);
  return Array.from(new Set((data ?? []).map(sourceFor))).sort() as string[];
}

export async function listOrders(filters: Filters, pageSize = 20) {
  const supabase = getSupabaseServerClient();
  const page = safePage(filters.page);
  if (!supabase) return { rows: [], page, total: 0, pageSize, hasPrev: page > 1, hasNext: false };
  const from = (page - 1) * pageSize;
  let query = supabase.from('orders').select(`${listColumns}, order_items(quantity)`, { count: 'exact' });
  query = applyFilters(query, filters).order('created_at', { ascending: false }).range(from, from + pageSize - 1);
  const { data, error, count } = await query;
  if (error || !data) throw new Error('Failed to load orders');
  let rows = (data as any[]).map<OrderListRow>((row) => ({ orderNumber: row.order_number, createdAt: row.created_at, customerName: row.customer_name, whatsapp: row.whatsapp, telegramUsername: row.telegram_username, grandTotal: row.grand_total, totalItems: (row.order_items ?? []).reduce((sum: number, item: any) => sum + Number(item.quantity ?? 0), 0), status: row.status, paymentStatus: row.payment_status ?? 'unpaid', paymentType: row.payment_type ?? null, paidAt: row.paid_at ?? null, source: sourceFor(row) }));
  if (filters.source === 'telegram' || filters.source === 'web') rows = rows.filter((row) => row.source === filters.source);
  const total = count ?? rows.length;
  return { rows, page, total, pageSize, hasPrev: page > 1, hasNext: from + pageSize < total };
}

export async function getAdminOrder(orderNumber: string): Promise<PersistedOrder | null> {
  if (!ORDER_NUMBER_RE.test(orderNumber)) return null;
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('orders').select('*, order_items(product_id,product_name,unit_price,quantity,subtotal)').eq('order_number', orderNumber).single();
  if (error || !data) return null;
  const row = data as any;
  return { id: row.id, orderNumber: row.order_number, customerName: row.customer_name, whatsapp: row.whatsapp, email: row.email, address: row.address, district: row.district, city: row.city, province: row.province, postalCode: row.postal_code, notes: row.notes, adminNotes: row.admin_notes, telegramUserId: row.telegram_user_id, telegramUsername: row.telegram_username, telegramFirstName: row.telegram_first_name, telegramLastName: row.telegram_last_name, telegramLanguage: row.telegram_language, subtotal: row.subtotal, grandTotal: row.grand_total, status: row.status, paymentStatus: row.payment_status ?? 'unpaid', paymentProvider: row.payment_provider ?? null, paymentType: row.payment_type ?? null, midtransTransactionId: row.midtrans_transaction_id ?? null, midtransTransactionStatus: row.midtrans_transaction_status ?? null, midtransFraudStatus: row.midtrans_fraud_status ?? null, midtransStatusCode: row.midtrans_status_code ?? null, midtransStatusMessage: row.midtrans_status_message ?? null, midtransTransactionTime: row.midtrans_transaction_time ?? null, midtransSettlementTime: row.midtrans_settlement_time ?? null, midtransExpiryTime: row.midtrans_expiry_time ?? null, midtransSnapToken: row.midtrans_snap_token ?? null, midtransRedirectUrl: row.midtrans_redirect_url ?? null, paidAt: row.paid_at ?? null, paymentUpdatedAt: row.payment_updated_at ?? null, paymentAttemptCount: row.payment_attempt_count ?? 0, courierName: row.courier_name ?? null, shippingService: row.shipping_service ?? null, trackingNumber: row.tracking_number ?? null, shippedAt: row.shipped_at ?? null, completedAt: row.completed_at ?? null, cancelledAt: row.cancelled_at ?? null, estimatedDeliveryStart: row.estimated_delivery_start ?? null, estimatedDeliveryEnd: row.estimated_delivery_end ?? null, createdAt: row.created_at, updatedAt: row.updated_at, items: (row.order_items ?? []).map((i: any): OrderItemSnapshot => ({ productId: i.product_id, productName: i.product_name, unitPrice: i.unit_price, quantity: i.quantity, subtotal: i.subtotal })) };
}

export async function updateOrderStatus(orderNumber: string, status: unknown) { if (!ORDER_NUMBER_RE.test(orderNumber) || !isOrderStatus(status)) return null; return updateOrder(orderNumber, { status }); }
export async function updateAdminNotes(orderNumber: string, notes: unknown) { if (!ORDER_NUMBER_RE.test(orderNumber) || typeof notes !== 'string' || notes.length > 2000) return null; return updateOrder(orderNumber, { admin_notes: notes.trim() }); }
async function updateOrder(orderNumber: string, values: Record<string, unknown>) {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Database unavailable');
  const { data, error } = await supabase.from('orders').update({ ...values, updated_at: new Date().toISOString() }).eq('order_number', orderNumber).select('order_number,status,admin_notes,updated_at').single();
  if (error || !data) throw new Error('Failed to update order');
  return data;
}

export type ShippingUpdate = { courierName?: string | null; shippingService?: string | null; trackingNumber?: string | null; estimatedDeliveryStart?: string | null; estimatedDeliveryEnd?: string | null };
export function validateShippingUpdate(input: ShippingUpdate) { const trim=(v?:string|null,max=100)=>typeof v==='string'?v.trim().slice(0,max):null; const out={ courier_name: trim(input.courierName,100), shipping_service: trim(input.shippingService,100), tracking_number: trim(input.trackingNumber,150), estimated_delivery_start: input.estimatedDeliveryStart || null, estimated_delivery_end: input.estimatedDeliveryEnd || null }; if(out.estimated_delivery_start && out.estimated_delivery_end && out.estimated_delivery_start > out.estimated_delivery_end) throw new Error('Rentang estimasi tidak valid.'); return out; }
export async function updateShippingInfo(orderNumber: string, input: ShippingUpdate) { if(!ORDER_NUMBER_RE.test(orderNumber)) return null; const current=await getAdminOrder(orderNumber); if(!current?.id) return null; const values=validateShippingUpdate(input); const shouldShip=Boolean(values.tracking_number) && ['confirmed','processing'].includes(current.status) && current.paymentStatus==='paid'; const updates: Record<string, unknown>={...values}; if(shouldShip){ updates.status='shipped'; updates.shipped_at=current.shippedAt ?? new Date().toISOString(); } const changed=Object.entries(updates).some(([k,v])=>{ const map:Record<string,unknown>={courier_name:current.courierName,shipping_service:current.shippingService,tracking_number:current.trackingNumber,estimated_delivery_start:current.estimatedDeliveryStart,estimated_delivery_end:current.estimatedDeliveryEnd,status:current.status,shipped_at:current.shippedAt}; return (map[k] ?? null)!==(v ?? null); }); if(!changed) return { order_number: orderNumber, changed:false }; const updated=await updateOrder(orderNumber, updates); await createOrderEvent({ orderId: current.id, eventType: shouldShip?'order_shipped':'tracking_updated', orderStatus: shouldShip?'shipped':current.status, paymentStatus: current.paymentStatus, title: shouldShip?'Pesanan Dikirim':'Informasi Pengiriman Diperbarui', description: 'Informasi pengiriman diperbarui oleh admin.', source: 'admin' }); return { ...updated, changed:true }; }
