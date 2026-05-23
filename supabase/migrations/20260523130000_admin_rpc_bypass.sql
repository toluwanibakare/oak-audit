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

GRANT EXECUTE ON FUNCTION public.admin_get_all_workspaces() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_workspace_review(UUID, TEXT) TO authenticated;
