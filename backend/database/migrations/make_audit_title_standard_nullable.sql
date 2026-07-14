-- Make title and standard nullable so draft audits can be created without them
ALTER TABLE audits ALTER COLUMN title DROP NOT NULL;
ALTER TABLE audits ALTER COLUMN standard DROP NOT NULL;
