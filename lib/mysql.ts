import mysql, { Pool } from "mysql2/promise";
import { hashPassword } from "@/lib/password";

let pool: Pool | null = null;

export function getMysqlPool(): Pool {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "vor_enterprise",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

async function addColumnIfMissing(table: string, column: string, definition: string): Promise<void> {
  const db = getMysqlPool();

  const [rows] = await db.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1
    `,
    [table, column],
  );

  const exists = Array.isArray(rows) && rows.length > 0;
  if (exists) {
    return;
  }

  await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export async function ensureKycSchema(): Promise<void> {
  const db = getMysqlPool();

  await db.query(`
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
      reset_token_hash VARCHAR(255) NULL,
      reset_token_expires_at DATETIME NULL,
      company_name VARCHAR(200) NULL,
      legal_representative VARCHAR(200) NULL,
      tax_id VARCHAR(80) NULL,
      beneficial_owners VARCHAR(40) NULL,
      notes TEXT NULL,
      accepted_policy TINYINT(1) NOT NULL DEFAULT 0,
      cc_pdf_path VARCHAR(255) NULL,
      rut_pdf_path VARCHAR(255) NULL,
      chamber_pdf_path VARCHAR(255) NULL,
      legal_rep_cc_pdf_path VARCHAR(255) NULL,
      financial_statements_pdf_path VARCHAR(255) NULL,
      bank_certificate_pdf_path VARCHAR(255) NULL,
      shareholder_composition_pdf_path VARCHAR(255) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_kyc_document (document_type, document_number),
      UNIQUE KEY uq_kyc_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await addColumnIfMissing("kyc_requests", "kyc_type", "VARCHAR(30) NOT NULL DEFAULT 'PERSONA_NATURAL' AFTER id");
  await addColumnIfMissing("kyc_requests", "nationality", "VARCHAR(80) NOT NULL DEFAULT '' AFTER document_number");
  await addColumnIfMissing("kyc_requests", "city", "VARCHAR(120) NOT NULL DEFAULT '' AFTER nationality");
  await addColumnIfMissing("kyc_requests", "address", "VARCHAR(220) NOT NULL DEFAULT '' AFTER city");
  await addColumnIfMissing("kyc_requests", "source_of_funds", "TEXT NULL AFTER phone");
  await addColumnIfMissing("kyc_requests", "password_hash", "VARCHAR(255) NULL AFTER source_of_funds");
  await addColumnIfMissing("kyc_requests", "reset_token_hash", "VARCHAR(255) NULL AFTER password_hash");
  await addColumnIfMissing("kyc_requests", "reset_token_expires_at", "DATETIME NULL AFTER reset_token_hash");
  await addColumnIfMissing("kyc_requests", "company_name", "VARCHAR(200) NULL AFTER password_hash");
  await addColumnIfMissing("kyc_requests", "legal_representative", "VARCHAR(200) NULL AFTER company_name");
  await addColumnIfMissing("kyc_requests", "tax_id", "VARCHAR(80) NULL AFTER legal_representative");
  await addColumnIfMissing("kyc_requests", "beneficial_owners", "VARCHAR(40) NULL AFTER tax_id");
  await addColumnIfMissing("kyc_requests", "notes", "TEXT NULL AFTER beneficial_owners");
  await addColumnIfMissing("kyc_requests", "accepted_policy", "TINYINT(1) NOT NULL DEFAULT 0 AFTER notes");
  await addColumnIfMissing("kyc_requests", "cc_pdf_path", "VARCHAR(255) NULL AFTER accepted_policy");
  await addColumnIfMissing("kyc_requests", "rut_pdf_path", "VARCHAR(255) NULL AFTER cc_pdf_path");
  await addColumnIfMissing("kyc_requests", "chamber_pdf_path", "VARCHAR(255) NULL AFTER rut_pdf_path");
  await addColumnIfMissing("kyc_requests", "legal_rep_cc_pdf_path", "VARCHAR(255) NULL AFTER chamber_pdf_path");
  await addColumnIfMissing("kyc_requests", "financial_statements_pdf_path", "VARCHAR(255) NULL AFTER legal_rep_cc_pdf_path");
  await addColumnIfMissing("kyc_requests", "bank_certificate_pdf_path", "VARCHAR(255) NULL AFTER financial_statements_pdf_path");
  await addColumnIfMissing("kyc_requests", "shareholder_composition_pdf_path", "VARCHAR(255) NULL AFTER bank_certificate_pdf_path");
  await db.query("ALTER TABLE kyc_requests MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO'");
  await db.query("UPDATE kyc_requests SET status = 'REGISTRADO' WHERE status = 'PENDIENTE' OR status IS NULL OR status = ''");

  await db.query(`
    CREATE TABLE IF NOT EXISTS kyc_admin_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(80) NOT NULL,
      full_name VARCHAR(180) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_kyc_admin_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const adminUsername = (process.env.KYC_MAIN_USER || "admin").trim();
  const adminPassword = (process.env.KYC_MAIN_PASSWORD || "Admin12345!").trim();
  const adminFullName = (process.env.KYC_MAIN_FULL_NAME || "Usuario Principal").trim();

  if (adminUsername && adminPassword) {
    const [adminRows] = await db.query(
      `
        SELECT id
        FROM kyc_admin_users
        WHERE username = ?
        LIMIT 1
      `,
      [adminUsername],
    );

    const adminExists = Array.isArray(adminRows) && adminRows.length > 0;
    if (!adminExists) {
      await db.query(
        `
          INSERT INTO kyc_admin_users (username, full_name, password_hash)
          VALUES (?, ?, ?)
        `,
        [adminUsername, adminFullName, hashPassword(adminPassword)],
      );
    }
  }
}
