
-- Set search_path on touch_updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin new.updated_at := now(); return new; end;
$$;

-- Lock down SECURITY DEFINER helpers
revoke execute on function public.has_role(uuid, uuid, public.app_role) from public, anon;
revoke execute on function public.is_org_member(uuid, uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

grant execute on function public.has_role(uuid, uuid, public.app_role) to authenticated;
grant execute on function public.is_org_member(uuid, uuid) to authenticated;
