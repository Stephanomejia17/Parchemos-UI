import { Suspense } from "react";
import { TableManagement } from "@/modules/restaurant/tables/TableManagement";

export default function TablesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-64 animate-pulse bg-background"
          aria-label="Cargando configuraci\u00F3n de mesas"
        />
      }
    >
      <TableManagement />
    </Suspense>
  );
}
