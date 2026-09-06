const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCop(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value)
    ? ""
    : COP_FORMATTER.format(value);
}

/** Convierte una entrada monetaria visible a un número entero en COP. */
export function parseCop(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
