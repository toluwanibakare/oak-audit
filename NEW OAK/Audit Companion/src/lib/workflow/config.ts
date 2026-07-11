import type { RBACMatrix, Role, StageConfig, StageId } from "./types";

export const STAGE_ORDER: StageId[] = [
  "programme", "scheduling", "checklist", "inspection",
  "findings", "capa", "verification", "closure", "history",
];

export const defaultStageConfig: StageConfig[] = [
  {
    id: "programme", label: "Audit Programme Creation", shortLabel: "Programme",
    requiresApproval: true,
    approverRoles: ["Audit Manager", "Administrator"],
    notifyRoles: ["Audit Manager", "Lead Auditor", "Department Head"],
    entryCriteria: () => ({ ok: true }),
  },
  {
    id: "scheduling", label: "Automated Scheduling", shortLabel: "Schedule",
    requiresApproval: false,
    approverRoles: ["Audit Manager"],
    notifyRoles: ["Lead Auditor", "Auditor", "Department Head"],
    entryCriteria: (a) => a.stages.programme.status === "Approved"
      ? { ok: true }
      : { ok: false, reason: "Programme must be approved." },
  },
  {
    id: "checklist", label: "Checklist Management", shortLabel: "Checklist",
    requiresApproval: true,
    approverRoles: ["Audit Manager", "Lead Auditor"],
    notifyRoles: ["Auditor"],
    entryCriteria: (a) => a.stages.scheduling.status === "Completed" || a.stages.scheduling.status === "Approved"
      ? { ok: true }
      : { ok: false, reason: "Schedule must be set first." },
  },
  {
    id: "inspection", label: "Mobile Inspection", shortLabel: "Inspection",
    requiresApproval: false,
    approverRoles: [],
    notifyRoles: ["Lead Auditor"],
    entryCriteria: (a) => a.checklist.length > 0
      ? { ok: true }
      : { ok: false, reason: "Checklist has no questions." },
  },
  {
    id: "findings", label: "Findings Capture", shortLabel: "Findings",
    requiresApproval: false,
    approverRoles: ["Lead Auditor"],
    notifyRoles: ["Audit Manager", "Department Head"],
    entryCriteria: (a) => a.stages.inspection.completion > 0
      ? { ok: true }
      : { ok: false, reason: "Begin inspection before logging findings." },
  },
  {
    id: "capa", label: "CAPA Assignment & Tracking", shortLabel: "CAPA",
    requiresApproval: false,
    approverRoles: ["Audit Manager"],
    notifyRoles: ["CAPA Owner", "Department Head"],
    entryCriteria: (a) => a.findings.length > 0
      ? { ok: true }
      : { ok: false, reason: "No findings to action." },
  },
  {
    id: "verification", label: "Verification", shortLabel: "Verification",
    requiresApproval: true,
    approverRoles: ["Reviewer", "Audit Manager"],
    notifyRoles: ["CAPA Owner", "Lead Auditor"],
    entryCriteria: (a) => a.capas.length > 0
      ? { ok: true }
      : { ok: false, reason: "No CAPAs to verify." },
  },
  {
    id: "closure", label: "Audit Closure", shortLabel: "Closure",
    requiresApproval: true,
    approverRoles: ["Audit Manager", "Executive"],
    notifyRoles: ["Executive", "Audit Manager", "Department Head"],
    entryCriteria: (a) => {
      const openMajor = a.findings.some(f => f.category === "Major NC"
        && !a.capas.find(c => c.findingId === f.id && c.status === "Verified"));
      if (openMajor) return { ok: false, reason: "Outstanding Major NC blocks closure." };
      const pending = a.capas.filter(c => c.status !== "Verified" && c.status !== "Closed");
      if (pending.length) return { ok: false, reason: `${pending.length} CAPA(s) still open.` };
      return { ok: true };
    },
  },
  {
    id: "history", label: "Audit History & Analytics", shortLabel: "History",
    requiresApproval: false,
    approverRoles: [],
    notifyRoles: [],
    entryCriteria: (a) => a.stages.closure.status === "Completed"
      ? { ok: true }
      : { ok: false, reason: "Available after closure." },
  },
];

const ALL: import("./types").Permission[] = ["view","create","edit","approve","close","delete","export"];
const RW: import("./types").Permission[] = ["view","create","edit","export"];
const RO: import("./types").Permission[] = ["view"];
const APV: import("./types").Permission[] = ["view","approve","export"];

function per(all: (id: StageId) => import("./types").Permission[]): Record<StageId, import("./types").Permission[]> {
  return STAGE_ORDER.reduce((acc, id) => { acc[id] = all(id); return acc; }, {} as Record<StageId, import("./types").Permission[]>);
}

export const defaultRBAC: RBACMatrix = {
  "Administrator": per(() => ALL),
  "Audit Manager": per(() => ["view","create","edit","approve","close","export"]),
  "Lead Auditor":  per((id) => id === "closure" ? APV : ["view","create","edit","export"]),
  "Auditor":       per((id) => ["inspection","findings"].includes(id) ? RW : RO),
  "Reviewer":      per((id) => id === "verification" ? ["view","approve","edit","export"] : RO),
  "Department Head": per(() => APV),
  "CAPA Owner":    per((id) => id === "capa" ? ["view","edit","export"] : RO),
  "Executive":     per((id) => id === "closure" ? APV : ["view","export"]),
  "Read Only":     per(() => RO),
};

export const ALL_ROLES: Role[] = [
  "Administrator","Audit Manager","Lead Auditor","Auditor",
  "Reviewer","Department Head","CAPA Owner","Executive","Read Only",
];
