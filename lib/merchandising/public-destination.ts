import { isSafePublicInternalPath } from './destination';
import type { PublicBanner } from './types';

export function resolvePublicBannerHref(banner: Pick<PublicBanner, 'destinationType' | 'destinationValue'>): string | null {
  const value = banner.destinationValue?.trim() ?? null;

  if (banner.destinationType === 'none') return null;
  if (banner.destinationType === 'all_products') return '/#products';
  if (banner.destinationType === 'featured') return '/#products';

  if (banner.destinationType === 'category') {
    if (!value || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(value)) return null;
    return `/?category=${encodeURIComponent(value)}#products`;
  }

  if (banner.destinationType === 'internal_path') {
    if (!value || !isSafePublicInternalPath(value)) return null;
    return value;
  }

  return null;
}
