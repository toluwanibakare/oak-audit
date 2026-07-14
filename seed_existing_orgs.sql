-- Seed default roles and permissions for ALL existing organizations
-- Run this in phpMyAdmin if you have orgs created before the backend fix

-- ===================== ROLES =====================
INSERT INTO entity_data (id, org_id, entity_type, data, created_at, updated_at)
SELECT
  UUID() AS id,
  o.id AS org_id,
  'roles' AS entity_type,
  JSON_OBJECT('name', r.name, 'scope', 'Global', 'members', 0, 'description', '', 'status', 'Active') AS data,
  NOW() AS created_at,
  NOW() AS updated_at
FROM organizations o
CROSS JOIN (
  SELECT 'Management Representative' AS name
  UNION SELECT 'Admin'
  UNION SELECT 'Lead Auditor'
  UNION SELECT 'Auditor'
  UNION SELECT 'Viewer'
  UNION SELECT 'Auditee'
) r
WHERE NOT EXISTS (
  SELECT 1 FROM entity_data e
  WHERE e.org_id = o.id
    AND e.entity_type = 'roles'
    AND JSON_UNQUOTE(JSON_EXTRACT(e.data, '$.name')) = r.name
);

-- ===================== PERMISSIONS =====================
INSERT INTO entity_data (id, org_id, entity_type, data, created_at, updated_at)
SELECT
  UUID() AS id,
  o.id AS org_id,
  'permissions' AS entity_type,
  JSON_OBJECT('role', r.role, 'module', m.module, 'level', r.level) AS data,
  NOW() AS created_at,
  NOW() AS updated_at
FROM organizations o
CROSS JOIN (
  SELECT 'Management Representative' AS role, 3 AS level
  UNION SELECT 'Admin', 3
  UNION SELECT 'Lead Auditor', 2
  UNION SELECT 'Auditor', 2
  UNION SELECT 'Viewer', 0
  UNION SELECT 'Auditee', 0
) r
CROSS JOIN (
  SELECT 'Audits' AS module
  UNION SELECT 'Findings'
  UNION SELECT 'Corrective Actions'
  UNION SELECT 'Risk'
  UNION SELECT 'Reports'
  UNION SELECT 'Organization'
  UNION SELECT 'Users'
  UNION SELECT 'Settings'
) m
WHERE NOT EXISTS (
  SELECT 1 FROM entity_data e
  WHERE e.org_id = o.id
    AND e.entity_type = 'permissions'
    AND JSON_UNQUOTE(JSON_EXTRACT(e.data, '$.role')) = r.role
    AND JSON_UNQUOTE(JSON_EXTRACT(e.data, '$.module')) = m.module
);
