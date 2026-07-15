// Transient store for draft audit plans and UI state. All entity data comes from the backend API.
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

export type ApprovalStatus = "pending" | "notified" | "in_review" | "approved" | "rejected";
export type ApprovalStage = { stage: string; role: string; who: string; email: string; required: boolean; status: ApprovalStatus; updatedAt?: string };
export type ChecklistItem = { id: string; text: string; section: string; owner: string; clause?: string };
export type EditableChecklist = { id: string; name: string; standard: string; version: string; items: ChecklistItem[] };

export type AuditPlan = {
  id: string; title: string; standard: string; department: string; location: string;
  startDate: string; endDate: string; lead: string; teamCount: number;
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected"; createdAt: string;
  deptAssignments?: Record<string, string[]>; // department -> auditor names
  wizardState?: Record<string, any>;
  serverId?: string;
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
const ACTOR = "System";

function load(): State {
  if (typeof window === "undefined") return base();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      return { ...base(), ...JSON.parse(raw), collections: { ...base().collections, ...JSON.parse(raw).collections } };
    }
  } catch {}
  return base();
}

function base(): State {
  return { plans: {}, trail: {}, versions: {}, notifications: [], collections: {} };
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
  create(entity: string, item: Partial<EntityItem>, idPrefix = "ID", silent = false): EntityItem {
    const id = item.id ?? genId(idPrefix);
    const updated = new Date().toISOString().slice(0, 10);
    const full = { id, updated, ...item };
    const coll = { ...(state.collections[entity] ?? {}), [id]: full };
    state = { ...state, collections: { ...state.collections, [entity]: coll } };
    persist();
    if (!silent) toast.success(`Created ${id}`);
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
