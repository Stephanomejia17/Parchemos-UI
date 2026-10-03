"use client";

import { CakeSlice, Coffee, Store,  Soup, Utensils } from "lucide-react";

const iconByCategory = {
  entradas: Soup,
  platos_fuertes: Utensils,
  postres: CakeSlice,
  bebidas: Coffee,
  default: Store,
};

function labelFor(category: string) {
  return category.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function CategoryChips({ categories, activeCategory, onChange }: { categories: string[]; activeCategory: string | null; onChange: (category: string | null) => void }) {
  return (
    <section aria-labelledby="categories-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="categories-title" className="text-sm font-bold text-foreground">Categorías</h2>
      </div>
      <nav aria-label="Categorías del menú" className="-mx-4 overflow-x-auto px-4 scrollbar-hide md:-mx-6 md:px-6">
        <div className="flex min-w-max gap-3 pb-1">
          <button type="button" onClick={() => onChange(null)} aria-pressed={!activeCategory} className={`flex w-24 flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition duration-200 focus-visible:outline-2 focus-visible:outline-primary md:w-28 ${!activeCategory ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-surface text-foreground hover:border-primary"}`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${!activeCategory ? "bg-primary-foreground/20" : "bg-primary-soft text-primary"}`}><Store className="h-5 w-5" /></span>
            <span className="max-w-full truncate text-xs font-semibold">Todo</span>
          </button>
          {categories.map((category) => {
            const Icon = iconByCategory[category as keyof typeof iconByCategory] ?? iconByCategory.default;
            const active = activeCategory === category;
            return (
              <button key={category} type="button" onClick={() => onChange(active ? null : category)} aria-pressed={active} className={`flex w-24 flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition duration-200 focus-visible:outline-2 focus-visible:outline-primary md:w-28 ${active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-surface text-foreground hover:border-primary"}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-primary-foreground/20" : "bg-primary-soft text-primary"}`}><Icon className="h-5 w-5" /></span>
                <span className="max-w-full truncate text-xs font-semibold">{labelFor(category)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
