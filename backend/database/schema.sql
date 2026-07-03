-- ============================================================
-- OakAudit Database Schema for MySQL 8
-- Migration from Supabase PostgreSQL to Laravel
-- ============================================================
-- INSTRUCTIONS:
-- 1. Open phpMyAdmin or MySQL CLI
-- 2. Copy and paste this entire file
-- 3. Execute
-- ============================================================

CREATE DATABASE IF NOT EXISTS oak_audit
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE oak_audit;

-- -----------------------------------------------------------
-- USERS (replaces Supabase auth.users)
-- -----------------------------------------------------------
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) DEFAULT NULL,
  account_type ENUM('individual', 'organization') NOT NULL DEFAULT 'individual',
  email_verified_at TIMESTAMP NULL,
  remember_token VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- PASSWORD RESETS
-- -----------------------------------------------------------
CREATE TABLE password_resets (
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL,
  INDEX password_resets_email_index (email)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- PERSONAL ACCESS TOKEN (for JWT / Sanctum)
-- -----------------------------------------------------------
CREATE TABLE personal_access_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  abilities TEXT NULL,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX tokenable_index (tokenable_type, tokenable_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- ORGANIZATIONS
-- -----------------------------------------------------------
CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('individual', 'organization') NOT NULL DEFAULT 'individual',
  industry VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  logo_url VARCHAR(500) DEFAULT NULL,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- ORGANIZATION MEMBERS
-- -----------------------------------------------------------
CREATE TABLE organization_members (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  user_id CHAR(36) DEFAULT NULL,
  invited_email VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- USER ROLES
-- -----------------------------------------------------------
CREATE TABLE user_roles (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role ENUM('owner', 'admin', 'lead_auditor', 'auditor', 'auditee', 'viewer') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_org_user_role (org_id, user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- PROFILES
-- -----------------------------------------------------------
CREATE TABLE profiles (
  id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  job_title VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- AUDITORS
-- -----------------------------------------------------------
CREATE TABLE auditors (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  user_id CHAR(36) DEFAULT NULL,
  role VARCHAR(100) DEFAULT NULL,
  certifications TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- ORG PROCESSES
-- -----------------------------------------------------------
CREATE TABLE org_processes (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL,
  scope VARCHAR(500) DEFAULT NULL,
  is_custom TINYINT(1) NOT NULL DEFAULT 0,
  process_owner VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- PROCESS ASSIGNMENTS
-- -----------------------------------------------------------
CREATE TABLE process_assignments (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  process_id CHAR(36) NOT NULL,
  auditor_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (process_id) REFERENCES org_processes(id) ON DELETE CASCADE,
  FOREIGN KEY (auditor_id) REFERENCES auditors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- AUDITS
-- -----------------------------------------------------------
CREATE TABLE audits (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  standard VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  scope TEXT DEFAULT NULL,
  criteria TEXT DEFAULT NULL,
  object TEXT DEFAULT NULL,
  conclusion TEXT DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  started_at TIMESTAMP NULL,
  closed_at TIMESTAMP NULL,
  owner VARCHAR(255) DEFAULT NULL,
  auditee_name VARCHAR(255) DEFAULT NULL,
  auditee_email VARCHAR(255) DEFAULT NULL,
  created_by CHAR(36) NOT NULL,
  lead_auditor_id CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_auditor_id) REFERENCES auditors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- AUDIT PROCESSES (junction table)
-- -----------------------------------------------------------
CREATE TABLE audit_processes (
  id CHAR(36) PRIMARY KEY,
  audit_id CHAR(36) NOT NULL,
  process_id CHAR(36) NOT NULL,
  auditor_id CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
  FOREIGN KEY (process_id) REFERENCES org_processes(id) ON DELETE CASCADE,
  FOREIGN KEY (auditor_id) REFERENCES auditors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- AUDIT ANSWERS
-- -----------------------------------------------------------
CREATE TABLE audit_answers (
  id CHAR(36) PRIMARY KEY,
  audit_id CHAR(36) NOT NULL,
  process_id CHAR(36) NOT NULL,
  clause VARCHAR(100) NOT NULL,
  kind VARCHAR(50) NOT NULL DEFAULT 'default',
  q_ref VARCHAR(100) DEFAULT NULL,
  question_text TEXT DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  severity VARCHAR(50) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  auditee_name VARCHAR(255) DEFAULT NULL,
  auditor_name VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
  FOREIGN KEY (process_id) REFERENCES org_processes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_answer (audit_id, process_id, clause, kind, q_ref)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- FINDINGS (Non-conformities / CARs)
-- -----------------------------------------------------------
CREATE TABLE findings (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  audit_id CHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'minor',
  clause VARCHAR(100) DEFAULT NULL,
  description TEXT NOT NULL,
  capa TEXT DEFAULT NULL,
  owner VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  due_date DATE DEFAULT NULL,
  root_cause TEXT DEFAULT NULL,
  auditor_comment TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- CUSTOM QUESTIONS
-- -----------------------------------------------------------
CREATE TABLE custom_questions (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  standard VARCHAR(100) NOT NULL,
  clause VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  kind VARCHAR(50) NOT NULL DEFAULT 'default',
  process_key VARCHAR(255) NOT NULL,
  reference VARCHAR(500) DEFAULT NULL,
  evidence TEXT DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- CREDIT WALLETS
-- -----------------------------------------------------------
CREATE TABLE credit_wallets (
  org_id CHAR(36) PRIMARY KEY,
  balance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- CREDIT TRANSACTIONS
-- -----------------------------------------------------------
CREATE TABLE credit_transactions (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  kind VARCHAR(50) NOT NULL,
  credits INT NOT NULL,
  naira_amount DECIMAL(15,2) DEFAULT NULL,
  pack VARCHAR(100) DEFAULT NULL,
  reference VARCHAR(255) DEFAULT NULL,
  audit_license_id CHAR(36) DEFAULT NULL,
  created_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- AUDIT LICENSES
-- -----------------------------------------------------------
CREATE TABLE audit_licenses (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  pack VARCHAR(100) NOT NULL,
  paid_amount_ngn DECIMAL(15,2) NOT NULL DEFAULT 0,
  paystack_ref VARCHAR(255) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  purchased_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- PAYSTACK TRANSACTIONS
-- -----------------------------------------------------------
CREATE TABLE paystack_transactions (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  reference VARCHAR(255) NOT NULL,
  amount_ngn DECIMAL(15,2) NOT NULL,
  pack VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  raw_payload JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- INDEXES for performance
-- -----------------------------------------------------------
CREATE INDEX idx_audits_org_id ON audits(org_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_findings_org_id ON findings(org_id);
CREATE INDEX idx_findings_audit_id ON findings(audit_id);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_audit_answers_audit_id ON audit_answers(audit_id);
CREATE INDEX idx_org_processes_org_id ON org_processes(org_id);
CREATE INDEX idx_custom_questions_org_id ON custom_questions(org_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(org_id);
CREATE INDEX idx_user_roles_org_id ON user_roles(org_id);
CREATE INDEX idx_auditors_org_id ON auditors(org_id);
