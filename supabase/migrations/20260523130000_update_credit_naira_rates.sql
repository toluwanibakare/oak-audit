-- Redefine spend_credits_for_pack to set naira values based on 1 credit = ₦10,000
CREATE OR REPLACE FUNCTION public.spend_credits_for_pack(_org_id UUID, _pack TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cost INTEGER;
  naira INTEGER;
  current_balance INTEGER;
  new_license_id UUID;
BEGIN
  IF NOT (public.has_role(auth.uid(), _org_id, 'owner'::app_role) OR public.has_role(auth.uid(), _org_id, 'admin'::app_role) OR public.has_role(auth.uid(), _org_id, 'lead_auditor'::app_role)) THEN
    RAISE EXCEPTION 'not authorised to spend credits for this organisation';
  END IF;

  CASE _pack
    WHEN 'iso9001' THEN cost:=1; naira:=10000;
    WHEN 'iso14001' THEN cost:=1; naira:=10000;
    WHEN 'iso45001' THEN cost:=1; naira:=10000;
    WHEN 'iso27001' THEN cost:=1; naira:=10000;
    WHEN 'hse' THEN cost:=2; naira:=20000;
    WHEN 'ims' THEN cost:=3; naira:=30000;
    ELSE RAISE EXCEPTION 'unknown audit pack: %', _pack;
  END CASE;

  SELECT balance INTO current_balance FROM public.credit_wallets WHERE org_id=_org_id FOR UPDATE;
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'no wallet for organisation';
  END IF;
  IF current_balance < cost THEN
    RAISE EXCEPTION 'insufficient credits';
  END IF;

  UPDATE public.credit_wallets SET balance = balance - cost, updated_at = now() WHERE org_id=_org_id;

  -- Set expires_at to exactly 1 week from now
  INSERT INTO public.audit_licenses (org_id, pack, paid_amount_ngn, paystack_ref, active, expires_at)
  VALUES (_org_id, _pack, naira, 'wallet:' || gen_random_uuid()::text, true, now() + interval '1 week')
  RETURNING id INTO new_license_id;

  INSERT INTO public.credit_transactions (org_id, kind, credits, naira_amount, pack, audit_license_id, created_by)
  VALUES (_org_id, 'spend', -cost, naira, _pack, new_license_id, auth.uid());

  RETURN new_license_id;
END;
$$;
