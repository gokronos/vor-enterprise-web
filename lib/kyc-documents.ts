import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_KYC_PDF_SIZE = 10 * 1024 * 1024;

export async function persistKycPdf(file: File, prefix: string): Promise<string> {
  if (file.size === 0 || file.size > MAX_KYC_PDF_SIZE) {
    throw new Error("El PDF debe pesar entre 1 byte y 10 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("El archivo adjunto no es un PDF válido.");
  }

  const uploadDir = path.join(process.cwd(), ".data", "kyc");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${prefix}-${randomUUID()}.pdf`;
  await writeFile(path.join(uploadDir, fileName), buffer, { flag: "wx" });

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
    path.join(process.cwd(), ".data", "kyc", fileName),
    path.join(process.cwd(), "public", "uploads", "kyc", fileName),
  ];
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
}
