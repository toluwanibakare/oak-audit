-- Migration to add process_owner_email to org_processes table
ALTER TABLE public.org_processes ADD COLUMN IF NOT EXISTS process_owner_email TEXT;
