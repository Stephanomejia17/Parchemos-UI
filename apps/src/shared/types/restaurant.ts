/** Contratos compartidos con la API (PARCHEMOS-API, dominio restaurantes/sedes). */

export type LocationStatus = "pendiente_aprobacion" | "activa" | "rechazada";

export interface Schedule {
  id?: string;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  description: string | null;
  status: LocationStatus;
  rejectionReason: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  schedules: Schedule[];
  images: GalleryImage[];
}

export interface Restaurant {
  id: string;
  businessName: string;
  locations: Location[];
}

/** Vista reducida usada donde solo se necesita identificar el restaurante (ej. selects de menú). */
export type RestaurantSummary = Pick<Restaurant, "id" | "businessName">;

/** Estado de acceso del personal de un restaurante (distinto del `AccountStatus` de `shared/auth`). */
export type StaffAccountStatus = "activa" | "deshabilitada";

export interface StaffMember {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    status: StaffAccountStatus;
    createdAt: string;
  };
  location: { id: string; name: string; restaurantId: string };
  createdAt: string;
}

export interface LocationReview {
  id: string;
  name: string;
  address: string;
  status: LocationStatus;
  rejectionReason: string | null;
  approvedAt: string | null;
  restaurant: {
    id: string;
    businessName: string;
    owner: { id: string; fullName: string; email: string };
  };
}
