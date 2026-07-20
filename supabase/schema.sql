create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  telegram_user_id text null,
  customer_name text not null,
  whatsapp text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  notes text null,
  subtotal integer not null check (subtotal >= 0),
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total integer not null check (line_total >= 0)
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_telegram_user_id_idx on public.orders(telegram_user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
-- Tidak membuat policy SELECT publik agar data pesanan tidak terbaca pengunjung.
-- Insert dilakukan dari API Next.js memakai SUPABASE_SERVICE_ROLE_KEY di server.
