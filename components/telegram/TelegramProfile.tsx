'use client';

import { useTelegram } from '../../providers/TelegramProvider';
import { Badge } from '../ui/Badge';

export function TelegramProfile() {
  const { mode, user } = useTelegram();
  const greetingName = user?.first_name || 'Guest';
  const initials = greetingName.slice(0, 1).toUpperCase();

  return (
    <section className="rounded-[1.75rem] border border-soia-green/8 bg-[var(--tg-card)] p-4 text-[var(--tg-text)] shadow-card">
      <div className="flex items-center gap-3">
        {user?.photo_url ? <img src={user.photo_url} alt={`${greetingName} avatar`} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-soia-lime" /> : <div className="grid h-14 w-14 place-items-center rounded-2xl bg-soia-mist text-lg font-black text-soia-green" aria-label="No avatar available">{initials}</div>}
        <div className="min-w-0 flex-1"><p className="truncate text-lg font-black tracking-tight">Hello, {greetingName} 👋</p><p className="truncate text-sm text-soia-green/56">{user?.username ? `@${user.username}` : 'Ready for a healthier snack?'}</p></div>
        <Badge tone={mode === 'telegram' ? 'lime' : 'soft'}>{mode === 'telegram' ? 'Telegram Mode' : 'Browser Mode'}</Badge>
      </div>
    </section>
  );
}
