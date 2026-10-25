"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, BarChart3, Eye, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { SurfaceCard as Card, TemporaryMessage, type TemporaryMessageType } from "@/shared/components";
import {
  surveyService,
  type SurveyConfiguration,
  type SurveyQuestionDraft,
  type SurveyQuestionType,
  type SurveyReport,
  type SurveyRestaurantOption,
  type SurveyOwnerOption,
} from "@/shared/services";

const emptyQuestion = (position: number): SurveyQuestionDraft => ({
  prompt: "",
  type: "texto",
  required: false,
  position,
  options: [],
});

const toDraftQuestions = (survey: SurveyConfiguration) =>
  survey.questions.map(({ prompt, type, required, position, options }) => ({
    prompt,
    type,
    required,
    position,
    options,
  }));

export function SurveyManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeQuery = searchParams.toString();
  const [view, setView] = useState<"list" | "edit" | "results">("list");
  const [restaurants, setRestaurants] = useState<SurveyRestaurantOption[]>([]);
  const [owners, setOwners] = useState<SurveyOwnerOption[]>([]);
  const [surveys, setSurveys] = useState<SurveyConfiguration[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyConfiguration | null>(null);
  const [creating, setCreating] = useState(false);
  const [ownerId, setOwnerId] = useState("");
  const [title, setTitle] = useState("Encuesta de satisfacción");
  const [active, setActive] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestionDraft[]>([emptyQuestion(0)]);
  const [assignedRestaurantIds, setAssignedRestaurantIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ type: TemporaryMessageType; message: string } | null>(null);
  const [report, setReport] = useState<SurveyReport | null>(null);
  const [reportRestaurantId, setReportRestaurantId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const closeDialog = useCallback(() => setDialog(null), []);

  useEffect(() => {
    surveyService.getSurveys()
      .then((result) => {
        setRestaurants(result.restaurants);
        setOwners(result.owners);
        setSurveys(result.surveys);
        setOwnerId(result.owners[0]?.id ?? "");
      })
      .catch((reason) => {
        setDialog({
          type: "error",
          message: reason instanceof Error ? reason.message : "No se pudieron cargar las encuestas.",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(routeQuery);
    const requestedView = params.get("surveyView");
    if (!requestedView) {
      setView("list");
      setCreating(false);
      setSelectedSurvey(null);
      return;
    }
    if (requestedView === "create") {
      setView("edit");
      setCreating(true);
      setSelectedSurvey(null);
      setTitle("Encuesta de satisfacción");
      setActive(false);
      setQuestions([emptyQuestion(0)]);
      setAssignedRestaurantIds([]);
      return;
    }
    const requestedSurvey = surveys.find((survey) => survey.id === params.get("surveyId"));
    if (!requestedSurvey || (requestedView !== "edit" && requestedView !== "results")) {
      router.replace("/surveys", { scroll: false });
      return;
    }
    setSelectedSurvey(requestedSurvey);
    setCreating(false);
    setView(requestedView);
    setTitle(requestedSurvey.title);
    setActive(requestedSurvey.isActive);
    setQuestions(toDraftQuestions(requestedSurvey));
    setAssignedRestaurantIds(requestedSurvey.restaurantIds);
    setReportRestaurantId((current) =>
      requestedSurvey.restaurantIds.includes(current)
        ? current
        : requestedSurvey.restaurantIds[0] ?? "",
    );
  }, [loading, routeQuery, router, surveys]);

  useEffect(() => {
    if (view !== "results" || !selectedSurvey || !reportRestaurantId) {
      setReport(null);
      return;
    }
    surveyService.getReport(reportRestaurantId, {
      surveyId: selectedSurvey.id,
      from: from || undefined,
      to: to || undefined,
    })
      .then((result) => {
        setReport(result);
      })
      .catch((reason) => {
        setReport(null);
        setDialog({
          type: "error",
          message: reason instanceof Error ? reason.message : "No se pudieron cargar los resultados.",
        });
      });
  }, [view, selectedSurvey, reportRestaurantId, from, to]);

  const currentOwnerId = selectedSurvey?.ownerId ?? (creating ? ownerId : "");
  const availableRestaurants = useMemo(
    () => restaurants.filter((restaurant) => restaurant.ownerId === currentOwnerId),
    [restaurants, currentOwnerId],
  );
  const ownerName = owners.find((owner) => owner.id === selectedSurvey?.ownerId)?.businessName;
  const selectedReportRestaurant = availableRestaurants.find((restaurant) => restaurant.id === reportRestaurantId)?.businessName;

  function selectSurvey(survey: SurveyConfiguration) {
    const params = new URLSearchParams({
      surveyView: "edit",
      surveyId: survey.id,
      surveyTitle: survey.title,
    });
    router.push(`/surveys?${params.toString()}`, { scroll: false });
    setSelectedSurvey(survey);
    setCreating(false);
    setView("edit");
    setTitle(survey.title);
    setActive(survey.isActive);
    setQuestions(toDraftQuestions(survey));
    setAssignedRestaurantIds(survey.restaurantIds);
    setReportRestaurantId(survey.restaurantIds[0] ?? "");
    setDialog(null);
  }

  function startCreating() {
    router.push("/surveys?surveyView=create", { scroll: false });
    setSelectedSurvey(null);
    setCreating(true);
    setView("edit");
    setTitle("Encuesta de satisfacción");
    setActive(false);
    setQuestions([emptyQuestion(0)]);
    setAssignedRestaurantIds([]);
    setReport(null);
    setDialog(null);
  }

  function updateQuestion(index: number, patch: Partial<SurveyQuestionDraft>) {
    setQuestions((current) => current.map((question, itemIndex) =>
      itemIndex === index ? { ...question, ...patch } : question,
    ));
  }

  function changeType(index: number, type: SurveyQuestionType) {
    updateQuestion(index, {
      type,
      options: type === "opciones" ? ["Opción 1", "Opción 2"] : [],
    });
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    setQuestions((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((question, position) => ({ ...question, position }));
    });
  }

  async function saveSurvey() {
    if (saving) return;
    if (questions.some((question) =>
      !question.prompt.trim() ||
      (question.type === "opciones" && question.options.filter((option) => option.trim()).length < 2),
    )) {
      setDialog({ type: "warning", message: "Completa todas las preguntas y sus opciones." });
      return;
    }
    if (creating && owners.length > 1 && !ownerId) {
      setDialog({ type: "warning", message: "Selecciona la cuenta propietaria de la encuesta." });
      return;
    }

    setSaving(true);
    setDialog(null);
    const body = {
      title,
      isActive: active,
      questions: questions.map((question, position) => ({ ...question, position })),
    };
    try {
      const wasCreating = creating;
      let saved: SurveyConfiguration;
      if (wasCreating) {
        saved = await surveyService.createSurvey({ ...body, ...(ownerId ? { ownerId } : {}) });
        setSurveys((current) => [saved, ...current.filter((survey) => survey.id !== saved.id)]);
        selectSurvey(saved);
        if (assignedRestaurantIds.length) {
          try {
            saved = await surveyService.assignRestaurants(saved.id, assignedRestaurantIds);
          } catch (reason) {
            setDialog({
              type: "error",
              message: reason instanceof Error
                ? `La encuesta se creó, pero no se pudieron guardar los restaurantes: ${reason.message}`
                : "La encuesta se creó, pero no se pudieron guardar los restaurantes.",
            });
            return;
          }
        }
      } else {
        saved = await surveyService.updateSurvey(selectedSurvey!.id, body);
      }
      setSurveys((current) => [
        saved,
        ...current.filter((survey) => survey.id !== saved.id),
      ]);
      selectSurvey(saved);
      setDialog({
        type: "success",
        message: wasCreating
          ? "Encuesta creada correctamente."
          : "Encuesta actualizada correctamente. Las respuestas anteriores conservan su configuración original.",
      });
    } catch (reason) {
      setDialog({
        type: "error",
        message: reason instanceof Error ? reason.message : "No se pudo guardar la encuesta.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveAssignments() {
    if (!selectedSurvey || saving) return;
    setSaving(true);
    setDialog(null);
    try {
      const updated = await surveyService.assignRestaurants(selectedSurvey.id, assignedRestaurantIds);
      setSurveys((current) => current.map((survey) => survey.id === updated.id ? updated : survey));
      setSelectedSurvey(updated);
      setAssignedRestaurantIds(updated.restaurantIds);
      setReportRestaurantId(updated.restaurantIds[0] ?? "");
      setDialog({ type: "success", message: "Asignación de restaurantes actualizada." });
    } catch (reason) {
      setDialog({
        type: "error",
        message: reason instanceof Error ? reason.message : "No se pudo actualizar la asignación.",
      });
    } finally {
      setSaving(false);
    }
  }

  function showResults(survey: SurveyConfiguration) {
    const params = new URLSearchParams({
      surveyView: "results",
      surveyId: survey.id,
      surveyTitle: survey.title,
    });
    router.push(`/surveys?${params.toString()}`, { scroll: false });
    setSelectedSurvey(survey);
    setCreating(false);
    setView("results");
    setReportRestaurantId(survey.restaurantIds[0] ?? "");
    setReport(null);
    setFrom("");
    setTo("");
    setDialog(null);
  }

  function returnToList() {
    router.push("/surveys", { scroll: false });
    setView("list");
    setCreating(false);
    setDialog(null);
  }

  if (loading) return <div className="p-6 text-sm text-gray-500">Cargando encuestas...</div>;

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {view === "list" ? "Encuestas de satisfacción" : view === "edit" ? (creating ? "Crear encuesta" : "Editar encuesta") : "Resultados de encuesta"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {view === "list" ? "Administra las encuestas y consulta sus resultados." : selectedSurvey?.title}
          </p>
        </div>
        {view === "list" && (
          <button type="button" onClick={startCreating} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white">
            <Plus size={16} /> Nueva encuesta
          </button>
        )}
        {view !== "list" && (
          <button type="button" onClick={returnToList} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Volver a encuestas
          </button>
        )}
      </div>
      {dialog && (
        <TemporaryMessage
          type={dialog.type}
          message={dialog.message}
          onClose={closeDialog}
        />
      )}

      {view === "list" && (
        <div className="space-y-3">
          {!surveys.length ? (
            <Card className="p-8 text-center">
              <p className="font-medium text-gray-800">Todavía no hay encuestas creadas.</p>
              <p className="mt-1 text-sm text-gray-500">Crea una encuesta para configurar sus preguntas y asignarla después.</p>
            </Card>
          ) : surveys.map((survey) => {
            const assignedRestaurants = restaurants.filter((restaurant) => survey.restaurantIds.includes(restaurant.id));
            return (
              <Card key={survey.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{survey.title}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${survey.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {survey.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{survey.questions.length} preguntas</p>
                  <p className="mt-2 text-sm text-gray-600">
                    {assignedRestaurants.length
                      ? assignedRestaurants.map((restaurant) => restaurant.businessName).join(" · ")
                      : "Sin restaurantes asignados"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => selectSurvey(survey)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Pencil size={15} /> Editar
                  </button>
                  <button type="button" onClick={() => showResults(survey)} className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-primary hover:bg-orange-100">
                    <BarChart3 size={16} /> Ver resultados
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {view === "edit" && (creating || selectedSurvey) && (
        <>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <Card className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold text-gray-900">{creating ? "Crear encuesta" : "Editar encuesta"}</h2>
                <p className="text-xs text-gray-500">La configuración nueva no modifica las respuestas ya registradas.</p>
              </div>
              {creating && owners.length > 1 && (
                <label className="block text-sm font-medium text-gray-700">
                  Cuenta propietaria
                  <select
                    value={ownerId}
                    onChange={(event) => {
                      const nextOwnerId = event.target.value;
                      setOwnerId(nextOwnerId);
                      setAssignedRestaurantIds((current) => current.filter((id) =>
                        restaurants.some((restaurant) => restaurant.id === id && restaurant.ownerId === nextOwnerId),
                      ));
                    }}
                    className="mt-1 block w-full rounded-lg border border-gray-200 bg-white p-2"
                  >
                    <option value="">Selecciona una cuenta</option>
                    {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.businessName}</option>)}
                  </select>
                </label>
              )}
              <label className="block text-sm font-medium text-gray-700">
                Título
                <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} className="mt-1 w-full rounded-xl border border-gray-200 p-3" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Encuesta activa
              </label>

              {(selectedSurvey || creating) && (
                <section className="rounded-xl border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-gray-800">Restaurantes asignados</h3>
                  <p className="mb-3 mt-1 text-xs text-gray-500">
                    Puedes asignar esta encuesta a ninguno, uno o varios restaurantes{creating ? " al crearla" : " de su propietario"}.
                  </p>
                  {!availableRestaurants.length ? (
                    <p className="text-sm text-gray-500">No hay restaurantes disponibles para esta cuenta.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableRestaurants.map((restaurant) => (
                        <label key={restaurant.id} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm">
                          <input
                            type="checkbox"
                            checked={assignedRestaurantIds.includes(restaurant.id)}
                            onChange={(event) => setAssignedRestaurantIds((current) =>
                              event.target.checked
                                ? [...current, restaurant.id]
                                : current.filter((id) => id !== restaurant.id),
                            )}
                          />
                          {restaurant.businessName}
                        </label>
                      ))}
                    </div>
                  )}
                  {!creating && (
                    <button type="button" disabled={saving} onClick={() => void saveAssignments()} className="mt-3 rounded-xl border border-orange-300 px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50">
                      Guardar asignación
                    </button>
                  )}
                </section>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Preguntas</h3>
                    <p className="text-xs text-gray-500">Define los tipos de respuesta y las preguntas obligatorias.</p>
                  </div>
                  <button type="button" onClick={() => setQuestions((current) => [...current, emptyQuestion(current.length)])} className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-primary">
                    <Plus size={14} /> Añadir
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {questions.map((question, index) => (
                    <div key={index} className="rounded-xl border border-gray-100 p-3">
                      <div className="flex gap-2">
                        <span className="pt-3 text-xs font-bold text-gray-400">{index + 1}</span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <input value={question.prompt} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} placeholder="Escribe la pregunta" maxLength={500} className="w-full rounded-lg border border-gray-200 p-2.5 text-sm" />
                          <div className="flex flex-wrap gap-2">
                            <select value={question.type} onChange={(event) => changeType(index, event.target.value as SurveyQuestionType)} className="rounded-lg border border-gray-200 p-2 text-sm">
                              <option value="calificacion">Calificación (1 a 5)</option>
                              <option value="opciones">Selección de opciones</option>
                              <option value="texto">Texto libre</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs text-gray-600">
                              <input type="checkbox" checked={question.required} onChange={(event) => updateQuestion(index, { required: event.target.checked })} /> Obligatoria
                            </label>
                          </div>
                          {question.type === "opciones" && (
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex gap-2">
                                  <input value={option} onChange={(event) => updateQuestion(index, { options: question.options.map((item, current) => current === optionIndex ? event.target.value : item) })} className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder={`Opción ${optionIndex + 1}`} />
                                  <button type="button" onClick={() => updateQuestion(index, { options: question.options.filter((_, current) => current !== optionIndex) })} className="rounded-lg bg-red-50 px-2 text-red-600"><Trash2 size={14} /></button>
                                </div>
                              ))}
                              <button type="button" onClick={() => updateQuestion(index, { options: [...question.options, `Opción ${question.options.length + 1}`] })} className="text-xs font-semibold text-primary">+ Añadir opción</button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button type="button" disabled={index === 0} onClick={() => moveQuestion(index, -1)} className="rounded-lg bg-gray-100 p-1 text-gray-600 disabled:opacity-30"><ArrowUp size={14} /></button>
                          <button type="button" disabled={index === questions.length - 1} onClick={() => moveQuestion(index, 1)} className="rounded-lg bg-gray-100 p-1 text-gray-600 disabled:opacity-30"><ArrowDown size={14} /></button>
                          <button type="button" disabled={questions.length === 1} onClick={() => setQuestions((current) => current.filter((_, currentIndex) => currentIndex !== index))} className="rounded-lg bg-red-50 p-1 text-red-600 disabled:opacity-30"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" disabled={saving} onClick={() => void saveSurvey()} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                <Save size={16} />{saving ? "Guardando..." : creating ? "Crear encuesta" : "Guardar configuración"}
              </button>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2"><Eye size={18} className="text-primary" /><h2 className="font-semibold text-gray-900">Vista previa</h2></div>
              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">{title || "Encuesta de satisfacción"}</p>
                {questions.map((question, index) => (
                  <div key={index} className="mt-4">
                    <p className="text-sm font-medium text-gray-800">{index + 1}. {question.prompt || "Pregunta sin texto"}{question.required && <span className="text-red-500"> *</span>}</p>
                    <p className="mt-1 text-xs text-gray-500">{question.type === "calificacion" ? "☆ ☆ ☆ ☆ ☆" : question.type === "opciones" ? question.options.join(" · ") : "Respuesta de texto"}</p>
                  </div>
                ))}
              </div>
              {ownerName && <p className="mt-3 text-xs text-gray-500">Cuenta propietaria: {ownerName}</p>}
            </Card>
          </div>

        </>
      )}

      {view === "results" && selectedSurvey && (
        <>
          {selectedSurvey.restaurantIds.length > 0 ? (
            <Card className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><BarChart3 size={18} className="text-primary" /><h2 className="font-semibold text-gray-900">Resultados</h2></div>
                  <p className="mt-1 text-xs text-gray-500">Respuestas históricas de {selectedReportRestaurant ?? "los restaurantes asignados"}.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSurvey.restaurantIds.length > 1 && (
                    <select value={reportRestaurantId} onChange={(event) => setReportRestaurantId(event.target.value)} className="rounded-lg border border-gray-200 bg-white p-2 text-sm">
                      {availableRestaurants.filter((restaurant) => selectedSurvey.restaurantIds.includes(restaurant.id)).map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.businessName}</option>)}
                    </select>
                  )}
                  <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded-lg border border-gray-200 p-2 text-sm" />
                  <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded-lg border border-gray-200 p-2 text-sm" />
                </div>
              </div>
              {!report || report.totalResponses === 0 ? (
                <p className="mt-5 rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">Todavía no hay respuestas para este período.</p>
              ) : (
                <>
                  <p className="mt-4 text-sm font-semibold text-gray-800">{report.totalResponses} respuesta(s)</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {report.questions.map((question) => (
                      <div key={question.id} className="rounded-xl border border-gray-100 p-3">
                        <p className="font-semibold text-gray-900">{question.prompt}</p>
                        {question.average !== null && <p className="mt-1 text-sm text-primary">Promedio: {question.average.toFixed(2)} / 5</p>}
                        {question.type === "texto"
                          ? <div className="mt-2 space-y-1">{question.answers.map((answer, index) => <p key={`${question.id}-${index}`} className="rounded-lg bg-gray-50 p-2 text-sm text-gray-700">{answer}</p>)}</div>
                          : <div className="mt-2 space-y-1">{Object.entries(question.distribution).map(([value, count]) => <p key={value} className="flex justify-between text-sm text-gray-700"><span>{value}</span><strong>{count}</strong></p>)}</div>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-800">Respuestas recibidas</h3>
                    <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100">
                      {report.responses.map((response) => (
                        <div key={response.id} className="flex flex-wrap justify-between gap-2 px-3 py-2.5 text-sm">
                          <span className="text-gray-700">Pedido <span className="font-medium">{response.orderId}</span></span>
                          <span className="text-gray-500">{new Date(response.submittedAt).toLocaleString("es-CO")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <BarChart3 className="mx-auto text-gray-400" />
              <p className="mt-3 font-medium text-gray-800">Esta encuesta aún no está asignada a restaurantes.</p>
              <p className="mt-1 text-sm text-gray-500">Asígnala para comenzar a recibir respuestas.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
