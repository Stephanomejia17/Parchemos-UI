/** Reglas de archivos para publicaciones (DO-04 RN1). El servidor las valida de nuevo. */
export const MAX_POST_MEDIA_BYTES = 50 * 1024 * 1024;
export const MAX_POST_MEDIA_FILES = 10;
export const POST_MEDIA_ACCEPT = "image/jpeg,image/png,image/heic,image/heif,video/mp4,.heic,.heif";
export const ALLOWED_FORMATS_LABEL = "JPG, PNG, HEIC y MP4";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "heif", "mp4"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/heic", "image/heif", "video/mp4"];

/** HEIC llega a veces sin `type` (Windows), por eso también se mira la extensión. */
export function isAllowedPostMedia(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.type
    ? ALLOWED_MIME.includes(file.type.toLowerCase()) && ALLOWED_EXTENSIONS.includes(extension)
    : ALLOWED_EXTENSIONS.includes(extension);
}

export function isVideoFile(file: File): boolean {
  return file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
}

/** Devuelve el motivo por el que el archivo no se puede subir, o `null` si es válido. */
export function validatePostMedia(file: File): string | null {
  if (!isAllowedPostMedia(file)) {
    return `"${file.name}" no es un formato soportado. Formatos permitidos: ${ALLOWED_FORMATS_LABEL}.`;
  }
  if (file.size > MAX_POST_MEDIA_BYTES) {
    return `"${file.name}" supera el límite de ${MAX_POST_MEDIA_BYTES / 1024 / 1024} MB por archivo.`;
  }
  return null;
}
