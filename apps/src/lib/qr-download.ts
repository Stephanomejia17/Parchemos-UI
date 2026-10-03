import { buildApiUrl } from "@/shared/services/http/api-client";
import type { Table } from "@/shared/types/table";

const QR_SIZE = 720;
const QR_PADDING = 40;
const QR_IMAGE_SIZE = 640;
const QR_LABEL_Y = 755;
const QR_FONT = "bold 42px Arial";

export function qrUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/api/") ? path.slice("/api".length) : path;
  return buildApiUrl(normalizedPath);
}

export async function downloadQr(table: Table): Promise<void> {
  let sourceUrl: string | null = null;
  let outputUrl: string | null = null;

  try {
    const response = await fetch(qrUrl(table.qrImageUrl));
    if (!response.ok) throw new Error(`QR request failed with status ${response.status}`);

    const blob = await response.blob();
    sourceUrl = URL.createObjectURL(blob);
    const image = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = QR_SIZE;
    canvas.height = QR_SIZE + 100;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, QR_PADDING, QR_PADDING, QR_IMAGE_SIZE, QR_IMAGE_SIZE);
    context.fillStyle = "#111827";
    context.font = QR_FONT;
    context.textAlign = "center";
    context.fillText(`Mesa ${table.code}`, QR_SIZE / 2, QR_LABEL_Y);
    image.close();

    const outputBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Could not create QR image"));
      }, "image/png");
    });

    outputUrl = URL.createObjectURL(outputBlob);
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = `mesa-${table.code}-qr.png`;
    link.click();
  } finally {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }
}
