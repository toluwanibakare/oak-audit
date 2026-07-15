import apiClient from "./client";

export interface AuditRecord {
  id: string;
  org_id: string;
  title: string | null;
  standard: string | null;
  status: string;
  scope: string | null;
  criteria: string | null;
  object: string | null;
  conclusion: string | null;
  start_date: string | null;
  end_date: string | null;
  started_at: string | null;
  closed_at: string | null;
  lead_auditor_id: string | null;
  lead_auditor?: { id: string; full_name: string; email: string } | null;
  owner: string | null;
  wizard_state: Record<string, any> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const auditsApi = {
  list: (orgId: string, auditorId?: string) =>
    apiClient.get<AuditRecord[]>(`/organizations/${orgId}/audits`, { params: auditorId ? { auditor_id: auditorId } : {} }).then((r) => r.data),

  get: (orgId: string, id: string) =>
    apiClient.get<AuditRecord>(`/organizations/${orgId}/audits/${id}`).then((r) => r.data),

  create: (orgId: string, data: Record<string, any>) =>
    apiClient.post<AuditRecord>(`/organizations/${orgId}/audits`, data).then((r) => r.data),

  update: (orgId: string, id: string, data: Record<string, any>) =>
    apiClient.put<AuditRecord>(`/organizations/${orgId}/audits/${id}`, data).then((r) => r.data),

  delete: (orgId: string, id: string) =>
    apiClient.delete<{ message: string }>(`/organizations/${orgId}/audits/${id}`).then((r) => r.data),

  // Approvals
  getApprovals: (orgId: string, auditId: string) =>
    apiClient.get<{ audit: AuditRecord; stages: ApprovalStageRecord[] }>(`/organizations/${orgId}/audits/${auditId}/approvals`).then((r) => r.data),

  submitApprovals: (orgId: string, auditId: string, payload: { allow_auditee?: boolean; auditee_name?: string; auditee_email?: string }) =>
    apiClient.post<{ message: string; stages: ApprovalStageRecord[] }>(`/organizations/${orgId}/audits/${auditId}/approvals/submit`, payload).then((r) => r.data),

  approveStage: (orgId: string, auditId: string, stageId: string, comment?: string) =>
    apiClient.post<{ message: string; audit_status: string; stages: ApprovalStageRecord[] }>(`/organizations/${orgId}/audits/${auditId}/approvals/${stageId}/approve`, { comment }).then((r) => r.data),

  rejectStage: (orgId: string, auditId: string, stageId: string, comment: string) =>
    apiClient.post<{ message: string; audit_status: string; stages: ApprovalStageRecord[] }>(`/organizations/${orgId}/audits/${auditId}/approvals/${stageId}/reject`, { comment }).then((r) => r.data),

  // Assignment flow
  take: (orgId: string, auditId: string) =>
    apiClient.post<AuditRecord>(`/organizations/${orgId}/audits/${auditId}/take`).then((r) => r.data),

  submitForReview: (orgId: string, auditId: string) =>
    apiClient.post<AuditRecord>(`/organizations/${orgId}/audits/${auditId}/submit-for-review`).then((r) => r.data),

  finalSubmit: (orgId: string, auditId: string) =>
    apiClient.post<AuditRecord>(`/organizations/${orgId}/audits/${auditId}/final-submit`).then((r) => r.data),
};

export interface ApprovalStageRecord {
  id: string;
  audit_id: string;
  stage: string;
  approver_name: string;
  approver_email: string;
  is_required: boolean;
  sort_order: number;
  status: string;
  comment: string | null;
  notified_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_MAP: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In Progress",
  under_review: "Under Review",
  completed: "Completed",
};

export function auditRecordToPlan(r: AuditRecord) {
  const ws = r.wizard_state ?? {};
  const departments: string[] = Array.isArray(ws.departments) ? ws.departments : [];
  const locations: string[] = Array.isArray(ws.locations) ? ws.locations : [];
  const teamIds: string[] = Array.isArray(ws.teamIds) ? ws.teamIds : [];
  return {
    id: r.id,
    title: r.title ?? "",
    standard: r.standard ?? "",
    department: departments[0] ?? "",
    location: locations.join(", "),
    startDate: r.start_date ?? "",
    endDate: r.end_date ?? "",
    lead: ws.leadId ?? "(unknown)",
    teamCount: teamIds.length + 1,
    status: STATUS_MAP[r.status] ?? "Draft",
    createdAt: r.created_at ?? new Date().toISOString(),
    deptAssignments: ws.deptAssignments,
    wizardState: ws,
    serverId: r.id,
  };
}
