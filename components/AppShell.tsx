'use client';

import { useCallback, useState } from 'react';
import { products } from '../lib/products';
import { useCart } from '../lib/cart';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramMainButton } from '../hooks/useTelegramMainButton';
import { CartDrawer } from './CartDrawer';
import { ProductCard } from './ProductCard';
import { TelegramDebugPanel } from './telegram/TelegramDebugPanel';
import { TelegramProfile } from './telegram/TelegramProfile';

export function AppShell() {
  const cart = useCart();
  const { triggerHaptic } = useTelegram();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const openCheckoutModal = useCallback(() => {
    setIsCheckoutModalOpen(true);
  }, []);

  useTelegramMainButton(cart.itemCount, openCheckoutModal);

  const handleAddItem = (productId: string) => {
    triggerHaptic();
    cart.addItem(productId);
  };

  return (
    <main className="safe mx-auto min-h-screen w-full max-w-md px-4">
      <header className="sticky top-0 z-30 -mx-4 bg-soia-cream/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-soia-green/65">Hi, welcome back</p>
            <h1 className="text-xl font-black tracking-tight text-soia-green">SOIA Protein Shop</h1>
          </div>
          <button type="button" onClick={() => setIsCartOpen(true)} className="relative rounded-2xl bg-[var(--tg-button)] p-3 text-[var(--tg-button-text)] shadow-lg shadow-soia-green/20" aria-label="Open cart">
            <span aria-hidden="true">🛒</span>
            <span className="absolute -right-2 -top-2 grid min-h-6 min-w-6 place-items-center rounded-full bg-[var(--tg-accent)] px-1 text-xs font-black text-soia-green">{cart.itemCount}</span>
          </button>
        </div>
      </header>

      <div className="my-5"><TelegramProfile /></div>

      <section className="my-5 overflow-hidden rounded-[2.2rem] bg-[var(--tg-button)] p-6 text-[var(--tg-button-text)] shadow-xl shadow-soia-green/15">
        <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-black">3 pilihan rasa</span>
        <h2 className="mt-5 text-3xl font-black leading-tight">Protein nabati, dibuat lebih menyenangkan.</h2>
        <p className="mt-3 text-base leading-7 text-white/78">Snack berbahan pangan nyata dengan rasa yang mudah dinikmati setiap hari.</p>
      </section>

      <section className="grid gap-4 pb-6" aria-labelledby="products-title">
        <h2 id="products-title" className="sr-only">Products</h2>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={handleAddItem} />
        ))}
      </section>

      <TelegramDebugPanel />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onQuantityChange={triggerHaptic} />

      {isCheckoutModalOpen ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={() => setIsCheckoutModalOpen(false)}>
          <section className="w-full max-w-sm rounded-[2rem] bg-[var(--tg-card)] p-6 text-[var(--tg-text)] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 id="checkout-title" className="text-2xl font-black">Checkout Coming Soon</h2>
            <p className="mt-3 text-sm leading-6 text-soia-green/70">Checkout will be implemented in Task 4.</p>
            <button type="button" onClick={() => setIsCheckoutModalOpen(false)} className="mt-5 w-full rounded-2xl bg-[var(--tg-button)] px-5 py-4 text-sm font-black text-[var(--tg-button-text)]">Got it</button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
