import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] border border-soia-green/8 bg-[var(--tg-card)] shadow-card ${className}`}>{children}</div>;
}
