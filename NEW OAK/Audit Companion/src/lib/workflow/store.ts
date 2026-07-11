import { useSyncExternalStore } from "react";
import type {
  AuditProgramme, AuditTrailEntry, AppNotification, Role, StageId, StageState,
  Finding, CAPA, ChecklistQuestion, InspectionResponse, Evidence, StageConfig,
} from "./types";
import { defaultRBAC, defaultStageConfig, STAGE_ORDER } from "./config";

const LS_KEY = "oakaudix:workflow:v1";

interface State {
  role: Role;
  actor: string;
  programmes: AuditProgramme[];
  notifications: AppNotification[];
  trail: AuditTrailEntry[];
  stageConfig: StageConfig[];
  rbac: typeof defaultRBAC;
}

function emptyStageState(id: StageId): StageState {
  return {
    id, status: "Locked", completion: 0,
    approvalStatus: "Not Required", comments: [],
    evidenceCount: 0, notificationsSent: 0,
  };
}

export function newProgramme(partial: Partial<AuditProgramme> & { title: string; type: AuditProgramme["type"]; standards: AuditProgramme["standards"] }, actor: string): AuditProgramme {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const stages = STAGE_ORDER.reduce((acc, s) => {
    acc[s] = emptyStageState(s);
    return acc;
  }, {} as Record<StageId, StageState>);
  stages.programme.status = "Draft";
  stages.programme.completion = 20;
  return {
    id,
    code: `AUD-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
    title: partial.title,
    type: partial.type,
    standards: partial.standards,
    site: partial.site ?? "",
    department: partial.department ?? "",
    objectives: partial.objectives ?? "",
    scope: partial.scope ?? "",
    criteria: partial.criteria ?? "",
    leadAuditor: partial.leadAuditor ?? "",
    teamMembers: partial.teamMembers ?? [],
    approvers: partial.approvers ?? [],
    riskPriority: partial.riskPriority ?? "Medium",
    targetDate: partial.targetDate ?? new Date(Date.now() + 30*86400000).toISOString().slice(0,10),
    estimatedDurationDays: partial.estimatedDurationDays ?? 5,
    createdBy: actor,
    createdAt: now,
    stages,
    currentStage: "programme",
    checklist: [],
    inspection: [],
    findings: [],
    capas: [],
  };
}

// ---------- store singleton ----------
let state: State = load();
const listeners = new Set<() => void>();

function persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {} }
function emit() { persist(); listeners.forEach(l => l()); }
function load(): State {
  const base: State = {
    role: "Audit Manager",
    actor: "You",
    programmes: [],
    notifications: [],
    trail: [],
    stageConfig: defaultStageConfig,
    rbac: defaultRBAC,
  };
  if (typeof localStorage === "undefined") return base;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ...base,
      ...parsed,
      // functions in stageConfig are lost after JSON — always use runtime config
      stageConfig: defaultStageConfig,
      rbac: parsed.rbac ?? defaultRBAC,
    };
  } catch { return base; }
}

function update(mut: (s: State) => void) {
  mut(state);
  emit();
}

function log(entry: Omit<AuditTrailEntry, "id" | "at" | "actor" | "role">) {
  state.trail.unshift({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor: state.actor,
    role: state.role,
    device: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 60) : "server",
    ...entry,
  });
  if (state.trail.length > 2000) state.trail.length = 2000;
}

function notify(n: Omit<AppNotification, "id" | "at" | "read">) {
  state.notifications.unshift({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    read: false,
    ...n,
  });
  if (state.notifications.length > 500) state.notifications.length = 500;
}

// ---------- public API ----------
export const workflow = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get: () => state,

  setRole(role: Role) { update(s => { s.role = role; log({ action: `Switched role to ${role}` }); }); },
  setActor(actor: string) { update(s => { s.actor = actor; }); },

  createProgramme(input: Parameters<typeof newProgramme>[0]) {
    const p = newProgramme(input, state.actor);
    update(s => {
      s.programmes.unshift(p);
      log({ action: "Programme created", target: p.id, stage: "programme", after: p.title });
      for (const r of ["Audit Manager", "Lead Auditor"] as Role[]) {
        notify({ channel: "in_app", to: r, subject: `New audit programme: ${p.title}`, body: `${p.type} audit against ${p.standards.join(", ")} — awaiting your review.`, audit: p.id, stage: "programme" });
        p.stages.programme.notificationsSent++;
      }
    });
    return p;
  },

  updateProgramme(id: string, patch: Partial<AuditProgramme>) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      Object.assign(p, patch);
      log({ action: "Programme edited", target: id, stage: "programme" });
    });
  },

  submitForApproval(id: string, stage: StageId) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const cfg = s.stageConfig.find(c => c.id === stage)!;
      const gate = cfg.entryCriteria(p);
      if (!gate.ok) throw new Error(gate.reason);
      p.stages[stage].status = cfg.requiresApproval ? "Pending Approval" : "Completed";
      p.stages[stage].approvalStatus = cfg.requiresApproval ? "Pending" : "Not Required";
      p.stages[stage].approvers = cfg.approverRoles as string[];
      if (!cfg.requiresApproval) advance(s, p, stage);
      log({ action: cfg.requiresApproval ? "Submitted for approval" : "Stage completed", target: id, stage });
      for (const r of cfg.notifyRoles) {
        notify({ channel: "in_app", to: r, subject: `${cfg.label} — action needed`, body: `${p.code} ${p.title}`, audit: p.id, stage });
        p.stages[stage].notificationsSent++;
      }
    });
  },

  approve(id: string, stage: StageId, comment?: string) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const cfg = s.stageConfig.find(c => c.id === stage)!;
      if (!cfg.approverRoles.includes(s.role) && s.role !== "Administrator") throw new Error(`Role ${s.role} cannot approve ${cfg.label}.`);
      const st = p.stages[stage];
      st.status = "Approved"; st.approvalStatus = "Approved";
      st.approvedBy = s.actor; st.approvedAt = new Date().toISOString();
      st.completion = 100;
      if (comment) st.comments.unshift({ id: crypto.randomUUID(), by: s.actor, at: st.approvedAt, text: comment });
      log({ action: `Approved ${cfg.label}`, target: id, stage, reason: comment });
      advance(s, p, stage);
    });
  },

  reject(id: string, stage: StageId, reason: string) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const cfg = s.stageConfig.find(c => c.id === stage)!;
      if (!cfg.approverRoles.includes(s.role) && s.role !== "Administrator") throw new Error(`Role ${s.role} cannot reject.`);
      const st = p.stages[stage];
      st.status = "Rejected"; st.approvalStatus = "Rejected";
      st.comments.unshift({ id: crypto.randomUUID(), by: s.actor, at: new Date().toISOString(), text: `Rejected: ${reason}` });
      log({ action: `Rejected ${cfg.label}`, target: id, stage, reason });
    });
  },

  addComment(id: string, stage: StageId, text: string) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      p.stages[stage].comments.unshift({ id: crypto.randomUUID(), by: s.actor, at: new Date().toISOString(), text });
      log({ action: "Comment added", target: id, stage });
    });
  },

  // --- stage-specific mutators ---
  setSchedule(id: string, slot: AuditProgramme["schedule"]) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      // conflict detection across programmes
      if (slot) {
        const conflict = s.programmes.find(other => other.id !== id && other.schedule
          && overlap(other.schedule.start, other.schedule.end, slot.start, slot.end)
          && other.schedule.assignees.some(a => slot.assignees.includes(a)));
        if (conflict) throw new Error(`Auditor conflict with ${conflict.code}`);
      }
      p.schedule = slot;
      p.stages.scheduling.status = "Completed";
      p.stages.scheduling.completion = 100;
      p.stages.scheduling.dueDate = slot?.start;
      p.stages.scheduling.responsible = p.leadAuditor;
      advance(s, p, "scheduling");
      log({ action: "Scheduled", target: id, stage: "scheduling", after: slot });
    });
  },

  setChecklist(id: string, items: ChecklistQuestion[]) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      p.checklist = items;
      p.stages.checklist.completion = items.length ? 60 : 0;
      p.stages.checklist.responsible = p.leadAuditor;
      log({ action: "Checklist updated", target: id, stage: "checklist" });
    });
  },

  recordInspection(id: string, resp: InspectionResponse) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const idx = p.inspection.findIndex(r => r.questionId === resp.questionId);
      if (idx >= 0) p.inspection[idx] = resp; else p.inspection.push(resp);
      const total = p.checklist.length || 1;
      const answered = p.inspection.filter(r => r.value !== null && r.value !== "").length;
      p.stages.inspection.completion = Math.round((answered / total) * 100);
      p.stages.inspection.status = p.stages.inspection.completion >= 100 ? "Completed" : "In Progress";
      p.stages.inspection.responsible = s.actor;
      p.stages.inspection.evidenceCount = p.inspection.reduce((n, r) => n + (r.evidence?.length ?? 0), 0);
      if (p.stages.inspection.status === "Completed") advance(s, p, "inspection");
      log({ action: "Inspection response", target: id, stage: "inspection", after: resp.questionId });
    });
  },

  addFinding(id: string, f: Omit<Finding, "id" | "createdAt" | "createdBy" | "auditRef">) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const finding: Finding = {
        ...f, id: crypto.randomUUID(), auditRef: p.code,
        createdAt: new Date().toISOString(), createdBy: s.actor,
      };
      p.findings.push(finding);
      p.stages.findings.status = "In Progress";
      p.stages.findings.completion = Math.min(100, p.findings.length * 20 + 20);
      p.stages.findings.evidenceCount = p.findings.reduce((n, x) => n + x.evidence.length, 0);
      // auto-CAPA for NC/Observation
      if (["Major NC", "Minor NC", "Observation"].includes(finding.category)) {
        const capa: CAPA = {
          id: crypto.randomUUID(), findingId: finding.id,
          owner: finding.owner, dueDate: finding.targetDate,
          priority: finding.category === "Major NC" ? "Critical" : finding.category === "Minor NC" ? "High" : "Medium",
          rootCause: finding.rootCause, correctiveAction: "",
          verificationRequired: true, approvalRequired: finding.category === "Major NC",
          completionPct: 0, status: "Open", createdAt: new Date().toISOString(),
        };
        p.capas.push(capa);
        notify({ channel: "in_app", to: "CAPA Owner", subject: `New CAPA: ${finding.category}`, body: finding.description, audit: p.id, stage: "capa" });
        p.stages.capa.notificationsSent++;
      }
      log({ action: "Finding logged", target: id, stage: "findings", after: finding.category });
    });
  },

  updateCAPA(id: string, capaId: string, patch: Partial<CAPA>) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const c = p.capas.find(x => x.id === capaId); if (!c) return;
      Object.assign(c, patch);
      if ((c.completionPct ?? 0) >= 100 && c.status === "In Progress") c.status = "Awaiting Review";
      const closed = p.capas.filter(x => x.status === "Verified" || x.status === "Closed").length;
      p.stages.capa.completion = p.capas.length ? Math.round(closed / p.capas.length * 100) : 0;
      p.stages.capa.status = p.stages.capa.completion === 100 ? "Completed" : "In Progress";
      log({ action: "CAPA updated", target: id, stage: "capa" });
    });
  },

  verifyCAPA(id: string, capaId: string, verdict: { effective: boolean; comment: string }) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const c = p.capas.find(x => x.id === capaId); if (!c) return;
      if (c.owner === s.actor) throw new Error("Verifier must be different from CAPA owner.");
      c.verifiedBy = s.actor; c.verifiedAt = new Date().toISOString();
      c.verificationComments = verdict.comment;
      c.effectivenessConfirmed = verdict.effective;
      c.status = verdict.effective ? "Verified" : "In Progress";
      const verified = p.capas.filter(x => x.status === "Verified").length;
      p.stages.verification.completion = p.capas.length ? Math.round(verified / p.capas.length * 100) : 0;
      if (p.stages.verification.completion === 100) {
        p.stages.verification.status = "Completed";
        advance(s, p, "verification");
      }
      log({ action: `CAPA verification: ${verdict.effective ? "effective" : "returned"}`, target: id, stage: "verification", reason: verdict.comment });
    });
  },

  closeAudit(id: string, summary: string) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      const cfg = s.stageConfig.find(c => c.id === "closure")!;
      const gate = cfg.entryCriteria(p);
      if (!gate.ok) throw new Error(gate.reason);
      p.stages.closure.status = "Pending Approval";
      p.stages.closure.approvalStatus = "Pending";
      p.reportSummary = summary;
      p.closureNotes = summary;
      log({ action: "Closure submitted", target: id, stage: "closure" });
      for (const r of cfg.notifyRoles) {
        notify({ channel: "in_app", to: r, subject: `Closure approval: ${p.code}`, body: p.title, audit: p.id, stage: "closure" });
        p.stages.closure.notificationsSent++;
      }
    });
  },

  addEvidence(id: string, stage: StageId, ev: Evidence) {
    update(s => {
      const p = s.programmes.find(x => x.id === id); if (!p) return;
      p.stages[stage].evidenceCount++;
      log({ action: "Evidence uploaded", target: id, stage, after: ev.name });
    });
  },

  markNotificationRead(nid: string) {
    update(s => { const n = s.notifications.find(x => x.id === nid); if (n) n.read = true; });
  },

  reset() {
    update(s => { s.programmes = []; s.notifications = []; s.trail = []; log({ action: "System reset" }); });
  },
};

function overlap(a1: string, a2: string, b1: string, b2: string) {
  return new Date(a1) < new Date(b2) && new Date(b1) < new Date(a2);
}

function advance(s: State, p: AuditProgramme, from: StageId) {
  const idx = STAGE_ORDER.indexOf(from);
  const next = STAGE_ORDER[idx + 1];
  if (!next) return;
  const gate = s.stageConfig.find(c => c.id === next)!.entryCriteria(p);
  const nx = p.stages[next];
  if (gate.ok) {
    if (nx.status === "Locked") nx.status = "Draft";
    p.currentStage = next;
  } else {
    nx.status = "Locked";
  }
}

// ---------- hooks ----------
export function useWorkflow<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(workflow.subscribe, () => selector(state), () => selector(state));
}

export function useProgramme(id: string | undefined) {
  return useWorkflow(s => s.programmes.find(p => p.id === id));
}

export function can(role: Role, stage: StageId, perm: import("./types").Permission): boolean {
  return (state.rbac[role]?.[stage] ?? []).includes(perm);
}
