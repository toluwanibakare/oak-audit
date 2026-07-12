import apiClient from "./client";

export interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export const invitationsApi = {
  list: (orgId: string) =>
    apiClient.get<Invitation[]>(`/organizations/${orgId}/invitations`).then((r) => r.data),

  send: (orgId: string, payload: { email: string; role?: string }) =>
    apiClient.post<Invitation>(`/organizations/${orgId}/invitations`, payload).then((r) => r.data),

  cancel: (orgId: string, id: string) =>
    apiClient.delete(`/organizations/${orgId}/invitations/${id}`).then((r) => r.data),

  accept: (token: string) =>
    apiClient.post<{ message: string; organization_id: string }>("/invitations/accept", { token }).then((r) => r.data),
};
