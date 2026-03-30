create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  oauth_full_name text;
begin
  oauth_full_name := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  );

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
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'first_name',
          new.raw_user_meta_data ->> 'given_name',
          split_part(coalesce(oauth_full_name, ''), ' ', 1),
          ''
        )
      ),
      ''
    ),
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'last_name',
          new.raw_user_meta_data ->> 'family_name',
          nullif(
            trim(
              regexp_replace(
                coalesce(oauth_full_name, ''),
                '^[^[:space:]]+[[:space:]]*',
                ''
              )
            ),
            ''
          ),
          ''
        )
      ),
      ''
    ),
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'company_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'job_title', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        first_name = coalesce(public.profiles.first_name, excluded.first_name),
        last_name = coalesce(public.profiles.last_name, excluded.last_name),
        phone = coalesce(public.profiles.phone, excluded.phone),
        company_name = coalesce(public.profiles.company_name, excluded.company_name),
        job_title = coalesce(public.profiles.job_title, excluded.job_title);

  return new;
end;
$$;
