'use client';

import { useTelegram } from '../../providers/TelegramProvider';

export function TelegramProfile() {
  const { mode, user } = useTelegram();
  const firstName = user?.first_name || '-';
  const username = user?.username ? `@${user.username}` : '-';
  const telegramId = user?.id ? String(user.id) : '-';
  const greetingName = user?.first_name || 'Guest';

  return (
    <section className="rounded-[1.8rem] bg-[var(--tg-card)] p-4 text-[var(--tg-text)] shadow-[0_18px_45px_rgba(23,53,41,0.08)] ring-1 ring-soia-green/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-black">Hello, {greetingName} 👋</p>
          <span className="mt-2 inline-flex rounded-full bg-[var(--tg-button)] px-3 py-1 text-xs font-black text-[var(--tg-button-text)]">
            {mode === 'telegram' ? 'Telegram Mode' : 'Browser Mode'}
          </span>
        </div>
        {user?.photo_url ? (
          <img src={user.photo_url} alt={`${greetingName} avatar`} className="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--tg-accent)]" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-full bg-soia-cream text-2xl" aria-label="No avatar available">👤</div>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl bg-soia-cream/70 p-3"><dt className="text-soia-green/60">First Name</dt><dd className="font-black">{firstName}</dd></div>
        <div className="rounded-2xl bg-soia-cream/70 p-3"><dt className="text-soia-green/60">Username</dt><dd className="font-black">{username}</dd></div>
        <div className="col-span-2 rounded-2xl bg-soia-cream/70 p-3"><dt className="text-soia-green/60">Telegram ID</dt><dd className="font-black">{telegramId}</dd></div>
      </dl>
    </section>
  );
}
