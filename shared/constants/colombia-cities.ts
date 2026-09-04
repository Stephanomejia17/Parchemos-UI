/**
 * Municipios de Colombia disponibles en los formularios de Parchemos.
 *
 * El alcance del producto es Colombia, asi que la ciudad se elige de esta
 * lista en vez de escribirse a mano: en la base de datos `users.city` sigue
 * siendo texto libre, pero normalizar lo que envia la UI evita que "Medellin",
 * "medellín" y "Medellín " terminen como tres ciudades distintas.
 *
 * La lista no pretende ser el DIVIPOLA completo: son las capitales mas los
 * municipios con mayor poblacion. Por eso los combos que la usan siguen
 * aceptando texto libre para quien viva en un municipio que falte aqui.
 */

export interface ColombianCity {
  /** Nombre tal como se guarda en la base de datos. */
  name: string;
  department: string;
}

export const COLOMBIA_CITIES: ColombianCity[] = [
  { name: "Armenia", department: "Quindío" },
  { name: "Arauca", department: "Arauca" },
  { name: "Apartadó", department: "Antioquia" },
  { name: "Barrancabermeja", department: "Santander" },
  { name: "Barranquilla", department: "Atlántico" },
  { name: "Bello", department: "Antioquia" },
  { name: "Bogotá D.C.", department: "Cundinamarca" },
  { name: "Bucaramanga", department: "Santander" },
  { name: "Buenaventura", department: "Valle del Cauca" },
  { name: "Buga", department: "Valle del Cauca" },
  { name: "Cali", department: "Valle del Cauca" },
  { name: "Cartagena", department: "Bolívar" },
  { name: "Cartago", department: "Valle del Cauca" },
  { name: "Caucasia", department: "Antioquia" },
  { name: "Chía", department: "Cundinamarca" },
  { name: "Ciénaga", department: "Magdalena" },
  { name: "Cúcuta", department: "Norte de Santander" },
  { name: "Dosquebradas", department: "Risaralda" },
  { name: "Duitama", department: "Boyacá" },
  { name: "Envigado", department: "Antioquia" },
  { name: "Facatativá", department: "Cundinamarca" },
  { name: "Florencia", department: "Caquetá" },
  { name: "Floridablanca", department: "Santander" },
  { name: "Fusagasugá", department: "Cundinamarca" },
  { name: "Girardot", department: "Cundinamarca" },
  { name: "Girón", department: "Santander" },
  { name: "Ibagué", department: "Tolima" },
  { name: "Inírida", department: "Guainía" },
  { name: "Ipiales", department: "Nariño" },
  { name: "Itagüí", department: "Antioquia" },
  { name: "Jamundí", department: "Valle del Cauca" },
  { name: "La Dorada", department: "Caldas" },
  { name: "Leticia", department: "Amazonas" },
  { name: "Lorica", department: "Córdoba" },
  { name: "Magangué", department: "Bolívar" },
  { name: "Maicao", department: "La Guajira" },
  { name: "Malambo", department: "Atlántico" },
  { name: "Manizales", department: "Caldas" },
  { name: "Medellín", department: "Antioquia" },
  { name: "Mitú", department: "Vaupés" },
  { name: "Mocoa", department: "Putumayo" },
  { name: "Montería", department: "Córdoba" },
  { name: "Mosquera", department: "Cundinamarca" },
  { name: "Neiva", department: "Huila" },
  { name: "Ocaña", department: "Norte de Santander" },
  { name: "Palmira", department: "Valle del Cauca" },
  { name: "Pasto", department: "Nariño" },
  { name: "Pereira", department: "Risaralda" },
  { name: "Piedecuesta", department: "Santander" },
  { name: "Pitalito", department: "Huila" },
  { name: "Popayán", department: "Cauca" },
  { name: "Puerto Carreño", department: "Vichada" },
  { name: "Quibdó", department: "Chocó" },
  { name: "Riohacha", department: "La Guajira" },
  { name: "Rionegro", department: "Antioquia" },
  { name: "Sabanalarga", department: "Atlántico" },
  { name: "Sahagún", department: "Córdoba" },
  { name: "San Andrés", department: "San Andrés y Providencia" },
  { name: "San José del Guaviare", department: "Guaviare" },
  { name: "Santa Marta", department: "Magdalena" },
  { name: "Sincelejo", department: "Sucre" },
  { name: "Soacha", department: "Cundinamarca" },
  { name: "Sogamoso", department: "Boyacá" },
  { name: "Soledad", department: "Atlántico" },
  { name: "Tuluá", department: "Valle del Cauca" },
  { name: "Tumaco", department: "Nariño" },
  { name: "Tunja", department: "Boyacá" },
  { name: "Turbo", department: "Antioquia" },
  { name: "Valledupar", department: "Cesar" },
  { name: "Villavicencio", department: "Meta" },
  { name: "Yopal", department: "Casanare" },
  { name: "Zipaquirá", department: "Cundinamarca" },
];

/** Opciones listas para un `ComboBoxField`. */
export const COLOMBIA_CITY_OPTIONS = COLOMBIA_CITIES.map(city => ({
  value: city.name,
  label: city.name,
  description: city.department,
}));
