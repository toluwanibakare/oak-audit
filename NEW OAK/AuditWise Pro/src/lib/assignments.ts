// Assignment helpers built on top of auditStore.collections.assignments.
import { auditStore, type EntityItem } from "./audit-store";
import { getChecklist } from "./iso-checklists";

export type AssignmentRole = "primary" | "support" | "expert" | "observer";
export type AssignmentStatus =
  | "Not Started" | "In Progress" | "Submitted"
  | "Under Review" | "Revision Required" | "Resubmitted"
  | "Approved" | "Completed";

export type ResponseResult = "Conformity" | "Nonconformity" | "OFI" | "N/A" | "";
export type ChecklistResponse = {
  qid: string;
  result: ResponseResult;
  notes: string;
  evidence: string[];
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  version: number;
};

export type Assignment = EntityItem & {
  planId: string;
  planTitle: string;
  dept: string;
  processId: string;
  processName: string;
  standardId: string;
  standardCode: string;
  checklistId: string;
  primaryId: string;
  supportIds: string[];
  expertIds: string[];
  observerIds: string[];
  startDate: string;
  endDate: string;
  status: AssignmentStatus;
  progress: number;
  responses: Record<string, ChecklistResponse>;
  findings: string[]; // finding IDs
  notes: { id: string; text: string; author: string; ts: string }[];
  evidence: { id: string; label: string; author: string; ts: string }[];
  submissions: { ts: string; by: string; version: number }[];
  reviews: { ts: string; by: string; action: "approved" | "revision" | "reassign" | "comment"; comment?: string }[];
  version: number;
  createdAt: string;
};

export function listAssignments(): Assignment[] {
  return auditStore.list("assignments") as Assignment[];
}

export function getAssignment(id: string): Assignment | undefined {
  return auditStore.get("assignments", id) as Assignment | undefined;
}

export function assignmentsForPlan(planId: string): Assignment[] {
  return listAssignments().filter((a) => a.planId === planId);
}

export function assignmentsForUser(userId: string): Assignment[] {
  return listAssignments().filter((a) =>
    a.primaryId === userId ||
    a.supportIds.includes(userId) ||
    a.expertIds.includes(userId) ||
    a.observerIds.includes(userId),
  );
}

export function userRoleOn(a: Assignment, userId: string): AssignmentRole | null {
  if (a.primaryId === userId) return "primary";
  if (a.supportIds.includes(userId)) return "support";
  if (a.expertIds.includes(userId)) return "expert";
  if (a.observerIds.includes(userId)) return "observer";
  return null;
}

export function canEditResponses(role: AssignmentRole | null): boolean {
  return role === "primary" || role === "support";
}
export function canSubmit(role: AssignmentRole | null): boolean {
  return role === "primary";
}
export function canReview(role: string | undefined): boolean {
  return role === "Lead Auditor";
}

export function updateResponse(
  assignmentId: string,
  qid: string,
  patch: Partial<Pick<ChecklistResponse, "result" | "notes" | "evidence">>,
  actor: { id: string; name: string },
  expectedVersion?: number,
): { ok: boolean; error?: string; response?: ChecklistResponse } {
  const a = getAssignment(assignmentId);
  if (!a) return { ok: false, error: "Assignment not found" };
  const prev = a.responses[qid];
  if (expectedVersion != null && prev && prev.version !== expectedVersion) {
    return { ok: false, error: `Concurrency conflict — reload (v${prev.version} vs v${expectedVersion})` };
  }
  const next: ChecklistResponse = {
    qid,
    result: patch.result ?? prev?.result ?? "",
    notes: patch.notes ?? prev?.notes ?? "",
    evidence: patch.evidence ?? prev?.evidence ?? [],
    updatedBy: actor.id,
    updatedByName: actor.name,
    updatedAt: new Date().toISOString(),
    version: (prev?.version ?? 0) + 1,
  };
  const responses = { ...a.responses, [qid]: next };
  const status: AssignmentStatus = a.status === "Not Started" ? "In Progress" : a.status;
  const progress = computeProgress(a.checklistId, responses);
  auditStore.update("assignments", a.id, { responses, status, progress });
  return { ok: true, response: next };
}

export function computeProgress(checklistId: string, responses: Record<string, ChecklistResponse>): number {
  const cl = getChecklist(checklistId);
  const total = cl?.questions.length ?? 0;
  if (!total) return 0;
  const done = cl!.questions.filter((q) => {
    const r = responses[q.id];
    return r && !!r.result;
  }).length;
  return Math.round((done / total) * 100);
}

export function validateForSubmission(a: Assignment): string[] {
  const errors: string[] = [];
  const cl = getChecklist(a.checklistId);
  if (!cl) errors.push("Checklist not mapped to this process");
  else {
    const missing = cl.questions.filter((q) => {
      const r = a.responses[q.id];
      return !r || !r.result;
    });
    if (missing.length) errors.push(`${missing.length} unanswered question${missing.length > 1 ? "s" : ""}`);
  }
  if (!a.primaryId) errors.push("Primary auditor is missing");
  return errors;
}

export function submitAssignment(a: Assignment, actor: { id: string; name: string }) {
  const errs = validateForSubmission(a);
  if (errs.length) return { ok: false, errors: errs };
  auditStore.update("assignments", a.id, {
    status: "Submitted",
    submissions: [...a.submissions, { ts: new Date().toISOString(), by: actor.name, version: a.version + 1 }],
    version: a.version + 1,
  });
  auditStore.notify({
    channel: "in-app", to: "Lead Auditor",
    subject: `Assignment ${a.id} submitted`,
    body: `${actor.name} submitted ${a.dept} · ${a.processName} for review.`,
  });
  return { ok: true };
}

export function reviewAssignment(
  a: Assignment,
  action: "approved" | "revision" | "reassign" | "comment",
  comment: string,
  actor: { id: string; name: string },
) {
  const reviews = [...a.reviews, { ts: new Date().toISOString(), by: actor.name, action, comment }];
  let status: AssignmentStatus = a.status;
  if (action === "approved") status = "Approved";
  else if (action === "revision") status = "Revision Required";
  auditStore.update("assignments", a.id, { reviews, status });
  auditStore.notify({
    channel: "in-app",
    to: a.primaryId,
    subject: `Assignment ${a.id} · ${action}`,
    body: comment || `Reviewed by ${actor.name}`,
  });
}

export function generateAssignmentsForPlan(input: {
  planId: string;
  planTitle: string;
  standardId: string;
  standardCode: string;
  checklistId: string;
  startDate: string;
  endDate: string;
  perDept: Record<string, {
    processes: { id: string; name: string }[];
    primaryId: string;
    supportIds: string[];
    expertIds: string[];
    observerIds: string[];
  }>;
}): Assignment[] {
  const created: Assignment[] = [];
  for (const [dept, cfg] of Object.entries(input.perDept)) {
    for (const proc of cfg.processes) {
      const a = auditStore.create("assignments", {
        planId: input.planId,
        planTitle: input.planTitle,
        dept,
        processId: proc.id,
        processName: proc.name,
        standardId: input.standardId,
        standardCode: input.standardCode,
        checklistId: input.checklistId,
        primaryId: cfg.primaryId,
        supportIds: cfg.supportIds,
        expertIds: cfg.expertIds,
        observerIds: cfg.observerIds,
        startDate: input.startDate,
        endDate: input.endDate,
        status: "Not Started" as AssignmentStatus,
        progress: 0,
        responses: {},
        findings: [],
        notes: [],
        evidence: [],
        submissions: [],
        reviews: [],
        version: 1,
        createdAt: new Date().toISOString(),
      }, "ASG") as Assignment;
      created.push(a);
      auditStore.notify({
        channel: "in-app",
        to: cfg.primaryId,
        subject: `New assignment ${a.id}`,
        body: `${dept} · ${proc.name} — you are the Primary Auditor.`,
      });
    }
  }
  return created;
}

export function processesForDept(dept: string): { id: string; name: string }[] {
  return auditStore.list("processes")
    .filter((p) => p.department === dept)
    .map((p) => ({ id: p.id, name: p.name }));
}
