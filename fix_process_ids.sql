-- Fix existing process records to have P-... IDs
-- Run this on your cPanel database via phpMyAdmin or command line

UPDATE entity_data
SET data = JSON_SET(
    data,
    '$.id',
    CONCAT('P-', UPPER(SUBSTRING(REPLACE(id, '-', ''), -8)))
)
WHERE entity_type = 'processes'
  AND (
      JSON_EXTRACT(data, '$.id') IS NULL
      OR JSON_EXTRACT(data, '$.id') NOT LIKE '"P-%"'
  );
