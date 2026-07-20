import 'server-only';
import { getSupabaseServerClient } from '../supabase/server';
import type { OrderItemSnapshot, OrderStatus, PersistedOrder } from '../orders/types';
import { isOrderStatus } from './status';

const ORDER_NUMBER_RE = /^SOIA-\d{8}-[A-Z0-9]{6}$/;
const listColumns = 'order_number, customer_name, whatsapp, telegram_username, grand_total, status, created_at, subtotal';

type Filters = { q?: string; status?: string; source?: string; from?: string; to?: string; page?: string | number };
export type OrderListRow = { orderNumber: string; createdAt: string; customerName: string; whatsapp: string; telegramUsername: string | null; grandTotal: number; totalItems: number; status: OrderStatus; source: string };
export type DashboardStats = { total: number; revenue: number; byStatus: Record<OrderStatus, number> };

function sourceFor(row: { telegram_username?: string | null }) { return row.telegram_username ? 'telegram' : 'web'; }
function safePage(page: Filters['page']) { const n = Number(page ?? 1); return Number.isInteger(n) && n > 0 ? Math.min(n, 9999) : 1; }
function applyFilters(query: any, filters: Filters) {
  const q = filters.q?.trim();
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,whatsapp.ilike.%${q}%,telegram_username.ilike.%${q}%`);
  if (filters.status && isOrderStatus(filters.status)) query = query.eq('status', filters.status);
  if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) query = query.gte('created_at', `${filters.from}T00:00:00.000Z`);
  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) query = query.lte('created_at', `${filters.to}T23:59:59.999Z`);
  return query;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = { total: 0, revenue: 0, byStatus: { pending: 0, confirmed: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 } };
  const supabase = getSupabaseServerClient();
  if (!supabase) return empty;
  const { data, error } = await supabase.from('orders').select('status, grand_total');
  if (error || !data) throw new Error('Failed to load dashboard');
  return data.reduce((acc, row: any) => {
    if (isOrderStatus(row.status)) acc.byStatus[row.status] += 1;
    acc.total += 1;
    if (row.status !== 'cancelled') acc.revenue += Number(row.grand_total ?? 0);
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
  let rows = (data as any[]).map<OrderListRow>((row) => ({ orderNumber: row.order_number, createdAt: row.created_at, customerName: row.customer_name, whatsapp: row.whatsapp, telegramUsername: row.telegram_username, grandTotal: row.grand_total, totalItems: (row.order_items ?? []).reduce((sum: number, item: any) => sum + Number(item.quantity ?? 0), 0), status: row.status, source: sourceFor(row) }));
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
  return { id: row.id, orderNumber: row.order_number, customerName: row.customer_name, whatsapp: row.whatsapp, email: row.email, address: row.address, district: row.district, city: row.city, province: row.province, postalCode: row.postal_code, notes: row.notes, adminNotes: row.admin_notes, telegramUserId: row.telegram_user_id, telegramUsername: row.telegram_username, telegramFirstName: row.telegram_first_name, telegramLastName: row.telegram_last_name, telegramLanguage: row.telegram_language, subtotal: row.subtotal, grandTotal: row.grand_total, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at, items: (row.order_items ?? []).map((i: any): OrderItemSnapshot => ({ productId: i.product_id, productName: i.product_name, unitPrice: i.unit_price, quantity: i.quantity, subtotal: i.subtotal })) };
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
