import type { PaymentStatus } from './types';
export const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid','pending','paid','failed','expired','cancelled','challenged','refunded'];
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus,string> = { unpaid:'Belum Dibayar', pending:'Menunggu Pembayaran', paid:'Sudah Dibayar', failed:'Pembayaran Gagal', expired:'Pembayaran Kedaluwarsa', cancelled:'Pembayaran Dibatalkan', challenged:'Pembayaran Ditinjau', refunded:'Dana Dikembalikan' };
const rank: Record<PaymentStatus, number> = { unpaid:0, pending:1, challenged:2, failed:3, expired:3, cancelled:3, paid:4, refunded:5 };
export function mapMidtransStatus(transactionStatus?: string | null, fraudStatus?: string | null): PaymentStatus {
  if (fraudStatus === 'challenge') return 'challenged';
  if (transactionStatus === 'settlement') return 'paid';
  if (transactionStatus === 'capture') return fraudStatus === 'accept' || !fraudStatus ? 'paid' : 'challenged';
  if (transactionStatus === 'pending' || transactionStatus === 'authorize') return 'pending';
  if (transactionStatus === 'deny' || transactionStatus === 'failure') return 'failed';
  if (transactionStatus === 'cancel') return 'cancelled';
  if (transactionStatus === 'expire') return 'expired';
  if (transactionStatus === 'refund' || transactionStatus === 'partial_refund') return 'refunded';
  return 'pending';
}
export function canTransitionPaymentStatus(current: PaymentStatus, next: PaymentStatus) {
  if (current === next) return false;
  if (current === 'paid') return next === 'refunded';
  if (['expired','failed','cancelled'].includes(current)) return next === 'refunded';
  return rank[next] >= rank[current];
}
export function canRetryPayment(status: PaymentStatus) { return ['unpaid','failed','expired','cancelled'].includes(status); }
export function generateProviderOrderId(orderNumber: string, attempt: number) { return `${orderNumber}-P${String(attempt).padStart(2,'0')}`.toUpperCase().slice(0,50); }
export function isPaymentStatus(v: unknown): v is PaymentStatus { return typeof v === 'string' && PAYMENT_STATUSES.includes(v as PaymentStatus); }
