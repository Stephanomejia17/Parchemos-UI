"use client";

import { Minus, Plus } from "lucide-react";

type AddButtonProps = {
  name: string;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function AddButton({ name, quantity, onAdd, onIncrement, onDecrement }: AddButtonProps) {
  return (
    <div className="flex h-11 items-center gap-1 rounded-full bg-primary-soft px-1" aria-label={`Cantidad de ${name}: ${quantity}`}>
      <button type="button" onClick={onDecrement} disabled={quantity === 0} aria-label={`Quitar una unidad de ${name}`} className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"><Minus className="h-4 w-4" /></button>
      <span className="min-w-5 text-center text-sm font-bold text-foreground">{quantity}</span>
      <button type="button" onClick={quantity === 0 ? onAdd : onIncrement} aria-label={`Agregar ${quantity === 0 ? "" : "otra unidad de "}${name}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-accent"><Plus className="h-4 w-4" /></button>
    </div>
  );
}
