/** Contratos compartidos con la API (PARCHEMOS-API, modulo auth). */

export type UserRole = "comensal" | "restaurante" | "personal_restaurante" | "repartidor" | "administrador";

export type AccountStatus = "pendiente_aprobacion" | "activa" | "suspendida" | "deshabilitada" | "pendiente_eliminacion";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  /** GU-01 Esc. 2: false mientras el restaurante espera aprobacion. */
  canOperate: boolean;
  phone: string | null;
  city: string | null;
  profilePhotoUrl: string | null;
  assignedLocation: { id: string; name: string; address: string; status: string; restaurantName: string } | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  profilePhotoUrl: string;
  role: "comensal" | "restaurante";
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export interface RegisterResult {
  user: AuthUser;
  message: string;
  nextStep: "login";
}

/** Error de negocio ya traducido a algo que la UI puede pintar. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** CUENTA_SUSPENDIDA, CUENTA_BLOQUEADA, ... cuando la API lo envia. */
    readonly code?: string,
    /** Motivo de la suspension (GU-02 Esc. 3). */
    readonly reason?: string,
    /** Mensajes de validacion campo por campo. */
    readonly details?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
