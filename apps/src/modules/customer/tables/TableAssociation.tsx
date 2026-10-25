"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { apiFetch } from "@/shared/services/http/api-client";

export type PublicTable = {
  tableId: string;
  tableCode: string;
  locationId: string;
};

type Props = {
  locationId: string;
  onAssociated: (table: PublicTable) => void;
};

export function TableAssociation({ locationId, onAssociated }: Props) {
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitManual = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = manualCode.trim();
    if (!/^[1-9]\d*$/.test(code)) {
      setError("Ingresa un número de mesa válido.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const table = await apiFetch<PublicTable>(
        `/mesas/public-by-code?locationId=${encodeURIComponent(locationId)}&code=${encodeURIComponent(code)}`,
      );
      onAssociated(table);
      setManualCode("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No encontramos esa mesa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <div className="mb-3">
        <p className="font-semibold text-gray-900">Vincúlate a una mesa</p>
        <p className="mt-1 text-sm text-gray-600">
          Ingresa el número impreso en una mesa habilitada de esta sede.
        </p>
      </div>
      <form onSubmit={(event) => void submitManual(event)} className="flex gap-2">
        <input
          value={manualCode}
          onChange={(event) => setManualCode(event.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          pattern="[1-9][0-9]*"
          placeholder="Número de mesa"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
          aria-label="Número de mesa"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          <span className="sr-only">Asociar mesa</span>
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
