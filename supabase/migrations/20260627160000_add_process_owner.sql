-- Add process_owner column to org_processes table
ALTER TABLE public.org_processes ADD COLUMN IF NOT EXISTS process_owner TEXT;
