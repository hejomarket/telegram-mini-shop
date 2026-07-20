import { ORDER_STATUS_LABELS } from '../admin/status';
import { canRetryPayment, PAYMENT_STATUS_LABELS } from '../midtrans/status';
import type { OrderStatus, PaymentStatus, PersistedOrder } from './types';

export type OrderEvent = { eventType: string; orderStatus: OrderStatus | null; paymentStatus: PaymentStatus | null; title: string; description: string | null; source: string; createdAt: string };
export type TimelineItem = { key: string; title: string; state: 'complete' | 'current' | 'pending' | 'problem' | 'cancelled'; occurredAt: string | null; description: string };

export const CUSTOMER_ORDER_TOKEN_HEADER = 'x-order-access-token';

const orderRank: Record<OrderStatus, number> = { pending: 0, confirmed: 2, processing: 3, shipped: 4, completed: 5, cancelled: -1 };
const finalBad = ['failed', 'expired', 'cancelled'] as PaymentStatus[];
const visibleEvents = new Set(['order_created','payment_attempt_created','payment_pending','payment_paid','payment_failed','payment_expired','payment_cancelled','payment_challenged','order_confirmed','order_processing','order_shipped','order_completed','order_cancelled','tracking_updated']);

export function maskPhone(value?: string | null) { if (!value) return null; const clean = value.replace(/\s+/g, ''); if (clean.length <= 6) return clean[0] ? `${clean[0]}•••` : null; return `${clean.slice(0, 4)}•••••${clean.slice(-3)}`; }
export function maskEmail(value?: string | null) { if (!value || !value.includes('@')) return null; const [name, domain] = value.split('@'); return `${name.slice(0, Math.min(2, name.length))}•••@${domain}`; }
export function customerStatusMessage(orderStatus: OrderStatus, paymentStatus: PaymentStatus) { if (orderStatus === 'cancelled') return 'Pesanan telah dibatalkan.'; if (paymentStatus === 'expired') return 'Waktu pembayaran telah habis. Silakan buat percobaan pembayaran baru jika masih tersedia.'; if (paymentStatus === 'failed') return 'Pembayaran belum berhasil. Silakan coba lagi jika pesanan masih tersedia.'; if (paymentStatus === 'pending' || paymentStatus === 'challenged') return 'Pembayaran sedang menunggu penyelesaian atau konfirmasi.'; if (orderStatus === 'completed') return 'Pesanan sudah selesai.'; if (orderStatus === 'shipped') return 'Pesanan sudah dikirim.'; if (orderStatus === 'processing') return 'Pesanan sedang diproses.'; if (paymentStatus === 'paid' || orderStatus === 'confirmed') return 'Pembayaran berhasil. Pesanan sedang disiapkan.'; return 'Pesanan sudah dibuat dan menunggu pembayaran.'; }

export function deriveTimeline(order: Pick<PersistedOrder,'status'|'paymentStatus'|'createdAt'|'paidAt'|'updatedAt'|'paymentUpdatedAt'|'shippedAt'|'completedAt'|'cancelledAt'>, events: OrderEvent[] = []): TimelineItem[] {
  if (order.status === 'cancelled') return [{ key:'cancelled', title:'Pesanan Dibatalkan', state:'cancelled', occurredAt: order.cancelledAt ?? order.updatedAt ?? null, description:'Pesanan telah dibatalkan.' }];
  const blocked = finalBad.includes(order.paymentStatus);
  const milestones = [
    ['created','Pesanan Dibuat', true, order.createdAt, 'Pesanan diterima oleh sistem.'],
    ['waiting_payment','Menunggu Pembayaran', order.paymentStatus !== 'unpaid' || order.status !== 'pending' || blocked, order.paymentUpdatedAt ?? null, blocked ? PAYMENT_STATUS_LABELS[order.paymentStatus] : 'Menunggu pembayaran diselesaikan.'],
    ['paid','Pembayaran Diterima', order.paymentStatus === 'paid' || order.status !== 'pending', order.paidAt ?? null, 'Pembayaran sudah diverifikasi server.'],
    ['confirmed','Pesanan Dikonfirmasi', orderRank[order.status] >= orderRank.confirmed, null, 'Pesanan dikonfirmasi untuk diproses.'],
    ['processing','Sedang Diproses', orderRank[order.status] >= orderRank.processing, null, 'Pesanan sedang disiapkan.'],
    ['shipped','Dikirim', orderRank[order.status] >= orderRank.shipped, order.shippedAt ?? null, 'Pesanan sudah dikirim.'],
    ['completed','Selesai', order.status === 'completed', order.completedAt ?? null, 'Pesanan sudah selesai.'],
  ] as const;
  let currentSet = false;
  return milestones.map(([key,title,done,time,description]) => { const event = events.find((e) => e.eventType.includes(key) || e.title === title); const complete = Boolean(done) && (!blocked || key === 'created' || key === 'waiting_payment'); const state = blocked && key === 'waiting_payment' ? 'problem' : complete ? 'complete' : !currentSet ? (currentSet = true, 'current') : 'pending'; return { key, title, state, occurredAt: event?.createdAt ?? time ?? null, description }; });
}
export function filterCustomerEvents(events: OrderEvent[]) { return events.filter((e) => visibleEvents.has(e.eventType)); }
export function buildActions(order: PersistedOrder, midtransConfigured: boolean) { const terminal = order.status === 'cancelled' || order.status === 'completed' || order.paymentStatus === 'paid' || order.paymentStatus === 'refunded'; return { canPay: midtransConfigured && !terminal && order.paymentStatus === 'unpaid', canResumePayment: midtransConfigured && !terminal && order.paymentStatus === 'pending' && Boolean(order.midtransRedirectUrl), canRetryPayment: midtransConfigured && !terminal && canRetryPayment(order.paymentStatus), canRefreshPayment: order.paymentStatus !== 'paid' && order.status !== 'cancelled' && order.status !== 'completed' }; }
export function serializeCustomerOrder(order: PersistedOrder, events: OrderEvent[], midtransConfigured: boolean) { return { orderNumber: order.orderNumber, createdAt: order.createdAt, updatedAt: order.updatedAt, orderStatus: order.status, orderStatusLabel: ORDER_STATUS_LABELS[order.status], paymentStatus: order.paymentStatus, paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus], paymentType: order.paymentType, message: customerStatusMessage(order.status, order.paymentStatus), totals: { subtotal: order.subtotal, grandTotal: order.grandTotal }, items: order.items.map(i=>({ productName:i.productName, quantity:i.quantity, unitPrice:i.unitPrice, subtotal:i.subtotal })), customer: { name: order.customerName, whatsapp: maskPhone(order.whatsapp), email: maskEmail(order.email), address: order.address, district: order.district, city: order.city, province: order.province, postalCode: order.postalCode, notes: order.notes }, shipping: { courierName: order.courierName ?? null, shippingService: order.shippingService ?? null, trackingNumber: order.trackingNumber ?? null, shippedAt: order.shippedAt ?? null, completedAt: order.completedAt ?? null, estimatedDeliveryStart: order.estimatedDeliveryStart ?? null, estimatedDeliveryEnd: order.estimatedDeliveryEnd ?? null }, paidAt: order.paidAt, expiryTime: order.midtransExpiryTime, timeline: deriveTimeline(order, filterCustomerEvents(events)), events: filterCustomerEvents(events), actions: buildActions(order, midtransConfigured) }; }
