'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/cart';
import { formatRupiah } from '../../lib/format';
import { useTelegram } from '../../providers/TelegramProvider';
import { ProductVisual } from '../../components/ProductVisual';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { CartIcon, LeafIcon, MinusIcon, PlusIcon, TrashIcon } from '../../components/ui/Icons';
import {
  ADDRESS_STORAGE_KEY,
  CUSTOMER_STORAGE_KEY,
  LAST_ORDER_STORAGE_KEY,
  emptyAddress,
  emptyCustomer,
  getOrderItems,
  safeReadJson,
  safeWriteJson,
  type CheckoutAddress,
  type CheckoutCustomer,
  type DemoOrder,
} from '../../lib/checkout';
import { productById } from '../../lib/products';

const steps = ['Ringkasan', 'Data', 'Pengiriman', 'Konfirmasi'];

type CustomerErrors = Partial<Record<keyof CheckoutCustomer, string>>;
type AddressErrors = Partial<Record<keyof CheckoutAddress, string>>;

function validateCustomer(customer: CheckoutCustomer): CustomerErrors {
  const errors: CustomerErrors = {};
  if (customer.fullName.trim().length < 3) errors.fullName = 'Nama lengkap minimal 3 karakter.';
  if (!/^\+?[0-9\s-]{9,16}$/.test(customer.whatsapp.trim())) errors.whatsapp = 'Masukkan nomor WhatsApp yang aktif.';
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.email = 'Format email belum sesuai.';
  return errors;
}

function validateAddress(address: CheckoutAddress): AddressErrors {
  const errors: AddressErrors = {};
  if (address.address.trim().length < 10) errors.address = 'Alamat lengkap minimal 10 karakter.';
  if (address.district.trim().length < 3) errors.district = 'Kecamatan wajib diisi.';
  if (address.city.trim().length < 3) errors.city = 'Kota / Kabupaten wajib diisi.';
  if (address.province.trim().length < 3) errors.province = 'Provinsi wajib diisi.';
  if (!/^\d{5}$/.test(address.postalCode.trim())) errors.postalCode = 'Kode pos harus 5 digit.';
  return errors;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-sm font-extrabold text-soia-green">{label}<div className="mt-2">{children}</div>{error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}</label>;
}

const inputClass = (error?: string) => `min-h-12 w-full rounded-2xl border bg-white/80 px-4 text-sm font-semibold text-soia-green shadow-sm outline-none transition focus:border-soia-green focus:ring-4 focus:ring-soia-lime/30 ${error ? 'border-red-300 ring-4 ring-red-100' : 'border-soia-green/10'}`;

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { user, isTelegram, triggerHaptic } = useTelegram();
  const [customer, setCustomer] = useState(emptyCustomer);
  const [address, setAddress] = useState(emptyAddress);
  const [confirmed, setConfirmed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const storedCustomer = safeReadJson(CUSTOMER_STORAGE_KEY, emptyCustomer);
    const storedAddress = safeReadJson(ADDRESS_STORAGE_KEY, emptyAddress);
    if (!storedCustomer.fullName && isTelegram && user) {
      storedCustomer.fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
    }
    setCustomer(storedCustomer);
    setAddress(storedAddress);
    setHydrated(true);
  }, [isTelegram, user]);

  useEffect(() => { if (hydrated) safeWriteJson(CUSTOMER_STORAGE_KEY, customer); }, [customer, hydrated]);
  useEffect(() => { if (hydrated) safeWriteJson(ADDRESS_STORAGE_KEY, address); }, [address, hydrated]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 2200); return () => window.clearTimeout(timer); }, [toast]);

  const orderItems = useMemo(() => getOrderItems(cart.items), [cart.items]);
  const customerErrors = useMemo(() => validateCustomer(customer), [customer]);
  const addressErrors = useMemo(() => validateAddress(address), [address]);
  const isValid = cart.items.length > 0 && Object.keys(customerErrors).length === 0 && Object.keys(addressErrors).length === 0 && confirmed;
  const activeStep = !cart.items.length ? 0 : Object.keys(customerErrors).length ? 1 : Object.keys(addressErrors).length ? 2 : 3;

  const updateCustomer = (key: keyof CheckoutCustomer, value: string) => { setCustomer((current) => ({ ...current, [key]: value })); setConfirmed(false); };
  const updateAddress = (key: keyof CheckoutAddress, value: string) => { setAddress((current) => ({ ...current, [key]: value })); setConfirmed(false); };

  const submit = async () => {
    if (!isValid) { setToast('Lengkapi data dan centang konfirmasi terlebih dahulu.'); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          address,
          items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          telegram: user ? {
            userId: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            language: user.language_code,
          } : undefined,
        }),
      });
      const result = await response.json() as { success: boolean; orderNumber?: string; mode?: DemoOrder['mode']; message?: string };
      if (!response.ok || !result.success || !result.orderNumber) throw new Error(result.message || 'Pesanan gagal dibuat.');
      const completedOrder: DemoOrder = {
        id: result.orderNumber,
        mode: result.mode ?? 'demo',
        createdAt: new Date().toISOString(),
        customer,
        delivery: address,
        items: orderItems,
        totalQuantity: cart.itemCount,
        grandTotal: cart.totalPrice,
      };
      safeWriteJson(LAST_ORDER_STORAGE_KEY, completedOrder);
      cart.clearCart();
      triggerHaptic();
      router.push('/checkout/success');
    } catch {
      setToast('Pesanan belum dapat dibuat. Coba lagi beberapa saat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hydrated) return <main className="safe mx-auto min-h-screen w-full max-w-5xl px-4"><div className="mt-6 h-32 animate-pulse rounded-[2rem] bg-white/60" /></main>;

  if (cart.items.length === 0) return <main className="safe mx-auto grid min-h-screen w-full max-w-md place-items-center px-4"><EmptyState icon={<LeafIcon />} title="Keranjang masih kosong" description="Pilih varian SOIA favoritmu sebelum melanjutkan checkout." action={<Button type="button" onClick={() => router.push('/')} size="lg">Belanja Sekarang</Button>} /></main>;

  return (
    <main className="safe mx-auto min-h-screen w-full max-w-5xl px-4 pb-28 text-soia-green">
      <header className="sticky top-0 z-20 -mx-4 border-b border-soia-green/5 bg-[var(--tg-bg)]/85 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-soia-green/45">Checkout aman</p><h1 className="text-2xl font-black tracking-[-0.05em]">Selesaikan Pesanan</h1></div><Button type="button" variant="outline" onClick={() => router.push('/')}>Belanja</Button></div>
      </header>

      <nav className="my-5 grid grid-cols-4 gap-2" aria-label="Progress checkout">{steps.map((step, index) => <div key={step} className={`rounded-2xl p-3 text-center text-[11px] font-black ${index <= activeStep ? 'bg-soia-green text-white' : 'bg-white/60 text-soia-green/45'}`}>{index + 1}. {step}</div>)}</nav>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <section className="space-y-5">
          <div className="rounded-[2rem] border border-soia-green/8 bg-white/75 p-4 shadow-card"><h2 className="text-xl font-black">1. Ringkasan Pesanan</h2><div className="mt-4 space-y-3">{cart.items.map((item) => { const product = productById.get(item.productId); if (!product) return null; return <article key={item.productId} className="grid gap-3 rounded-[1.5rem] bg-soia-cream/70 p-3 sm:grid-cols-[9rem_1fr]"><ProductVisual product={product} /><div><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{product.name}</h3><p className="text-sm font-bold text-soia-green/55">{formatRupiah(product.price)} / pcs</p></div><strong>{formatRupiah(product.price * item.quantity)}</strong></div><div className="mt-4 flex items-center gap-2"><Button type="button" variant="outline" size="icon" aria-label={`Kurangi ${product.name}`} onClick={() => cart.decreaseItem(item.productId)}><MinusIcon /></Button><input aria-label={`Jumlah ${product.name}`} className="h-11 w-16 rounded-2xl border border-soia-green/10 text-center font-black" type="number" min="1" max="99" value={item.quantity} onChange={(event) => cart.setItemQuantity(item.productId, Number(event.target.value))} /><Button type="button" variant="secondary" size="icon" aria-label={`Tambah ${product.name}`} onClick={() => cart.increaseItem(item.productId)}><PlusIcon /></Button><Button type="button" variant="danger" size="icon" className="ml-auto" aria-label={`Hapus ${product.name}`} onClick={() => cart.removeItem(item.productId)}><TrashIcon /></Button></div></div></article>; })}</div><div className="mt-4 flex items-center justify-between rounded-2xl bg-soia-green p-4 text-white"><span className="font-bold">{cart.itemCount} produk</span><strong className="text-2xl tracking-[-0.04em]">{formatRupiah(cart.totalPrice)}</strong></div></div>

          <div className="rounded-[2rem] border border-soia-green/8 bg-white/75 p-4 shadow-card"><h2 className="text-xl font-black">2. Informasi Pelanggan</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Nama Lengkap *" error={customerErrors.fullName}><input className={inputClass(customerErrors.fullName)} value={customer.fullName} onChange={(e) => updateCustomer('fullName', e.target.value)} autoComplete="name" /></Field><Field label="Nomor WhatsApp *" error={customerErrors.whatsapp}><input className={inputClass(customerErrors.whatsapp)} value={customer.whatsapp} onChange={(e) => updateCustomer('whatsapp', e.target.value)} inputMode="tel" autoComplete="tel" /></Field><Field label="Email (opsional)" error={customerErrors.email}><input className={inputClass(customerErrors.email)} value={customer.email} onChange={(e) => updateCustomer('email', e.target.value)} inputMode="email" autoComplete="email" /></Field></div></div>

          <div className="rounded-[2rem] border border-soia-green/8 bg-white/75 p-4 shadow-card"><h2 className="text-xl font-black">3. Informasi Pengiriman</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Alamat Lengkap *" error={addressErrors.address}><textarea className={`${inputClass(addressErrors.address)} min-h-28 py-3`} value={address.address} onChange={(e) => updateAddress('address', e.target.value)} /></Field><Field label="Kecamatan *" error={addressErrors.district}><input className={inputClass(addressErrors.district)} value={address.district} onChange={(e) => updateAddress('district', e.target.value)} /></Field><Field label="Kota / Kabupaten *" error={addressErrors.city}><input className={inputClass(addressErrors.city)} value={address.city} onChange={(e) => updateAddress('city', e.target.value)} /></Field><Field label="Provinsi *" error={addressErrors.province}><input className={inputClass(addressErrors.province)} value={address.province} onChange={(e) => updateAddress('province', e.target.value)} /></Field><Field label="Kode Pos *" error={addressErrors.postalCode}><input className={inputClass(addressErrors.postalCode)} value={address.postalCode} onChange={(e) => updateAddress('postalCode', e.target.value)} inputMode="numeric" maxLength={5} /></Field><Field label="Catatan Pesanan (opsional)"><textarea className={`${inputClass()} min-h-24 py-3`} value={address.notes} onChange={(e) => updateAddress('notes', e.target.value)} /></Field></div></div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-soia-green/8 bg-[var(--tg-card)] p-5 shadow-card lg:sticky lg:top-24"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-soia-mist"><CartIcon /></div><h2 className="mt-4 text-xl font-black">4. Konfirmasi</h2><div className="mt-4 space-y-3 text-sm font-semibold text-soia-green/70"><p><strong className="text-soia-green">Nama:</strong> {customer.fullName || '-'}</p><p><strong className="text-soia-green">WhatsApp:</strong> {customer.whatsapp || '-'}</p><p><strong className="text-soia-green">Alamat:</strong> {[address.address, address.district, address.city, address.province, address.postalCode].filter(Boolean).join(', ') || '-'}</p><div><strong className="text-soia-green">Produk:</strong><ul className="mt-2 space-y-1">{orderItems.map((item) => <li key={item.productId}>{item.name} × {item.quantity}</li>)}</ul></div><p><strong className="text-soia-green">Total quantity:</strong> {cart.itemCount}</p><p className="text-2xl font-black text-soia-green">{formatRupiah(cart.totalPrice)}</p></div><label className="mt-5 flex items-start gap-3 rounded-2xl bg-soia-cream/70 p-4 text-sm font-bold"><input className="mt-1 h-5 w-5 accent-soia-green" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />Saya sudah memeriksa ringkasan pesanan dan memahami total akan dihitung ulang oleh server.</label><Button type="button" size="lg" className="mt-4 w-full" isLoading={isSubmitting} disabled={!isValid} onClick={submit}>Buat Pesanan</Button></aside>
      </div>
      {toast ? <div className="toast-in fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-soia-green/10 bg-white/95 px-4 py-3 text-sm font-bold text-soia-green shadow-card" role="status">{toast}</div> : null}
    </main>
  );
}
