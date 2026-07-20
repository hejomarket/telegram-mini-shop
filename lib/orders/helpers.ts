import { getTrustedProductsByIds, isProductPurchasable } from '../products/repository';
import type { CreateOrderPayload } from './validation';
import type { OrderItemSnapshot, PersistedOrder } from './types';

export class OrderError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function generateOrderNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 6).toUpperCase();
  return `SOIA-${stamp}-${suffix}`;
}

export async function calculateOrderItems(items: CreateOrderPayload['items']): Promise<OrderItemSnapshot[]> {
  const trustedProducts = await getTrustedProductsByIds(items.map((item) => item.productId));
  return items.map((item) => {
    const product = trustedProducts.get(item.productId);
    if (!product) throw new OrderError(422, `Produk tidak ditemukan: ${item.productId}`);
    if (!isProductPurchasable(product)) {
      console.warn('checkout.product.rejected', { productId: item.productId, sku: product.sku });
      throw new OrderError(422, 'Produk ini sedang tidak tersedia dan perlu dihapus sebelum melanjutkan pembayaran.');
    }
    return { productId: product.id, productName: product.name, unitPrice: product.price, quantity: item.quantity, subtotal: product.price * item.quantity };
  });
}

export async function buildOrder(payload: CreateOrderPayload): Promise<PersistedOrder> {
  const items = await calculateOrderItems(payload.items);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const now = new Date().toISOString();
  return {
    orderNumber: generateOrderNumber(), customerName: payload.customer.fullName, whatsapp: payload.customer.whatsapp,
    email: payload.customer.email, address: payload.address.address, district: payload.address.district, city: payload.address.city,
    province: payload.address.province, postalCode: payload.address.postalCode, notes: payload.address.notes,
    telegramUserId: payload.telegram.userId ?? null, telegramUsername: payload.telegram.username ?? null,
    telegramFirstName: payload.telegram.firstName ?? null, telegramLastName: payload.telegram.lastName ?? null,
    telegramLanguage: payload.telegram.language ?? null, subtotal, grandTotal: subtotal, status: 'pending', paymentStatus: 'unpaid', paymentProvider: null, paymentType: null, midtransTransactionId: null, midtransTransactionStatus: null, midtransFraudStatus: null, midtransStatusCode: null, midtransStatusMessage: null, midtransTransactionTime: null, midtransSettlementTime: null, midtransExpiryTime: null, midtransSnapToken: null, midtransRedirectUrl: null, paidAt: null, paymentUpdatedAt: null, paymentAttemptCount: 0, createdAt: now, updatedAt: now, items,
  };
}
