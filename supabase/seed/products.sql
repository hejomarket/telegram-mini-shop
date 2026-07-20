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
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
insert into public.products (id, slug, sku, name, short_description, description, price, currency, weight_grams, protein_grams, serving_size_grams, category, image_alt, is_active, is_available, is_featured, display_order)
values
('soia-original','soia-original','SOIA-ORI-100','SOIA Original','Light and savory plant-based protein snack.','Light and savory plant-based protein snack for everyday snacking.',25000,'IDR',100,18,100,'Snack Protein','SOIA Original',true,true,true,10),
('soia-seaweed','soia-seaweed','SOIA-SEA-100','SOIA Seaweed','Balanced seaweed flavor with savory umami.','Balanced seaweed flavor with a savory umami profile.',28000,'IDR',100,18,100,'Snack Protein','SOIA Seaweed',true,true,false,20),
('soia-kecombrang','soia-kecombrang','SOIA-KEC-100','SOIA Kecombrang','Bold aromatic Indonesian kecombrang flavor.','A bold and aromatic Indonesian kecombrang flavor.',30000,'IDR',100,18,100,'Snack Protein','SOIA Kecombrang',true,true,false,30)
on conflict (id) do nothing;
