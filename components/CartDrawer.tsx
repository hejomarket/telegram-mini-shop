'use client';

import { productById } from '../lib/products';
import { formatRupiah } from '../lib/format';
import { useCart } from '../lib/cart';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { CartIcon, CloseIcon, LeafIcon, MinusIcon, PlusIcon, TrashIcon } from './ui/Icons';

type CartDrawerProps = { isOpen: boolean; onClose: () => void; onQuantityChange: () => void; onCheckout?: () => void; };

export function CartDrawer({ isOpen, onClose, onQuantityChange, onCheckout }: CartDrawerProps) {
  const cart = useCart();
  if (!isOpen) return null;

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end bg-soia-forest/45 px-2 pb-2 pt-12 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={onClose}>
      <aside className="sheet flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-[var(--tg-card)] text-soia-green shadow-2xl sm:mx-auto sm:max-w-md" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-soia-green/8 bg-[var(--tg-card)]/95 p-5 backdrop-blur">
          <div><p className="text-xs font-black uppercase tracking-[0.14em] text-soia-green/45">Your order</p><h2 id="cart-title" className="text-2xl font-black tracking-[-0.04em]">Cart</h2></div>
          <Button type="button" onClick={onClose} variant="outline" size="icon" aria-label="Close cart"><CloseIcon /></Button>
        </div>
        <div className="overflow-y-auto p-5">
          {cart.items.length === 0 ? <EmptyState icon={<LeafIcon />} title="Your cart is empty" description="Add a SOIA flavor and your order summary will appear here." /> : (
            <div className="space-y-3">
              {cart.items.map((item) => {
                const product = productById.get(item.productId); if (!product) return null;
                return (
                  <article key={item.productId} className="rounded-[1.5rem] border border-soia-green/8 bg-soia-cream/55 p-4">
                    <div className="flex justify-between gap-3"><div><h3 className="font-black tracking-tight">{product.name}</h3><p className="mt-1 text-sm text-soia-green/58">{formatRupiah(product.price)} × {item.quantity}</p></div><p className="font-black">{formatRupiah(product.price * item.quantity)}</p></div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button type="button" onClick={() => { onQuantityChange(); cart.decreaseItem(item.productId); }} variant="outline" size="icon" aria-label={`Decrease ${product.name} quantity`}><MinusIcon /></Button>
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black shadow-sm" aria-label={`${product.name} quantity`}>{item.quantity}</span>
                      <Button type="button" onClick={() => { onQuantityChange(); cart.increaseItem(item.productId); }} variant="secondary" size="icon" aria-label={`Increase ${product.name} quantity`}><PlusIcon /></Button>
                      <Button type="button" onClick={() => cart.removeItem(item.productId)} variant="danger" size="icon" className="ml-auto" aria-label={`Remove ${product.name} from cart`}><TrashIcon /></Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 border-t border-soia-green/8 bg-[var(--tg-card)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-soia-green/45">Total</p><p className="text-sm text-soia-green/58">{cart.itemCount} item{cart.itemCount === 1 ? '' : 's'}</p></div><p className="text-3xl font-black tracking-[-0.05em]">{formatRupiah(cart.totalPrice)}</p></div>
          <div className="flex gap-2"><Button type="button" onClick={cart.clearCart} variant="outline" disabled={cart.items.length === 0} className="flex-1">Clear</Button><Button type="button" onClick={onCheckout} disabled={cart.items.length === 0} className="flex-[2]"><span className="h-4 w-4"><CartIcon /></span>Checkout</Button></div>
        </div>
      </aside>
    </div>
  );
}
