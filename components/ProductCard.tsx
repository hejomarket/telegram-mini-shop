import type { MouseEvent } from 'react';
import type { Product } from '../lib/products';
import { formatRupiah } from '../lib/format';
import { ProductVisual } from './ProductVisual';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { MinusIcon, PlusIcon } from './ui/Icons';

type ProductCardProps = {
  product: Product;
  quantity: number;
  onAdd: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onOpen: (product: Product) => void;
};

function productBadges(product: Product): Array<{ label: string; tone: 'lime' | 'success' | 'soft' }> {
  const badges: Array<{ label: string; tone: 'lime' | 'success' | 'soft' }> = [];
  if (product.isBestSeller) badges.push({ label: 'Best Seller', tone: 'lime' as const });
  if (product.isFeatured) badges.push({ label: 'Featured', tone: 'success' as const });
  if (product.badge?.toLowerCase() === 'new') badges.push({ label: 'New', tone: 'soft' as const });
  return badges;
}

export function ProductCard({ product, quantity, onAdd, onDecrease, onOpen }: ProductCardProps) {
  const handleStepperClick = (event: MouseEvent) => event.stopPropagation();

  return (
    <Card className="group relative overflow-hidden p-3 transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(18,59,42,.16)] focus-within:ring-2 focus-within:ring-soia-lime/70">
      <button type="button" onClick={() => onOpen(product)} className="block w-full rounded-[1.7rem] text-left focus:outline-none focus:ring-2 focus:ring-soia-green" aria-label={`Lihat detail ${product.name}`}>
        <ProductVisual product={product} />
        <div className="p-2 pt-4">
          <div className="flex flex-wrap gap-2">{productBadges(product).map((badge) => <Badge key={badge.label} tone={badge.tone}>{badge.label}</Badge>)}<Badge>{product.protein} protein</Badge></div>
          <div className="mt-3 min-w-0"><h3 className="text-xl font-black tracking-[-0.03em] text-soia-green">{product.name}</h3><p className="mt-1 product-copy-clamp text-sm leading-6 text-soia-green/64">{product.shortDescription || product.description}</p></div>
          <div className="mt-3 flex items-center gap-1 text-xs font-black text-soia-green/52" aria-label="Rating placeholder"><span aria-hidden="true">★★★★★</span><span>Baru dinilai</span></div>
        </div>
      </button>
      <div className="px-2 pb-2" onClick={handleStepperClick}>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-soia-green/45">Harga</p><p className="text-2xl font-black tracking-[-0.04em] text-soia-green">{formatRupiah(product.price)}</p>{product.compareAtPrice && product.compareAtPrice > product.price ? <p className="text-sm font-bold text-soia-green/45 line-through">{formatRupiah(product.compareAtPrice)}</p> : null}</div>
          {quantity > 0 ? (
            <div className="flex min-h-12 items-center rounded-full border border-soia-green/10 bg-white p-1 shadow-sm" aria-label={`Jumlah ${product.name} di keranjang`}>
              <Button type="button" onClick={() => onDecrease(product.id)} size="icon" aria-label={`Kurangi ${product.name}`}><MinusIcon /></Button>
              <span className="min-w-10 text-center text-sm font-black text-soia-green" aria-live="polite">{quantity}</span>
              <Button type="button" onClick={() => onAdd(product.id)} size="icon" aria-label={`Tambah ${product.name}`}><PlusIcon /></Button>
            </div>
          ) : <Button type="button" onClick={() => onAdd(product.id)} size="lg" disabled={!product.isAvailable} aria-label={`Tambah cepat ${product.name}`}><span className="h-4 w-4"><PlusIcon /></span>{product.isAvailable ? 'Quick Add' : 'Habis'}</Button>}
        </div>
      </div>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return <Card className="overflow-hidden p-3"><div className="h-48 animate-pulse rounded-[1.7rem] bg-soia-green/8" /><div className="space-y-3 p-2 pt-4"><div className="h-5 w-28 animate-pulse rounded-full bg-soia-green/8" /><div className="h-6 w-3/4 animate-pulse rounded-full bg-soia-green/8" /><div className="h-4 w-full animate-pulse rounded-full bg-soia-green/8" /><div className="flex items-end justify-between pt-3"><div className="h-8 w-28 animate-pulse rounded-full bg-soia-green/8" /><div className="h-12 w-32 animate-pulse rounded-full bg-soia-green/8" /></div></div></Card>;
}
