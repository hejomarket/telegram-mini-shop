'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '../../../lib/format';
import { LAST_ORDER_STORAGE_KEY, safeReadJson, type DemoOrder } from '../../../lib/checkout';
import { Button } from '../../../components/ui/Button';
import { CartIcon, LeafIcon } from '../../../components/ui/Icons';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setOrder(safeReadJson<DemoOrder | null>(LAST_ORDER_STORAGE_KEY, null));
  }, []);

  if (!order) {
    return <main className="safe mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 text-soia-green"><section className="rounded-[2rem] border border-soia-green/8 bg-white/80 p-6 text-center shadow-card"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-soia-mist"><LeafIcon /></div><h1 className="mt-4 text-2xl font-black">Ringkasan belum tersedia</h1><p className="mt-2 text-sm leading-6 text-soia-green/60">Belum ada pesanan demo tersimpan di perangkat ini.</p><Button type="button" className="mt-5 w-full" onClick={() => router.push('/')}>Kembali Belanja</Button></section></main>;
  }

  const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(order.createdAt));

  return (
    <main className="safe mx-auto min-h-screen w-full max-w-2xl px-4 text-soia-green">
      <section className="mt-6 overflow-hidden rounded-[2.4rem] border border-soia-green/8 bg-[var(--tg-card)] shadow-card">
        <div className="bg-soia-green p-7 text-white"><div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/12 text-soia-lime"><CartIcon /></div><p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-white/55">Mode: Demo</p><h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">Pesanan Berhasil Dibuat</h1><p className="mt-3 text-sm leading-6 text-white/70">Pembayaran dan integrasi backend akan ditambahkan pada task berikutnya. Pesanan ini hanya tersimpan di browser localStorage.</p></div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-soia-cream/70 p-4"><p className="text-xs font-black uppercase text-soia-green/45">Nomor Pesanan</p><strong className="mt-1 block break-all">{order.id}</strong></div>
          <div className="rounded-2xl bg-soia-cream/70 p-4"><p className="text-xs font-black uppercase text-soia-green/45">Tanggal</p><strong className="mt-1 block">{date}</strong></div>
          <div className="rounded-2xl bg-soia-cream/70 p-4"><p className="text-xs font-black uppercase text-soia-green/45">Customer Name</p><strong className="mt-1 block">{order.customer.fullName}</strong></div>
          <div className="rounded-2xl bg-soia-cream/70 p-4"><p className="text-xs font-black uppercase text-soia-green/45">Grand Total</p><strong className="mt-1 block text-2xl">{formatRupiah(order.grandTotal)}</strong></div>
        </div>
        {showSummary ? <div className="border-t border-soia-green/8 p-5"><h2 className="font-black">Ringkasan Pesanan</h2><ul className="mt-3 space-y-2 text-sm font-semibold text-soia-green/70">{order.items.map((item) => <li key={item.productId} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{formatRupiah(item.subtotal)}</span></li>)}</ul><p className="mt-4 rounded-2xl bg-soia-green p-4 text-right text-xl font-black text-white">{order.totalQuantity} produk · {formatRupiah(order.grandTotal)}</p></div> : null}
        <div className="grid gap-3 p-5 sm:grid-cols-2"><Button type="button" size="lg" onClick={() => router.push('/')}>Kembali Belanja</Button><Button type="button" size="lg" variant="outline" onClick={() => setShowSummary((current) => !current)}>Lihat Ringkasan Pesanan</Button></div>
      </section>
    </main>
  );
}
