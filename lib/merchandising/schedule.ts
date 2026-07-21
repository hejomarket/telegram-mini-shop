import type { BannerScheduleState, StorefrontBannerRow } from './types';

type SchedulableBanner = Pick<StorefrontBannerRow, 'is_active' | 'starts_at' | 'ends_at'>;

function time(value: string | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function isBannerCurrentlyVisible(banner: SchedulableBanner, now: Date = new Date()): boolean {
  if (banner.is_active !== true) return false;
  const nowTime = now.getTime();
  const startsAt = time(banner.starts_at);
  const endsAt = time(banner.ends_at);
  return (startsAt === null || nowTime >= startsAt) && (endsAt === null || nowTime <= endsAt);
}

export function getBannerScheduleState(banner: SchedulableBanner, now: Date = new Date()): BannerScheduleState {
  if (banner.is_active !== true) return 'inactive';
  const nowTime = now.getTime();
  const startsAt = time(banner.starts_at);
  const endsAt = time(banner.ends_at);
  if (startsAt !== null && nowTime < startsAt) return 'scheduled';
  if (endsAt !== null && nowTime > endsAt) return 'expired';
  return 'active';
}
