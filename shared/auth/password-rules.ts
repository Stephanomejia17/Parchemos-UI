import type { UserRole } from "./types";

/**
 * Misma politica que valida el backend (GU-01 Esc. 4). Aqui se replica solo
 * para dar retroalimentacion inmediata: la validacion que manda es la del API.
 */
export const PASSWORD_RULES = [
  { id: "length", label: "Al menos 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "uppercase", label: "Al menos una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "Al menos un número", test: (v: string) => /\d/.test(v) },
] as const;

export interface PasswordCheck {
  id: string;
  label: string;
  met: boolean;
}

export function evaluatePassword(value: string): { checks: PasswordCheck[]; valid: boolean } {
  const checks = PASSWORD_RULES.map(rule => ({ id: rule.id, label: rule.label, met: rule.test(value) }));
  return { checks, valid: checks.every(c => c.met) };
}

/** GU-02 Esc. 1: cada rol aterriza en su propio panel. */
export function roleHomePath(role: UserRole): string {
  switch (role) {
    case "administrador":
      return "/admin/restaurants";
    case "restaurante":
    case "personal_restaurante":
      return "/profile/dashboard";
    case "repartidor":
      return "/orders";
    case "comensal":
    default:
      return "/home";
  }
}
