import type { Product } from '../lib/products';
import { formatRupiah } from '../lib/format';
import { ProductVisual } from './ProductVisual';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PlusIcon } from './ui/Icons';

type ProductCardProps = { product: Product; quantity: number; onAdd: (productId: string) => void; };

export function ProductCard({ product, quantity, onAdd }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden p-3 transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(18,59,42,.14)]">
      <ProductVisual product={product} />
      <div className="p-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><h3 className="text-xl font-black tracking-[-0.03em] text-soia-green">{product.name}</h3><p className="mt-1 text-sm leading-6 text-soia-green/64">{product.description}</p></div>
          {quantity > 0 ? <span className="grid h-8 min-w-8 place-items-center rounded-full bg-soia-green px-2 text-xs font-black text-white" aria-label={`${quantity} in cart`}>{quantity}</span> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{product.isFeatured ? <Badge tone="lime">Produk Unggulan</Badge> : null}<Badge tone={product.isAvailable ? 'success' : 'soft'}>{product.isAvailable ? 'Tersedia' : 'Stok sedang tidak tersedia'}</Badge><Badge>{product.protein} protein</Badge><Badge>{product.weight}</Badge></div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-soia-green/45">Price</p><p className="text-2xl font-black tracking-[-0.04em] text-soia-green">{formatRupiah(product.price)}</p>{product.compareAtPrice && product.compareAtPrice > product.price ? <p className="text-sm font-bold text-soia-green/45 line-through">{formatRupiah(product.compareAtPrice)}</p> : null}</div>
          <Button type="button" onClick={() => onAdd(product.id)} size="lg" disabled={!product.isAvailable} aria-label={`Add ${product.name} to cart`}><span className="h-4 w-4"><PlusIcon /></span>{product.isAvailable ? 'Add' : 'Tidak Tersedia'}</Button>
        </div>
      </div>
    </Card>
  );
}
