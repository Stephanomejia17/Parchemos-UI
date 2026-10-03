"use client";

import { ImageOff } from "lucide-react";
import type { Dish } from "@/shared/types/menu";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { AddButton } from "./AddButton";
import { PriceTag } from "./PriceTag";

export function DishCardVertical({ dish, quantity, onAdd, onIncrement, onDecrement }: { dish: Dish; quantity: number; onAdd: () => void; onIncrement: () => void; onDecrement: () => void }) {
  return (
    <article className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm transition duration-200 hover:shadow-md">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {dish.image ? <RemoteImage src={dish.image} alt={dish.name} className="h-full w-full" sizes="64px" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ImageOff className="h-6 w-6" aria-hidden="true" /></div>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-foreground">{dish.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{dish.description || "Sin descripción disponible."}</p>
        <div className="mt-2"><PriceTag price={dish.price} /></div>
      </div>
      <AddButton name={dish.name} quantity={quantity} onAdd={onAdd} onIncrement={onIncrement} onDecrement={onDecrement} />
    </article>
  );
}
