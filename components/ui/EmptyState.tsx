import type { ReactNode } from 'react';

export function EmptyState({ title, description, icon, action }: { title: string; description: string; icon: ReactNode; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-soia-green/15 bg-[linear-gradient(145deg,rgba(255,253,248,.92),rgba(200,241,105,.18))] p-8 text-center shadow-sm">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-soia-lime/30 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-12 left-4 h-28 w-28 rounded-full bg-soia-green/10 blur-2xl" aria-hidden="true" />
      <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-white text-soia-green shadow-soft">
        <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-soia-lime" aria-hidden="true" />
        <div className="relative h-10 w-10">{icon}</div>
      </div>
      <h3 className="relative mt-5 text-xl font-black tracking-[-0.04em] text-soia-green">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-xs text-sm leading-6 text-soia-green/62">{description || 'Tenang, pilihan enak SOIA akan segera hadir lagi. Coba cek kategori lain dulu, ya.'}</p>
      {action ? <div className="relative mt-6">{action}</div> : null}
    </div>
  );
}
