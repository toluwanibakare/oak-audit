-- Custom administration RPC helpers to bypass RLS safely under security definer context
CREATE OR REPLACE FUNCTION public.admin_get_all_workspaces()
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  industry TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ,
  created_by_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.type::text,
    o.name,
    o.industry,
    o.address,
    o.logo_url,
    o.created_at,
    u.email::text
  FROM public.organizations o
  LEFT JOIN auth.users u ON o.created_by = u.id
  ORDER BY o.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_workspace_review(_org_id UUID, _address TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.organizations
  SET address = _address, updated_at = now()
  WHERE id = _org_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_workspace(_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _owner_id UUID;
BEGIN
  -- Get the owner/creator of the organization
  SELECT created_by INTO _owner_id FROM public.organizations WHERE id = _org_id;

  -- Delete the organization
  DELETE FROM public.organizations WHERE id = _org_id;

  -- Delete the owner user from auth.users if they exist
  IF _owner_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = _owner_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_workspaces() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_workspace_review(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_workspace(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_workspace(UUID) TO service_role;

-- Drop old constraints
ALTER TABLE public.audits DROP CONSTRAINT IF EXISTS audits_lead_auditor_id_fkey;
ALTER TABLE public.audit_processes DROP CONSTRAINT IF EXISTS audit_processes_auditor_id_fkey;

-- Add new constraints with ON DELETE SET NULL
ALTER TABLE public.audits
  ADD CONSTRAINT audits_lead_auditor_id_fkey
  FOREIGN KEY (lead_auditor_id) REFERENCES public.auditors(id)
  ON DELETE SET NULL;

ALTER TABLE public.audit_processes
  ADD CONSTRAINT audit_processes_auditor_id_fkey
  FOREIGN KEY (auditor_id) REFERENCES public.auditors(id)
  ON DELETE SET NULL;
