create table if not exists public.storefront_banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  eyebrow_text text,
  image_url text not null,
  mobile_image_url text,
  image_alt text not null,
  cta_label text,
  destination_type text not null default 'none',
  destination_value text,
  is_active boolean not null default false,
  display_order integer not null default 0,
  text_theme text not null default 'light',
  overlay_strength numeric not null default 0.25,
  background_color text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storefront_banners_image_url_not_empty check (length(trim(image_url)) > 0),
  constraint storefront_banners_image_alt_not_empty check (length(trim(image_alt)) > 0),
  constraint storefront_banners_destination_type_check check (destination_type in ('none', 'product', 'category', 'featured', 'all_products', 'internal_path')),
  constraint storefront_banners_text_theme_check check (text_theme in ('light', 'dark')),
  constraint storefront_banners_overlay_strength_check check (overlay_strength >= 0 and overlay_strength <= 0.7),
  constraint storefront_banners_schedule_check check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index if not exists storefront_banners_active_display_order_idx on public.storefront_banners(is_active, display_order, created_at, id);
create index if not exists storefront_banners_starts_at_idx on public.storefront_banners(starts_at) where starts_at is not null;
create index if not exists storefront_banners_ends_at_idx on public.storefront_banners(ends_at) where ends_at is not null;
create index if not exists storefront_banners_updated_at_idx on public.storefront_banners(updated_at desc);

drop trigger if exists storefront_banners_set_updated_at on public.storefront_banners;
create trigger storefront_banners_set_updated_at before update on public.storefront_banners for each row execute function public.set_updated_at();
