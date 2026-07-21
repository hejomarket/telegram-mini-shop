export const bannerDestinationTypes = ['none', 'product', 'category', 'featured', 'all_products', 'internal_path'] as const;
export type BannerDestinationType = (typeof bannerDestinationTypes)[number];

export const bannerTextThemes = ['light', 'dark'] as const;
export type BannerTextTheme = (typeof bannerTextThemes)[number];

export type BannerScheduleState = 'active' | 'scheduled' | 'expired' | 'inactive';

export type StorefrontBannerRow = {
  id: string;
  title: string | null;
  subtitle: string | null;
  eyebrow_text: string | null;
  image_url: string;
  mobile_image_url: string | null;
  image_alt: string;
  cta_label: string | null;
  destination_type: BannerDestinationType;
  destination_value: string | null;
  is_active: boolean;
  display_order: number;
  text_theme: BannerTextTheme;
  overlay_strength: number;
  background_color: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicBanner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  eyebrowText: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  imageAlt: string;
  ctaLabel: string | null;
  destinationType: BannerDestinationType;
  destinationValue: string | null;
  displayOrder: number;
  textTheme: BannerTextTheme;
  overlayStrength: number;
  backgroundColor: string | null;
};

export type AdminBannerInput = {
  title?: string | null;
  subtitle?: string | null;
  eyebrowText?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  imageAlt: string;
  ctaLabel?: string | null;
  destinationType: BannerDestinationType;
  destinationValue?: string | null;
  isActive: boolean;
  displayOrder: number;
  textTheme: BannerTextTheme;
  overlayStrength: number;
  backgroundColor?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  updatedAt?: string;
};

export type AdminBannerMutationInput = AdminBannerInput;
export type AdminBannerPatchInput = Partial<AdminBannerInput> & { updatedAt?: string };
