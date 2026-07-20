alter table public.orders add column if not exists order_access_token_hash text;
alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_type text;
alter table public.orders add column if not exists midtrans_transaction_id text;
alter table public.orders add column if not exists midtrans_transaction_status text;
alter table public.orders add column if not exists midtrans_fraud_status text;
alter table public.orders add column if not exists midtrans_status_code text;
alter table public.orders add column if not exists midtrans_status_message text;
alter table public.orders add column if not exists midtrans_transaction_time timestamptz;
alter table public.orders add column if not exists midtrans_settlement_time timestamptz;
alter table public.orders add column if not exists midtrans_expiry_time timestamptz;
alter table public.orders add column if not exists midtrans_snap_token text;
alter table public.orders add column if not exists midtrans_redirect_url text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists payment_updated_at timestamptz;
alter table public.orders add column if not exists payment_attempt_count integer not null default 0;

do $$ begin
  alter table public.orders add constraint orders_payment_status_check check (payment_status in ('unpaid','pending','paid','failed','expired','cancelled','challenged','refunded'));
exception when duplicate_object then null; end $$;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'midtrans',
  provider_order_id text not null unique,
  snap_token text,
  redirect_url text,
  transaction_id text,
  transaction_status text,
  fraud_status text,
  payment_type text,
  gross_amount integer not null check (gross_amount > 0),
  raw_status jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_midtrans_transaction_id_idx on public.orders(midtrans_transaction_id);
create index if not exists orders_created_at_payment_idx on public.orders(created_at desc);
create index if not exists orders_order_number_payment_idx on public.orders(order_number);
create index if not exists payment_attempts_order_id_idx on public.payment_attempts(order_id, created_at desc);
create index if not exists payment_attempts_provider_order_id_idx on public.payment_attempts(provider_order_id);
create index if not exists payment_attempts_transaction_id_idx on public.payment_attempts(transaction_id);

drop trigger if exists payment_attempts_set_updated_at on public.payment_attempts;
create trigger payment_attempts_set_updated_at before update on public.payment_attempts for each row execute function public.set_updated_at();
