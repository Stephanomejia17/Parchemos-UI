"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  IdCard,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import {
  CheckboxField,
  ChoiceCardGroup,
  ComboBoxField,
  FormAlert,
  FormSection,
  FormStepper,
  PasswordField,
  PrimaryButton,
  RequirementList,
  TextField,
  type ChoiceCardOption,
  type FormStep,
} from "@parchemos/shared/components";
import { COLOMBIA_CITY_OPTIONS } from "@parchemos/shared/constants";
import { ApiError, evaluatePassword, useAuth } from "@parchemos/shared/auth";

type SelectableRole = "comensal" | "restaurante";

const ROLES: ChoiceCardOption<SelectableRole>[] = [
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

/** El registro se recorre por secciones; cada una valida lo suyo antes de avanzar. */
const STEPS: FormStep[] = [
  { id: "tipo", label: "Tipo de cuenta" },
  { id: "cuenta", label: "Cuenta" },
  { id: "perfil", label: "Perfil" },
];

/** Mismo formato que exige el backend para el telefono. */
const PHONE_PATTERN = /^(?:\+57\s?)?(?:3\d{2}|\d{2})\s?\d{3}\s?\d{2}\s?\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(0);
  // Los errores de un paso solo se pintan cuando ya se intento avanzar desde el.
  const [attempted, setAttempted] = useState<boolean[]>([false, false, false]);

  const [role, setRole] = useState<SelectableRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const passwordState = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirm.length > 0 && password === confirm;

  // GU-01 Esc. 4, 5 y 6: reglas de cada campo, agrupadas por seccion.
  const errors = {
    role: role === null ? "Selecciona un tipo de cuenta para continuar." : null,
    email: !email.trim()
      ? "Ingresa tu correo electrónico."
      : !EMAIL_PATTERN.test(email.trim())
        ? "Ingresa un correo electrónico válido."
        : null,
    password: passwordState.valid ? null : "La contraseña todavía no cumple los requisitos.",
    confirm: !confirm ? "Repite tu contraseña." : passwordsMatch ? null : "Las contraseñas no coinciden.",
    fullName: fullName.trim().length < 2 ? "Ingresa un nombre de al menos 2 caracteres." : null,
    phone: !phone.trim()
      ? "Ingresa tu teléfono."
      : !PHONE_PATTERN.test(phone.trim())
        ? "Ingresa un teléfono colombiano válido, por ejemplo 3001234567."
        : null,
    city: city.trim().length < 2 ? "Elige o escribe tu ciudad." : null,
    consent:
      acceptedTerms && acceptedPrivacy
        ? null
        : "Debes aceptar los términos y la política de datos para crear tu cuenta.",
  };

  const stepErrors: (string | null)[][] = [
    [errors.role],
    [errors.email, errors.password, errors.confirm],
    [errors.fullName, errors.phone, errors.city, errors.consent],
  ];
  const stepIsValid = stepErrors.map(list => list.every(error => error === null));
  const isLastStep = step === STEPS.length - 1;

  /** Solo se muestra el error de un campo si ya se intento pasar de su seccion. */
  const shown = (index: number, error: string | null) => (attempted[index] ? error : null);

  const markAttempted = (index: number) =>
    setAttempted(previous => previous.map((value, i) => (i === index ? true : value)));

  const goBack = () => {
    setServerErrors([]);
    setStep(current => Math.max(0, current - 1));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    markAttempted(step);
    setServerErrors([]);

    if (!stepIsValid[step]) return;

    // Mientras queden secciones, "Continuar" solo avanza el formulario.
    if (!isLastStep) {
      setStep(current => current + 1);
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
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
      <div className="w-full max-w-xl flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-heading">Crea tu cuenta</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Son tres pasos cortos: eliges cómo usar Parchemos, creas tu acceso y completas tu perfil.
          </p>
        </header>

        <FormStepper steps={STEPS} current={step} onStepSelect={index => { setServerErrors([]); setStep(index); }} className="px-1" />

        <FormAlert type="error" messages={serverErrors} />

        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          {step === 0 && (
            <FormSection
              title="Tipo de cuenta"
              description="Con esto ajustamos lo que verás dentro de la app."
              icon={IdCard}
            >
              <ChoiceCardGroup
                legend="Quiero registrarme como"
                options={ROLES}
                value={role}
                onChange={setRole}
                error={shown(0, errors.role)}
              />
            </FormSection>
          )}

          {step === 1 && (
            <FormSection
              title="Cuenta"
              description="Los datos con los que iniciarás sesión."
              icon={Lock}
            >
              <TextField
                label="Correo electrónico"
                type="email"
                inputMode="email"
                autoComplete="email"
                icon={Mail}
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onValueChange={setEmail}
                error={shown(1, errors.email)}
              />

              <div className="flex flex-col gap-2">
                <PasswordField
                  label="Contraseña"
                  autoComplete="new-password"
                  icon={Lock}
                  value={password}
                  onValueChange={setPassword}
                  visible={showPassword}
                  onVisibleChange={setShowPassword}
                  error={shown(1, errors.password)}
                />
                {/* GU-01 Esc. 4: se muestran los requisitos que faltan. */}
                <RequirementList items={passwordState.checks} />
              </div>

              <PasswordField
                label="Confirma tu contraseña"
                autoComplete="new-password"
                icon={Lock}
                value={confirm}
                onValueChange={setConfirm}
                visible={showPassword}
                onVisibleChange={setShowPassword}
                error={confirm.length > 0 || attempted[1] ? errors.confirm : null}
              />
            </FormSection>
          )}

          {step === 2 && (
            <FormSection
              title="Perfil"
              description={
                role === "restaurante"
                  ? "Cómo verán tu negocio los comensales."
                  : "Cómo te verán los restaurantes en Parchemos."
              }
              icon={UserRound}
            >
              <TextField
                label={role === "restaurante" ? "Nombre del restaurante" : "Nombre completo"}
                autoComplete="name"
                icon={User}
                placeholder={role === "restaurante" ? "La Paloma Gastrobar" : "Tu nombre"}
                value={fullName}
                onValueChange={setFullName}
                error={shown(2, errors.fullName)}
              />

              <TextField
                label="Teléfono"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                icon={Phone}
                placeholder="3001234567"
                value={phone}
                onValueChange={setPhone}
                error={shown(2, errors.phone)}
              />

              {/* Parchemos opera en Colombia: la ciudad se elige de la lista, y
                  quien no aparezca puede escribirla igual. */}
              <ComboBoxField
                label="Ciudad"
                icon={MapPin}
                placeholder="Busca tu ciudad"
                options={COLOMBIA_CITY_OPTIONS}
                value={city}
                onValueChange={setCity}
                maxLength={120}
                hint="¿No está en la lista? Escríbela y la guardamos igual."
                error={shown(2, errors.city)}
              />

              {/* GU-01 Esc. 6: aceptación explícita, sin marcar por defecto. */}
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2 text-xs font-semibold text-gray-600">Autorizaciones</legend>

                <CheckboxField
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                  invalid={attempted[2] && !acceptedTerms}
                >
                  Acepto los <span className="font-semibold text-primary">Términos y condiciones</span> de Parchemos.
                </CheckboxField>

                <CheckboxField
                  checked={acceptedPrivacy}
                  onCheckedChange={setAcceptedPrivacy}
                  invalid={attempted[2] && !acceptedPrivacy}
                >
                  Acepto la <span className="font-semibold text-primary">Política de tratamiento de datos</span>.
                </CheckboxField>

                {shown(2, errors.consent) && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.consent}
                  </p>
                )}
              </fieldset>
            </FormSection>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-60 sm:w-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </button>
            )}

            <PrimaryButton type="submit" size="lg" className="w-full flex-1" disabled={submitting}>
              <span className="flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando tu cuenta...
                  </>
                ) : isLastStep ? (
                  "Crear cuenta"
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </span>
            </PrimaryButton>
          </div>
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
