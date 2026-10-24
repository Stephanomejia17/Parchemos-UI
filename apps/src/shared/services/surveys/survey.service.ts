import { apiFetch } from "../http/api-client";

export type SurveyQuestionType = "calificacion" | "opciones" | "texto";

export interface SurveyQuestion {
  id: string;
  prompt: string;
  type: SurveyQuestionType;
  required: boolean;
  position: number;
  options: string[];
}

export interface SurveyConfiguration {
  id: string;
  ownerId: string;
  title: string;
  isActive: boolean;
  version: number;
  restaurantIds: string[];
  questions: SurveyQuestion[];
}

export interface SurveyRestaurantOption {
  id: string;
  ownerId: string;
  businessName: string;
}

export interface SurveyOwnerOption {
  id: string;
  businessName: string;
}

export interface SurveyOrderInvitation {
  surveys: Array<
    Pick<SurveyConfiguration, "id" | "title" | "version"> & {
      alreadyResponded: boolean;
      questions: SurveyQuestion[];
    }
  >;
}

export interface SurveyReportQuestion {
  id: string;
  prompt: string;
  type: SurveyQuestionType;
  answers: string[];
  average: number | null;
  distribution: Record<string, number>;
}

export interface SurveyReport {
  totalResponses: number;
  questions: SurveyReportQuestion[];
  responses: Array<{ id: string; orderId: string; surveyVersion: number; submittedAt: string }>;
}

export type SurveyQuestionDraft = Omit<SurveyQuestion, "id">;
export type SurveyConfigurationDraft = {
  title: string;
  isActive: boolean;
  questions: SurveyQuestionDraft[];
};

export const surveyService = {
  getSurveys: () =>
    apiFetch<{
      restaurants: SurveyRestaurantOption[];
      owners: SurveyOwnerOption[];
      surveys: SurveyConfiguration[];
    }>("/encuestas"),
  createSurvey: (body: SurveyConfigurationDraft & { ownerId?: string }) =>
    apiFetch<SurveyConfiguration>("/encuestas", { method: "POST", body }),
  updateSurvey: (surveyId: string, body: SurveyConfigurationDraft) =>
    apiFetch<SurveyConfiguration>(`/encuestas/${surveyId}`, { method: "PUT", body }),
  assignRestaurants: (surveyId: string, restaurantIds: string[]) =>
    apiFetch<SurveyConfiguration>(`/encuestas/${surveyId}/restaurantes`, {
      method: "PUT",
      body: { restaurantIds },
    }),
  getReport: (
    restaurantId: string,
    params?: { surveyId?: string; from?: string; to?: string; orderId?: string },
  ) => {
    const query = new URLSearchParams();
    if (params?.surveyId) query.set("surveyId", params.surveyId);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    if (params?.orderId) query.set("orderId", params.orderId);
    const suffix = query.toString() ? `?${query}` : "";
    return apiFetch<SurveyReport>(`/encuestas/restaurante/${restaurantId}/reportes${suffix}`);
  },
  getOrderInvitation: (orderId: string) => apiFetch<SurveyOrderInvitation>(`/pedidos/${orderId}/encuesta`),
  submitOrderResponse: (orderId: string, surveyId: string, answers: Array<{ questionId: string; value: string }>) =>
    apiFetch<{ id: string; submittedAt: string; surveyVersion: number }>(`/pedidos/${orderId}/encuesta/respuestas`, { method: "POST", body: { surveyId, answers } }),
};
