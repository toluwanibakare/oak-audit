import apiClient from "./client";

export interface CustomQuestion {
  id: string;
  org_id: string;
  standard: string;
  clause: string;
  text: string;
  kind: string;
  process_key: string;
  reference: string | null;
  evidence: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface IsoClause {
  id: string;
  standard: string;
  clause: string;
  title: string;
  requirement: string;
}

export const questionsApi = {
  list: (orgId: string, params?: { process_key?: string; standard?: string; active?: boolean }) =>
    apiClient.get<CustomQuestion[]>(`/organizations/${orgId}/questions`, { params }).then((r) => r.data),

  create: (orgId: string, data: Partial<CustomQuestion>) =>
    apiClient.post<CustomQuestion>(`/organizations/${orgId}/questions`, data).then((r) => r.data),

  update: (id: string, data: Partial<CustomQuestion>) =>
    apiClient.put<CustomQuestion>(`/questions/${id}`, data).then((r) => r.data),

  remove: (id: string, soft?: boolean) =>
    apiClient.delete(`/questions/${id}`, { params: { soft: soft ?? true } }),

  getIsoClauses: () => apiClient.get<IsoClause[]>("/iso-clauses").then((r) => r.data),

  getIsoClausesByStandard: (standard: string) =>
    apiClient.get<IsoClause[]>(`/iso-clauses/${standard}`).then((r) => r.data),
};
