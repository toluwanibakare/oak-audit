create or replace function public.grant_demo_credits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_email text;
  org record;
  total_added integer := 0;
  current_bal integer;
  to_add integer;
begin
  select email into caller_email from auth.users where id = auth.uid();
  if caller_email is null or lower(caller_email) <> 'demo@oakglobal.app' then
    raise exception 'not the demo user';
  end if;

  for org in
    select om.org_id
    from public.organization_members om
    where om.user_id = auth.uid() and om.status = 'active'
  loop
    insert into public.credit_wallets (org_id, balance)
    values (org.org_id, 0)
    on conflict (org_id) do nothing;

    select balance into current_bal from public.credit_wallets where org_id = org.org_id for update;
    if current_bal < 5 then
      to_add := 5 - current_bal;
      update public.credit_wallets
        set balance = 5, updated_at = now()
        where org_id = org.org_id;
      insert into public.credit_transactions (org_id, kind, credits, naira_amount, reference, created_by)
      values (org.org_id, 'topup', to_add, 0, 'demo-grant:' || org.org_id::text || ':' || gen_random_uuid()::text, auth.uid());
      total_added := total_added + to_add;
    end if;
  end loop;

  return total_added;
end;
$$;

grant execute on function public.grant_demo_credits() to authenticated;