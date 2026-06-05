set check_function_bodies = off;

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
    'sent',
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
