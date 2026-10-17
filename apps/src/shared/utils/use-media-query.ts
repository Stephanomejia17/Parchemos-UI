"use client";

import { useEffect, useState } from "react";

/** Breakpoint `md` de Tailwind: por debajo se considera móvil. */
export const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * `true` cuando la pantalla cumple la media query. Arranca en `false` (igual
 * en servidor y cliente) y se corrige tras montar, para no desajustar la
 * hidratación.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}
