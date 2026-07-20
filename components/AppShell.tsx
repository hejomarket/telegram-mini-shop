'use client';

import { useState } from 'react';
import { products } from '../lib/products';
import { useCart } from '../lib/cart';
import { CartDrawer } from './CartDrawer';
import { ProductCard } from './ProductCard';

export function AppShell() {
  const cart = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="safe mx-auto min-h-screen w-full max-w-md px-4">
      <header className="sticky top-0 z-30 -mx-4 bg-soia-cream/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-soia-green/65">Hi, welcome back</p>
            <h1 className="text-xl font-black tracking-tight text-soia-green">SOIA Protein Shop</h1>
          </div>
          <button type="button" onClick={() => setIsCartOpen(true)} className="relative rounded-2xl bg-soia-green p-3 text-white shadow-lg shadow-soia-green/20" aria-label="Open cart">
            <span aria-hidden="true">🛒</span>
            <span className="absolute -right-2 -top-2 grid min-h-6 min-w-6 place-items-center rounded-full bg-amber-300 px-1 text-xs font-black text-soia-green">{cart.itemCount}</span>
          </button>
        </div>
      </header>

      <section className="my-5 overflow-hidden rounded-[2.2rem] bg-soia-green p-6 text-white shadow-xl shadow-soia-green/15">
        <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-black">3 pilihan rasa</span>
        <h2 className="mt-5 text-3xl font-black leading-tight">Protein nabati, dibuat lebih menyenangkan.</h2>
        <p className="mt-3 text-base leading-7 text-white/78">Snack berbahan pangan nyata dengan rasa yang mudah dinikmati setiap hari.</p>
      </section>

      <section className="grid gap-4 pb-10" aria-labelledby="products-title">
        <h2 id="products-title" className="sr-only">Products</h2>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={cart.addItem} />
        ))}
      </section>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
