"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardList, LoaderCircle, Star, X } from "lucide-react";
import {
  surveyService,
  type SurveyOrderInvitation,
  type SurveyQuestion,
} from "@/shared/services";

type OrderSurvey = SurveyOrderInvitation["surveys"][number];
type AnswerMap = Record<string, string>;

export function SurveyPrompt({
  orderId,
  status,
  locationId,
  locationName,
}: {
  orderId: string;
  status: string;
  locationId: string;
  locationName: string;
}) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<SurveyOrderInvitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<OrderSurvey | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "entregado") return;
    let active = true;
    setLoading(true);
    surveyService.getOrderInvitation(orderId)
      .then((value) => {
        if (active) {
          setInvitation(value);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudieron cargar las encuestas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [orderId, status]);

  const pendingSurveys = invitation?.surveys.filter((survey) => !survey.alreadyResponded) ?? [];
  const requiredComplete = selectedSurvey?.questions
    .filter((question) => question.required)
    .every((question) => answers[question.id]?.trim()) ?? false;

  function closeDialog() {
    setDialogOpen(false);
    setSelectedSurvey(null);
    setError("");
  }

  function openSurvey(survey: OrderSurvey) {
    setSelectedSurvey(survey);
    setAnswers({});
    setSent(false);
    setError("");
  }

  async function submitSurvey() {
    if (!selectedSurvey || !requiredComplete || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await surveyService.submitOrderResponse(
        orderId,
        selectedSurvey.id,
        Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      );
      setSent(true);
      setInvitation((current) => current
        ? {
            surveys: current.surveys.map((survey) =>
              survey.id === selectedSurvey.id ? { ...survey, alreadyResponded: true } : survey,
            ),
          }
        : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo enviar la encuesta.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status !== "entregado") return null;

  return (
    <>
      <section aria-label="Calificar o responder encuesta de satisfacción" className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
        <h3 className="font-semibold text-gray-900">Ayúdanos a mejorar y déjanos tu opinión</h3>
        <p className="mt-1 text-sm text-gray-600">Ambas opciones son opcionales.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push(`/restaurant?locationId=${encodeURIComponent(locationId)}&tab=reviews`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-orange-100"
          >
            <Star className="h-4 w-4 text-primary" />
            Calificar
          </button>
          <button
            type="button"
            onClick={() => {
              setDialogOpen(true);
              if (pendingSurveys.length === 1) openSurvey(pendingSurveys[0]);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-semibold text-white transition-colors hover:brightness-95"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
            Encuesta de satisfacción
          </button>
        </div>
        {!loading && pendingSurveys.length === 0 && (
          <p className="mt-2 text-xs text-gray-500">No hay una encuesta activa para este restaurante por ahora.</p>
        )}
        {error && !dialogOpen && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
      </section>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-survey-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Cerrar encuesta"
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            {sent ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h2 id="order-survey-title" className="mt-4 text-xl font-bold text-gray-900">¡Gracias por tu opinión!</h2>
                <p className="mt-2 text-sm text-gray-600">Tu respuesta nos ayuda a mejorar.</p>
                <button type="button" onClick={closeDialog} className="mt-6 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white">Cerrar</button>
              </div>
            ) : selectedSurvey ? (
              <>
                <button type="button" onClick={() => { setSelectedSurvey(null); setError(""); }} className="mb-4 text-sm font-medium text-gray-500 hover:text-gray-900">
                  ← Volver a encuestas
                </button>
                <h2 id="order-survey-title" className="pr-8 text-xl font-bold text-gray-900">{selectedSurvey.title}</h2>
                <p className="mt-1 text-sm text-gray-600">Responde sobre tu experiencia en {locationName}. Tus respuestas son opcionales, excepto las marcadas con *.</p>
                <div className="mt-5 space-y-4">
                  {selectedSurvey.questions.map((question) => (
                    <QuestionInput
                      key={question.id}
                      question={question}
                      value={answers[question.id] ?? ""}
                      onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                    />
                  ))}
                </div>
                {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" disabled={!requiredComplete || submitting} onClick={() => void submitSurvey()} className="rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    {submitting ? "Enviando..." : "Enviar encuesta"}
                  </button>
                  <button type="button" onClick={() => { setSelectedSurvey(null); setError(""); }} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700">Ahora no</button>
                </div>
              </>
            ) : (
              <>
                <h2 id="order-survey-title" className="pr-8 text-xl font-bold text-gray-900">Encuestas disponibles</h2>
                <p className="mt-2 text-sm text-gray-600">Elige una encuesta para compartir tu experiencia. Responder es opcional.</p>
                <div className="mt-5 space-y-2">
                  {pendingSurveys.map((survey) => (
                    <button key={survey.id} type="button" onClick={() => openSurvey(survey)} className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 p-4 text-left transition-colors hover:border-orange-300 hover:bg-orange-50">
                      <ClipboardList className="h-5 w-5 shrink-0 text-primary" />
                      <span className="font-semibold text-gray-900">{survey.title}</span>
                    </button>
                  ))}
                </div>
                {!loading && pendingSurveys.length === 0 && (
                  <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-gray-700">
                    No hay una encuesta de satisfacción activa disponible por ahora.
                  </p>
                )}
                {loading && <p className="mt-4 text-sm text-gray-500">Buscando encuestas disponibles...</p>}
                {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <button type="button" onClick={closeDialog} className="mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Ahora no</button>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-800">
      {question.prompt}{question.required && <span className="text-red-600"> *</span>}
      {question.type === "calificacion" ? (
        <span className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button type="button" key={rating} aria-pressed={value === String(rating)} onClick={() => onChange(String(rating))} className={`rounded-lg px-2 py-1 text-lg ${value === String(rating) ? "bg-primary text-white" : "bg-orange-50 text-primary"}`}>
              {rating}
            </button>
          ))}
        </span>
      ) : question.type === "opciones" ? (
        <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm">
          <option value="">Selecciona una opción</option>
          {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={2000} className="mt-1 min-h-20 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm" placeholder="Escribe tu respuesta" />
      )}
    </label>
  );
}
