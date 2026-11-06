// Upload validation: size, allowed type, and a magic-byte check so a renamed
// executable can't be stored as "certificate.pdf".
export const MAX_FILE_BYTES = 4 * 1024 * 1024;

const TYPES: { ext: string; mime: string; magic: number[][] }[] = [
  { ext: "pdf", mime: "application/pdf", magic: [[0x25, 0x50, 0x44, 0x46]] },
  { ext: "png", mime: "image/png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  { ext: "jpg", mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  { ext: "jpeg", mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  { ext: "webp", mime: "image/webp", magic: [[0x52, 0x49, 0x46, 0x46]] },
  { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", magic: [[0x50, 0x4b, 0x03, 0x04]] },
];

export async function readUpload(file: File): Promise<{ ok: true; data: Buffer; mime: string; name: string } | { ok: false; error: string }> {
  if (!file || file.size === 0) return { ok: false, error: "Choose a file to upload." };
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: "File is too large (max 4 MB)." };
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES.find((t) => t.ext === ext);
  if (!type) return { ok: false, error: "Allowed file types: PDF, PNG, JPG, WEBP, DOCX." };
  const data = Buffer.from(await file.arrayBuffer());
  if (!type.magic.some((m) => m.every((b, i) => data[i] === b))) {
    return { ok: false, error: "That file's contents don't match its extension." };
  }
  const name = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  return { ok: true, data, mime: type.mime, name };
}
