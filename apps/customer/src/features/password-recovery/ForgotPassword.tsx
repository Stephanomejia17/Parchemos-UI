"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { PrimaryButton } from "@parchemos/shared/components";
import { ApiError, requestPasswordReset } from "@parchemos/shared/auth";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !email.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-full bg-background flex items-center justify-center px-5 py-8">
      <section className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm p-7 md:p-9 flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center"><Mail className="w-6 h-6" /></div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-heading">Recupera tu contraseña</h1>
          <p className="text-sm text-muted-foreground">Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
        </header>
        {sent ? (
          <div role="status" className="flex gap-2.5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /><p>Si el correo está registrado, recibirás un enlace de recuperación.</p></div>
        ) : (
          <>
            {error && <div role="alert" className="flex gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><p>{error}</p></div>}
            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Correo electrónico</span><input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="tucorreo@ejemplo.com" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors" /></label>
              <PrimaryButton type="submit" size="lg" className="w-full" disabled={submitting || !email.trim()}>{submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Enviando...</span> : "Enviar enlace"}</PrimaryButton>
            </form>
          </>
        )}
        <Link href="/login" className="text-center text-sm text-primary font-semibold hover:underline">Volver al inicio de sesión</Link>
      </section>
    </main>
  );
}
