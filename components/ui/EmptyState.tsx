import type { ReactNode } from 'react';

export function EmptyState({ title, description, icon, action }: { title: string; description: string; icon: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-soia-green/15 bg-soia-cream/55 p-7 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-soia-green shadow-soft">{icon}</div>
      <h3 className="mt-4 text-lg font-black tracking-tight text-soia-green">{title}</h3>
      <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-6 text-soia-green/62">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
