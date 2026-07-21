import 'server-only';

export const bannerStorageBucket = 'product-images';
export const bannerManagedPrefix = 'banners/';

export function createBannerStoragePath(fileName: string, ext: string, folderId?: string) {
  const safeFolder = (folderId && /^[a-zA-Z0-9._-]{2,120}$/.test(folderId)) ? folderId : crypto.randomUUID();
  return `${bannerManagedPrefix}${safeFolder}/${Date.now()}-${crypto.randomUUID()}-${fileName || `banner.${ext}`}`;
}

export function isManagedBannerImagePath(value: string | null | undefined) {
  if (!value || typeof value !== 'string') return false;
  if (/^https?:\/\//i.test(value)) return false;
  return /^banners\/[a-zA-Z0-9._-]{2,120}\/[a-zA-Z0-9._-]+$/.test(value);
}
