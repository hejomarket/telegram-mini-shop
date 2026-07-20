import type { Product } from '../lib/products';
import { Badge } from './ui/Badge';

export function ProductVisual({ product }: { product: Product }) {
  const flavor = product.name.replace('SOIA ', '');

  return (
    <div className="relative min-h-48 overflow-hidden rounded-[1.7rem] bg-[linear-gradient(145deg,#fffdf8,#eef3e7)] p-5">
      <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-25 blur-sm" style={{ backgroundColor: product.accent }} />
      <div className="absolute left-5 top-5"><Badge tone="lime">{product.badge}</Badge></div>
      <div className="absolute bottom-5 left-8 h-8 w-28 rounded-full bg-soia-green/12 blur-lg" />
      <div className="relative mx-auto mt-5 flex h-36 w-28 rotate-[-3deg] flex-col items-center justify-between rounded-[1.5rem] border border-soia-green/15 bg-white/95 p-3 text-center shadow-soft">
        <span className="h-2 w-12 rounded-full" style={{ backgroundColor: product.accent }} />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-soia-leaf">SOIA</p>
          <strong className="mt-1 block text-xl leading-5 tracking-tight text-soia-green">{flavor}</strong>
        </div>
        <span className="rounded-full bg-soia-mist px-3 py-1 text-[10px] font-black text-soia-green">{product.protein}</span>
      </div>
    </div>
  );
}
