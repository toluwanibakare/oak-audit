import apiClient from "./client";

export interface Auditor {
  id: string;
  org_id: string;
  name: string;
  email: string | null;
  user_id: string | null;
  role: string | null;
  certifications: string | null;
}

export const auditorsApi = {
  list: (orgId: string) =>
    apiClient.get<Auditor[]>(`/organizations/${orgId}/auditors`).then((r) => r.data),

  create: (orgId: string, data: Partial<Auditor>) =>
    apiClient.post<Auditor>(`/organizations/${orgId}/auditors`, data).then((r) => r.data),

  update: (orgId: string, id: string, data: Partial<Auditor>) =>
    apiClient.put<Auditor>(`/organizations/${orgId}/auditors/${id}`, data).then((r) => r.data),

  remove: (orgId: string, auditorId: string) =>
    apiClient.delete(`/organizations/${orgId}/auditors/${auditorId}`).then((r) => r.data),
};
