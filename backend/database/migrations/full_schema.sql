-- ============================================================
-- FULL DATABASE SCHEMA — OakAudit / AuditOS
-- Run this on a fresh MySQL 8+ database, then:
--   php artisan db:seed --class=DatabaseSeeder
-- ============================================================

/* -------------------- 1. users -------------------- */
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) DEFAULT NULL,
  invite_token VARCHAR(64) DEFAULT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL DEFAULT NULL,
  remember_token VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

/* -------------------- 2. cache -------------------- */
CREATE TABLE cache (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` MEDIUMTEXT NOT NULL,
  expiration INT NOT NULL,
  INDEX cache_expiration_idx (expiration)
) ENGINE=InnoDB;

/* -------------------- 3. cache_locks -------------------- */
CREATE TABLE cache_locks (
  `key` VARCHAR(255) PRIMARY KEY,
  owner VARCHAR(255) NOT NULL,
  expiration INT NOT NULL,
  INDEX cache_locks_expiration_idx (expiration)
) ENGINE=InnoDB;

/* -------------------- 4. jobs -------------------- */
CREATE TABLE jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload LONGTEXT NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL,
  reserved_at INT UNSIGNED DEFAULT NULL,
  available_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  INDEX jobs_queue_idx (queue)
) ENGINE=InnoDB;

/* -------------------- 5. job_batches -------------------- */
CREATE TABLE job_batches (
  id VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  total_jobs INT NOT NULL,
  pending_jobs INT NOT NULL,
  failed_jobs INT NOT NULL,
  failed_job_ids LONGTEXT NOT NULL,
  `options` MEDIUMTEXT DEFAULT NULL,
  cancelled_at INT DEFAULT NULL,
  created_at INT NOT NULL,
  finished_at INT DEFAULT NULL
) ENGINE=InnoDB;

/* -------------------- 6. failed_jobs -------------------- */
CREATE TABLE failed_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  connection TEXT NOT NULL,
  queue TEXT NOT NULL,
  payload LONGTEXT NOT NULL,
  exception LONGTEXT NOT NULL,
  failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* -------------------- 7. organizations -------------------- */
CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'individual',
  industry VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  logo_url VARCHAR(500) DEFAULT NULL,
  settings JSON DEFAULT NULL,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX organizations_created_by_idx (created_by),
  CONSTRAINT fk_organizations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 8. organization_members -------------------- */
CREATE TABLE organization_members (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  user_id CHAR(36) DEFAULT NULL,
  invited_email VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  department VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX org_members_user_id_idx (user_id),
  INDEX org_members_org_user_idx (org_id, user_id),
  CONSTRAINT fk_org_members_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 9. profiles -------------------- */
CREATE TABLE profiles (
  id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  job_title VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_profiles_id FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 10. user_roles -------------------- */
CREATE TABLE user_roles (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_user_roles (org_id, user_id),
  CONSTRAINT fk_user_roles_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 11. auditors -------------------- */
CREATE TABLE auditors (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  user_id CHAR(36) DEFAULT NULL,
  role VARCHAR(100) DEFAULT NULL,
  certifications TEXT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_auditors_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_auditors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 12. org_processes -------------------- */
CREATE TABLE org_processes (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `key` VARCHAR(255) NOT NULL,
  scope VARCHAR(500) DEFAULT NULL,
  is_custom TINYINT(1) NOT NULL DEFAULT 0,
  process_owner VARCHAR(255) DEFAULT NULL,
  process_owner_email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_org_processes_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 13. process_assignments -------------------- */
CREATE TABLE process_assignments (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  process_id CHAR(36) NOT NULL,
  auditor_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_proc_assign_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_proc_assign_process FOREIGN KEY (process_id) REFERENCES org_processes(id) ON DELETE CASCADE,
  CONSTRAINT fk_proc_assign_auditor FOREIGN KEY (auditor_id) REFERENCES auditors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 14. audits -------------------- */
CREATE TABLE audits (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  `standard` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
  scope TEXT DEFAULT NULL,
  criteria TEXT DEFAULT NULL,
  `object` TEXT DEFAULT NULL,
  conclusion TEXT DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  started_at TIMESTAMP NULL DEFAULT NULL,
  closed_at TIMESTAMP NULL DEFAULT NULL,
  owner VARCHAR(255) DEFAULT NULL,
  auditee_name VARCHAR(255) DEFAULT NULL,
  auditee_email VARCHAR(255) DEFAULT NULL,
  created_by CHAR(36) NOT NULL,
  lead_auditor_id CHAR(36) DEFAULT NULL,
  wizard_state JSON DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX audits_org_status_idx (org_id, `status`),
  INDEX audits_org_start_date_idx (org_id, start_date),
  INDEX audits_start_date_idx (start_date),
  CONSTRAINT fk_audits_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_audits_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_audits_lead_auditor FOREIGN KEY (lead_auditor_id) REFERENCES auditors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* -------------------- 15. audit_answers -------------------- */
CREATE TABLE audit_answers (
  id CHAR(36) PRIMARY KEY,
  audit_id CHAR(36) NOT NULL,
  process_id CHAR(36) NOT NULL,
  clause VARCHAR(100) NOT NULL,
  kind VARCHAR(50) NOT NULL DEFAULT 'default',
  q_ref VARCHAR(100) DEFAULT NULL,
  question_text TEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  severity VARCHAR(50) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  auditee_name VARCHAR(255) DEFAULT NULL,
  auditor_name VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_audit_answer (audit_id, process_id, clause, kind, q_ref),
  CONSTRAINT fk_audit_answers_audit FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_answers_process FOREIGN KEY (process_id) REFERENCES org_processes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 16. audit_processes -------------------- */
CREATE TABLE audit_processes (
  id CHAR(36) PRIMARY KEY,
  audit_id CHAR(36) NOT NULL,
  process_id CHAR(36) NOT NULL,
  auditor_id CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_audit_proc_audit FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_proc_process FOREIGN KEY (process_id) REFERENCES org_processes(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_proc_auditor FOREIGN KEY (auditor_id) REFERENCES auditors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* -------------------- 17. findings -------------------- */
CREATE TABLE findings (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  audit_id CHAR(36) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'minor',
  clause VARCHAR(100) DEFAULT NULL,
  description TEXT NOT NULL,
  capa TEXT DEFAULT NULL,
  owner VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'open',
  due_date DATE DEFAULT NULL,
  root_cause TEXT DEFAULT NULL,
  auditor_comment TEXT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX findings_org_status_idx (org_id, `status`),
  INDEX findings_org_type_idx (org_id, `type`),
  INDEX findings_org_audit_idx (org_id, audit_id),
  INDEX findings_status_idx (`status`),
  CONSTRAINT fk_findings_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_findings_audit FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 18. audit_licenses -------------------- */
CREATE TABLE audit_licenses (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  pack VARCHAR(100) NOT NULL,
  paid_amount_ngn DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  paystack_ref VARCHAR(255) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  purchased_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_audit_licenses_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 19. credit_wallets -------------------- */
CREATE TABLE credit_wallets (
  org_id CHAR(36) PRIMARY KEY,
  balance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_credit_wallets_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 20. custom_questions -------------------- */
CREATE TABLE custom_questions (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  `standard` VARCHAR(100) NOT NULL,
  clause VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  kind VARCHAR(50) NOT NULL DEFAULT 'default',
  process_key VARCHAR(255) NOT NULL,
  `reference` VARCHAR(500) DEFAULT NULL,
  evidence TEXT DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_custom_q_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_custom_q_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 21. paystack_transactions -------------------- */
CREATE TABLE paystack_transactions (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  `reference` VARCHAR(255) NOT NULL,
  amount_ngn DECIMAL(15,2) NOT NULL,
  pack VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  raw_payload JSON DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_paystack_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_paystack_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 22. credit_transactions -------------------- */
CREATE TABLE credit_transactions (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  kind VARCHAR(50) NOT NULL,
  credits INT NOT NULL,
  naira_amount DECIMAL(15,2) DEFAULT NULL,
  pack VARCHAR(100) DEFAULT NULL,
  `reference` VARCHAR(255) DEFAULT NULL,
  audit_license_id CHAR(36) DEFAULT NULL,
  created_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_credit_tx_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_credit_tx_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 23. password_resets -------------------- */
CREATE TABLE password_resets (
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  INDEX password_resets_email_idx (email)
) ENGINE=InnoDB;

/* -------------------- 24. iso_clauses -------------------- */
CREATE TABLE iso_clauses (
  id CHAR(36) PRIMARY KEY,
  `standard` VARCHAR(10) NOT NULL,
  clause VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  requirement TEXT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_iso_clause (standard, clause)
) ENGINE=InnoDB;

/* -------------------- 25. verification_otps -------------------- */
CREATE TABLE verification_otps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  `type` VARCHAR(20) NOT NULL DEFAULT 'signup',
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX verif_otps_email_type_idx (email, `type`)
) ENGINE=InnoDB;

/* -------------------- 26. support_tickets -------------------- */
CREATE TABLE support_tickets (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) DEFAULT NULL,
  user_id CHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  `status` VARCHAR(20) NOT NULL DEFAULT 'open',
  response TEXT DEFAULT NULL,
  responded_at TIMESTAMP NULL DEFAULT NULL,
  responded_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_tickets_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_responded_by FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 27. newsletter_subscriptions -------------------- */
CREATE TABLE newsletter_subscriptions (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(50) DEFAULT NULL,
  user_id CHAR(36) DEFAULT NULL,
  subscribed_at TIMESTAMP NULL DEFAULT NULL,
  unsubscribed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_newsletter_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 28. notifications -------------------- */
CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  read_at TIMESTAMP NULL DEFAULT NULL,
  data JSON DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX notifications_user_read_idx (user_id, is_read),
  INDEX notifications_user_created_idx (user_id, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 29. invitations -------------------- */
CREATE TABLE invitations (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL DEFAULT 'member',
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP NULL DEFAULT NULL,
  declined_at TIMESTAMP NULL DEFAULT NULL,
  invited_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX invitations_org_email_idx (org_id, email),
  INDEX invitations_token_idx (token),
  CONSTRAINT fk_invitations_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_invitations_invited_by FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* -------------------- 30. entity_data -------------------- */
CREATE TABLE entity_data (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX entity_data_org_type_idx (org_id, entity_type),
  CONSTRAINT fk_entity_data_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA: default roles & permissions
-- ============================================================
-- Roles are inserted per-organization via DatabaseSeeder.
-- Below is the template for a single org (replace :orgId with actual UUID).
-- ============================================================

-- ============================================================
-- SEED DATA: ISO clauses (run via IsoClauseSeeder)
-- ============================================================
-- ISO 9001:2015 clauses
INSERT IGNORE INTO iso_clauses (id, `standard`, clause, title, requirement) VALUES
  ('iso9001-4.1', 'ISO 9001', '4.1', 'Understanding the organization and its context',
   'The organization shall determine external and internal issues that are relevant to its purpose and strategic direction and that affect its ability to achieve the intended result(s) of its quality management system.'),
  ('iso9001-4.2', 'ISO 9001', '4.2', 'Understanding the needs and expectations of interested parties',
   'The organization shall determine the interested parties that are relevant to the quality management system and the requirements of these interested parties.'),
  ('iso9001-4.3', 'ISO 9001', '4.3', 'Determining the scope of the quality management system',
   'The organization shall determine the boundaries and applicability of the quality management system to establish its scope.'),
  ('iso9001-4.4', 'ISO 9001', '4.4', 'Quality management system and its processes',
   'The organization shall establish, implement, maintain and continually improve a quality management system, including the processes needed and their interactions.'),
  ('iso9001-5.1', 'ISO 9001', '5.1', 'Leadership and commitment',
   'Top management shall demonstrate leadership and commitment with respect to the quality management system.'),
  ('iso9001-5.2', 'ISO 9001', '5.2', 'Quality policy',
   'Top management shall establish, implement and maintain a quality policy that is appropriate to the purpose and context of the organization.'),
  ('iso9001-5.3', 'ISO 9001', '5.3', 'Organizational roles, responsibilities and authorities',
   'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned and communicated within the organization.'),
  ('iso9001-6.1', 'ISO 9001', '6.1', 'Actions to address risks and opportunities',
   'The organization shall plan actions to address risks and opportunities.'),
  ('iso9001-6.2', 'ISO 9001', '6.2', 'Quality objectives and planning to achieve them',
   'The organization shall establish quality objectives at relevant functions, levels and processes needed for the quality management system.'),
  ('iso9001-7.1', 'ISO 9001', '7.1', 'Resources',
   'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the quality management system.'),
  ('iso9001-7.2', 'ISO 9001', '7.2', 'Competence',
   'The organization shall determine the necessary competence of person(s) doing work under its control that affects the performance and effectiveness of the quality management system.'),
  ('iso9001-7.3', 'ISO 9001', '7.3', 'Awareness',
   'The organization shall ensure that persons doing work under the organization\'s control are aware of the quality policy, relevant quality objectives, their contribution to the effectiveness of the QMS, and the implications of not conforming.'),
  ('iso9001-7.4', 'ISO 9001', '7.4', 'Communication',
   'The organization shall determine the internal and external communications relevant to the quality management system.'),
  ('iso9001-7.5', 'ISO 9001', '7.5', 'Documented information',
   'The organization\'s quality management system shall include documented information required by this International Standard and documented information determined by the organization as being necessary for the effectiveness of the QMS.'),
  ('iso9001-8.1', 'ISO 9001', '8.1', 'Operational planning and control',
   'The organization shall plan, implement and control the processes needed to meet the requirements for the provision of products and services.'),
  ('iso9001-8.2', 'ISO 9001', '8.2', 'Requirements for products and services',
   'The organization shall communicate with customers to determine requirements for products and services.'),
  ('iso9001-8.3', 'ISO 9001', '8.3', 'Design and development of products and services',
   'The organization shall establish, implement and maintain a design and development process.'),
  ('iso9001-8.4', 'ISO 9001', '8.4', 'Control of externally provided processes, products and services',
   'The organization shall ensure that externally provided processes, products and services conform to requirements.'),
  ('iso9001-8.5', 'ISO 9001', '8.5', 'Production and service provision',
   'The organization shall implement production and service provision under controlled conditions.'),
  ('iso9001-8.6', 'ISO 9001', '8.6', 'Release of products and services',
   'The organization shall implement planned arrangements at appropriate stages to verify that product and service requirements have been met.'),
  ('iso9001-8.7', 'ISO 9001', '8.7', 'Control of nonconforming outputs',
   'The organization shall ensure that outputs that do not conform to their requirements are identified and controlled to prevent their unintended use or delivery.'),
  ('iso9001-9.1', 'ISO 9001', '9.1', 'Monitoring, measurement, analysis and evaluation',
   'The organization shall determine what needs to be monitored and measured.'),
  ('iso9001-9.2', 'ISO 9001', '9.2', 'Internal audit',
   'The organization shall conduct internal audits at planned intervals to provide information on whether the quality management system conforms to the organization\'s own requirements and the requirements of this International Standard.'),
  ('iso9001-9.3', 'ISO 9001', '9.3', 'Management review',
   'Top management shall review the organization\'s quality management system at planned intervals to ensure its continuing suitability, adequacy, effectiveness and alignment with the strategic direction of the organization.'),
  ('iso9001-10.1', 'ISO 9001', '10.1', 'Nonconformity and corrective action',
   'When a nonconformity occurs, the organization shall react to the nonconformity and take action to control and correct it.'),
  ('iso9001-10.2', 'ISO 9001', '10.2', 'Continual improvement',
   'The organization shall continually improve the suitability, adequacy and effectiveness of the quality management system.');

-- ISO 14001:2015 clauses
INSERT IGNORE INTO iso_clauses (id, `standard`, clause, title, requirement) VALUES
  ('iso14001-4.1', 'ISO 14001', '4.1', 'Understanding the organization and its context',
   'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its environmental management system.'),
  ('iso14001-4.2', 'ISO 14001', '4.2', 'Understanding the needs and expectations of interested parties',
   'The organization shall determine interested parties that are relevant to the environmental management system.'),
  ('iso14001-4.3', 'ISO 14001', '4.3', 'Determining the scope of the environmental management system',
   'The organization shall determine the boundaries and applicability of the environmental management system to establish its scope.'),
  ('iso14001-4.4', 'ISO 14001', '4.4', 'Environmental management system',
   'The organization shall establish, implement, maintain and continually improve an environmental management system.'),
  ('iso14001-5.1', 'ISO 14001', '5.1', 'Leadership and commitment',
   'Top management shall demonstrate leadership and commitment with respect to the environmental management system.'),
  ('iso14001-5.2', 'ISO 14001', '5.2', 'Environmental policy',
   'Top management shall establish, implement and maintain an environmental policy.'),
  ('iso14001-5.3', 'ISO 14001', '5.3', 'Roles, responsibilities and authorities',
   'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned and communicated.'),
  ('iso14001-6.1', 'ISO 14001', '6.1', 'Actions to address risks and opportunities',
   'The organization shall establish, implement and maintain the processes needed to address risks and opportunities.'),
  ('iso14001-6.2', 'ISO 14001', '6.2', 'Environmental objectives and planning to achieve them',
   'The organization shall establish environmental objectives at relevant functions and levels.'),
  ('iso14001-7.1', 'ISO 14001', '7.1', 'Resources',
   'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the environmental management system.'),
  ('iso14001-7.2', 'ISO 14001', '7.2', 'Competence',
   'The organization shall determine the necessary competence of person(s) doing work under its control that affects its environmental performance.'),
  ('iso14001-7.3', 'ISO 14001', '7.3', 'Awareness',
   'The organization shall ensure that persons doing work under the organization\'s control are aware of the environmental policy, significant environmental aspects, their contribution to EMS effectiveness, and the implications of not conforming.'),
  ('iso14001-7.4', 'ISO 14001', '7.4', 'Communication',
   'The organization shall establish, implement and maintain the processes needed for internal and external communications relevant to the environmental management system.'),
  ('iso14001-7.5', 'ISO 14001', '7.5', 'Documented information',
   'The organization\'s environmental management system shall include documented information required by this International Standard.'),
  ('iso14001-8.1', 'ISO 14001', '8.1', 'Operational planning and control',
   'The organization shall establish, implement and control the processes needed to meet environmental management system requirements.'),
  ('iso14001-8.2', 'ISO 14001', '8.2', 'Emergency preparedness and response',
   'The organization shall establish, implement and maintain the processes needed to prepare for and respond to potential emergency situations.'),
  ('iso14001-9.1', 'ISO 14001', '9.1', 'Monitoring, measurement, analysis and evaluation',
   'The organization shall monitor, measure, analyse and evaluate its environmental performance.'),
  ('iso14001-9.2', 'ISO 14001', '9.2', 'Internal audit',
   'The organization shall conduct internal audits at planned intervals to provide information on whether the environmental management system conforms to requirements.'),
  ('iso14001-9.3', 'ISO 14001', '9.3', 'Management review',
   'Top management shall review the organization\'s environmental management system at planned intervals.'),
  ('iso14001-10.1', 'ISO 14001', '10.1', 'Nonconformity and corrective action',
   'When a nonconformity occurs, the organization shall react to the nonconformity and take action to control and correct it.'),
  ('iso14001-10.2', 'ISO 14001', '10.2', 'Continual improvement',
   'The organization shall continually improve the suitability, adequacy and effectiveness of the environmental management system.');

-- ISO 45001:2018 clauses
INSERT IGNORE INTO iso_clauses (id, `standard`, clause, title, requirement) VALUES
  ('iso45001-4.1', 'ISO 45001', '4.1', 'Understanding the organization and its context',
   'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its OH&S management system.'),
  ('iso45001-4.2', 'ISO 45001', '4.2', 'Understanding the needs and expectations of workers and other interested parties',
   'The organization shall determine interested parties that are relevant to the OH&S management system.'),
  ('iso45001-4.3', 'ISO 45001', '4.3', 'Determining the scope of the OH&S management system',
   'The organization shall determine the boundaries and applicability of the OH&S management system to establish its scope.'),
  ('iso45001-4.4', 'ISO 45001', '4.4', 'OH&S management system',
   'The organization shall establish, implement, maintain and continually improve an OH&S management system.'),
  ('iso45001-5.1', 'ISO 45001', '5.1', 'Leadership and commitment',
   'Top management shall demonstrate leadership and commitment with respect to the OH&S management system.'),
  ('iso45001-5.2', 'ISO 45001', '5.2', 'OH&S policy',
   'Top management shall establish, implement and maintain an OH&S policy.'),
  ('iso45001-5.3', 'ISO 45001', '5.3', 'Roles, responsibilities and authorities',
   'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned and communicated.'),
  ('iso45001-5.4', 'ISO 45001', '5.4', 'Consultation and participation of workers',
   'The organization shall establish, implement and maintain processes for consultation and participation of workers.'),
  ('iso45001-6.1', 'ISO 45001', '6.1', 'Actions to address risks and opportunities',
   'The organization shall establish, implement and maintain the processes needed to address risks and opportunities.'),
  ('iso45001-6.2', 'ISO 45001', '6.2', 'OH&S objectives and planning to achieve them',
   'The organization shall establish OH&S objectives at relevant functions and levels.'),
  ('iso45001-7.1', 'ISO 45001', '7.1', 'Resources',
   'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the OH&S management system.'),
  ('iso45001-7.2', 'ISO 45001', '7.2', 'Competence',
   'The organization shall determine the necessary competence of person(s) doing work under its control that affects its OH&S performance.'),
  ('iso45001-7.3', 'ISO 45001', '7.3', 'Awareness',
   'The organization shall ensure that persons doing work under the organization\'s control are aware of the OH&S policy, their contribution to OH&S performance, and the implications of not conforming.'),
  ('iso45001-7.4', 'ISO 45001', '7.4', 'Communication',
   'The organization shall establish, implement and maintain the processes needed for internal and external communications relevant to the OH&S management system.'),
  ('iso45001-8.1', 'ISO 45001', '8.1', 'Operational planning and control',
   'The organization shall establish, implement and control the processes needed to meet OH&S management system requirements.'),
  ('iso45001-8.2', 'ISO 45001', '8.2', 'Emergency preparedness and response',
   'The organization shall establish, implement and maintain the processes needed to prepare for and respond to potential emergency situations.'),
  ('iso45001-9.1', 'ISO 45001', '9.1', 'Monitoring, measurement, analysis and evaluation',
   'The organization shall monitor, measure, analyse and evaluate its OH&S performance.'),
  ('iso45001-9.2', 'ISO 45001', '9.2', 'Internal audit',
   'The organization shall conduct internal audits at planned intervals to provide information on whether the OH&S management system conforms to requirements.'),
  ('iso45001-9.3', 'ISO 45001', '9.3', 'Management review',
   'Top management shall review the organization\'s OH&S management system at planned intervals.'),
  ('iso45001-10.1', 'ISO 45001', '10.1', 'Nonconformity and corrective action',
   'When a nonconformity occurs, the organization shall react to the nonconformity and take action to control and correct it.'),
  ('iso45001-10.2', 'ISO 45001', '10.2', 'Continual improvement',
   'The organization shall continually improve the suitability, adequacy and effectiveness of the OH&S management system.');

-- ISO 27001:2022 clauses
INSERT IGNORE INTO iso_clauses (id, `standard`, clause, title, requirement) VALUES
  ('iso27001-4.1', 'ISO 27001', '4.1', 'Understanding the organization and its context',
   'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of the information security management system.'),
  ('iso27001-4.2', 'ISO 27001', '4.2', 'Understanding the needs and expectations of interested parties',
   'The organization shall determine interested parties that are relevant to the information security management system.'),
  ('iso27001-4.3', 'ISO 27001', '4.3', 'Determining the scope of the information security management system',
   'The organization shall determine the boundaries and applicability of the information security management system to establish its scope.'),
  ('iso27001-4.4', 'ISO 27001', '4.4', 'Information security management system',
   'The organization shall establish, implement, maintain and continually improve an information security management system.'),
  ('iso27001-5.1', 'ISO 27001', '5.1', 'Leadership and commitment',
   'Top management shall demonstrate leadership and commitment with respect to the information security management system.'),
  ('iso27001-5.2', 'ISO 27001', '5.2', 'Policy',
   'Top management shall establish, implement and maintain an information security policy.'),
  ('iso27001-5.3', 'ISO 27001', '5.3', 'Organizational roles, responsibilities and authorities',
   'Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated.'),
  ('iso27001-6.1', 'ISO 27001', '6.1', 'Actions to address risks and opportunities',
   'The organization shall plan actions to address risks and opportunities.'),
  ('iso27001-6.2', 'ISO 27001', '6.2', 'Information security objectives and planning to achieve them',
   'The organization shall establish information security objectives at relevant functions and levels.'),
  ('iso27001-6.3', 'ISO 27001', '6.3', 'Planning of changes',
   'The organization shall plan changes to the ISMS when necessary.'),
  ('iso27001-7.1', 'ISO 27001', '7.1', 'Resources',
   'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the information security management system.'),
  ('iso27001-7.2', 'ISO 27001', '7.2', 'Competence',
   'The organization shall determine the necessary competence of person(s) doing work under its control that affects its information security performance.'),
  ('iso27001-7.3', 'ISO 27001', '7.3', 'Awareness',
   'The organization shall ensure that persons doing work under the organization\'s control are aware of the information security policy, their contribution to ISMS effectiveness, and the implications of not conforming.'),
  ('iso27001-7.4', 'ISO 27001', '7.4', 'Communication',
   'The organization shall establish, implement and maintain the processes needed for internal and external communications relevant to the information security management system.'),
  ('iso27001-7.5', 'ISO 27001', '7.5', 'Documented information',
   'The organization\'s information security management system shall include documented information required by this International Standard.'),
  ('iso27001-8.1', 'ISO 27001', '8.1', 'Operational planning and control',
   'The organization shall plan, implement and control the processes needed to meet information security requirements.'),
  ('iso27001-8.2', 'ISO 27001', '8.2', 'Information security risk assessment',
   'The organization shall perform information security risk assessments at planned intervals or when significant changes occur.'),
  ('iso27001-8.3', 'ISO 27001', '8.3', 'Information security risk treatment',
   'The organization shall implement the information security risk treatment plan.'),
  ('iso27001-9.1', 'ISO 27001', '9.1', 'Monitoring, measurement, analysis and evaluation',
   'The organization shall monitor, measure, analyse and evaluate its information security performance.'),
  ('iso27001-9.2', 'ISO 27001', '9.2', 'Internal audit',
   'The organization shall conduct internal audits at planned intervals to provide information on whether the ISMS conforms to requirements.'),
  ('iso27001-9.3', 'ISO 27001', '9.3', 'Management review',
   'Top management shall review the organization\'s information security management system at planned intervals.'),
  ('iso27001-10.1', 'ISO 27001', '10.1', 'Nonconformity and corrective action',
   'When a nonconformity occurs, the organization shall react to the nonconformity and take action to control and correct it.'),
  ('iso27001-10.2', 'ISO 27001', '10.2', 'Continual improvement',
   'The organization shall continually improve the suitability, adequacy and effectiveness of the information security management system.');
