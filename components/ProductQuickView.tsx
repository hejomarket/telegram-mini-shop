'use client';

import { useEffect, useRef } from 'react';
import type { Product } from '../lib/products';
import { formatRupiah } from '../lib/format';
import { ProductVisual } from './ProductVisual';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { CloseIcon, MinusIcon, PlusIcon } from './ui/Icons';

type ProductQuickViewProps = {
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onAdd: (productId: string) => void;
  onDecrease: (productId: string) => void;
};

export function ProductQuickView({ product, quantity, onClose, onAdd, onDecrease }: ProductQuickViewProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => dialog?.querySelectorAll<HTMLElement>(focusableSelector)[0]?.focus();
    focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter((el: HTMLElement) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [product, onClose]);

  if (!product) return null;
  const nutrition = [product.protein ? `${product.protein} protein` : null, product.weight, product.servingSizeGrams ? `${product.servingSizeGrams} g / serving` : null].filter((item): item is string => Boolean(item));

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-soia-forest/45 p-0 backdrop-blur-sm md:items-center md:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="product-quick-view-title" className="quick-view-in max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-[var(--tg-bg)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-28px_90px_rgba(18,59,42,.24)] outline-none md:max-w-2xl md:rounded-[2rem] md:p-6 md:shadow-card">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-soia-green/18 md:hidden" aria-hidden="true" />
        <div className="mb-3 flex items-center justify-between gap-3"><Badge tone="lime">Detail Produk</Badge><Button type="button" size="icon" onClick={onClose} aria-label="Tutup detail produk"><CloseIcon /></Button></div>
        <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <ProductVisual product={product} />
          <div>
            <h2 id="product-quick-view-title" className="text-3xl font-black tracking-[-0.06em] text-soia-green">{product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-soia-green/65">{product.description}</p>
            <div className="mt-4 rounded-3xl bg-soia-cream/70 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-soia-green/45">Nutrisi</p><div className="mt-3 flex flex-wrap gap-2">{nutrition.map((item) => <Badge key={item}>{item}</Badge>)}</div>{product.ingredients ? <p className="mt-3 text-sm font-semibold text-soia-green/62">Komposisi: {product.ingredients}</p> : null}</div>
            <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-soia-green/45">Harga</p><p className="text-3xl font-black tracking-[-0.05em] text-soia-green">{formatRupiah(product.price)}</p>{product.compareAtPrice && product.compareAtPrice > product.price ? <p className="text-sm font-bold text-soia-green/45 line-through">{formatRupiah(product.compareAtPrice)}</p> : null}</div><div className="flex min-h-12 items-center rounded-full border border-soia-green/10 bg-white p-1 shadow-sm"><Button type="button" size="icon" onClick={() => onDecrease(product.id)} aria-label={`Kurangi ${product.name}`} disabled={quantity === 0}><MinusIcon /></Button><span className="min-w-10 text-center text-sm font-black text-soia-green" aria-live="polite">{quantity}</span><Button type="button" size="icon" onClick={() => onAdd(product.id)} aria-label={`Tambah ${product.name}`}><PlusIcon /></Button></div></div>
            <Button type="button" size="lg" className="mt-5 w-full justify-center" disabled={!product.isAvailable} onClick={() => onAdd(product.id)}>{product.isAvailable ? (quantity > 0 ? 'Tambah Lagi' : 'Add to Cart') : 'Stok sedang habis'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
