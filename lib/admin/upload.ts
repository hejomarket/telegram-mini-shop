import 'server-only';

export const adminImageMimeTypes = new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']]);
export const adminImageMaxBytes = 5 * 1024 * 1024;

export function sanitizeUploadFilename(name: string, fallbackExtension = 'jpg') {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `image.${fallbackExtension}`;
}

export function validateAdminImageFile(file: File) {
  const ext = adminImageMimeTypes.get(file.type);
  if (!ext) return { ok: false as const, message: 'Format gambar harus JPEG, PNG, atau WebP.' };
  if (file.size <= 0) return { ok: false as const, message: 'File gambar tidak boleh kosong.' };
  if (file.size > adminImageMaxBytes) return { ok: false as const, message: 'Ukuran gambar maksimal 5 MB.' };
  return { ok: true as const, ext };
}
