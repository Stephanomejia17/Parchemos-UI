const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function PriceTag({ price }: { price: number }) {
  return <span className="font-bold text-primary">{currencyFormatter.format(price)}</span>;
}
