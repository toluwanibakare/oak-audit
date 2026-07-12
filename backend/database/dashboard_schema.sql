-- ============================================================================
-- OakAudix — Complete Dashboard Schema (FRESH INSTALL)
-- WARNING: Drops ALL existing tables first. Data will be lost.
-- ============================================================================

DROP TABLE IF EXISTS `failed_jobs`;
DROP TABLE IF EXISTS `job_batches`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `cache_locks`;
DROP TABLE IF EXISTS `cache`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `iso_clauses`;
DROP TABLE IF EXISTS `newsletter_subscriptions`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `credit_transactions`;
DROP TABLE IF EXISTS `paystack_transactions`;
DROP TABLE IF EXISTS `custom_questions`;
DROP TABLE IF EXISTS `credit_wallets`;
DROP TABLE IF EXISTS `audit_licenses`;
DROP TABLE IF EXISTS `audit_answers`;
DROP TABLE IF EXISTS `process_assignments`;
DROP TABLE IF EXISTS `entity_data`;
DROP TABLE IF EXISTS `invitations`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `findings`;
DROP TABLE IF EXISTS `audit_processes`;
DROP TABLE IF EXISTS `audits`;
DROP TABLE IF EXISTS `org_processes`;
DROP TABLE IF EXISTS `auditors`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `organization_members`;
DROP TABLE IF EXISTS `organizations`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `verification_otps`;
DROP TABLE IF EXISTS `users`;

-- 1. USERS
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. VERIFICATION_OTPS
CREATE TABLE `verification_otps` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'signup',
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `verification_otps_email_type_index` (`email`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PROFILES
CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_user_id_unique` (`user_id`),
  CONSTRAINT `profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ORGANIZATIONS
CREATE TABLE `organizations` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'individual',
  `industry` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `created_by` char(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `organizations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ORGANIZATION_MEMBERS
CREATE TABLE `organization_members` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `invited_email` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `om_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `om_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. USER_ROLES
CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` varchar(50) DEFAULT 'viewer',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_roles_org_id_user_id_unique` (`org_id`,`user_id`),
  CONSTRAINT `ur_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ur_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AUDITORS
CREATE TABLE `auditors` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_id` char(36) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `certifications` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `auditors_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `auditors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ORG_PROCESSES
CREATE TABLE `org_processes` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `key` varchar(255) NOT NULL,
  `scope` varchar(500) DEFAULT NULL,
  `is_custom` tinyint(1) DEFAULT 0,
  `process_owner` varchar(255) DEFAULT NULL,
  `process_owner_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `op_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AUDITS
CREATE TABLE `audits` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `standard` varchar(100) NOT NULL,
  `status` varchar(50) DEFAULT 'draft',
  `scope` text DEFAULT NULL,
  `criteria` text DEFAULT NULL,
  `object` text DEFAULT NULL,
  `conclusion` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `auditee_name` varchar(255) DEFAULT NULL,
  `auditee_email` varchar(255) DEFAULT NULL,
  `created_by` char(36) NOT NULL,
  `lead_auditor_id` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `audits_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audits_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audits_lead_auditor_id_foreign` FOREIGN KEY (`lead_auditor_id`) REFERENCES `auditors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. AUDIT_PROCESSES
CREATE TABLE `audit_processes` (
  `id` char(36) NOT NULL,
  `audit_id` char(36) NOT NULL,
  `process_id` char(36) NOT NULL,
  `auditor_id` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `ap_audit_id_foreign` FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ap_process_id_foreign` FOREIGN KEY (`process_id`) REFERENCES `org_processes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ap_auditor_id_foreign` FOREIGN KEY (`auditor_id`) REFERENCES `auditors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. FINDINGS
CREATE TABLE `findings` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `audit_id` char(36) NOT NULL,
  `type` varchar(50) DEFAULT 'minor',
  `clause` varchar(100) DEFAULT NULL,
  `description` text NOT NULL,
  `capa` text DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'open',
  `due_date` date DEFAULT NULL,
  `root_cause` text DEFAULT NULL,
  `auditor_comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `findings_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `findings_audit_id_foreign` FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. NOTIFICATIONS
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. INVITATIONS
CREATE TABLE `invitations` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT 'member',
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `declined_at` timestamp NULL DEFAULT NULL,
  `invited_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invitations_token_unique` (`token`),
  KEY `invitations_org_id_email_index` (`org_id`,`email`),
  KEY `invitations_token_index` (`token`),
  CONSTRAINT `invitations_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invitations_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. ENTITY_DATA
CREATE TABLE `entity_data` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `entity_data_org_id_entity_type_index` (`org_id`,`entity_type`),
  CONSTRAINT `entity_data_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. PROCESS_ASSIGNMENTS
CREATE TABLE `process_assignments` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `process_id` char(36) NOT NULL,
  `auditor_id` char(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `pa_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pa_process_id_foreign` FOREIGN KEY (`process_id`) REFERENCES `org_processes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pa_auditor_id_foreign` FOREIGN KEY (`auditor_id`) REFERENCES `auditors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. AUDIT_ANSWERS
CREATE TABLE `audit_answers` (
  `id` char(36) NOT NULL,
  `audit_id` char(36) NOT NULL,
  `process_id` char(36) NOT NULL,
  `clause` varchar(100) NOT NULL,
  `kind` varchar(50) DEFAULT 'default',
  `q_ref` varchar(100) DEFAULT NULL,
  `question_text` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `severity` varchar(50) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `auditee_name` varchar(255) DEFAULT NULL,
  `auditor_name` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `aa_audit_id_foreign` FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `aa_process_id_foreign` FOREIGN KEY (`process_id`) REFERENCES `org_processes` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_answer` (`audit_id`,`process_id`,`clause`,`kind`,`q_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. AUDIT_LICENSES
CREATE TABLE `audit_licenses` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `pack` varchar(100) NOT NULL,
  `paid_amount_ngn` decimal(15,2) DEFAULT 0.00,
  `paystack_ref` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `purchased_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `al_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. CREDIT_WALLETS
CREATE TABLE `credit_wallets` (
  `org_id` char(36) NOT NULL,
  `balance` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`org_id`),
  CONSTRAINT `cw_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. CUSTOM_QUESTIONS
CREATE TABLE `custom_questions` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `standard` varchar(100) NOT NULL,
  `clause` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `kind` varchar(50) DEFAULT 'default',
  `process_key` varchar(255) NOT NULL,
  `reference` varchar(500) DEFAULT NULL,
  `evidence` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_by` char(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `cq_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cq_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. PAYSTACK_TRANSACTIONS
CREATE TABLE `paystack_transactions` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `amount_ngn` decimal(15,2) NOT NULL,
  `pack` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `raw_payload` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `pt_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pt_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. CREDIT_TRANSACTIONS
CREATE TABLE `credit_transactions` (
  `id` char(36) NOT NULL,
  `org_id` char(36) NOT NULL,
  `kind` varchar(50) NOT NULL,
  `credits` int(11) NOT NULL,
  `naira_amount` decimal(15,2) DEFAULT NULL,
  `pack` varchar(100) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `audit_license_id` char(36) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `ct_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ct_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. SUPPORT_TICKETS
CREATE TABLE `support_tickets` (
  `id` char(36) NOT NULL,
  `org_id` char(36) DEFAULT NULL,
  `user_id` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `category` varchar(50) DEFAULT 'general',
  `status` varchar(20) DEFAULT 'open',
  `response` text DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `responded_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `st_org_id_foreign` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `st_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `st_responded_by_foreign` FOREIGN KEY (`responded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. NEWSLETTER_SUBSCRIPTIONS
CREATE TABLE `newsletter_subscriptions` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subscribed` tinyint(1) DEFAULT 1,
  `source` varchar(50) DEFAULT NULL,
  `user_id` char(36) DEFAULT NULL,
  `subscribed_at` timestamp NULL DEFAULT NULL,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscriptions_email_unique` (`email`),
  CONSTRAINT `ns_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. ISO_CLAUSES
CREATE TABLE `iso_clauses` (
  `id` char(36) NOT NULL,
  `standard` varchar(10) NOT NULL,
  `clause` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `requirement` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `iso_clauses_standard_clause_unique` (`standard`,`clause`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. PASSWORD_RESETS
CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. CACHE
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. CACHE_LOCKS
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. JOBS
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. JOB_BATCHES
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. FAILED_JOBS
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
