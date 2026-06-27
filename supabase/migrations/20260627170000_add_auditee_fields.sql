-- Migration to add auditee fields to audits table and feedback columns to findings table
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS auditee_name TEXT;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS auditee_email TEXT;

-- Add a column to findings to store auditor evaluation comment or rejection reason
ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS auditor_comment TEXT;
ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'; -- open | under_review | closed
