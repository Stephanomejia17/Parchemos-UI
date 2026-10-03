"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Dish, MenuItem } from "@/shared/types/menu";
import { useOrder } from "@/shared/context/order-context";
import { CategoryChips } from "./components/CategoryChips";
import { DishCardHorizontal } from "./components/DishCardHorizontal";
import { DishCardVertical } from "./components/DishCardVertical";
import { SectionTitle } from "./components/SectionTitle";

function toOrderItem(dish: Dish): MenuItem {
  return {
    id: dish.id,
    name: dish.name,
    description: dish.description,
    price: dish.price,
    imageUrl: dish.image,
    featured: dish.mostOrdered,
    available: true,
  };
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-md animate-pulse space-y-7 px-4 py-6 md:max-w-6xl md:px-6 lg:px-8">
      <div className="flex gap-3 overflow-hidden"><span className="h-16 w-20 shrink-0 rounded-2xl bg-muted" /><span className="h-16 w-20 shrink-0 rounded-2xl bg-muted" /><span className="h-16 w-20 shrink-0 rounded-2xl bg-muted" /><span className="h-16 w-20 shrink-0 rounded-2xl bg-muted" /></div>
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="flex gap-4 overflow-hidden"><span className="h-64 min-w-44 rounded-2xl bg-muted" /><span className="h-64 min-w-44 rounded-2xl bg-muted" /><span className="h-64 min-w-44 rounded-2xl bg-muted" /></div>
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"><span className="h-24 rounded-2xl bg-muted" /><span className="h-24 rounded-2xl bg-muted" /><span className="h-24 rounded-2xl bg-muted" /></div>
    </div>
  );
}

export function MenuScreen({ dishes, loadError = false, loading = false }: { dishes: Dish[]; loadError?: boolean; loading?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addItem, decrementQuantity, incrementQuantity, quantityOf } = useOrder();
  const activeCategory = searchParams.get("category");

  const categories = useMemo(() => Array.from(new Set(dishes.map((dish) => dish.category).filter(Boolean))), [dishes]);
  const filteredDishes = activeCategory ? dishes.filter((dish) => dish.category === activeCategory) : dishes;
  const flaggedFeatured = filteredDishes.filter((dish) => dish.mostOrdered);
  const featured = flaggedFeatured.length > 0 ? flaggedFeatured : filteredDishes.slice(0, 6);
  const featuredIds = new Set(featured.map((dish) => dish.id));
  const seasonal = filteredDishes.filter((dish) => dish.seasonal && !featuredIds.has(dish.id));
  const remaining = filteredDishes.filter((dish) => !featuredIds.has(dish.id) && !dish.seasonal);

  const changeCategory = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false });
  };

  const handleAdd = (dish: Dish) => {
    addItem(toOrderItem(dish));
  };

  if (loading) return <LoadingSkeleton />;

  if (loadError) {
    return <div className="rounded-3xl border border-border bg-surface p-8 text-center"><p className="font-semibold text-foreground">No pudimos cargar el menú.</p><button type="button" onClick={() => router.refresh()} className="mt-4 min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground transition duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary">Reintentar</button></div>;
  }

  if (dishes.length === 0) return <p className="rounded-3xl bg-primary-soft p-8 text-center text-muted-foreground">Esta sede todavía no tiene platos publicados.</p>;

  return (
    <div className="-mx-4 bg-background md:-mx-6">
      <div className="mx-auto max-w-md space-y-7 px-4 pb-8 pt-2 md:max-w-6xl md:px-6 lg:px-8">
        <CategoryChips categories={categories} activeCategory={activeCategory} onChange={changeCategory} />

        {featured.length > 0 && <section aria-labelledby="featured-title"><SectionTitle id="featured-title" action={{ label: "Ver todo", onClick: () => changeCategory(null) }}>Destacados</SectionTitle><div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scrollbar-hide">{featured.map((dish) => <DishCardHorizontal key={dish.id} dish={dish} quantity={quantityOf(dish.id)} onAdd={() => handleAdd(dish)} onIncrement={() => incrementQuantity(dish.id)} onDecrement={() => decrementQuantity(dish.id)} />)}</div></section>}

        {seasonal.length > 0 && <section aria-labelledby="seasonal-title"><SectionTitle id="seasonal-title">De temporada</SectionTitle><div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">{seasonal.map((dish) => <DishCardHorizontal key={dish.id} dish={dish} quantity={quantityOf(dish.id)} onAdd={() => handleAdd(dish)} onIncrement={() => incrementQuantity(dish.id)} onDecrement={() => decrementQuantity(dish.id)} />)}</div></section>}

        {remaining.length > 0 && <section aria-labelledby="all-products-title"><SectionTitle id="all-products-title">Más opciones</SectionTitle><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{remaining.map((dish) => <DishCardVertical key={dish.id} dish={dish} quantity={quantityOf(dish.id)} onAdd={() => handleAdd(dish)} onIncrement={() => incrementQuantity(dish.id)} onDecrement={() => decrementQuantity(dish.id)} />)}</div></section>}

        {filteredDishes.length === 0 && <p className="rounded-3xl bg-primary-soft p-8 text-center text-muted-foreground">No hay platos en esta categoría.</p>}
      </div>
    </div>
  );
}
