"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, Loader2, X } from "lucide-react";
import { PrimaryButton } from "@parchemos/shared/components";
import { ApiError, evaluatePassword, resetPassword } from "@parchemos/shared/auth";

export function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "El enlace de recuperación no es válido.");
  const passwordState = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirmation.length > 0 && password === confirmation;
  const canSubmit = Boolean(token) && passwordState.valid && passwordsMatch;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setCompleted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-full bg-background flex items-center justify-center px-5 py-8">
      <section className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm p-7 md:p-9 flex flex-col gap-5">
        <header className="flex flex-col gap-2"><h1 className="text-2xl font-extrabold text-gray-900 font-heading">Crea una nueva contraseña</h1><p className="text-sm text-muted-foreground">Usa una contraseña segura para proteger tu cuenta.</p></header>
        {completed ? (
          <div role="status" className="flex gap-2.5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /><p>Tu contraseña fue actualizada. Ya puedes iniciar sesión.</p></div>
        ) : (
          <>
            {error && <div role="alert" className="flex gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><p>{error}</p></div>}
            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <PasswordField label="Nueva contraseña" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword(value => !value)} />
              <ul className="flex flex-col gap-1">{passwordState.checks.map(check => <li key={check.id} className={`flex items-center gap-1.5 text-xs ${check.met ? "text-green-600" : "text-gray-500"}`}>{check.met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}{check.label}</li>)}</ul>
              <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Confirmar contraseña</span><input type={showPassword ? "text" : "password"} autoComplete="new-password" required value={confirmation} onChange={event => setConfirmation(event.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors" />{confirmation.length > 0 && !passwordsMatch && <span className="text-xs text-red-600">Las contraseñas no coinciden.</span>}</label>
              <PrimaryButton type="submit" size="lg" className="w-full" disabled={!canSubmit || submitting}>{submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Guardando...</span> : "Cambiar contraseña"}</PrimaryButton>
            </form>
          </>
        )}
        <Link href="/login" className="text-center text-sm text-primary font-semibold hover:underline">Ir al inicio de sesión</Link>
      </section>
    </main>
  );
}

function PasswordField({ label, value, onChange, visible, onToggle }: { label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">{label}</span><div className="relative"><input type={visible ? "text" : "password"} autoComplete="new-password" required value={value} onChange={event => onChange(event.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm outline-none focus:border-primary transition-colors" /><button type="button" onClick={onToggle} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></label>;
}
