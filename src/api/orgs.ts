import apiClient from "./client";

export interface Organization {
  id: string;
  name: string;
  type: "individual" | "organization";
  industry: string | null;
  address: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  org_id: string;
  user_id: string | null;
  invited_email: string | null;
  status: string;
}

export interface UserRole {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
}

export const orgsApi = {
  list: () => apiClient.get<Organization[]>("/organizations").then((r) => r.data),

  get: (id: string) => apiClient.get<Organization>(`/organizations/${id}`).then((r) => r.data),

  create: (data: Partial<Organization>) =>
    apiClient.post<Organization>("/organizations", data).then((r) => r.data),

  update: (id: string, data: Partial<Organization>) =>
    apiClient.put<Organization>(`/organizations/${id}`, data).then((r) => r.data),

  getMembers: (orgId: string) =>
    apiClient.get<Member[]>(`/organizations/${orgId}/members`).then((r) => r.data),

  addMember: (orgId: string, data: Partial<Member>) =>
    apiClient.post<Member>(`/organizations/${orgId}/members`, data).then((r) => r.data),

  removeMember: (orgId: string, memberId: string) =>
    apiClient.delete(`/organizations/${orgId}/members/${memberId}`).then((r) => r.data),

  uploadLogo: (orgId: string, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return apiClient.post<{ logo_url: string }>(
      `/organizations/${orgId}/logo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data);
  },

  getRoles: (orgId: string) =>
    apiClient.get<UserRole[]>(`/organizations/${orgId}/roles`).then((r) => r.data),
};
