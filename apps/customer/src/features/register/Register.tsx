"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Eye, EyeOff, Loader2, Store, UtensilsCrossed, X } from "lucide-react";
import { PrimaryButton } from "@parchemos/shared/components";
import { ApiError, evaluatePassword, useAuth } from "@parchemos/shared/auth";

type SelectableRole = "comensal" | "restaurante";

const ROLES: { id: SelectableRole; label: string; description: string; icon: typeof Store }[] = [
  {
    id: "comensal",
    label: "Comensal",
    description: "Descubre restaurantes, reserva y pide.",
    icon: UtensilsCrossed,
  },
  {
    id: "restaurante",
    label: "Restaurante",
    description: "Publica tu negocio y recibe pedidos.",
    icon: Store,
  },
];

export function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<SelectableRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  // Solo se resaltan los campos obligatorios despues del primer intento de envio.
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  const passwordState = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirm.length > 0 && password === confirm;

  const canSubmit =
    role !== null &&
    fullName.trim().length >= 2 &&
    email.trim().length > 0 &&
    passwordState.valid &&
    passwordsMatch &&
    acceptedTerms &&
    acceptedPrivacy;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouchedSubmit(true);
    setServerErrors([]);

    // GU-01 Esc. 5 y 6: sin rol o sin aceptar los terminos no se envia nada.
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const result = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: role!,
        acceptedTerms,
        acceptedPrivacy,
      });
      // GU-01 Esc. 1 y 2: tras registrarse, a iniciar sesion.
      const params = new URLSearchParams({ registrado: "1", rol: result.user.role });
      router.replace(`/login?${params.toString()}`);
    } catch (err) {
      setServerErrors(toMessages(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-background flex justify-center px-5 py-8 md:py-12">
      <div className="w-full max-w-lg flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-heading">Crea tu cuenta</h1>
          </div>
          <p className="text-sm text-muted-foreground">Elige cómo quieres usar Parchemos.</p>
        </header>

        {serverErrors.length > 0 && (
          <div role="alert" className="flex gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <ul className="flex flex-col gap-1">
              {serverErrors.map(message => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          {/* GU-01 Esc. 5: selección de rol obligatoria */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold text-gray-600 mb-2">Quiero registrarme como</legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(option => {
                const selected = role === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRole(option.id)}
                    className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? "border-primary bg-orange-50 ring-2 ring-primary/20"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <option.icon className={`w-5 h-5 ${selected ? "text-primary" : "text-gray-400"}`} />
                    <span className="text-sm font-semibold text-gray-900">{option.label}</span>
                    <span className="text-xs text-muted-foreground leading-snug">{option.description}</span>
                  </button>
                );
              })}
            </div>
            {touchedSubmit && !role && (
              <p className="text-xs text-red-600">Selecciona un rol para continuar.</p>
            )}
            {role === "restaurante" && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                Tu cuenta quedará <strong>pendiente de aprobación</strong>. Podrás crear tu perfil de negocio de
                inmediato, pero pedidos y reservas se habilitan cuando el administrador la apruebe.
              </p>
            )}
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Nombre completo</span>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder={role === "restaurante" ? "Nombre del restaurante" : "Tu nombre"}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
            />
            {touchedSubmit && fullName.trim().length < 2 && (
              <span className="text-xs text-red-600">Ingresa un nombre de al menos 2 caracteres.</span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Correo electrónico</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
            />
            {touchedSubmit && email.trim().length === 0 && (
              <span className="text-xs text-red-600">Ingresa tu correo electrónico.</span>
            )}
          </label>

          <div className="flex flex-col gap-1.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Contraseña</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>
            {/* GU-01 Esc. 4: se muestran los requisitos que faltan */}
            <ul className="flex flex-col gap-1 mt-1">
              {passwordState.checks.map(check => (
                <li
                  key={check.id}
                  className={`flex items-center gap-1.5 text-xs ${check.met ? "text-green-600" : "text-gray-500"}`}
                >
                  {check.met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {check.label}
                </li>
              ))}
            </ul>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Confirma tu contraseña</span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
            />
            {confirm.length > 0 && !passwordsMatch && (
              <span className="text-xs text-red-600">Las contraseñas no coinciden.</span>
            )}
          </label>

          {/* GU-01 Esc. 6: aceptación explícita, sin marcar por defecto */}
          <fieldset className="flex flex-col gap-2.5">
            <label
              className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                touchedSubmit && !acceptedTerms ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[color:var(--color-primary,#FF6B35)]"
              />
              <span className="text-xs text-gray-700">
                Acepto los <span className="text-primary font-semibold">Términos y condiciones</span> de Parchemos.
              </span>
            </label>

            <label
              className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                touchedSubmit && !acceptedPrivacy ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={e => setAcceptedPrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[color:var(--color-primary,#FF6B35)]"
              />
              <span className="text-xs text-gray-700">
                Acepto la <span className="text-primary font-semibold">Política de tratamiento de datos</span>.
              </span>
            </label>

            {touchedSubmit && (!acceptedTerms || !acceptedPrivacy) && (
              <p className="text-xs text-red-600">
                Debes aceptar los términos y la política de datos para crear tu cuenta.
              </p>
            )}
          </fieldset>

          <PrimaryButton type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando tu cuenta...
              </span>
            ) : (
              "Crear cuenta"
            )}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-muted-foreground pb-4">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function toMessages(err: unknown): string[] {
  if (err instanceof ApiError) {
    return err.details?.length ? err.details : [err.message];
  }
  return ["No pudimos conectar con el servidor. Revisa tu conexión."];
}
