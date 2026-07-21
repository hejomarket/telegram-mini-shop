alter table public.products add column if not exists is_best_seller boolean not null default false;
create index if not exists products_best_seller_display_idx on public.products(is_active, is_best_seller, display_order, name) where is_best_seller = true;
