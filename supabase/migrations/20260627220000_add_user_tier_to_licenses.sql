-- Add user_tier to audit_licenses so Team page can enforce the paid tier limit
alter table public.audit_licenses
  add column if not exists user_tier  text,   -- '1-5' | '5-15' | '16+'
  add column if not exists user_count integer; -- exact count at time of payment
