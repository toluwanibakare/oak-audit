-- ============================================================
-- CHANGES — 15 July 2026
-- 1. Add manager_id to organizations
-- 2. Clear auto-assigned manager_id (was wrongly set to org creator / MR)
-- 3. Create audit_approvals table
-- Run this on a MySQL 8+ database AFTER full_schema.sql
-- ============================================================

/* -------------------- 1. organizations: add manager_id -------------------- */
ALTER TABLE organizations
  ADD COLUMN manager_id CHAR(36) DEFAULT NULL AFTER created_by,
  ADD CONSTRAINT fk_organizations_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

/* -------------------- 1b. clear auto-assigned manager -------------------- */
-- The old migration wrongly set manager_id = created_by (MR). Manager is a separate role.
UPDATE organizations SET manager_id = NULL WHERE manager_id IS NOT NULL AND manager_id = created_by;

/* -------------------- 2. audit_approvals -------------------- */
CREATE TABLE audit_approvals (
  id CHAR(36) PRIMARY KEY,
  audit_id CHAR(36) NOT NULL,
  stage VARCHAR(255) NOT NULL,
  approver_name VARCHAR(255) DEFAULT NULL,
  approver_email VARCHAR(255) DEFAULT NULL,
  is_required TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  comment TEXT DEFAULT NULL,
  notified_at TIMESTAMP NULL DEFAULT NULL,
  responded_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
  INDEX idx_audit_approvals_audit_id (audit_id)
) ENGINE=InnoDB;
