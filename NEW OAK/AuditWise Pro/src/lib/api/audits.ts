import apiClient from "./client";

export interface AuditRecord {
  id: string;
  org_id: string;
  title: string | null;
  standard: string | null;
  status: string;
  scope: string | null;
  criteria: string | null;
  object: string | null;
  conclusion: string | null;
  start_date: string | null;
  end_date: string | null;
  lead_auditor_id: string | null;
  wizard_state: Record<string, any> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const auditsApi = {
  list: (orgId: string, auditorId?: string) =>
    apiClient.get<AuditRecord[]>(`/organizations/${orgId}/audits`, { params: auditorId ? { auditor_id: auditorId } : {} }).then((r) => r.data),

  get: (orgId: string, id: string) =>
    apiClient.get<AuditRecord>(`/organizations/${orgId}/audits/${id}`).then((r) => r.data),

  create: (orgId: string, data: Record<string, any>) =>
    apiClient.post<AuditRecord>(`/organizations/${orgId}/audits`, data).then((r) => r.data),

  update: (orgId: string, id: string, data: Record<string, any>) =>
    apiClient.put<AuditRecord>(`/organizations/${orgId}/audits/${id}`, data).then((r) => r.data),
};
