import type { Product } from '../lib/products';

export function ProductVisual({ product }: { product: Product }) {
  const flavor = product.name.replace('SOIA ', '');

  return (
    <div className="relative min-h-44 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,#fff7df,transparent_42%),linear-gradient(135deg,#f3e7c7,#fffaf0)] p-5">
      <div className="absolute -right-10 -top-8 h-32 w-32 rounded-full opacity-25" style={{ backgroundColor: product.accent }} />
      <div className="absolute bottom-5 left-5 h-12 w-12 rounded-full border-[10px] border-soia-green/10" />
      <div className="absolute bottom-7 right-7 h-6 w-20 rounded-full bg-soia-green/10 blur-sm" />
      <div className="relative mx-auto flex h-36 w-28 rotate-[-4deg] flex-col items-center justify-between rounded-[1.6rem] border-2 border-soia-green bg-white p-3 text-center shadow-xl">
        <span className="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white" style={{ backgroundColor: product.accent }}>
          {product.badge}
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-soia-leaf">SOIA</p>
          <strong className="mt-1 block text-lg leading-5 text-soia-green">{flavor}</strong>
        </div>
        <span className="rounded-full bg-soia-cream px-3 py-1 text-[10px] font-bold text-soia-green">{product.protein} protein</span>
      </div>
    </div>
  );
}
