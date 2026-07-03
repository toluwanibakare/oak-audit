import apiClient from "./client";

export interface AuditAnswer {
  id: string;
  audit_id: string;
  process_id: string;
  clause: string;
  kind: string;
  q_ref: string | null;
  question_text: string | null;
  status: string;
  severity: string | null;
  note: string | null;
  auditee_name: string | null;
  auditor_name: string | null;
}

export const answersApi = {
  list: (auditId: string) =>
    apiClient.get<AuditAnswer[]>(`/audits/${auditId}/answers`).then((r) => r.data),

  upsert: (auditId: string, data: Partial<AuditAnswer>) =>
    apiClient.post<AuditAnswer>(`/audits/${auditId}/answers`, data).then((r) => r.data),

  update: (auditId: string, answerId: string, data: Partial<AuditAnswer>) =>
    apiClient.put<AuditAnswer>(`/audits/${auditId}/answers/${answerId}`, data).then((r) => r.data),
};
