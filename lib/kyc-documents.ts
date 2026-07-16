import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureKycSchema, getMysqlPool } from "@/lib/mysql";

export const MAX_KYC_PDF_SIZE = 10 * 1024 * 1024;

function resolveStorageDir(configuredPath: string): string {
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(/*turbopackIgnore: true*/ process.cwd(), configuredPath);
}

function getKycStorageDirs(): string[] {
  const configuredStorageDir = (process.env.KYC_STORAGE_DIR || "").trim();
  const candidates = [
    configuredStorageDir ? resolveStorageDir(configuredStorageDir) : "",
    path.resolve(/*turbopackIgnore: true*/ process.cwd(), "..", "kyc-storage"),
    path.join(process.cwd(), ".data"),
  ].filter(Boolean);

  return [...new Set(candidates)];
}

export async function persistKycPdf(file: File, prefix: string): Promise<string> {
  if (file.size === 0 || file.size > MAX_KYC_PDF_SIZE) {
    throw new Error("El PDF debe pesar entre 1 byte y 10 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("El archivo adjunto no es un PDF válido.");
  }

  const fileName = `${Date.now()}-${prefix}-${randomUUID()}.pdf`;
  const errors: unknown[] = [];
  let savedToDisk = false;

  for (const storageDir of getKycStorageDirs()) {
    try {
      const uploadDir = path.join(storageDir, "kyc");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer, { flag: "wx" });
      savedToDisk = true;
      break;
    } catch (error) {
      errors.push(error);
    }
  }

  try {
    await ensureKycSchema();
    const db = getMysqlPool();
    await db.query(
      `
        INSERT INTO kyc_document_files (file_name, mime_type, file_size, contents)
        VALUES (?, 'application/pdf', ?, ?)
        ON DUPLICATE KEY UPDATE
          mime_type = VALUES(mime_type),
          file_size = VALUES(file_size),
          contents = VALUES(contents)
      `,
      [fileName, buffer.length, buffer],
    );
  } catch (error) {
    if (!savedToDisk) {
      throw error instanceof Error ? error : errors[0] instanceof Error ? errors[0] : new Error("No fue posible guardar el PDF.");
    }
  }

  return `kyc/${fileName}`;
}

export function getKycDocumentFileName(storedPath: string): string | null {
  const fileName = path.posix.basename(storedPath);
  return /^[a-zA-Z0-9._-]+\.pdf$/i.test(fileName) ? fileName : null;
}

export function toKycDocumentUrl(storedPath: string | null | undefined): string | null {
  if (!storedPath) return null;
  const fileName = getKycDocumentFileName(storedPath);
  return fileName ? `/api/kyc/documents/${encodeURIComponent(fileName)}` : null;
}

export function getKycDocumentCandidates(fileName: string): string[] {
  return [
    ...getKycStorageDirs().map((storageDir) => path.join(storageDir, "kyc", fileName)),
    path.join(process.cwd(), "public", "uploads", "kyc", fileName),
  ];
}

export async function readKycDocumentFromDatabase(fileName: string): Promise<Buffer | null> {
  await ensureKycSchema();
  const db = getMysqlPool();
  const [rows] = await db.query(
    `
      SELECT contents
      FROM kyc_document_files
      WHERE file_name = ?
      LIMIT 1
    `,
    [fileName],
  );

  const record = (Array.isArray(rows) ? rows : [])[0] as { contents: Buffer | Uint8Array } | undefined;
  return record ? Buffer.from(record.contents) : null;
}

export async function deleteKycDocument(storedPath: string | null | undefined): Promise<void> {
  if (!storedPath) return;
  const fileName = getKycDocumentFileName(storedPath);
  if (!fileName) return;

  await Promise.all(
    getKycDocumentCandidates(fileName).map(async (candidate) => {
      try {
        await unlink(candidate);
      } catch {
        // El archivo puede haber sido migrado o eliminado previamente.
      }
    }),
  );

  try {
    await ensureKycSchema();
    const db = getMysqlPool();
    await db.query("DELETE FROM kyc_document_files WHERE file_name = ?", [fileName]);
  } catch {
    // La limpieza en base de datos no debe bloquear la eliminación del registro principal.
  }
}
