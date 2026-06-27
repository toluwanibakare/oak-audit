-- Migration to add conclusion column to audits table
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS conclusion TEXT;
