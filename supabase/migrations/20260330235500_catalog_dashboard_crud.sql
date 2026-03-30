set check_function_bodies = off;

alter table public.products
  add column if not exists documents jsonb not null default '[]'::jsonb,
  add column if not exists source_url text;

create index if not exists idx_products_is_active_category_slug
  on public.products (is_active, category_slug);

create index if not exists idx_products_is_rentable
  on public.products (is_rentable)
  where is_rentable = true;

alter table public.product_categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "product_categories_public_read" on public.product_categories;
create policy "product_categories_public_read"
on public.product_categories
for select
using (is_active = true);

drop policy if exists "product_categories_admin_all" on public.product_categories;
create policy "product_categories_admin_all"
on public.product_categories
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
on public.products
for select
using (is_active = true);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit)
values ('catalog-assets', 'catalog-assets', true, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "catalog_assets_admin_select" on storage.objects;
create policy "catalog_assets_admin_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'catalog-assets'
  and public.is_admin()
);

drop policy if exists "catalog_assets_admin_insert" on storage.objects;
create policy "catalog_assets_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'catalog-assets'
  and public.is_admin()
);

drop policy if exists "catalog_assets_admin_update" on storage.objects;
create policy "catalog_assets_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'catalog-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'catalog-assets'
  and public.is_admin()
);

drop policy if exists "catalog_assets_admin_delete" on storage.objects;
create policy "catalog_assets_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'catalog-assets'
  and public.is_admin()
);
