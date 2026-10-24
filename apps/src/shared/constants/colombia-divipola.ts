import { apiFetch } from "../services/http/api-client";

export interface ColombianDepartment {
  code: string;
  name: string;
}

export interface ColombianMunicipality {
  departmentCode: string;
  municipalityCode: string;
  department: string;
  municipality: string;
}

interface DivipolaCatalogResponse {
  departments: ColombianDepartment[];
  municipalities: ColombianMunicipality[];
}

export async function loadColombiaDivipola(): Promise<DivipolaCatalogResponse> {
  const data = await apiFetch<DivipolaCatalogResponse>(
    "/restaurantes/catalogo/divipola",
  );

  if (
    !data ||
    !Array.isArray(data.departments) ||
    !Array.isArray(data.municipalities) ||
    data.departments.some((item) => !item.code || !item.name) ||
    data.municipalities.some(
      (item) =>
        !item.departmentCode ||
        !item.municipalityCode ||
        !item.department ||
        !item.municipality,
    )
  ) {
    throw new Error(
      "La API devolvió una estructura de catálogo DIVIPOLA inválida.",
    );
  }

  return {
    departments: [...data.departments].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    ),
    municipalities: [...data.municipalities].sort((a, b) =>
      a.municipality.localeCompare(b.municipality, "es"),
    ),
  };
}