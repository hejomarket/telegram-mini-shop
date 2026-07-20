import type { ReactNode } from 'react';

type BadgeTone = 'default' | 'lime' | 'soft' | 'success';

const tones: Record<BadgeTone, string> = {
  default: 'bg-soia-green text-white',
  lime: 'bg-soia-lime text-soia-forest',
  soft: 'bg-soia-mist text-soia-green ring-1 ring-soia-green/8',
  success: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-900/10',
};

export function Badge({ children, tone = 'soft', className = '' }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${tones[tone]} ${className}`}>{children}</span>;
}
