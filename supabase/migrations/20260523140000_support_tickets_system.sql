-- Support Ticket System Schema and Admin helpers
CREATE TABLE public.support_tickets (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or logged-in users to submit support tickets
CREATE POLICY "tickets_insert_policy" ON public.support_tickets 
FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view only their own tickets
CREATE POLICY "tickets_user_view_policy" ON public.support_tickets 
FOR SELECT USING (
  auth.uid() = user_id 
  OR (org_id IS NOT NULL AND public.is_org_member(auth.uid(), org_id))
);

-- Administrative helper to get all support tickets bypassing RLS
CREATE OR REPLACE FUNCTION public.admin_get_all_tickets()
RETURNS TABLE (
  id UUID,
  org_id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  category TEXT,
  status TEXT,
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID,
  created_at TIMESTAMPTZ,
  org_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.org_id,
    t.user_id,
    t.name,
    t.email,
    t.subject,
    t.message,
    t.category,
    t.status,
    t.response,
    t.responded_at,
    t.responded_by,
    t.created_at,
    o.name AS org_name
  FROM public.support_tickets t
  LEFT JOIN public.organizations o ON t.org_id = o.id
  ORDER BY t.created_at DESC;
END;
$$;

-- Administrative helper to respond to support tickets and resolve them
CREATE OR REPLACE FUNCTION public.admin_respond_to_ticket(_ticket_id UUID, _response TEXT, _admin_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.support_tickets
  SET
    response = _response,
    status = 'resolved',
    responded_at = now(),
    responded_by = _admin_user_id,
    updated_at = now()
  WHERE id = _ticket_id;
END;
$$;

-- Grant permissions to execute administrative functions
GRANT EXECUTE ON FUNCTION public.admin_get_all_tickets() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_respond_to_ticket(UUID, TEXT, UUID) TO authenticated;
