"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { ApiError, useAuth } from "@parchemos/shared/auth";

const ACCENT = "#FF6B35";

/** Inicio de sesión de Parchemos Console. Solo entra el rol `administrador`. */
export function ConsoleLogin() {
  const router = useRouter();
  const { login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });

      // La consola es solo para administradores: una cuenta válida de otro rol
      // se autentica correctamente, pero aquí no entra.
      if (user.role !== "administrador") {
        await logout();
        setError("Esta consola es exclusiva para administradores de Parchemos.");
        setPassword("");
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos conectar con el servidor.");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-3xl shadow-sm p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <span className="text-white font-bold text-[14px]">P</span>
            </div>
            <div>
              <div className="text-[15px] font-bold text-gray-900 leading-none">Parchemos</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Console</div>
            </div>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Ingresa con tu cuenta de administrador.</p>
        </div>

        {error && (
          <div role="alert" className="flex gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-gray-600">Correo</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@parchemos.co"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:bg-white transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-gray-600">Contraseña</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 pr-10 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: ACCENT }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Verificando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck size={12} />
          Los accesos quedan registrados para auditoría.
        </p>
      </div>
    </div>
  );
}
