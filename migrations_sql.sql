-- ============================================================
-- Migration 1: Add P- IDs to existing process records
-- ============================================================
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

-- ============================================================
-- Migration 2: Cascade delete user references
-- Run the query below to see the FK names, then run the ALTERs
-- ============================================================
SELECT CONCAT(
  'ALTER TABLE ', TABLE_NAME, ' DROP FOREIGN KEY ', CONSTRAINT_NAME,
  ', ADD CONSTRAINT ', CONSTRAINT_NAME,
  ' FOREIGN KEY (', COLUMN_NAME, ') REFERENCES users(id) ON DELETE CASCADE;'
) AS `Copy and run these ALTER statements`
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'users'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'PRIMARY'
ORDER BY TABLE_NAME, COLUMN_NAME;
