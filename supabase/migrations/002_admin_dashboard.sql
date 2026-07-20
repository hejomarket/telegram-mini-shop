create extension if not exists pg_trgm;

alter table public.orders add column if not exists admin_notes text;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'));

create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_customer_name_idx on public.orders using gin (customer_name gin_trgm_ops);
create index if not exists orders_whatsapp_idx on public.orders(whatsapp);
create index if not exists orders_telegram_username_idx on public.orders(telegram_username);
