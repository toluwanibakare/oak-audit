import apiClient from "./client";

export interface Audit {
  id: string;
  org_id: string;
  title: string;
  standard: string;
  status: string;
  scope: string | null;
  criteria: string | null;
  object: string | null;
  conclusion: string | null;
  start_date: string | null;
  end_date: string | null;
  started_at: string | null;
  closed_at: string | null;
  owner: string | null;
  auditee_name: string | null;
  auditee_email: string | null;
  created_by: string;
  lead_auditor_id: string | null;
  created_at: string;
  updated_at: string;
}

export const auditsApi = {
  list: (orgId: string) =>
    apiClient.get<Audit[]>(`/organizations/${orgId}/audits`).then((r) => r.data),

  get: (orgId: string, auditId: string) =>
    apiClient.get<Audit>(`/organizations/${orgId}/audits/${auditId}`).then((r) => r.data),

  create: (orgId: string, data: Partial<Audit> & { process_ids?: string[] }) =>
    apiClient.post<Audit>(`/organizations/${orgId}/audits`, data).then((r) => r.data),

  update: (orgId: string, auditId: string, data: Partial<Audit>) =>
    apiClient.put<Audit>(`/organizations/${orgId}/audits/${auditId}`, data).then((r) => r.data),
};
