import apiClient from "./client";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export interface CreateTeamMemberPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
}

export interface UpdateTeamMemberPayload {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
}

export const teamMembersApi = {
  list: (orgId: string) =>
    apiClient.get<TeamMember[]>(`/organizations/${orgId}/team-members`).then((r) => r.data),

  create: (orgId: string, payload: CreateTeamMemberPayload) =>
    apiClient.post<TeamMember>(`/organizations/${orgId}/team-members`, payload).then((r) => r.data),

  update: (orgId: string, userId: string, payload: UpdateTeamMemberPayload) =>
    apiClient.put<TeamMember>(`/organizations/${orgId}/team-members/${userId}`, payload).then((r) => r.data),

  delete: (orgId: string, userId: string) =>
    apiClient.delete(`/organizations/${orgId}/team-members/${userId}`).then((r) => r.data),
};
