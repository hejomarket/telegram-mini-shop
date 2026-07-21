'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '../lib/products';
import type { ProductCategoryNavigationItem } from '../lib/products/categories';
import { getCategoryHref } from '../lib/products/categories';
import type { PublicBanner } from '../lib/merchandising/types';
import { useCart } from '../lib/cart';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramMainButton } from '../hooks/useTelegramMainButton';
import { CartDrawer } from './CartDrawer';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { ProductQuickView } from './ProductQuickView';
import { StorefrontBannerCarousel } from './StorefrontBannerCarousel';
import { TelegramDebugPanel } from './telegram/TelegramDebugPanel';
import { TelegramProfile } from './telegram/TelegramProfile';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { CartIcon, LeafIcon } from './ui/Icons';

type AppShellProps = { products: Product[]; allProducts?: Product[]; featuredProducts?: Product[]; bestSellerProducts?: Product[]; categories?: ProductCategoryNavigationItem[]; selectedCategory?: ProductCategoryNavigationItem | null; selectedCategoryValue?: string | null; hasInvalidCategory?: boolean; banners?: PublicBanner[] };
export function AppShell({ products, allProducts = products, featuredProducts = [], bestSellerProducts = [], categories = [], selectedCategory = null, selectedCategoryValue = null, hasInvalidCategory = false, banners = [] }: AppShellProps) {
  const router = useRouter();
  const cart = useCart();
  const { triggerHaptic, user, mode } = useTelegram();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showSkeletonPreview, setShowSkeletonPreview] = useState(true);

  const quantities = useMemo(() => new Map(cart.items.map((item) => [item.productId, item.quantity])), [cart.items]);
  const greetingName = user?.first_name || 'there';

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    router.push('/checkout');
  }, [router]);

  useTelegramMainButton(cart.itemCount, openCheckout);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSkeletonPreview(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAddItem = (productId: string) => {
    triggerHaptic();
    cart.addItem(productId);
    const product = allProducts.find((item) => item.id === productId);
    setToast(`${product?.name ?? 'Item'} ditambahkan ke keranjang`);
  };

  const handleDecreaseItem = (productId: string) => {
    triggerHaptic();
    cart.decreaseItem(productId);
    setToast('Jumlah keranjang diperbarui');
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

      <StorefrontBannerCarousel banners={banners} />

      <StorefrontCategoryNavigation categories={categories} selectedCategoryValue={selectedCategory?.value ?? selectedCategoryValue} />
      <ProductSection id="featured" eyebrow="Pilihan SOIA" title="Pilihan SOIA" description="Produk unggulan yang kami pilih untuk kamu." products={featuredProducts} quantities={quantities} onAdd={handleAddItem} onDecrease={handleDecreaseItem} onOpen={setQuickViewProduct} isLoading={showSkeletonPreview} hideWhenEmpty />
      <ProductSection id="best-sellers" eyebrow="Favorit" title="Paling Banyak Dipilih" description="Produk favorit pelanggan SOIA." products={bestSellerProducts} quantities={quantities} onAdd={handleAddItem} onDecrease={handleDecreaseItem} onOpen={setQuickViewProduct} isLoading={showSkeletonPreview} hideWhenEmpty />
      <ProductSection id="products" eyebrow="Shop" title={selectedCategory ? `Produk: ${selectedCategory.label}` : 'Semua Produk'} description={selectedCategory ? 'Menampilkan produk dalam kategori pilihan kamu.' : undefined} products={products} quantities={quantities} onAdd={handleAddItem} onDecrease={handleDecreaseItem} onOpen={setQuickViewProduct} isLoading={showSkeletonPreview} emptyTitle={selectedCategoryValue || hasInvalidCategory ? 'Belum ada produk dalam kategori ini.' : 'Produk sedang belum tersedia.'} emptyDescription={selectedCategoryValue || hasInvalidCategory ? 'Coba kategori lain atau kembali lihat semua produk SOIA.' : 'Katalog SOIA akan tampil kembali setelah produk aktif tersedia.'} action={selectedCategoryValue || hasInvalidCategory ? <Link href="/#products" className="inline-flex min-h-11 items-center rounded-full bg-soia-green px-5 font-bold text-white">Lihat Semua Produk</Link> : null} headerAction={selectedCategory ? <Link href="/#products" className="text-sm font-black text-soia-green underline">Lihat Semua</Link> : <p className="text-sm font-bold text-soia-green/50">{products.length} items</p>} />

      <TelegramDebugPanel />
      <ProductQuickView product={quickViewProduct} quantity={quickViewProduct ? quantities.get(quickViewProduct.id) ?? 0 : 0} onClose={() => setQuickViewProduct(null)} onAdd={handleAddItem} onDecrease={handleDecreaseItem} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onQuantityChange={() => { triggerHaptic(); setToast('Quantity updated'); }} onCheckout={openCheckout} />

      {toast ? <div className="toast-in fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-soia-green/10 bg-white/95 px-4 py-3 text-sm font-bold text-soia-green shadow-card backdrop-blur" role="status">{toast}</div> : null}
    </main>
  );
}

function StorefrontCategoryNavigation({ categories, selectedCategoryValue }: { categories: ProductCategoryNavigationItem[]; selectedCategoryValue: string | null | undefined }) {
  if (categories.length === 0) return null;
  const items = [{ label: 'Semua', value: null as string | null }, ...categories];
  return <nav aria-label="Kategori produk" className="mt-6 overflow-x-auto pb-2 storefront-chip-scroll"><div className="flex min-w-0 gap-2">{items.map(item => { const selected = item.value === (selectedCategoryValue ?? null); return <Link key={item.value ?? 'all'} href={getCategoryHref(item.value)} aria-current={selected ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-soia-green ${selected ? 'border-soia-green bg-soia-green text-white ring-2 ring-soia-lime/60' : 'border-soia-green/10 bg-white text-soia-green shadow-sm'}`}>{item.label}{selected ? <span className="ml-2 text-xs" aria-hidden="true">✓</span> : null}</Link>; })}</div></nav>;
}

function ProductSection({ id, eyebrow, title, description, products, quantities, onAdd, onDecrease, onOpen, isLoading, hideWhenEmpty, emptyTitle = 'Produk sedang belum tersedia.', emptyDescription = '', action, headerAction }: { id: string; eyebrow: string; title: string; description?: string; products: Product[]; quantities: Map<string, number>; onAdd: (productId: string) => void; onDecrease: (productId: string) => void; onOpen: (product: Product) => void; isLoading?: boolean; hideWhenEmpty?: boolean; emptyTitle?: string; emptyDescription?: string; action?: React.ReactNode; headerAction?: React.ReactNode }) {
  if (hideWhenEmpty && products.length === 0) return null;
  return <section id={id} className="scroll-mt-24 py-6" aria-labelledby={`${id}-title`}><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-soia-green/45">{eyebrow}</p><h2 id={`${id}-title`} className="text-2xl font-black tracking-[-0.05em] text-soia-green">{title}</h2>{description ? <p className="mt-1 text-sm font-semibold text-soia-green/58">{description}</p> : null}</div>{headerAction}</div>{isLoading ? <div className="grid gap-4 md:grid-cols-2" aria-label="Memuat produk">{[0, 1, 2, 3].map((item) => <ProductCardSkeleton key={item} />)}</div> : products.length === 0 ? <EmptyState icon={<LeafIcon />} title={emptyTitle} description={emptyDescription} action={action} /> : <div className="grid gap-4 md:grid-cols-2">{products.map((product) => <ProductCard key={product.id} product={product} quantity={quantities.get(product.id) ?? 0} onAdd={onAdd} onDecrease={onDecrease} onOpen={onOpen} />)}</div>}</section>;
}
