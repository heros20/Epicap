-- Bootstrap role assignments after the first signup.
-- Replace the email placeholders, then run in Supabase SQL Editor if needed.

update public.profiles
set role = 'super_admin'
where email = 'superadmin@epicap.com';

update public.profiles
set role = 'admin'
where email = 'admin@epicap.com';
