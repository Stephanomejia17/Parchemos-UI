"use client";

import { ImageOff } from "lucide-react";
import type { Dish } from "@/shared/types/menu";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { AddButton } from "./AddButton";
import { PriceTag } from "./PriceTag";

type DishCardHorizontalProps = {
  dish: Dish;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function DishCardHorizontal({ dish, quantity, onAdd, onIncrement, onDecrement }: DishCardHorizontalProps) {
  return (
    <article className="flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-2.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        {dish.image ? <RemoteImage src={dish.image} alt={dish.name} className="h-full w-full" sizes="176px" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ImageOff className="h-8 w-8" aria-hidden="true" /></div>}
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h3 className="truncate font-bold text-foreground">{dish.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-4 text-muted-foreground">{dish.description || "Sin descripción disponible."}</p>
        <div className="mt-auto flex flex-col items-center gap-3 pt-3">
          <PriceTag price={dish.price} />
          <AddButton name={dish.name} quantity={quantity} onAdd={onAdd} onIncrement={onIncrement} onDecrement={onDecrement} />
        </div>
      </div>
    </article>
  );
}
