import apiClient from "./client";

export interface Organization {
  id: string;
  name: string;
  type: "individual" | "organization";
  industry?: string;
  address?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateOrgPayload {
  name: string;
  type?: string;
  industry?: string;
  address?: string;
}

export const orgsApi = {
  list: () =>
    apiClient.get<Organization[]>("/organizations").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Organization>(`/organizations/${id}`).then((r) => r.data),

  create: (payload: CreateOrgPayload) =>
    apiClient.post<Organization>("/organizations", payload).then((r) => r.data),

  update: (id: string, payload: Partial<Organization>) =>
    apiClient.put<Organization>(`/organizations/${id}`, payload).then((r) => r.data),

  uploadLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return apiClient.post<{ logo_url: string }>(`/organizations/${id}/logo`, form).then((r) => r.data);
  },

  getMembers: (id: string) =>
    apiClient.get<Member[]>(`/organizations/${id}/members`).then((r) => r.data),

  addMember: (orgId: string, payload: { email: string; role: string }) =>
    apiClient.post(`/organizations/${orgId}/members`, payload).then((r) => r.data),

  removeMember: (orgId: string, memberId: string) =>
    apiClient.delete(`/organizations/${orgId}/members/${memberId}`).then((r) => r.data),

  getRoles: (id: string) =>
    apiClient.get(`/organizations/${id}/roles`).then((r) => r.data),
};
