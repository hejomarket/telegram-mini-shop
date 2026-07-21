import { isSafePublicInternalPath } from './destination';
import { normalizeCategoryValue } from '../products/categories';
import type { PublicBanner } from './types';

export function resolvePublicBannerHref(banner: Pick<PublicBanner, 'destinationType' | 'destinationValue'>): string | null {
  const value = banner.destinationValue?.trim() ?? null;

  if (banner.destinationType === 'none') return null;
  if (banner.destinationType === 'all_products') return '/#products';
  if (banner.destinationType === 'featured') return '/#featured';

  if (banner.destinationType === 'category') {
    const category = normalizeCategoryValue(value);
    if (!category) return null;
    return `/?category=${encodeURIComponent(category)}#products`;
  }

  if (banner.destinationType === 'internal_path') {
    if (!value || !isSafePublicInternalPath(value)) return null;
    return value;
  }

  return null;
}
