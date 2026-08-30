export class ImageUploadError extends Error {}

const MAX = 5 * 1024 * 1024;

export function validateImage(mime: string, size: number): ImageUploadError | null {
  if (!mime.startsWith("image/")) return new ImageUploadError("Only images are allowed.");
  if (size > MAX) return new ImageUploadError("Image exceeds 5 MB.");
  return null;
}
