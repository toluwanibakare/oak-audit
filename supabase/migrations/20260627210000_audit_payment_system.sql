-- =====================================================================
-- Migration: Audit Payment System (Direct Paystack, Per-User Pricing)
-- Replaces: credit wallet top-up model
-- Date: 2026-06-27
-- =====================================================================

-- 1. Add payment columns to the audits table
alter table public.audits
  add column if not exists user_count      integer,
  add column if not exists paid_amount_ngn bigint,
  add column if not exists payment_reference text,
  add column if not exists payment_status  text not null default 'unpaid';

-- 2. Allow the paystack_transactions table to store the full audit metadata
--    in its raw_payload (no schema change needed — raw_payload is already jsonb).
--    We just add a `kind` column to distinguish audit payments from legacy top-ups.
alter table public.paystack_transactions
  add column if not exists kind text not null default 'audit';

-- 3. Service-role bypass policy for paystack_transactions
--    (edge functions run as service_role and need to insert/update)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'paystack_transactions'
      and policyname = 'ptx: service role full access'
  ) then
    create policy "ptx: service role full access"
      on public.paystack_transactions
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- 4. Allow service role to insert/update audit records during payment verification
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'audits'
      and policyname = 'audits: service role full access'
  ) then
    create policy "audits: service role full access"
      on public.audits
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- 5. Allow service role to insert into audit_licenses during payment verification
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'audit_licenses'
      and policyname = 'licenses: service role full access'
  ) then
    create policy "licenses: service role full access"
      on public.audit_licenses
      for all
      using (true)
      with check (true);
  end if;
end $$;
