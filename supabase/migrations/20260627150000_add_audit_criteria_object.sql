-- Migration to add criteria and object columns to audits table
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS criteria TEXT;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS object TEXT;
