"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@parchemos/shared/components";
import { RemoteImage } from "@/components/media/RemoteImage";

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const onLogin = () => router.push("/home");

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      {/* Hero image — full bg on mobile, left panel on desktop */}
      <div className="relative h-52 md:h-auto md:flex-1">
        <RemoteImage
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=900&fit=crop&auto=format"
          alt="food"
          className="w-full h-full"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-white md:bg-gradient-to-r md:from-transparent md:to-black/40" />
        {/* Logo overlay on desktop */}
        <div className="hidden md:flex absolute inset-0 items-end p-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍽️</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white font-heading">Parchemos</h1>
            </div>
            <p className="text-white/80 text-lg max-w-xs">La plataforma gastronómica que conecta personas con experiencias únicas.</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="bg-white px-6 pt-8 pb-12 flex flex-col gap-5 md:w-96 md:overflow-y-auto md:justify-center md:px-10 md:py-12 lg:w-[440px]">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-2 md:hidden">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-heading">Parchemos</h2>
        </div>
        {/* Desktop heading */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1 font-heading">Bienvenido de vuelta</h2>
        </div>
        <p className="text-muted-foreground text-sm -mt-2 md:mt-0">La experiencia gastronómica que mereces</p>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </button>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-black rounded-2xl py-3.5 text-sm font-semibold text-white hover:bg-gray-900 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Continuar con Apple
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-muted-foreground">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
          />
          <PrimaryButton onClick={onLogin} size="lg" className="w-full">
            Continuar
          </PrimaryButton>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Al continuar aceptas los <span className="text-primary font-semibold">Términos de servicio</span> y{" "}
          <span className="text-primary font-semibold">Política de privacidad</span>
        </p>
      </div>
    </div>
  );
}
