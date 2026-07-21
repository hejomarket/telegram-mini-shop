create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  whatsapp text not null,
  email text,
  address text not null,
  district text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  notes text,
  admin_notes text,
  telegram_user_id bigint,
  telegram_username text,
  telegram_first_name text,
  telegram_last_name text,
  telegram_language text,
  subtotal integer not null check (subtotal >= 0),
  grand_total integer not null check (grand_total >= subtotal),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0 and quantity <= 99),
  subtotal integer not null check (subtotal = unit_price * quantity),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_customer_name_idx on public.orders using gin (customer_name gin_trgm_ops);
create index if not exists orders_whatsapp_idx on public.orders(whatsapp);
create index if not exists orders_telegram_username_idx on public.orders(telegram_username);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

drop trigger if exists order_items_set_updated_at on public.order_items;
create trigger order_items_set_updated_at before update on public.order_items for each row execute function public.set_updated_at();

-- Task 7 Midtrans Snap payments are applied additively in supabase/migrations/003_midtrans_payments.sql.

-- Task 8 customer order tracking.
alter table public.orders add column if not exists courier_name text;
alter table public.orders add column if not exists shipping_service text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists completed_at timestamptz;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists estimated_delivery_start date;
alter table public.orders add column if not exists estimated_delivery_end date;

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  order_status text,
  payment_status text,
  title text not null,
  description text,
  source text not null check (source in ('system','customer','admin','midtrans')),
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_id_idx on public.order_events(order_id);
create index if not exists order_events_event_type_idx on public.order_events(event_type);
create index if not exists order_events_created_at_idx on public.order_events(created_at desc);
create index if not exists orders_tracking_number_idx on public.orders(tracking_number) where tracking_number is not null;
create table if not exists public.products (
  id text primary key,
  slug text not null,
  sku text not null,
  name text not null,
  short_description text not null,
  description text not null,
  price integer not null check (price > 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  currency text not null default 'IDR' check (currency = 'IDR'),
  weight_grams integer not null check (weight_grams > 0),
  protein_grams numeric check (protein_grams is null or protein_grams >= 0),
  serving_size_grams numeric check (serving_size_grams is null or serving_size_grams > 0),
  ingredients text,
  allergen_information text,
  category text,
  image_url text,
  image_alt text,
  additional_images text[] not null default '{}',
  is_active boolean not null default false,
  is_available boolean not null default false,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_not_empty check (length(trim(slug)) > 0),
  constraint products_sku_not_empty check (length(trim(sku)) > 0),
  constraint products_inactive_not_available check (is_active or not is_available)
);
create unique index if not exists products_slug_unique_idx on public.products(lower(slug));
create unique index if not exists products_sku_unique_idx on public.products(upper(sku));
create index if not exists products_active_available_idx on public.products(is_active, is_available);
create index if not exists products_display_order_idx on public.products(display_order, name);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists products_category_idx on public.products(category) where category is not null;
create index if not exists products_best_seller_display_idx on public.products(is_active, is_best_seller, display_order, name) where is_best_seller = true;
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
insert into public.products (id, slug, sku, name, short_description, description, price, currency, weight_grams, protein_grams, serving_size_grams, category, image_alt, is_active, is_available, is_featured, is_best_seller, display_order)
values
('soia-original','soia-original','SOIA-ORI-100','SOIA Original','Light and savory plant-based protein snack.','Light and savory plant-based protein snack for everyday snacking.',25000,'IDR',100,18,100,'Snack Protein','SOIA Original',true,true,true,10),
('soia-seaweed','soia-seaweed','SOIA-SEA-100','SOIA Seaweed','Balanced seaweed flavor with savory umami.','Balanced seaweed flavor with a savory umami profile.',28000,'IDR',100,18,100,'Snack Protein','SOIA Seaweed',true,true,false,20),
('soia-kecombrang','soia-kecombrang','SOIA-KEC-100','SOIA Kecombrang','Bold aromatic Indonesian kecombrang flavor.','A bold and aromatic Indonesian kecombrang flavor.',30000,'IDR',100,18,100,'Snack Protein','SOIA Kecombrang',true,true,false,30)
on conflict (id) do nothing;
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
