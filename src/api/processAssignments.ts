import apiClient from "./client";

export interface ProcessAssignment {
  id: string;
  org_id: string;
  process_id: string;
  auditor_id: string;
}

export const processAssignmentsApi = {
  list: (orgId: string) =>
    apiClient.get<ProcessAssignment[]>(`/organizations/${orgId}/process-assignments`).then((r) => r.data),
};
