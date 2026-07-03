import apiClient from "./client";

export interface AuditProcess {
  id: string;
  audit_id: string;
  process_id: string;
  auditor_id: string | null;
  process?: { id: string; key: string; name: string };
  auditor?: { id: string; name: string };
}

export const auditProcessesApi = {
  list: (auditId: string) =>
    apiClient.get<AuditProcess[]>(`/audits/${auditId}/processes`).then((r) => r.data),

  create: (auditId: string, data: { process_id: string; auditor_id?: string | null }) =>
    apiClient.post<AuditProcess>(`/audits/${auditId}/processes`, data).then((r) => r.data),

  assignAuditor: (auditId: string, processId: string, auditorId: string | null) =>
    apiClient.put<AuditProcess>(`/audits/${auditId}/processes/${processId}`, { auditor_id: auditorId }).then((r) => r.data),
};
