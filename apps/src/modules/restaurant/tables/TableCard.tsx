"use client";

import { Download, Power, QrCode } from "lucide-react";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { TABLE_STATUS, type Table } from "@/shared/types/table";
import { qrUrl } from "@/lib/qr-download";

type TableCardProps = {
  table: Table;
  onDownload: (table: Table) => void;
  onStatus: (table: Table) => void;
};

export function TableCard({ table, onDownload, onStatus }: TableCardProps) {
  const active = table.status === TABLE_STATUS.ACTIVE;
  return (
    <article
      className={`rounded-2xl border bg-surface p-4 shadow-sm ${!active ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-foreground">Mesa {table.code}</h2>
          <p className="text-xs text-muted-foreground">Código QR único</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}
        >
          {active ? "Activa" : "Inactiva"}
        </span>
      </div>
      {active ? (
        <RemoteImage
          src={qrUrl(table.qrImageUrl)}
          alt={`Código QR de la mesa ${table.code}`}
          className="mx-auto my-4 h-48 w-48 rounded-lg border border-border"
          sizes="192px"
        />
      ) : (
        <div className="my-4 flex h-48 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
          <QrCode className="mr-2 h-5 w-5" />
          QR no válido
        </div>
      )}
      <p className="mb-4 text-center text-lg font-bold text-foreground">Mesa {table.code}</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!active}
          onClick={() => onDownload(table)}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-soft px-3 py-2.5 text-xs font-semibold text-primary transition duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Descargar PNG
        </button>
        <button
          type="button"
          onClick={() => onStatus(table)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-muted text-foreground transition duration-200 hover:bg-border"
          aria-label={active ? "Desactivar mesa" : "Activar mesa"}
        >
          <Power className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
