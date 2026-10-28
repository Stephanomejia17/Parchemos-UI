/**
 * Nomenclatura urbana colombiana, tal como la usa el catastro de Medellín:
 *
 *   Calle 51 Sur # 62E - 16        (cuadrante en la vía principal)
 *   Carrera 34 # 18AA Sur - 160    (letras dobles y cuadrante en el cruce)
 *   Carrera 10C # 44AA - 60
 *
 * La API vuelve a interpretar este mismo texto para ubicar la sede.
 */

export const ROAD_TYPES = [
  "Calle",
  "Carrera",
  "Avenida",
  "Avenida Calle",
  "Avenida Carrera",
  "Circular",
  "Diagonal",
  "Transversal",
] as const;

/** En Medellín solo se escriben Sur y Este; Norte y Oeste son el valor por defecto. */
export const QUADRANTS = ["", "Sur", "Este", "Norte", "Oeste"] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export interface RoadAddress {
  roadType: string;
  mainNumber: string;
  mainLetters: string;
  mainQuadrant: Quadrant;
  crossNumber: string;
  crossLetters: string;
  crossQuadrant: Quadrant;
  plateNumber: string;
  plateLetter: string;
}

export const EMPTY_ROAD_ADDRESS: RoadAddress = {
  roadType: "Carrera",
  mainNumber: "",
  mainLetters: "",
  mainQuadrant: "",
  crossNumber: "",
  crossLetters: "",
  crossQuadrant: "",
  plateNumber: "",
  plateLetter: "",
};

/** Solo dígitos, como máximo 3 ("43", "160"). */
export const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 3);

/** Solo letras en mayúscula ("c" -> "C", "aa" -> "AA"). */
export const onlyLetters = (value: string, max: number) =>
  value.replace(/[^a-z]/gi, "").toUpperCase().slice(0, max);

const withQuadrant = (text: string, quadrant: Quadrant) => (quadrant ? `${text} ${quadrant}` : text);

/** "Carrera 34 # 18AA Sur - 160" */
export function formatRoad(road: RoadAddress): string {
  const main = withQuadrant(`${road.roadType} ${road.mainNumber}${road.mainLetters}`, road.mainQuadrant);
  const cross = withQuadrant(`${road.crossNumber}${road.crossLetters}`, road.crossQuadrant);
  return `${main} # ${cross} - ${road.plateNumber}${road.plateLetter}`;
}

export function isRoadComplete(road: RoadAddress): boolean {
  return Boolean(road.mainNumber && road.crossNumber && road.plateNumber);
}

const ROAD_TYPE_PATTERN = "Avenida Calle|Avenida Carrera|Calle|Carrera|Avenida|Circular|Diagonal|Transversal";
const QUADRANT_PATTERN = "Sur|Este|Norte|Oeste";
// Las letras van pegadas al número o separadas por un espacio, nunca seguidas
// de más letras: así "51 Sur" no se lee como número 51 con letras "SU".
const ROAD_PATTERN = new RegExp(
  `^(${ROAD_TYPE_PATTERN})\\s+(\\d{1,3})\\s*([a-z]{0,2})(?=[\\s#-]|$)(?:\\s+(${QUADRANT_PATTERN}))?` +
    `\\s*#\\s*(\\d{1,3})\\s*([a-z]{0,2})(?=[\\s-]|$)(?:\\s+(${QUADRANT_PATTERN}))?` +
    `\\s*-\\s*(\\d{1,3})\\s*([a-z]?)(?=\\s|$)(?:\\s+(${QUADRANT_PATTERN}))?$`,
  "i",
);

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
const asQuadrant = (value?: string): Quadrant => (value ? (capitalize(value) as Quadrant) : "");

/** Lee una dirección guardada para precargar el formulario. */
export function parseRoad(text: string): RoadAddress | null {
  const match = ROAD_PATTERN.exec(text.trim());
  if (!match) return null;
  const [, roadType, mainNumber, mainLetters, mainQuadrant, crossNumber, crossLetters, crossQuadrant, plateNumber, plateLetter, trailingQuadrant] =
    match;

  return {
    roadType: ROAD_TYPES.find((type) => type.toLowerCase() === roadType.toLowerCase()) ?? "Carrera",
    mainNumber,
    mainLetters: mainLetters.toUpperCase(),
    mainQuadrant: asQuadrant(mainQuadrant),
    crossNumber,
    crossLetters: crossLetters.toUpperCase(),
    // "Calle 10 # 43 - 36 Sur" es lo mismo que "Calle 10 # 43 Sur - 36".
    crossQuadrant: asQuadrant(crossQuadrant ?? trailingQuadrant),
    plateNumber,
    plateLetter: plateLetter.toUpperCase(),
  };
}
