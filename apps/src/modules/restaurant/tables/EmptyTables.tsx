import { QrCode } from "lucide-react";

export function EmptyTables() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <QrCode className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">Todavía no hay mesas en esta sede.</p>
    </div>
  );
}
