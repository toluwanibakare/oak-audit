-- Migration to add owner column to audits table
ALTER TABLE audits ADD COLUMN IF NOT EXISTS owner TEXT;
