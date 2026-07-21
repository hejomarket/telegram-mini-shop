import { normalizeCategoryValue } from '../products/categories';
import { bannerDestinationTypes, type BannerDestinationType } from './types';

const productIdentifierPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,159}$/;
const categoryPattern = /^[a-z0-9][a-z0-9-]{0,99}$/;
const encodedProtocolPattern = /(?:%[0-9a-f]{2})/i;
const deniedInternalPathPattern = /^\/(admin|api)(?:\/|$)/i;

export function isBannerDestinationType(value: string): value is BannerDestinationType {
  return (bannerDestinationTypes as readonly string[]).includes(value);
}

export function normalizeBannerDestinationValue(type: BannerDestinationType, value: string | null | undefined): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (type === 'none' || type === 'featured' || type === 'all_products') return null;
  if (!trimmed) return null;
  if (type === 'category') return normalizeCategoryValue(trimmed);
  return trimmed;
}

export function isSafePublicInternalPath(value: string): boolean {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) return false;
  if (lower.startsWith('http:') || lower.startsWith('https:') || lower.startsWith('javascript:') || lower.startsWith('data:')) return false;
  if (encodedProtocolPattern.test(trimmed)) {
    try {
      const decoded = decodeURIComponent(trimmed).toLowerCase();
      if (decoded.includes('://') || decoded.startsWith('/admin') || decoded.startsWith('/api') || decoded.startsWith('//') || decoded.includes('javascript:') || decoded.includes('data:')) return false;
    } catch {
      return false;
    }
  }
  if (trimmed.includes('://') || deniedInternalPathPattern.test(trimmed)) return false;
  return true;
}

export function validateBannerDestination(type: BannerDestinationType, value: string | null): boolean {
  if (type === 'none' || type === 'featured' || type === 'all_products') return value === null;
  if (type === 'product') return typeof value === 'string' && productIdentifierPattern.test(value.trim());
  if (type === 'category') return typeof value === 'string' && categoryPattern.test(value.trim());
  if (type === 'internal_path') return typeof value === 'string' && isSafePublicInternalPath(value);
  return false;
}
