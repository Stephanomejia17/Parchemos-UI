import type { Dish } from "@/shared/types/menu";

type RawMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category: string;
  featured?: boolean;
  mostOrdered?: boolean;
  seasonal?: boolean;
  status?: string;
};

type RawMenuResponse = {
  data?: { items?: RawMenuItem[] };
  items?: RawMenuItem[];
};

function apiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:3001/api";
  throw new Error("La URL de la API no está configurada.");
}

export function mapMenuItem(item: RawMenuItem): Dish {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    image: item.imageUrl ?? null,
    category: item.category,
    // La API actual solo tiene `featured`; se usa como señal de más pedido.
    mostOrdered: item.mostOrdered ?? item.featured ?? false,
    // El backend aún no expone una bandera de temporada.
    seasonal: item.seasonal ?? false,
  };
}

export async function getMenu(locationId: string): Promise<Dish[]> {
  try {
    const response = await fetch(
      `${apiUrl()}/publicos/${encodeURIComponent(locationId)}/menu`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) {
      throw new Error(`No se pudo cargar el menú (${response.status}).`);
    }

    const payload = (await response.json()) as RawMenuResponse;
    const items = payload.data?.items ?? payload.items ?? [];
    return items.filter((item) => item.status !== "inactivo").map(mapMenuItem);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo cargar el menú.");
  }
}
