'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '../lib/products';
import { useCart } from '../lib/cart';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramMainButton } from '../hooks/useTelegramMainButton';
import { CartDrawer } from './CartDrawer';
import { ProductCard } from './ProductCard';
import { TelegramDebugPanel } from './telegram/TelegramDebugPanel';
import { TelegramProfile } from './telegram/TelegramProfile';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { CartIcon, LeafIcon, SparkIcon } from './ui/Icons';

export function AppShell({ products }: { products: Product[] }) {
  const router = useRouter();
  const cart = useCart();
  const { triggerHaptic, user, mode } = useTelegram();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const quantities = useMemo(() => new Map(cart.items.map((item) => [item.productId, item.quantity])), [cart.items]);
  const greetingName = user?.first_name || 'there';

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    router.push('/checkout');
  }, [router]);

  useTelegramMainButton(cart.itemCount, openCheckout);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAddItem = (productId: string) => {
    triggerHaptic();
    cart.addItem(productId);
    const product = products.find((item) => item.id === productId);
    setToast(`${product?.name ?? 'Item'} added to cart`);
  };

  return (
    <main className="safe mx-auto min-h-screen w-full max-w-md px-4 sm:max-w-2xl md:max-w-4xl">
      <header className="sticky top-0 z-30 -mx-4 border-b border-soia-green/5 bg-[var(--tg-bg)]/82 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-soia-green text-white shadow-soft"><LeafIcon /></div>
            <div><p className="text-xs font-bold text-soia-green/56">Hi, {greetingName} 👋</p><h1 className="text-lg font-black tracking-[-0.04em] text-soia-green">SOIA Protein Shop</h1></div>
          </div>
          <div className="flex items-center gap-2"><Badge tone={mode === 'telegram' ? 'lime' : 'soft'}>{mode === 'telegram' ? 'Telegram' : 'Browser'}</Badge><Button type="button" onClick={() => setIsCartOpen(true)} size="icon" aria-label="Open cart" className="relative"><CartIcon />{cart.itemCount > 0 ? <span className="absolute -right-1.5 -top-1.5 grid min-h-6 min-w-6 place-items-center rounded-full bg-soia-lime px-1 text-[11px] font-black text-soia-forest ring-2 ring-[var(--tg-bg)]">{cart.itemCount}</span> : null}</Button></div>
        </div>
      </header>

      <div className="mt-5"><TelegramProfile /></div>

      <section className="my-5 overflow-hidden rounded-[2.3rem] border border-soia-green/8 bg-soia-green p-6 text-white shadow-card md:p-8">
        <div className="flex items-start justify-between gap-4"><Badge tone="lime">Healthy protein snacks</Badge><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-soia-lime"><SparkIcon /></div></div>
        <h2 className="mt-6 max-w-xl text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-5xl">Plant protein, designed for everyday cravings.</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-white/72">Premium SOIA snacks in Original, Seaweed, and Kecombrang — clean ingredients, balanced crunch, and 18 g protein per pack.</p>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-white/72"><div className="rounded-2xl bg-white/10 p-3"><strong className="block text-lg text-white">18 g</strong>Protein</div><div className="rounded-2xl bg-white/10 p-3"><strong className="block text-lg text-white">100 g</strong>Pack</div><div className="rounded-2xl bg-white/10 p-3"><strong className="block text-lg text-white">3</strong>Flavors</div></div>
      </section>

      <section className="pb-8" aria-labelledby="products-title">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-soia-green/45">Shop</p><h2 id="products-title" className="text-2xl font-black tracking-[-0.05em] text-soia-green">Choose your flavor</h2></div><p className="text-sm font-bold text-soia-green/50">{products.length} items</p></div>
        {products.length === 0 ? <EmptyState icon={<LeafIcon />} title="Produk sedang belum tersedia." description="Katalog SOIA akan tampil kembali setelah produk aktif tersedia." /> : <div className="grid gap-4 md:grid-cols-2">{products.map((product) => <ProductCard key={product.id} product={product} quantity={quantities.get(product.id) ?? 0} onAdd={handleAddItem} />)}</div>}
      </section>

      <TelegramDebugPanel />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onQuantityChange={() => { triggerHaptic(); setToast('Quantity updated'); }} onCheckout={openCheckout} />

      {toast ? <div className="toast-in fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-soia-green/10 bg-white/95 px-4 py-3 text-sm font-bold text-soia-green shadow-card backdrop-blur" role="status">{toast}</div> : null}
    </main>
  );
}
