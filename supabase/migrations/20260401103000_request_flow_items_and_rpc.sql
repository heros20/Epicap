set check_function_bodies = off;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id integer references public.products(id) on delete set null,
  sku text not null,
  name text not null,
  description text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null default 0,
  total_price numeric(12, 2) not null default 0,
  is_rental boolean not null default false,
  rental_days integer,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id integer references public.products(id) on delete set null,
  sku text not null,
  name text not null,
  description text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null default 0,
  total_price numeric(12, 2) not null default 0,
  is_rental boolean not null default false,
  rental_days integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_quote_items_quote_id on public.quote_items(quote_id);
create index if not exists idx_quote_items_product_id on public.quote_items(product_id);

alter table public.order_items enable row level security;
alter table public.quote_items enable row level security;

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
on public.order_items
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "order_items_admin_manage" on public.order_items;
create policy "order_items_admin_manage"
on public.order_items
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "quote_items_select_own_or_admin" on public.quote_items;
create policy "quote_items_select_own_or_admin"
on public.quote_items
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.quotes
    where quotes.id = quote_items.quote_id
      and quotes.user_id = auth.uid()
  )
);

drop policy if exists "quote_items_admin_manage" on public.quote_items;
create policy "quote_items_admin_manage"
on public.quote_items
for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.submit_quote_request(
  next_company_name text,
  next_contact_name text,
  next_contact_email text,
  next_notes text default null,
  next_metadata jsonb default '{}'::jsonb,
  next_items jsonb default '[]'::jsonb,
  next_valid_until date default null,
  next_subtotal numeric default 0,
  next_tax_amount numeric default 0,
  next_discount_amount numeric default 0,
  next_total numeric default 0
)
returns table(id uuid, reference text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_company_id uuid;
  current_company_name text;
  inserted_quote public.quotes%rowtype;
  item jsonb;
begin
  if nullif(trim(coalesce(next_contact_name, '')), '') is null then
    raise exception 'Le contact est requis.';
  end if;

  if nullif(trim(coalesce(next_contact_email, '')), '') is null then
    raise exception 'L''email est requis.';
  end if;

  if auth.uid() is not null then
    select
      profiles.company_id,
      coalesce(companies.name, profiles.company_name)
    into current_company_id, current_company_name
    from public.profiles
    left join public.companies on companies.id = profiles.company_id
    where profiles.id = auth.uid();
  end if;

  insert into public.quotes (
    user_id,
    company_id,
    company_name,
    contact_name,
    contact_email,
    status,
    subtotal,
    tax_amount,
    discount_amount,
    total,
    currency,
    valid_until,
    notes,
    metadata
  )
  values (
    auth.uid(),
    current_company_id,
    coalesce(nullif(trim(next_company_name), ''), current_company_name),
    trim(next_contact_name),
    trim(next_contact_email),
    'draft',
    coalesce(next_subtotal, 0),
    coalesce(next_tax_amount, 0),
    coalesce(next_discount_amount, 0),
    coalesce(next_total, 0),
    'EUR',
    next_valid_until,
    nullif(trim(coalesce(next_notes, '')), ''),
    coalesce(next_metadata, '{}'::jsonb)
  )
  returning * into inserted_quote;

  for item in
    select value
    from jsonb_array_elements(coalesce(next_items, '[]'::jsonb))
  loop
    insert into public.quote_items (
      quote_id,
      product_id,
      sku,
      name,
      description,
      quantity,
      unit_price,
      total_price,
      is_rental,
      rental_days
    )
    values (
      inserted_quote.id,
      nullif(item ->> 'productId', '')::integer,
      coalesce(nullif(item ->> 'sku', ''), 'REFERENCE-A-CONFIRMER'),
      coalesce(nullif(item ->> 'name', ''), 'Produit à confirmer'),
      nullif(item ->> 'description', ''),
      greatest(coalesce((item ->> 'quantity')::integer, 1), 1),
      coalesce((item ->> 'unitPrice')::numeric, 0),
      coalesce((item ->> 'totalPrice')::numeric, 0),
      coalesce((item ->> 'isRental')::boolean, false),
      nullif(item ->> 'rentalDays', '')::integer
    );
  end loop;

  return query
  select inserted_quote.id, inserted_quote.quote_number;
end;
$$;

create or replace function public.submit_order_request(
  next_company_name text,
  next_contact_name text,
  next_contact_email text,
  next_payment_method text default null,
  next_notes text default null,
  next_metadata jsonb default '{}'::jsonb,
  next_items jsonb default '[]'::jsonb,
  next_billing_address jsonb default '{}'::jsonb,
  next_shipping_address jsonb default '{}'::jsonb,
  next_shipping_method text default null,
  next_subtotal numeric default 0,
  next_tax_amount numeric default 0,
  next_shipping_amount numeric default 0,
  next_discount_amount numeric default 0,
  next_total numeric default 0
)
returns table(id uuid, reference text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_company_id uuid;
  current_company_name text;
  inserted_order public.orders%rowtype;
  item jsonb;
begin
  if nullif(trim(coalesce(next_contact_name, '')), '') is null then
    raise exception 'Le contact est requis.';
  end if;

  if nullif(trim(coalesce(next_contact_email, '')), '') is null then
    raise exception 'L''email est requis.';
  end if;

  if auth.uid() is not null then
    select
      profiles.company_id,
      coalesce(companies.name, profiles.company_name)
    into current_company_id, current_company_name
    from public.profiles
    left join public.companies on companies.id = profiles.company_id
    where profiles.id = auth.uid();
  end if;

  insert into public.orders (
    user_id,
    company_id,
    company_name,
    contact_name,
    contact_email,
    status,
    payment_status,
    payment_method,
    subtotal,
    tax_amount,
    shipping_amount,
    discount_amount,
    total,
    currency,
    billing_address,
    shipping_address,
    shipping_method,
    notes,
    metadata
  )
  values (
    auth.uid(),
    current_company_id,
    coalesce(nullif(trim(next_company_name), ''), current_company_name),
    trim(next_contact_name),
    trim(next_contact_email),
    'pending',
    'pending',
    nullif(trim(coalesce(next_payment_method, '')), ''),
    coalesce(next_subtotal, 0),
    coalesce(next_tax_amount, 0),
    coalesce(next_shipping_amount, 0),
    coalesce(next_discount_amount, 0),
    coalesce(next_total, 0),
    'EUR',
    coalesce(next_billing_address, '{}'::jsonb),
    coalesce(next_shipping_address, '{}'::jsonb),
    nullif(trim(coalesce(next_shipping_method, '')), ''),
    nullif(trim(coalesce(next_notes, '')), ''),
    coalesce(next_metadata, '{}'::jsonb)
  )
  returning * into inserted_order;

  for item in
    select value
    from jsonb_array_elements(coalesce(next_items, '[]'::jsonb))
  loop
    insert into public.order_items (
      order_id,
      product_id,
      sku,
      name,
      description,
      quantity,
      unit_price,
      total_price,
      is_rental,
      rental_days
    )
    values (
      inserted_order.id,
      nullif(item ->> 'productId', '')::integer,
      coalesce(nullif(item ->> 'sku', ''), 'REFERENCE-A-CONFIRMER'),
      coalesce(nullif(item ->> 'name', ''), 'Produit à confirmer'),
      nullif(item ->> 'description', ''),
      greatest(coalesce((item ->> 'quantity')::integer, 1), 1),
      coalesce((item ->> 'unitPrice')::numeric, 0),
      coalesce((item ->> 'totalPrice')::numeric, 0),
      coalesce((item ->> 'isRental')::boolean, false),
      nullif(item ->> 'rentalDays', '')::integer
    );
  end loop;

  return query
  select inserted_order.id, inserted_order.order_number;
end;
$$;

grant execute on function public.submit_quote_request(
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  date,
  numeric,
  numeric,
  numeric,
  numeric
) to anon, authenticated;

grant execute on function public.submit_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric
) to anon, authenticated;
