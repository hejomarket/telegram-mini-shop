'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { productById } from './products';

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (productId: string) => void;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'soia-cart-v1';

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Partial<CartItem>;
  return (
    typeof candidate.productId === 'string' &&
    productById.has(candidate.productId) &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0 &&
    candidate.quantity <= 99
  );
}

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures, for example private browsing limits.
    }
  }, [hasHydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const updateQuantity = (productId: string, change: number) => {
      setItems((current) => {
        const existing = current.find((item) => item.productId === productId);
        if (!existing && change > 0) {
          return [...current, { productId, quantity: Math.min(change, 99) }];
        }

        return current.flatMap((item) => {
          if (item.productId !== productId) return [item];
          const nextQuantity = item.quantity + change;
          return nextQuantity > 0 ? [{ ...item, quantity: Math.min(nextQuantity, 99) }] : [];
        });
      });
    };

    return {
      items,
      addItem: (productId) => updateQuantity(productId, 1),
      increaseItem: (productId) => updateQuantity(productId, 1),
      decreaseItem: (productId) => updateQuantity(productId, -1),
      removeItem: (productId) => setItems((current) => current.filter((item) => item.productId !== productId)),
      clearCart: () => setItems([]),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + (productById.get(item.productId)?.price ?? 0) * item.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
