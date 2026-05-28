CREATE DATABASE IF NOT EXISTS vor_enterprise
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vor_enterprise;

CREATE TABLE IF NOT EXISTS kyc_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kyc_type VARCHAR(30) NOT NULL DEFAULT 'PERSONA_NATURAL',
  full_name VARCHAR(180) NOT NULL,
  document_type VARCHAR(40) NOT NULL,
  document_number VARCHAR(80) NOT NULL,
  nationality VARCHAR(80) NOT NULL DEFAULT '',
  city VARCHAR(120) NOT NULL DEFAULT '',
  address VARCHAR(220) NOT NULL DEFAULT '',
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  source_of_funds TEXT NULL,
  password_hash VARCHAR(255) NULL,
  company_name VARCHAR(200) NULL,
  legal_representative VARCHAR(200) NULL,
  tax_id VARCHAR(80) NULL,
  beneficial_owners VARCHAR(40) NULL,
  notes TEXT NULL,
  accepted_policy TINYINT(1) NOT NULL DEFAULT 0,
  cc_pdf_path VARCHAR(255) NULL,
  rut_pdf_path VARCHAR(255) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_kyc_document (document_type, document_number),
  UNIQUE KEY uq_kyc_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
