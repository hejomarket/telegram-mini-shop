import type { CartItem } from './cart';
import { productById } from './products';

export const CUSTOMER_STORAGE_KEY = 'soia-checkout-customer-v1';
export const ADDRESS_STORAGE_KEY = 'soia-checkout-address-v1';
export const LAST_ORDER_STORAGE_KEY = 'soia-last-demo-order-v1';

export type CheckoutCustomer = { fullName: string; whatsapp: string; email: string };
export type CheckoutAddress = { address: string; district: string; city: string; province: string; postalCode: string; notes: string };
export type DemoOrderItem = CartItem & { name: string; unitPrice: number; subtotal: number };
export type DemoOrder = {
  id: string;
  mode: 'demo' | 'supabase' | 'Demo';
  createdAt: string;
  customer: CheckoutCustomer;
  delivery: CheckoutAddress;
  items: DemoOrderItem[];
  totalQuantity: number;
  grandTotal: number;
  orderAccessToken?: string;
};

export const emptyCustomer: CheckoutCustomer = { fullName: '', whatsapp: '', email: '' };
export const emptyAddress: CheckoutAddress = { address: '', district: '', city: '', province: '', postalCode: '', notes: '' };

export function getOrderItems(items: CartItem[]): DemoOrderItem[] {
  return items.flatMap((item) => {
    const product = productById.get(item.productId);
    if (!product) return [];
    return [{ ...item, name: product.name, unitPrice: product.price, subtotal: product.price * item.quantity }];
  });
}

export function createDemoOrderNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SOIA-DEMO-${stamp}-${random}`;
}

export function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeWriteJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
