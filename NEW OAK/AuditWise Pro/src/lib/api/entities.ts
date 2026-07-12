import apiClient from "./client";

export interface EntityRecord {
  id: string;
  [key: string]: any;
}

export const entitiesApi = {
  list: (orgId: string, entityType: string) =>
    apiClient.get<EntityRecord[]>(`/organizations/${orgId}/entities/${entityType}`).then((r) => r.data),

  create: (orgId: string, entityType: string, data: Record<string, any>) =>
    apiClient.post<EntityRecord>(`/organizations/${orgId}/entities/${entityType}`, { data }).then((r) => r.data),

  update: (orgId: string, entityType: string, id: string, data: Record<string, any>) =>
    apiClient.put<EntityRecord>(`/organizations/${orgId}/entities/${entityType}/${id}`, { data }).then((r) => r.data),

  delete: (orgId: string, entityType: string, id: string) =>
    apiClient.delete(`/organizations/${orgId}/entities/${entityType}/${id}`).then((r) => r.data),

  seed: (orgId: string, data: Record<string, any[]>) =>
    apiClient.post(`/organizations/${orgId}/entities/seed`, { data }).then((r) => r.data),
};
