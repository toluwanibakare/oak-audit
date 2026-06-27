-- Migration to add start_date and end_date to audits table
ALTER TABLE audits ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS end_date DATE;
