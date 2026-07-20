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
