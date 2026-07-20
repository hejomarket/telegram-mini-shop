'use client';

import { productById } from '../lib/products';
import { formatRupiah } from '../lib/format';
import { useCart } from '../lib/cart';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onQuantityChange: () => void;
};

export function CartDrawer({ isOpen, onClose, onQuantityChange }: CartDrawerProps) {
  const cart = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/45 px-3 pb-3 pt-12" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={onClose}>
      <aside className="sheet max-h-[88vh] w-full overflow-y-auto rounded-[2rem] bg-white p-5 text-soia-green shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-soia-green/60">Your order</p>
            <h2 id="cart-title" className="text-2xl font-black">Cart</h2>
          </div>
          <button type="button" onClick={onClose} className="h-11 w-11 rounded-full bg-soia-cream text-xl font-black" aria-label="Close cart">×</button>
        </div>

        {cart.items.length === 0 ? (
          <div className="mt-6 rounded-[1.7rem] bg-soia-cream/70 p-8 text-center">
            <p className="text-5xl" aria-hidden="true">🌱</p>
            <p className="mt-3 text-lg font-black">Your cart is empty.</p>
            <p className="mt-1 text-sm text-soia-green/65">Add a SOIA flavor to start your order.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {cart.items.map((item) => {
              const product = productById.get(item.productId);
              if (!product) return null;

              return (
                <article key={item.productId} className="rounded-3xl bg-soia-cream/60 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-black">{product.name}</h3>
                      <p className="text-sm text-soia-green/65">{formatRupiah(product.price)} × {item.quantity}</p>
                    </div>
                    <p className="font-black">{formatRupiah(product.price * item.quantity)}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button type="button" onClick={() => { onQuantityChange(); cart.decreaseItem(item.productId); }} className="h-11 w-11 rounded-full bg-white text-xl font-black" aria-label={`Decrease ${product.name} quantity`}>−</button>
                    <span className="w-9 text-center font-black" aria-label={`${product.name} quantity`}>{item.quantity}</span>
                    <button type="button" onClick={() => { onQuantityChange(); cart.increaseItem(item.productId); }} className="h-11 w-11 rounded-full bg-soia-green text-xl font-black text-white" aria-label={`Increase ${product.name} quantity`}>+</button>
                    <button type="button" onClick={() => cart.removeItem(item.productId)} className="ml-auto rounded-full px-3 py-2 text-sm font-black text-red-700" aria-label={`Remove ${product.name} from cart`}>Remove</button>
                  </div>
                </article>
              );
            })}
            <div className="rounded-[1.7rem] bg-soia-green p-5 text-white">
              <div className="flex items-center justify-between text-sm font-bold text-white/75">
                <span>{cart.itemCount} item{cart.itemCount === 1 ? '' : 's'}</span>
                <button type="button" onClick={cart.clearCart} className="underline underline-offset-4">Clear cart</button>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-sm text-white/75">Total</p>
                <p className="text-3xl font-black">{formatRupiah(cart.totalPrice)}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
