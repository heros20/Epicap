create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.app_role as enum ('member', 'admin', 'super_admin');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'order_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.order_status as enum (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'payment_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.payment_status as enum (
      'pending',
      'paid',
      'failed',
      'refunded',
      'partial'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'quote_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.quote_status as enum (
      'draft',
      'sent',
      'viewed',
      'accepted',
      'rejected',
      'expired',
      'converted'
    );
  end if;
end
$$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  siret text unique,
  vat_number text,
  email text,
  phone text,
  website text,
  billing_address jsonb,
  shipping_addresses jsonb not null default '[]'::jsonb,
  payment_terms text not null default 'immediate',
  credit_limit numeric(12, 2) not null default 0,
  discount_percentage numeric(5, 2) not null default 0,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  job_title text,
  role public.app_role not null default 'member',
  is_active boolean not null default true,
  email_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  user_id uuid references auth.users(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  company_name text,
  contact_name text,
  contact_email text,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  payment_method text,
  subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  shipping_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'EUR',
  billing_address jsonb,
  shipping_address jsonb,
  shipping_method text,
  tracking_number text,
  notes text,
  internal_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique,
  user_id uuid references auth.users(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  company_name text,
  contact_name text,
  contact_email text,
  status public.quote_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'EUR',
  valid_until date,
  notes text,
  internal_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.order_number_seq start 1;
create sequence if not exists public.quote_number_seq start 1;

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'CMD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.generate_quote_number()
returns trigger
language plpgsql
as $$
begin
  if new.quote_number is null then
    new.quote_number := 'DEV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.quote_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('admin', 'super_admin'), false)
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'super_admin', false)
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    company_name,
    job_title
  )
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), ''),
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'company_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'job_title', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  return new;
end;
$$;

create or replace function public.update_my_profile(
  next_first_name text,
  next_last_name text,
  next_phone text,
  next_job_title text,
  next_company_name text,
  next_email_notifications boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.';
  end if;

  update public.profiles
  set
    first_name = nullif(trim(coalesce(next_first_name, '')), ''),
    last_name = nullif(trim(coalesce(next_last_name, '')), ''),
    phone = nullif(trim(coalesce(next_phone, '')), ''),
    job_title = nullif(trim(coalesce(next_job_title, '')), ''),
    company_name = nullif(trim(coalesce(next_company_name, '')), ''),
    email_notifications = coalesce(next_email_notifications, email_notifications)
  where id = auth.uid()
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profil introuvable.';
  end if;

  return updated_profile;
end;
$$;

create or replace function public.admin_update_profile(
  target_user_id uuid,
  next_role public.app_role default null,
  next_company_id uuid default null,
  next_is_active boolean default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.app_role;
  target_role public.app_role;
  updated_profile public.profiles;
begin
  actor_role := public.current_app_role();

  if actor_role is null or actor_role not in ('admin', 'super_admin') then
    raise exception 'Droits insuffisants.';
  end if;

  select role into target_role
  from public.profiles
  where id = target_user_id;

  if target_role is null then
    raise exception 'Profil cible introuvable.';
  end if;

  if actor_role <> 'super_admin' then
    if next_role is not null and next_role <> target_role then
      raise exception 'Seul un super admin peut changer les rôles.';
    end if;

    if target_role = 'super_admin' then
      raise exception 'Seul un super admin peut modifier un super admin.';
    end if;
  end if;

  update public.profiles
  set
    role = coalesce(next_role, role),
    company_id = coalesce(next_company_id, company_id),
    is_active = coalesce(next_is_active, is_active)
  where id = target_user_id
  returning * into updated_profile;

  return updated_profile;
end;
$$;

create index if not exists idx_profiles_company_id on public.profiles(company_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_is_active on public.profiles(is_active);
create index if not exists idx_companies_name on public.companies(name);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_company_id on public.orders(company_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_quotes_user_id on public.quotes(user_id);
create index if not exists idx_quotes_company_id on public.quotes(company_id);
create index if not exists idx_quotes_status on public.quotes(status);
create index if not exists idx_quotes_created_at on public.quotes(created_at desc);

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.quotes enable row level security;

drop policy if exists "companies_select_own_or_admin" on public.companies;
create policy "companies_select_own_or_admin"
on public.companies
for select
using (
  public.is_admin()
  or id in (
    select company_id
    from public.profiles
    where id = auth.uid()
  )
);

drop policy if exists "companies_admin_manage" on public.companies;
create policy "companies_admin_manage"
on public.companies
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
on public.profiles
for select
using (public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_insert_own_or_admin" on public.orders;
create policy "orders_insert_own_or_admin"
on public.orders
for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "quotes_select_own_or_admin" on public.quotes;
create policy "quotes_select_own_or_admin"
on public.quotes
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "quotes_insert_own_or_admin" on public.quotes;
create policy "quotes_insert_own_or_admin"
on public.quotes
for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "quotes_update_admin" on public.quotes;
create policy "quotes_update_admin"
on public.quotes
for update
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.update_my_profile(text, text, text, text, text, boolean) to authenticated;
grant execute on function public.admin_update_profile(uuid, public.app_role, uuid, boolean) to authenticated;

drop trigger if exists update_companies_updated_at on public.companies;
create trigger update_companies_updated_at
before update on public.companies
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
before update on public.orders
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_quotes_updated_at on public.quotes;
create trigger update_quotes_updated_at
before update on public.quotes
for each row
execute function public.update_updated_at_column();

drop trigger if exists generate_order_number_trigger on public.orders;
create trigger generate_order_number_trigger
before insert on public.orders
for each row
execute function public.generate_order_number();

drop trigger if exists generate_quote_number_trigger on public.quotes;
create trigger generate_quote_number_trigger
before insert on public.quotes
for each row
execute function public.generate_quote_number();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email on auth.users
for each row
execute function public.sync_profile_email();
