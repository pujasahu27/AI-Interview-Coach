import "server-only";

export class UnsupportedFileTypeError extends Error {
  constructor(fileName: string) {
    super(`Unsupported file type: ${fileName}. Upload a PDF or DOCX file.`);
    this.name = "UnsupportedFileTypeError";
  }
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function assertFileSize(file: File): void {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`,
    );
  }
}

async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function isDocx(file: File): boolean {
  return (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  );
}

export async function parseUploadedFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (isPdf(file)) {
    return parsePdfBuffer(buffer);
  }
  if (isDocx(file)) {
    return parseDocxBuffer(buffer);
  }
  throw new UnsupportedFileTypeError(file.name);
}
