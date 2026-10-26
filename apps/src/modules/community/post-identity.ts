import type { Post } from "@/shared/services";

export interface PostIdentity {
  /** Quién "firma" la publicación: la marca si la publicó un restaurante, si no el autor. */
  title: string;
  /** Insignia junto al título (publicación hecha por un restaurante). */
  badge: string | null;
  /** Sede (y marca, si el autor es un comensal) a la que está ligada, con su enlace. */
  place: { href: string; label: string } | null;
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Identidad visible de una publicación. Una publicación de un restaurante
 * siempre pertenece a una sede y a su marca: se muestra "NATS" con la sede
 * debajo, y no el nombre de la persona dueña de la cuenta. En la de un
 * comensal se muestra su nombre y, si la asoció a un restaurante, "Marca · Sede".
 */
export function postIdentity(post: Post): PostIdentity & { initials: string } {
  const { location, author } = post;
  const href = location ? `/restaurant?locationId=${encodeURIComponent(location.id)}` : null;

  if (author.role === "restaurante" && location && href) {
    return {
      title: location.restaurant.businessName,
      badge: "Restaurante",
      place: { href, label: location.name },
      initials: initialsOf(location.restaurant.businessName),
    };
  }
  return {
    title: author.fullName,
    badge: null,
    place:
      location && href
        ? { href, label: `${location.restaurant.businessName} · ${location.name}` }
        : null,
    initials: initialsOf(author.fullName),
  };
}
