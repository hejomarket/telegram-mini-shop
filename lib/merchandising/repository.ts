import 'server-only';
import { getRuntimeMode, getSupabaseServerClient } from '../supabase/server';
import { isBannerCurrentlyVisible } from './schedule';
import type { PublicBanner, StorefrontBannerRow } from './types';

const columns = 'id,title,subtitle,eyebrow_text,image_url,mobile_image_url,image_alt,cta_label,destination_type,destination_value,is_active,display_order,text_theme,overlay_strength,background_color,starts_at,ends_at,created_at,updated_at';

export function serializePublicBanner(row: StorefrontBannerRow): PublicBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    eyebrowText: row.eyebrow_text,
    imageUrl: row.image_url,
    mobileImageUrl: row.mobile_image_url,
    imageAlt: row.image_alt,
    ctaLabel: row.cta_label,
    destinationType: row.destination_type,
    destinationValue: row.destination_value,
    displayOrder: row.display_order,
    textTheme: row.text_theme,
    overlayStrength: Number(row.overlay_strength),
    backgroundColor: row.background_color,
  };
}

export function sortBannerRows(rows: StorefrontBannerRow[]): StorefrontBannerRow[] {
  return [...rows].sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

export async function listAdminBanners(): Promise<{ rows: StorefrontBannerRow[]; mode: 'supabase' | 'demo' }> {
  if (getRuntimeMode() === 'demo') return { rows: [], mode: 'demo' };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { rows: [], mode: 'demo' };
  const { data, error } = await supabase.from('storefront_banners').select(columns).order('display_order').order('created_at').order('id');
  if (error) throw new Error('Failed to load storefront banners');
  return { rows: (data ?? []) as StorefrontBannerRow[], mode: 'supabase' };
}

export async function getBannerById(id: string): Promise<StorefrontBannerRow | null> {
  if (getRuntimeMode() === 'demo') return null;
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('storefront_banners').select(columns).eq('id', id).maybeSingle();
  if (error) throw new Error('Failed to load storefront banner');
  return data ? (data as StorefrontBannerRow) : null;
}

export async function listVisiblePublicBanners(now: Date = new Date()): Promise<{ rows: PublicBanner[]; mode: 'supabase' | 'demo' }> {
  if (getRuntimeMode() === 'demo') return { rows: [], mode: 'demo' };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { rows: [], mode: 'demo' };
  const { data, error } = await supabase.from('storefront_banners').select(columns).eq('is_active', true).order('display_order').order('created_at').order('id');
  if (error) throw new Error('Failed to load storefront banners');
  const rows = sortBannerRows((data ?? []) as StorefrontBannerRow[]).filter(row => isBannerCurrentlyVisible(row, now)).map(serializePublicBanner);
  return { rows, mode: 'supabase' };
}
