import apiClient from "./client";

export interface OrgProcess {
  id: string;
  org_id: string;
  name: string;
  key: string;
  scope: string | null;
  is_custom: boolean;
  process_owner: string | null;
  process_owner_email: string | null;
}

export const processesApi = {
  list: (orgId: string) =>
    apiClient.get<OrgProcess[]>(`/organizations/${orgId}/processes`).then((r) => r.data),

  create: (orgId: string, data: Partial<OrgProcess>) =>
    apiClient.post<OrgProcess>(`/organizations/${orgId}/processes`, data).then((r) => r.data),

  remove: (orgId: string, processId: string) =>
    apiClient.delete(`/organizations/${orgId}/processes/${processId}`).then((r) => r.data),
};
