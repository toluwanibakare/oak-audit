-- ============================================================
-- OakAudit Migration SQL
-- Run this after auth_schema.sql to add all new tables/columns.
-- ============================================================

USE oak_audit;

-- -----------------------------------------------------------
-- 1. Remove account_type from users (everyone gets a workspace)
-- -----------------------------------------------------------
ALTER TABLE users DROP COLUMN account_type;

-- -----------------------------------------------------------
-- 2. Add settings column to organizations
-- -----------------------------------------------------------
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings JSON DEFAULT NULL AFTER logo_url;

-- -----------------------------------------------------------
-- 3. Organization members
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_members (
  id CHAR(36) PRIMARY KEY,
  org_id CHAR(36) NOT NULL,
  user_id CHAR(36) DEFAULT NULL,
  invited_email VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 4. Notifications
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  read_at TIMESTAMP NULL,
  data JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notif_user_read (user_id, is_read),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 5. Newsletter subscriptions
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(50) DEFAULT NULL,
  user_id CHAR(36) DEFAULT NULL,
  subscribed_at TIMESTAMP NULL,
  unsubscribed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nl_sub_email (email),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
