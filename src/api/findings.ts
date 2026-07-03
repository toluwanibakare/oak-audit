import apiClient from "./client";

export interface Finding {
  id: string;
  org_id: string;
  audit_id: string;
  type: string;
  clause: string | null;
  description: string;
  capa: string | null;
  owner: string | null;
  status: string;
  due_date: string | null;
  root_cause: string | null;
  auditor_comment: string | null;
  created_at: string;
  updated_at: string;
  audit?: { title: string; standard: string; auditee_name?: string; auditee_email?: string };
}

export const findingsApi = {
  list: (orgId: string, auditId?: string) => {
    const params = auditId ? { audit_id: auditId } : {};
    return apiClient.get<Finding[]>(`/organizations/${orgId}/findings`, { params }).then((r) => r.data);
  },

  get: (id: string) =>
    apiClient.get<Finding>(`/findings/${id}`).then((r) => r.data),

  create: (orgId: string, data: Partial<Finding>) =>
    apiClient.post<Finding>(`/organizations/${orgId}/findings`, data).then((r) => r.data),

  update: (id: string, data: Partial<Finding>) =>
    apiClient.put<Finding>(`/findings/${id}`, data).then((r) => r.data),

  submitCar: (id: string, data: { correction: string; root_cause_text: string; capa: string; evidence?: string[] }) =>
    apiClient.post<Finding>(`/findings/${id}/car`, data).then((r) => r.data),

  uploadEvidence: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ path: string; url: string; name: string; size: number; mime: string }>(
      `/findings/${id}/evidence`, formData, { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data);
  },

  remove: (id: string) => apiClient.delete(`/findings/${id}`).then((r) => r.data),
};
