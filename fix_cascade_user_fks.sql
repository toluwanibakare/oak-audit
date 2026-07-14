-- Run this query first — it will output the exact ALTER statements with the correct FK names.
-- Copy the results and paste them as a new query to execute.

SELECT CONCAT(
  'ALTER TABLE ', TABLE_NAME, ' DROP FOREIGN KEY ', CONSTRAINT_NAME,
  ', ADD CONSTRAINT ', CONSTRAINT_NAME,
  ' FOREIGN KEY (', COLUMN_NAME, ') REFERENCES users(id) ON DELETE CASCADE;'
) AS `Run these ALTER statements`
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'users'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'PRIMARY'
ORDER BY TABLE_NAME, COLUMN_NAME;
