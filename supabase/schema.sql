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
