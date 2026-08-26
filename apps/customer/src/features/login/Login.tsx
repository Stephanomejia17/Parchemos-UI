"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { PrimaryButton } from "@parchemos/shared/components";
import { ApiError, roleHomePath, useAuth } from "@parchemos/shared/auth";
import { RemoteImage } from "@/components/media/RemoteImage";

interface LoginError {
  message: string;
  /** Motivo de la suspension, cuando el administrador lo registro (GU-02 Esc. 3). */
  reason?: string;
  tone: "error" | "warning";
}

export function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();

  // Aviso tras un registro correcto (GU-01 Esc. 1 y 2).
  const justRegistered = params.get("registrado") === "1";
  const registeredAsRestaurant = params.get("rol") === "restaurante";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      // GU-02 Esc. 1: cada rol entra a su propio panel.
      router.replace(roleHomePath(user.role));
    } catch (err) {
      setError(toLoginError(err));
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      <div className="relative h-40 md:h-auto md:flex-1">
        <RemoteImage
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=900&fit=crop&auto=format"
          alt="food"
          className="w-full h-full"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-white md:bg-gradient-to-r md:from-transparent md:to-black/40" />
        <div className="hidden md:flex absolute inset-0 items-end p-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍽️</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white font-heading">Parchemos</h1>
            </div>
            <p className="text-white/80 text-lg max-w-xs">
              La plataforma gastronómica que conecta personas con experiencias únicas.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white px-6 pt-6 pb-10 flex flex-col gap-4 md:w-96 md:overflow-y-auto md:justify-center md:px-10 md:py-12 lg:w-[440px]">
        <div className="flex items-center gap-3 mb-1 md:hidden">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-heading">Parchemos</h2>
        </div>
        <div className="hidden md:block">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1 font-heading">Bienvenido de vuelta</h2>
        </div>
        <p className="text-muted-foreground text-sm">Inicia sesión para continuar</p>

        {justRegistered && !error && (
          <div role="status" className="flex gap-2.5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              {registeredAsRestaurant
                ? "Cuenta creada y pendiente de aprobación. Inicia sesión para crear tu perfil de negocio."
                : "Tu cuenta fue creada. Inicia sesión para continuar."}
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className={`flex gap-2.5 rounded-2xl px-4 py-3 text-sm ${
              error.tone === "warning" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"
            }`}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{error.message}</p>
              {error.reason && <p className="mt-1 text-xs opacity-80">Motivo: {error.reason}</p>}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Correo electrónico</span>
            <input
              type="email"
              autoComplete="email"
              required
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Contraseña</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm outline-none focus:border-primary transition-colors"
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

          <PrimaryButton type="submit" size="lg" className="w-full mt-1" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-primary font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

function toLoginError(err: unknown): LoginError {
  if (err instanceof ApiError) {
    // La cuenta bloqueada o suspendida no es un fallo de credenciales:
    // se muestra con otro tono para que el usuario entienda qué pasa.
    if (err.code === "CUENTA_BLOQUEADA" || err.code === "CUENTA_SUSPENDIDA" || err.code === "CUENTA_DESHABILITADA") {
      return { message: err.message, reason: err.reason, tone: "warning" };
    }
    return { message: err.message, tone: "error" };
  }
  return { message: "No pudimos conectar con el servidor. Revisa tu conexión.", tone: "error" };
}
