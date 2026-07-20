import type { Product } from '../lib/products';
import { formatRupiah } from '../lib/format';
import { ProductVisual } from './ProductVisual';

type ProductCardProps = {
  product: Product;
  onAdd: (productId: string) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="rounded-[2rem] bg-white p-4 shadow-[0_18px_45px_rgba(23,53,41,0.08)] ring-1 ring-soia-green/10">
      <ProductVisual product={product} />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black tracking-tight text-soia-green">{product.name}</h3>
          <p className="mt-1 text-sm leading-6 text-soia-green/70">{product.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-soia-cream px-3 py-1 text-xs font-black text-soia-green">{product.badge}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl bg-soia-cream/70 p-3">
          <dt className="text-soia-green/60">Weight</dt>
          <dd className="font-black text-soia-green">{product.weight}</dd>
        </div>
        <div className="rounded-2xl bg-soia-cream/70 p-3">
          <dt className="text-soia-green/60">Protein</dt>
          <dd className="font-black text-soia-green">{product.protein}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-2xl font-black text-soia-green">{formatRupiah(product.price)}</p>
        <button type="button" onClick={() => onAdd(product.id)} className="rounded-2xl bg-soia-green px-5 py-4 text-sm font-black text-white shadow-lg shadow-soia-green/20" aria-label={`Add ${product.name} to cart`}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
