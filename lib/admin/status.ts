import type { OrderStatus } from '../orders/types';

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Dikonfirmasi',
  processing: 'Sedang Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && ORDER_STATUSES.includes(value as OrderStatus);
}
