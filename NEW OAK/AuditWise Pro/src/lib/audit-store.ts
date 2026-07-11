// Frontend-only mock store. Persists to localStorage; useSyncExternalStore.
import { useRef, useSyncExternalStore } from "react";
import { toast } from "sonner";

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
    return true;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ak = Object.keys(a as object), bk = Object.keys(b as object);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (!Object.is((a as any)[k], (b as any)[k])) return false;
    return true;
  }
  return false;
}

export type ApprovalStatus = "Pending" | "Notified" | "In Review" | "Approved" | "Rejected";
export type ApprovalStage = { stage: string; role: string; who: string; required: boolean; status: ApprovalStatus; updatedAt?: string };
export type ChecklistItem = { id: string; text: string; section: string; owner: string; clause?: string };
export type EditableChecklist = { id: string; name: string; standard: string; version: string; items: ChecklistItem[] };

export type AuditPlan = {
  id: string; title: string; standard: string; department: string; location: string;
  startDate: string; endDate: string; lead: string; teamCount: number;
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected"; createdAt: string;
  deptAssignments?: Record<string, string[]>; // department -> auditor names
};


export type TrailEntry = { ts: string; step: string; actor: string; field: string; from?: string; to?: string; note?: string };
export type VersionSnapshot = { v: number; ts: string; step: string; actor: string; note: string; data: unknown };
export type Notification = { id: string; ts: string; channel: "email" | "in-app"; to: string; subject: string; body: string; read: boolean };

export type EntityItem = { id: string; [k: string]: any };

type State = {
  plans: Record<string, AuditPlan>;
  trail: Record<string, TrailEntry[]>;
  versions: Record<string, VersionSnapshot[]>;
  notifications: Notification[];
  collections: Record<string, Record<string, EntityItem>>;
};

const KEY = "auditos:store:v2";
const ACTOR = "M. Chen";

const SEED: Record<string, EntityItem[]> = {
  departments: [
    { id: "D-001", name: "Operations", owner: "M. Chen", head: "S. Müller", staff: 142, status: "Active", updated: "2026-06-12" },
    { id: "D-002", name: "Quality", owner: "L. Okafor", head: "L. Okafor", staff: 24, status: "Active", updated: "2026-06-14" },
    { id: "D-003", name: "HSE", owner: "R. Patel", head: "R. Patel", staff: 18, status: "Active", updated: "2026-06-11" },
    { id: "D-004", name: "IT & Security", owner: "R. Patel", head: "A. Novak", staff: 31, status: "Active", updated: "2026-06-13" },
    { id: "D-005", name: "Logistics", owner: "S. Müller", head: "D. Rossi", staff: 56, status: "Review", updated: "2026-06-09" },
    { id: "D-006", name: "HR", owner: "J. Auditor", head: "J. Auditor", staff: 12, status: "Active", updated: "2026-06-08" },
  ],
  processes: [
    { id: "P-001", name: "Document Control", owner: "L. Okafor", department: "Quality", standard: "ISO 9001", status: "Active", updated: "2026-06-10" },
    { id: "P-002", name: "Incident Management", owner: "R. Patel", department: "HSE", standard: "ISO 45001", status: "Active", updated: "2026-06-11" },
    { id: "P-003", name: "Access Control", owner: "A. Novak", department: "IT & Security", standard: "ISO 27001", status: "Active", updated: "2026-06-12" },
    { id: "P-004", name: "Calibration", owner: "M. Chen", department: "Operations", standard: "ISO 9001", status: "Active", updated: "2026-06-13" },
    { id: "P-005", name: "Waste Handling", owner: "L. Okafor", department: "Operations", standard: "ISO 14001", status: "Draft", updated: "2026-06-09" },
  ],
  locations: [
    { id: "L-001", name: "Plant A — Hamburg", country: "Germany", type: "Manufacturing", manager: "S. Müller", status: "Active", updated: "2026-06-10" },
    { id: "L-002", name: "Plant B — Rotterdam", country: "Netherlands", type: "Manufacturing", manager: "D. Rossi", status: "Active", updated: "2026-06-11" },
    { id: "L-003", name: "DC — Antwerp", country: "Belgium", type: "Distribution", manager: "L. Okafor", status: "Active", updated: "2026-06-12" },
    { id: "L-004", name: "HQ — Berlin", country: "Germany", type: "Office", manager: "J. Auditor", status: "Active", updated: "2026-06-08" },
    { id: "L-005", name: "Data Center — Frankfurt", country: "Germany", type: "DC", manager: "A. Novak", status: "Active", updated: "2026-06-13" },
  ],
  assets: [
    { id: "A-001", name: "CMM Zeiss Contura", type: "Equipment", location: "Plant A — Hamburg", owner: "M. Chen", status: "Active", updated: "2026-06-09" },
    { id: "A-002", name: "ERP — SAP S/4HANA", type: "Software", location: "Data Center — Frankfurt", owner: "A. Novak", status: "Active", updated: "2026-06-10" },
    { id: "A-003", name: "Forklift FL-22", type: "Vehicle", location: "DC — Antwerp", owner: "D. Rossi", status: "Maintenance", updated: "2026-06-11" },
    { id: "A-004", name: "Server Rack R-17", type: "Hardware", location: "Data Center — Frankfurt", owner: "A. Novak", status: "Active", updated: "2026-06-12" },
  ],
  users: [
    { id: "u1", name: "M. Chen", email: "m.chen@org.com", role: "Lead Auditor", department: "Quality", status: "Active", updated: "2026-06-10" },
    { id: "u2", name: "R. Patel", email: "r.patel@org.com", role: "Senior Auditor", department: "HSE", status: "Active", updated: "2026-06-11" },
    { id: "u3", name: "L. Okafor", email: "l.okafor@org.com", role: "Auditor", department: "Quality", status: "Active", updated: "2026-06-09" },
    { id: "u4", name: "S. Müller", email: "s.muller@org.com", role: "Lead Auditor", department: "Operations", status: "Active", updated: "2026-06-12" },
    { id: "u5", name: "J. Auditor", email: "j.auditor@org.com", role: "Auditor", department: "HR", status: "Active", updated: "2026-06-08" },
    { id: "u6", name: "A. Novak", email: "a.novak@org.com", role: "Technical Expert", department: "IT & Security", status: "Active", updated: "2026-06-13" },
    { id: "u7", name: "D. Rossi", email: "d.rossi@org.com", role: "Observer", department: "Logistics", status: "Invited", updated: "2026-06-14" },
  ],
  roles: [
    { id: "R-001", name: "Admin", scope: "Global", members: 3, description: "Full platform access", status: "Active", updated: "2026-06-01" },
    { id: "R-002", name: "Lead Auditor", scope: "Audits", members: 5, description: "Plan, conduct, and close audits", status: "Active", updated: "2026-06-01" },
    { id: "R-003", name: "Auditor", scope: "Audits", members: 12, description: "Execute audits, raise findings", status: "Active", updated: "2026-06-01" },
    { id: "R-004", name: "Manager", scope: "Department", members: 8, description: "Review findings, own actions", status: "Active", updated: "2026-06-01" },
    { id: "R-005", name: "Viewer", scope: "Read-only", members: 21, description: "Read-only dashboards & reports", status: "Active", updated: "2026-06-01" },
  ],
  teams: [
    { id: "T-001", name: "QMS Core Team", lead: "M. Chen", members: 6, standard: "ISO 9001", status: "Active", updated: "2026-06-10" },
    { id: "T-002", name: "HSE Inspectors", lead: "R. Patel", members: 4, standard: "ISO 45001", status: "Active", updated: "2026-06-11" },
    { id: "T-003", name: "InfoSec Auditors", lead: "A. Novak", members: 5, standard: "ISO 27001", status: "Active", updated: "2026-06-12" },
    { id: "T-004", name: "Environmental Squad", lead: "L. Okafor", members: 3, standard: "ISO 14001", status: "Active", updated: "2026-06-09" },
  ],
  nonconformities: [
    { id: "F-2001", clause: "8.5.1", description: "Work instructions not displayed at Line A station 3", severity: "Major", department: "Operations", owner: "M. Chen", auditor: "M. Chen", due: "2026-07-15", status: "Open", raisedAt: "2026-06-20" },
    { id: "F-2002", clause: "7.5.3", description: "Document control register missing v3.2 revision history", severity: "Minor", department: "Quality", owner: "L. Okafor", auditor: "L. Okafor", due: "2026-07-22", status: "Open", raisedAt: "2026-06-21" },
    { id: "F-2003", clause: "9.2", description: "Internal audit cycle delayed by 3 weeks", severity: "Observation", department: "Quality", owner: "L. Okafor", auditor: "M. Chen", due: "2026-08-01", status: "Open", raisedAt: "2026-06-18" },
    { id: "F-2004", clause: "A.5.18", description: "Quarterly access review evidence incomplete for Q1", severity: "Major", department: "IT & Security", owner: "A. Novak", auditor: "R. Patel", due: "2026-07-10", status: "In Progress", raisedAt: "2026-06-15" },
    { id: "F-2005", clause: "6.1", description: "Risk register not reviewed in last 12 months", severity: "Minor", department: "HSE", owner: "R. Patel", auditor: "R. Patel", due: "2026-07-25", status: "Open", raisedAt: "2026-06-22" },
    { id: "F-2006", clause: "10.2", description: "Suggest digital sign-off for shift handover forms", severity: "OFI", department: "Operations", owner: "S. Müller", auditor: "M. Chen", due: "2026-08-15", status: "Open", raisedAt: "2026-06-19" },
    { id: "F-2007", clause: "8.1", description: "PPE compliance 84% on shop floor walkthrough", severity: "Observation", department: "HSE", owner: "R. Patel", auditor: "R. Patel", due: "2026-07-30", status: "Open", raisedAt: "2026-06-23" },
  ],
  actions: [
    { id: "CA-101", title: "Update SOP for Line A operators", findingId: "F-2001", owner: "M. Chen", priority: "High", standard: "ISO 9001", due: "2026-07-12", status: "Open", updated: "2026-06-20" },
    { id: "CA-102", title: "Re-train HSE inspectors on incident logging", findingId: "F-2005", owner: "R. Patel", priority: "Medium", standard: "ISO 45001", due: "2026-07-18", status: "Open", updated: "2026-06-22" },
    { id: "CA-103", title: "Patch access control gaps in IAM", findingId: "F-2004", owner: "A. Novak", priority: "Critical", standard: "ISO 27001", due: "2026-07-09", status: "In Progress", updated: "2026-06-21" },
    { id: "CA-104", title: "Revise document control register", findingId: "F-2002", owner: "L. Okafor", priority: "Medium", standard: "ISO 9001", due: "2026-07-22", status: "In Progress", updated: "2026-06-23" },
    { id: "CA-105", title: "Containment for batch 4421", findingId: "F-2001", owner: "M. Chen", priority: "Critical", standard: "ISO 9001", due: "2026-07-05", status: "Pending Verification", updated: "2026-06-24" },
    { id: "CA-106", title: "Verify training records", findingId: "F-2002", owner: "J. Auditor", priority: "Low", standard: "ISO 9001", due: "2026-07-08", status: "Pending Verification", updated: "2026-06-22" },
    { id: "CA-107", title: "Calibration schedule restored", findingId: "F-2001", owner: "M. Chen", priority: "Medium", standard: "ISO 9001", due: "2026-06-14", status: "Closed", updated: "2026-06-14" },
    { id: "CA-108", title: "Q1 access review backfill", findingId: "F-2004", owner: "A. Novak", priority: "High", standard: "ISO 27001", due: "2026-06-10", status: "Open", updated: "2026-06-18" },
  ],
  evidence: [
    { id: "E-001", auditId: "AUD-2026-041", title: "Line A SOP photo", type: "Image", uploadedBy: "M. Chen", status: "Linked", updated: "2026-06-20" },
    { id: "E-002", auditId: "AUD-2026-041", title: "Calibration certificate Q2", type: "Document", uploadedBy: "M. Chen", status: "Linked", updated: "2026-06-20" },
    { id: "E-003", auditId: "AUD-2026-042", title: "Operator interview transcript", type: "Audio", uploadedBy: "R. Patel", status: "Linked", updated: "2026-06-21" },
  ],
  notes: [
    { id: "N-001", auditId: "AUD-2026-041", clause: "5.2", text: "Policy poster faded — recommend reprint", author: "M. Chen", updated: "2026-06-20" },
    { id: "N-002", auditId: "AUD-2026-041", clause: "9.2", text: "Internal audit cycle slipping behind plan", author: "M. Chen", updated: "2026-06-20" },
  ],
  responses: [], // {id, auditId, itemId, clause, result, notes, updated}
};

function load(): State {
  if (typeof window === "undefined") return base();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // ensure collections seeded for any missing key
      const collections = { ...parsed.collections };
      for (const k of Object.keys(SEED)) {
        if (!collections[k]) collections[k] = Object.fromEntries(SEED[k].map((i) => [i.id, i]));
      }
      return { ...parsed, collections };
    }
  } catch {}
  return base();
}

function base(): State {
  const collections: State["collections"] = {};
  for (const [k, items] of Object.entries(SEED)) {
    collections[k] = Object.fromEntries(items.map((i) => [i.id, i]));
  }
  return { plans: {}, trail: {}, versions: {}, notifications: [], collections };
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

let nextSeq = 1000;
function genId(prefix: string) {
  nextSeq += 1;
  return `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}${nextSeq.toString(36).toUpperCase()}`;
}

export const auditStore = {
  subscribe,
  getSnapshot: () => state,

  upsertPlan(plan: AuditPlan) {
    state = { ...state, plans: { ...state.plans, [plan.id]: plan } };
    persist();
  },
  removePlan(id: string) {
    const { [id]: _, ...rest } = state.plans;
    state = { ...state, plans: rest };
    persist();
  },

  logTrail(planId: string, entry: Omit<TrailEntry, "ts" | "actor"> & { actor?: string }) {
    const e: TrailEntry = { ts: new Date().toISOString(), actor: entry.actor ?? ACTOR, ...entry };
    const next = [...(state.trail[planId] ?? []), e];
    state = { ...state, trail: { ...state.trail, [planId]: next } };
    persist();
  },

  snapshot(planId: string, step: string, note: string, data: unknown) {
    const list = state.versions[planId] ?? [];
    const v: VersionSnapshot = { v: list.length + 1, ts: new Date().toISOString(), step, actor: ACTOR, note, data };
    state = { ...state, versions: { ...state.versions, [planId]: [...list, v] } };
    persist();
  },

  notify(n: Omit<Notification, "id" | "ts" | "read">) {
    const note: Notification = { id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, ts: new Date().toISOString(), read: false, ...n };
    state = { ...state, notifications: [note, ...state.notifications].slice(0, 200) };
    persist();
    if (typeof window !== "undefined") {
      toast(n.channel === "email" ? `Email sent · ${n.to}` : `In-app · ${n.to}`, { description: n.subject });
    }
  },
  markAllRead() {
    state = { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    persist();
  },

  // ===== Generic collections =====
  list(entity: string): EntityItem[] {
    return Object.values(state.collections[entity] ?? {});
  },
  get(entity: string, id: string): EntityItem | undefined {
    return state.collections[entity]?.[id];
  },
  create(entity: string, item: Partial<EntityItem>, idPrefix = "ID"): EntityItem {
    const id = item.id ?? genId(idPrefix);
    const updated = new Date().toISOString().slice(0, 10);
    const full = { id, updated, ...item };
    const coll = { ...(state.collections[entity] ?? {}), [id]: full };
    state = { ...state, collections: { ...state.collections, [entity]: coll } };
    persist();
    toast.success(`Created ${id}`);
    return full;
  },
  update(entity: string, id: string, patch: Partial<EntityItem>) {
    const cur = state.collections[entity]?.[id];
    if (!cur) return;
    const merged = { ...cur, ...patch, id, updated: new Date().toISOString().slice(0, 10) };
    const coll = { ...state.collections[entity], [id]: merged };
    state = { ...state, collections: { ...state.collections, [entity]: coll } };
    persist();
  },
  remove(entity: string, id: string) {
    const coll = { ...(state.collections[entity] ?? {}) };
    delete coll[id];
    state = { ...state, collections: { ...state.collections, [entity]: coll } };
    persist();
    toast.success(`Deleted ${id}`);
  },

  reset() { state = base(); persist(); },
};

export function useAuditStore<T>(selector: (s: State) => T): T {
  const cache = useRef<{ state: State | null; value: T }>({ state: null, value: undefined as unknown as T });
  const baseSnapshot = useRef<T>(selector(base()));
  const getSnap = () => {
    const cur = state;
    if (cache.current.state === cur) return cache.current.value;
    const next = selector(cur);
    if (cache.current.state !== null && shallowEqual(cache.current.value, next)) {
      cache.current.state = cur;
      return cache.current.value;
    }
    cache.current = { state: cur, value: next };
    return next;
  };
  return useSyncExternalStore(auditStore.subscribe, getSnap, () => baseSnapshot.current);
}

export function nextAuditId(): string {
  const year = new Date().getFullYear();
  const count = Object.values(state.plans).filter((p) => p.id.startsWith(`AUD-${year}`)).length + 46;
  return `AUD-${year}-${String(count).padStart(3, "0")}`;
}
