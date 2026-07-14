import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { WCard, WBadge, Annotation } from "@/components/wire";
import {
  Check, ChevronLeft, ChevronRight, FileText, Users, ListChecks,
  ShieldCheck, Send, CalendarRange, Search, X, Plus, History, Mail, Bell, Trash2, Pencil,
} from "lucide-react";
import {
  auditStore, useAuditStore, nextAuditId,
  type ApprovalStage, type ApprovalStatus, type EditableChecklist, type ChecklistItem,
} from "@/lib/audit-store";
import { toast } from "sonner";
import { CHECKLIST_LIBRARY, recommendedFor, getChecklist, asQuestion } from "@/lib/iso-checklists";
import { entitiesApi } from "@/lib/api/entities";
import { teamMembersApi, type TeamMember } from "@/lib/api/team-members";
import { orgsApi } from "@/lib/api/orgs";
import { auditsApi } from "@/lib/api/audits";

const newAuditSearchSchema = z.object({
  planId: z.string().optional(),
});

export const Route = createFileRoute("/audits/new")({
  validateSearch: (s) => newAuditSearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Create New Audit — AuditOS" },
      { name: "description", content: "Step-by-step wizard to plan, staff, and launch a new ISO internal audit." },
    ],
  }),
  component: NewAuditWizard,
});

/* ---------------- data ---------------- */

// Meta list for the "select checklist" cards
const CHECKLISTS = CHECKLIST_LIBRARY.map((c) => ({
  id: c.id, name: c.name, standard: c.standard, version: c.version, items: c.questions.length, integrated: !!c.integrated,
}));

const STEPS = [
  { key: "basics", label: "Basics", icon: FileText },
  { key: "scope", label: "Scope & Schedule", icon: CalendarRange },
  { key: "team", label: "Team", icon: Users },
  { key: "checklists", label: "Checklists", icon: ListChecks },
  { key: "approval", label: "Approval", icon: ShieldCheck },
  { key: "review", label: "Review & Launch", icon: Send },
] as const;

type StepKey = typeof STEPS[number]["key"];

/* ---------------- wizard ---------------- */

let _wizardInit = false;

function NewAuditWizard() {
  const navigate = useNavigate();
  const { planId: searchPlanId } = Route.useSearch();

  // Restore planId: URL param > sessionStorage > new
  const [planId, setPlanId] = useState(() => {
    if (typeof sessionStorage === "undefined") return nextAuditId();
    const fromUrl = searchPlanId && auditStore.getSnapshot().plans[searchPlanId] ? searchPlanId : null;
    if (fromUrl) {
      sessionStorage.setItem("audit_wizard_planId", fromUrl);
      return fromUrl;
    }
    const fromSs = sessionStorage.getItem("audit_wizard_planId");
    if (fromSs && auditStore.getSnapshot().plans[fromSs]) return fromSs;
    const fresh = nextAuditId();
    sessionStorage.setItem("audit_wizard_planId", fresh);
    return fresh;
  });
  const storedPlan = auditStore.getSnapshot().plans[planId];
  const ws = storedPlan?.wizardState;

  const [step, setStep] = useState<StepKey>(ws?.step ?? "basics");
  const [title, setTitle] = useState(ws?.title ?? "");
  const [auditType, setAuditType] = useState(ws?.auditType ?? "Internal");
  const [standardId, setStandardId] = useState(ws?.standardId ?? "");
  const [objective, setObjective] = useState(ws?.objective ?? "");
  const [scope, setScope] = useState(ws?.scope ?? "");
  const [criteria, setCriteria] = useState(ws?.criteria ?? "");
  const [departments, setDepartments] = useState<string[]>(ws?.departments ?? []);
  const [locations, setLocations] = useState<string[]>(ws?.locations ?? []);
  const [startDate, setStartDate] = useState(ws?.startDate ?? "");
  const [endDate, setEndDate] = useState(ws?.endDate ?? "");
  const [leadId, setLeadId] = useState(ws?.leadId ?? "");
  const [teamIds, setTeamIds] = useState<string[]>(ws?.teamIds ?? []);
  const [checklistIds, setChecklistIds] = useState<string[]>(ws?.checklistIds ?? []);
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistItem[]>>(ws?.checklistItems ?? {});
  const [deptAssignments, setDeptAssignments] = useState<Record<string, string[]>>(ws?.deptAssignments ?? {});
  const [approvers, setApprovers] = useState<ApprovalStage[]>(ws?.approvers ?? []);
  const [submitted, setSubmitted] = useState(ws?.submitted ?? false);

  const idx = STEPS.findIndex((s) => s.key === step);
  const standard = { id: standardId, code: standardId, name: standardId };
  const lead = { id: leadId, name: leadId, role: "", cert: [] as string[] };
  const team = teamIds.map((id) => ({ id, name: id, role: "", cert: [] as string[] }));
  const selectedChecklists: EditableChecklist[] = checklistIds.map((id) => {
    const c = CHECKLISTS.find((x) => x.id === id)!;
    return {
      id: c.id, name: c.name, standard: c.standard, version: c.version,
      items: checklistItems[id] ?? [],
    };
  });
  const totalItems = selectedChecklists.reduce((a, c) => a + c.items.length, 0);
  const department = departments.length ? departments.join(", ") : "";


  /* --------- Init draft on mount (API + localStorage) --------- */
  useEffect(() => {
    if (_wizardInit) return;
    _wizardInit = true;

    const serverId = sessionStorage.getItem("audit_wizard_serverId");
    if (serverId) {
      // Resume existing draft — fetch latest from API
      (async () => {
        try {
          const orgs = await orgsApi.list();
          if (orgs.length === 0) return;
          const audit = await auditsApi.get(orgs[0].id, serverId);
          const ws = audit.wizard_state ?? {};
          if (ws.step) setStep(ws.step);
          if (ws.title) setTitle(ws.title);
          if (ws.auditType) setAuditType(ws.auditType);
          if (ws.standardId) setStandardId(ws.standardId);
          if (ws.objective) setObjective(ws.objective);
          if (ws.scope) setScope(ws.scope);
          if (ws.criteria) setCriteria(ws.criteria);
          if (ws.departments) setDepartments(ws.departments);
          if (ws.locations) setLocations(ws.locations);
          if (ws.startDate) setStartDate(ws.startDate);
          if (ws.endDate) setEndDate(ws.endDate);
          if (ws.leadId) setLeadId(ws.leadId);
          if (ws.teamIds) setTeamIds(ws.teamIds);
          if (ws.checklistIds) setChecklistIds(ws.checklistIds);
          if (ws.checklistItems) setChecklistItems(ws.checklistItems);
          if (ws.deptAssignments) setDeptAssignments(ws.deptAssignments);
          if (ws.approvers) setApprovers(ws.approvers);
          if (ws.submitted !== undefined) setSubmitted(ws.submitted);
          // Also upsert into localStorage for fast cache
          sessionStorage.setItem("audit_wizard_serverId", audit.id);
          saveToLocal({
            serverId: audit.id,
            wizardState: ws,
            status: audit.status === "draft" ? "Draft" : audit.status,
          });
        } catch (e) {
          console.error("[audit] failed to load draft from API", e);
          toast.error("Failed to load draft from server — using local cache");
        }
      })();
      return;
    }

    // New draft — create via API
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const oid = orgs[0].id;
        const payload = {
          title: title || null,
          status: "draft",
          wizard_state: { step, title, auditType, standardId, objective, scope, criteria, departments, locations, startDate, endDate, leadId, teamIds, checklistIds, checklistItems, deptAssignments, approvers, submitted },
        };
        const created = await auditsApi.create(oid, payload);
        sessionStorage.setItem("audit_wizard_serverId", created.id);
      } catch (e) {
        console.error("[audit] failed to create draft on API", e);
        toast.error("Server unreachable — saving locally only");
      }
    })();
  }, []);

  /** Write current wizard state to both localStorage and the API */
  function saveToLocal(overrides?: Record<string, any>) {
    const named: Record<string, string[]> = {};
    for (const [d, ids] of Object.entries(deptAssignments)) {
      named[d] = ids;
    }
    auditStore.upsertPlan({
      id: planId,
      title, standard: standard.code, department, location: locations.join(", "),
      startDate, endDate, lead: lead.name, teamCount: team.length + 1,
      status: submitted ? "Pending Approval" : "Draft",
      createdAt: new Date().toISOString(),
      deptAssignments: named,
      wizardState: { step, title, auditType, standardId, objective, scope, criteria, departments, locations, startDate, endDate, leadId, teamIds, checklistIds, checklistItems, deptAssignments, approvers, submitted },
      ...overrides,
    });
  }

  /** Debounced sync to backend API */
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!_wizardInit) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      syncTimer.current = null;
      saveToLocal();
      const serverId = sessionStorage.getItem("audit_wizard_serverId");
      if (!serverId) return;
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        await auditsApi.update(orgs[0].id, serverId, {
          title: title || null,
          standard: standard.code || null,
          start_date: startDate || null,
          end_date: endDate || null,
          status: submitted ? "pending_approval" : "draft",
          wizard_state: { step, title, auditType, standardId, objective, scope, criteria, departments, locations, startDate, endDate, leadId, teamIds, checklistIds, checklistItems, deptAssignments, approvers, submitted },
        });
      } catch (e) {
        console.error("[audit] failed to sync to API", e);
        toast.error("Failed to save to server");
      }
    }, 500);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [title, standard.code, department, locations, startDate, endDate, lead.name, team.length, submitted, planId, deptAssignments, step, auditType, standardId, objective, scope, criteria, departments, leadId, teamIds, checklistIds, checklistItems, approvers]);


  /* --------- Tracking helper --------- */
  function track<T extends string>(field: string, from: T, to: T) {
    if (from === to) return;
    auditStore.logTrail(planId, { step, field, from: String(from), to: String(to) });
  }
  function trackList(field: string, from: string[], to: string[]) {
    const added = to.filter((x) => !from.includes(x));
    const removed = from.filter((x) => !to.includes(x));
    if (added.length) auditStore.logTrail(planId, { step, field, to: `+${added.join(", ")}` });
    if (removed.length) auditStore.logTrail(planId, { step, field, to: `−${removed.join(", ")}` });
  }

  const validation = useMemo(() => ({
    basics: !!title && !!standardId && !!auditType,
    scope: !!scope && departments.length >= 1 && locations.length >= 1 && !!startDate && !!endDate,
    team: !!leadId && team.length >= 1,
    checklists: selectedChecklists.length >= 1 && totalItems >= 1,
    approval: approvers.filter((a) => a.required).every((a) => !!a.who),
    review: true,
  } satisfies Record<StepKey, boolean>), [title, standardId, auditType, scope, department, locations, startDate, endDate, leadId, team.length, selectedChecklists.length, totalItems, approvers]);

  const canNext = validation[step];
  function goNext() {
    if (idx < STEPS.length - 1) {
      const next = STEPS[idx + 1].key;
      auditStore.snapshot(planId, step, `Advanced to ${next}`, {
        title, standardId, scope, department, location: locations.join(", "), startDate, endDate,
        leadId, teamIds, checklistIds, checklistItems, approvers,
      });
      setStep(next);
    }
  }
  function goPrev() { if (idx > 0) setStep(STEPS[idx - 1].key); }

  function toggleTeam(id: string) {
    setTeamIds((t) => {
      const next = t.includes(id) ? t.filter((x) => x !== id) : [...t, id];
      trackList("team_members", t, next);
      return next;
    });
  }
  function toggleChecklist(id: string) {
    setChecklistIds((t) => {
      const next = t.includes(id) ? t.filter((x) => x !== id) : [...t, id];
      trackList("checklists", t, next);
      if (!t.includes(id)) {
        const full = getChecklist(id);
        const items: ChecklistItem[] = full
          ? full.questions.map((q) => ({
              id: q.id,
              text: asQuestion(q),
              section: q.section,
              owner: "",
              clause: q.clause,
            }))
          : [];
        setChecklistItems((m) => (m[id] ? m : { ...m, [id]: items }));
      }
      return next;
    });
  }

  function updateItems(clId: string, updater: (items: ChecklistItem[]) => ChecklistItem[], note: string) {
    setChecklistItems((m) => {
      const before = m[clId] ?? [];
      const after = updater(before);
      auditStore.logTrail(planId, { step: "checklists", field: `${clId}:${note}`, to: `${after.length} items` });
      return { ...m, [clId]: after };
    });
  }

  function updateApprover(i: number, patch: Partial<ApprovalStage>, note: string) {
    setApprovers((prev) => {
      const next = prev.map((a, idx) => idx === i ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a);
      auditStore.logTrail(planId, { step: "approval", field: `${next[i].stage}:${note}`, to: JSON.stringify(patch) });
      return next;
    });
  }

  function changeApprovalStatus(i: number, status: ApprovalStatus) {
    const a = approvers[i];
    updateApprover(i, { status }, `status→${status}`);
    const emailSubject = `[${planId}] ${a.stage} — ${status}`;
    const body = `Audit "${title}" (${standard.code}) — stage "${a.stage}" is now ${status}.`;
    if (a.who) {
      auditStore.notify({ channel: "email", to: a.who, subject: emailSubject, body });
      auditStore.notify({ channel: "in-app", to: a.who, subject: emailSubject, body });
    }
    auditStore.notify({ channel: "in-app", to: "M. Chen (creator)", subject: emailSubject, body });
  }

  function submit() {
    setSubmitted(true);
    auditStore.logTrail(planId, { step: "review", field: "submitted_for_approval", to: "Pending Approval" });
    auditStore.snapshot(planId, "review", "Submitted for approval", {
      title, standardId, department, location: locations.join(", "), startDate, endDate, leadId, teamIds, checklistIds, approvers,
    });
    // Notify first required pending stage + auto-mark as Notified
    const firstIdx = approvers.findIndex((a) => a.required && a.status === "Pending");
    if (firstIdx >= 0) {
      const a = approvers[firstIdx];
      updateApprover(firstIdx, { status: "Notified" }, "status→Notified");
      auditStore.notify({
        channel: "email", to: a.who,
        subject: `Approval requested · ${planId} · ${a.stage}`,
        body: `Please review and approve audit "${title}" (${standard.code}).`,
      });
      auditStore.notify({
        channel: "in-app", to: a.who,
        subject: `Approval requested · ${planId}`,
        body: `${a.stage} — please review and approve.`,
      });
    }
  }

  return (
    <AppShell title="Create New Audit">
      {submitted ? (
        <Submitted
          planId={planId}
          title={title} standard={standard.code} startDate={startDate} endDate={endDate}
          lead={lead.name} teamCount={team.length} items={totalItems}
          approvers={approvers}
          onDashboard={() => navigate({ to: "/" })}
          onAnother={() => { setSubmitted(false); setStep("basics"); }}
          onCalendar={() => navigate({ to: "/audits/calendar" })}
        />
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Stepper */}
          <aside className="col-span-12 xl:col-span-3">
            <div className="wire-card rounded-lg p-3 xl:sticky xl:top-20">
              <Annotation>WIZARD STEPS</Annotation>
              <ol className="mt-2 space-y-1">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const active = s.key === step;
                    const done = i < idx;
                    const missing = done && !validation[s.key];
                    return (
                      <li key={s.key}>
                        <button
                          onClick={() => setStep(s.key)}
                          className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left text-sm ${active ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                          <span className={`h-6 w-6 grid place-items-center rounded-full text-[11px] border ${
                            active ? "border-background" :
                            missing ? "bg-destructive text-destructive-foreground border-destructive" :
                            done ? "bg-foreground text-background border-foreground" :
                            "border-border bg-card"
                          }`}>
                            {missing ? <X className="h-3 w-3" /> : done ? <Check className="h-3 w-3" /> : i + 1}
                          </span>
                          <Icon className="h-4 w-4 opacity-70" />
                          <span className="flex-1 truncate">{s.label}</span>
                          {validation[s.key] ? null : <span className="annotation opacity-70">REQ</span>}
                        </button>
                      </li>
                    );
                  })}
              </ol>
              <div className="border-t border-border mt-3 pt-3 space-y-1.5 text-xs">
                <Row k="Ref." v={planId} />
                <Row k="Audit" v={title} />
                <Row k="Standard" v={standard.code} />
                <Row k="Depts." v={departments.length ? `${departments.length} · ${department}` : "—"} />
                <Row k="Dates" v={`${startDate} → ${endDate}`} />
                <Row k="Lead" v={lead.name} />
                <Row k="Team" v={`${team.length} member${team.length !== 1 ? "s" : ""}`} />
                <Row k="Checklists" v={`${selectedChecklists.length} · ${totalItems} items`} />
              </div>
              <div className="border-t border-border mt-3 pt-3">
                <div className="annotation flex items-center gap-1.5"><Bell className="h-3 w-3" /> AUTO-PUBLISHED</div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Draft <span className="text-foreground">{planId}</span> is already visible on the Audit Calendar.
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="col-span-12 xl:col-span-9 space-y-4">
            {step === "basics" && (
              <BasicsStep
                title={title} setTitle={(v) => { track("title", title, v); setTitle(v); }}
                auditType={auditType} setAuditType={(v) => { track("audit_type", auditType, v); setAuditType(v); }}
                standardId={standardId} setStandardId={(v) => { track("standard", standardId, v); setStandardId(v); }}
                objective={objective} setObjective={(v) => { track("objective", objective, v); setObjective(v); }}
              />
            )}
            {step === "scope" && (
              <ScopeStep
                scope={scope} setScope={(v) => { track("scope", scope, v); setScope(v); }}
                criteria={criteria} setCriteria={(v) => { track("criteria", criteria, v); setCriteria(v); }}
                departments={departments} setDepartments={(v) => {
                  trackList("departments", departments, v);
                  setDepartments(v);
                  // Prune assignments for removed depts; seed new depts empty
                  setDeptAssignments((prev) => {
                    const next: Record<string, string[]> = {};
                    v.forEach((d) => { next[d] = prev[d] ?? []; });
                    return next;
                  });
                }}
                locations={locations} setLocations={(v) => { trackList("locations", locations, v); setLocations(v); }}
                startDate={startDate} setStartDate={(v) => { track("start_date", startDate, v); setStartDate(v); }}
                endDate={endDate} setEndDate={(v) => { track("end_date", endDate, v); setEndDate(v); }}
                deptAssignments={deptAssignments}
                setDeptAssignments={(next) => {
                  auditStore.logTrail(planId, { step: "scope", field: "dept_assignments", to: JSON.stringify(Object.fromEntries(Object.entries(next).map(([d, ids]) => [d, ids.length]))) });
                  setDeptAssignments(next);
                }}
              />
            )}

            {step === "team" && (
              <TeamStep
                leadId={leadId}
                setLeadId={(v) => { track("lead_auditor", leadId, v); setLeadId(v); }}
                teamIds={teamIds} toggleTeam={toggleTeam}
                standard={standard.code}
              />
            )}
            {step === "checklists" && (
              <ChecklistsStep
                selected={checklistIds} toggle={toggleChecklist}
                standard={standard.code}
                selectedChecklists={selectedChecklists}
                updateItems={updateItems}
              />
            )}
            {step === "approval" && (
              <ApprovalStep
                approvers={approvers}
                updateApprover={updateApprover}
                changeStatus={changeApprovalStatus}
                addStage={() => {
                  setApprovers([...approvers, { stage: "Additional Approver", role: "Custom", who: "", required: false, status: "Pending" }]);
                  auditStore.logTrail(planId, { step: "approval", field: "stage_added", to: "Additional Approver" });
                }}
                removeStage={(i) => {
                  const removed = approvers[i];
                  setApprovers(approvers.filter((_, x) => x !== i));
                  auditStore.logTrail(planId, { step: "approval", field: "stage_removed", to: removed.stage });
                }}
              />
            )}
            {step === "review" && (
              <ReviewStep
                title={title} standard={standard.code} objective={objective} scope={scope} criteria={criteria}
                department={department} location={locations.join(", ")} startDate={startDate} endDate={endDate}
                lead={lead} team={team} checklists={selectedChecklists} approvers={approvers}
              />
            )}

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button onClick={goPrev} disabled={idx === 0}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-muted">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="text-xs text-muted-foreground">Step {idx + 1} of {STEPS.length}</div>
              {idx < STEPS.length - 1 ? (
                <button onClick={goNext} disabled={!canNext}
                  className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-40">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={submit}
                  className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-foreground text-background text-sm font-medium">
                  Submit for Approval <Send className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* History & Trail */}
            <HistoryPanel planId={planId} />
          </section>
        </div>
      )}
    </AppShell>
  );
}

/* ---------------- shared ---------------- */

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="annotation w-16 shrink-0">{k}</span>
      <span className="flex-1 truncate text-foreground">{v}</span>
    </div>
  );
}

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="annotation">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputCls = "h-9 px-2 rounded-md border border-input bg-muted text-xs outline-none focus:border-ring";
const selectCls = "h-9 px-2 rounded-md border border-input bg-muted text-xs text-foreground outline-none focus:border-ring";
const areaCls = "min-h-[90px] w-full p-2 rounded-md border border-input bg-muted/30 text-sm outline-none focus:border-ring";

/* ---------------- step components ---------------- */

function BasicsStep(p: {
  title: string; setTitle: (v: string) => void;
  auditType: string; setAuditType: (v: string) => void;
  standardId: string; setStandardId: (v: string) => void;
  objective: string; setObjective: (v: string) => void;
}) {
  const [options, setOptions] = useState<any[] | undefined>(undefined);
  const storeStds = useAuditStore((s) => Object.values(s.collections.standards ?? {}));
  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const remote = await entitiesApi.list(orgs[0].id, "standards").catch(() => []);
        if (remote.length > 0) {
          for (const s of remote) {
            if (!auditStore.get("standards", s.id)) {
              auditStore.create("standards", { ...s, id: s.id }, "", true);
            }
          }
        }
      } catch {}
      const all = auditStore.list("standards");
      const active = all.filter((s: any) => s.status === "Active");
      if (active.length > 0) {
        setOptions(active);
      } else if (all.length === 0) {
        const defaults = [
          { code: "ISO 9001:2015", title: "Quality Management Systems", status: "Active" },
          { code: "ISO 14001:2015", title: "Environmental Management Systems", status: "Active" },
          { code: "ISO 45001:2018", title: "Occupational Health & Safety Management Systems", status: "Active" },
          { code: "ISO/IEC 27001:2022", title: "Information Security Management Systems", status: "Active" },
          { code: "ISO 22301:2019", title: "Security & Resilience — Business Continuity", status: "Active" },
          { code: "ISO 50001:2018", title: "Energy Management Systems", status: "Active" },
        ];
        for (const d of defaults) auditStore.create("standards", d, "STD", true);
        setOptions(defaults);
      } else {
        // All standards exist but none are Active
        setOptions([]);
      }
    })();
  }, []);
  const activeStandards = options ?? storeStds.filter((s: any) => s.status === "Active");
  return (
    <WCard title="Audit Basics" hint="Identify the audit and its objective">
      <div className="grid grid-cols-12 gap-3">
        <Field label="Audit Title*" className="col-span-12">
          <input className={inputCls} value={p.title} onChange={(e) => p.setTitle(e.target.value)} />
        </Field>
        <div className="col-span-12 grid grid-cols-2 gap-3">
          <Field label="Audit Type*">
            <select className={selectCls} value={p.auditType} onChange={(e) => p.setAuditType(e.target.value)}>
              {["Internal", "Supplier", "Surveillance", "Certification", "Follow-up", "Process"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="ISO Standard*" hint="Select an active ISO standard">
            {activeStandards.length === 0 ? (
              <div className="h-9 px-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center text-[11px] text-amber-600 dark:text-amber-400">
                No active standards. Activate one in Settings &gt; Standards first.
              </div>
            ) : (
              <select className={selectCls} value={p.standardId} onChange={(e) => p.setStandardId(e.target.value)}>
                <option value="">— Select Standard —</option>
                {activeStandards.map((s: any) => <option key={s.code} value={s.code}>{s.code} — {s.title}</option>)}
              </select>
            )}
          </Field>
        </div>
        <Field label="Audit Objective*" className="col-span-12" hint="What this audit is intended to verify or assess">
          <textarea className={areaCls} value={p.objective} onChange={(e) => p.setObjective(e.target.value)} />
        </Field>
      </div>
    </WCard>
  );
}

function ScopeStep(p: {
  scope: string; setScope: (v: string) => void;
  criteria: string; setCriteria: (v: string) => void;
  departments: string[]; setDepartments: (v: string[]) => void;
  locations: string[]; setLocations: (v: string[]) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  deptAssignments: Record<string, string[]>;
  setDeptAssignments: (next: Record<string, string[]>) => void;
}) {
  const [auditors, setAuditors] = useState<TeamMember[]>([]);
  const [auditorsLoading, setAuditorsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const data = await teamMembersApi.list(orgs[0].id);
        setAuditors(data.filter((m) => m.status === "Active"));
      } catch {} finally { setAuditorsLoading(false); }
    })();
  }, []);
  const storedDepts = useAuditStore((s) => Object.values(s.collections.departments ?? {}));
  const storedLocations = useAuditStore((s) => Object.values(s.collections.locations ?? {}));
  const availableDepts = storedDepts.map((d) => d.name || "").filter(Boolean);
  const availableLocations = storedLocations.map((l: any) => l.name || "").filter(Boolean);
  function toggleDept(d: string) {
    const next = p.departments.includes(d) ? p.departments.filter((x) => x !== d) : [...p.departments, d];
    p.setDepartments(next);
  }
  function toggleLoc(l: string) {
    const next = p.locations.includes(l) ? p.locations.filter((x) => x !== l) : [...p.locations, l];
    p.setLocations(next);
  }
  function selectAll() { p.setDepartments(availableDepts); }
  function clearAll() { p.setDepartments([]); }
  function toggleAuditor(dept: string, uid: string) {
    const cur = p.deptAssignments[dept] ?? [];
    const nextIds = cur.includes(uid) ? cur.filter((x) => x !== uid) : [...cur, uid];
    p.setDeptAssignments({ ...p.deptAssignments, [dept]: nextIds });
  }
  return (
    <>
      <WCard title="Scope & Criteria">
        <div className="grid gap-3">
          <Field label="Audit Scope*">
            <textarea className={areaCls} value={p.scope} onChange={(e) => p.setScope(e.target.value)} />
          </Field>
          <Field label="Audit Criteria*" hint="Standards, manuals, regulations, contracts">
            <textarea className={areaCls} value={p.criteria} onChange={(e) => p.setCriteria(e.target.value)} />
          </Field>
        </div>
      </WCard>
      <WCard
        title="Departments in Scope*"
        hint="Select one or more departments — the same audit will cover each."
        actions={
          <div className="flex gap-1">
            <WBadge tone="strong">{p.departments.length} selected</WBadge>
            <button onClick={selectAll} className="h-6 px-2 rounded border border-border text-[11px] hover:bg-muted">All</button>
            <button onClick={clearAll} className="h-6 px-2 rounded border border-border text-[11px] hover:bg-muted">Clear</button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          {availableDepts.map((d) => (
            <button key={d} type="button" onClick={() => toggleDept(d)}
              className={`h-7 px-2.5 rounded text-xs font-medium border transition-all ${
                p.departments.includes(d)
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}>
              {d}
            </button>
          ))}
        </div>
        {p.departments.length === 0 && (
          <div className="annotation mt-2 text-destructive/80">↳ Select at least one department to continue.</div>
        )}
      </WCard>

      {p.departments.length > 0 && (
        <WCard title="Assign Auditors per Department"
          hint="Each department can be audited by one or more assigned auditors."
          actions={<WBadge tone="outline">{Object.values(p.deptAssignments).reduce((a, ids) => a + ids.length, 0)} assignments</WBadge>}>
          {auditorsLoading ? (
            <div className="h-9 px-2 rounded-md border border-input bg-muted/30 flex items-center text-xs text-muted-foreground">Loading team members...</div>
          ) : auditors.length === 0 ? (
            <div className="h-9 px-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center text-[11px] text-amber-600 dark:text-amber-400">
              No active team members. Create users in Users first.
            </div>
          ) : (
            <div className="space-y-3">
              {p.departments.map((d) => {
                const assigned = p.deptAssignments[d] ?? [];
                return (
                  <div key={d} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{d}</div>
                      <WBadge tone={assigned.length ? "strong" : "outline"}>
                        {assigned.length ? `${assigned.length} auditor${assigned.length > 1 ? "s" : ""}` : "Unassigned"}
                      </WBadge>
                    </div>
                    <div className="max-h-32 overflow-y-auto rounded border border-border bg-muted/20 p-1.5 space-y-0.5">
                      {auditors.map((a) => {
                        const sel = assigned.includes(a.name);
                        return (
                          <label key={a.id} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs hover:bg-muted/80 ${sel ? "bg-primary/10" : ""}`}>
                            <input type="checkbox" checked={sel} onChange={() => toggleAuditor(d, a.name)} className="accent-primary" />
                            {a.name} <span className="text-muted-foreground">({a.email})</span>
                          </label>
                        );
                      })}
                    </div>
                    {assigned.length === 0 && (
                      <div className="annotation mt-2 opacity-70">↳ Optional — assign at least one auditor for accountability.</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </WCard>
      )}

      <WCard title="Where & When"
        hint="Select one or more locations"
        actions={<WBadge tone="strong">{p.locations.length} selected</WBadge>}>
        <div className="flex flex-wrap gap-2 mb-3">
          {availableLocations.length === 0 ? (
            <div className="h-9 px-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center text-[11px] text-amber-600 dark:text-amber-400">
              No locations yet. Create one in Organization &gt; Locations first.
            </div>
          ) : (
            availableLocations.map((l: string) => (
              <button key={l} type="button" onClick={() => toggleLoc(l)}
                className={`h-7 px-2.5 rounded text-xs font-medium border transition-all ${
                  p.locations.includes(l)
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}>
                {l}
              </button>
            ))
          )}
        </div>
        {p.locations.length === 0 && (
          <div className="annotation text-destructive/80 mb-3">↳ Select at least one location to continue.</div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date*">
            <input type="date" className={inputCls} value={p.startDate} onChange={(e) => p.setStartDate(e.target.value)} />
          </Field>
          <Field label="End Date*">
            <input type="date" className={inputCls} value={p.endDate} onChange={(e) => p.setEndDate(e.target.value)} />
          </Field>
        </div>
      </WCard>
    </>
  );
}



function TeamStep(p: { leadId: string; setLeadId: (v: string) => void; teamIds: string[]; toggleTeam: (id: string) => void; standard: string }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const data = await teamMembersApi.list(orgs[0].id);
        setMembers(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const activeMembers = members.filter((m) => m.status === "Active");
  return (
    <WCard title="Assign Audit Team" hint="Select team members from the organization">
      <div className="space-y-3">
        <Field label="Lead Auditor*">
          {loading ? (
            <div className="h-9 px-2 rounded-md border border-input bg-muted/30 flex items-center text-xs text-muted-foreground">Loading team members...</div>
          ) : activeMembers.length === 0 ? (
            <div className="h-9 px-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center text-[11px] text-amber-600 dark:text-amber-400">
              No active team members. Create users in Users first.
            </div>
          ) : (
            <select className={selectCls} value={p.leadId} onChange={(e) => p.setLeadId(e.target.value)}>
              <option value="">— Select Lead Auditor —</option>
              {activeMembers.map((m) => <option key={m.id} value={m.name}>{m.name} ({m.email})</option>)}
            </select>
          )}
        </Field>
        <Field label="Team Members*">
          {loading ? (
            <div className="h-9 px-2 rounded-md border border-input bg-muted/30 flex items-center text-xs text-muted-foreground">Loading team members...</div>
          ) : activeMembers.length === 0 ? (
            <div className="h-9 px-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center text-[11px] text-amber-600 dark:text-amber-400">
              No active team members. Create users in Users first.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto rounded-md border border-input bg-muted p-2 space-y-1">
              {activeMembers.filter((m) => m.name !== p.leadId).map((m) => {
                const selected = p.teamIds.includes(m.name);
                return (
                  <label key={m.id} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs hover:bg-muted/80 ${selected ? "bg-primary/10" : ""}`}>
                    <input type="checkbox" checked={selected} onChange={() => p.toggleTeam(m.name)} className="accent-primary" />
                    {m.name} <span className="text-muted-foreground">({m.email})</span>
                  </label>
                );
              })}
            </div>
          )}
        </Field>
      </div>
      <div className="annotation pt-3">↳ {activeMembers.length} active team member{activeMembers.length !== 1 ? "s" : ""} in the organization.</div>
    </WCard>
  );
}

/* ---------------- checklists ---------------- */

function ChecklistsStep(p: {
  selected: string[]; toggle: (id: string) => void; standard: string;
  selectedChecklists: EditableChecklist[];
  updateItems: (clId: string, updater: (items: ChecklistItem[]) => ChecklistItem[], note: string) => void;
}) {
  const recIds = new Set(recommendedFor(p.standard).map((c) => c.id));
  const recommended = CHECKLISTS.filter((c) => recIds.has(c.id));
  const others = CHECKLISTS.filter((c) => !recIds.has(c.id));

  const total = p.selectedChecklists.reduce((a, c) => a + c.items.length, 0);

  return (
    <>
      <WCard title="Select Audit Checklists" hint={`Filtered by standard · ${p.standard}`}
        actions={<WBadge tone="strong">{p.selected.length} selected · {total} items</WBadge>}>
        <Annotation>RECOMMENDED FOR THIS STANDARD</Annotation>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {recommended.map((c) => <ChecklistCard key={c.id} c={c} on={p.selected.includes(c.id)} toggle={() => p.toggle(c.id)} recommended />)}
        </div>
        <Annotation>OTHER LIBRARY CHECKLISTS</Annotation>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {others.map((c) => <ChecklistCard key={c.id} c={c} on={p.selected.includes(c.id)} toggle={() => p.toggle(c.id)} />)}
        </div>
      </WCard>

      {p.selectedChecklists.map((cl) => (
        <ChecklistEditor key={cl.id} cl={cl}
          onChange={(updater, note) => p.updateItems(cl.id, updater, note)} />
      ))}

      {p.selectedChecklists.length === 0 && (
        <WCard title="No checklists selected"><div className="text-xs text-muted-foreground">Pick at least one checklist to edit items and assign owners.</div></WCard>
      )}
    </>
  );
}

function ChecklistCard({ c, on, toggle, recommended }: { c: typeof CHECKLISTS[number]; on: boolean; toggle: () => void; recommended?: boolean }) {
  return (
    <button onClick={toggle}
      className={`text-left rounded-md border p-3 transition-colors ${on ? "border-foreground bg-muted" : "border-border hover:bg-muted/40"}`}>
      <div className="flex items-start gap-2">
        <div className={`h-4 w-4 mt-0.5 rounded border grid place-items-center ${on ? "bg-foreground border-foreground text-background" : "border-border"}`}>
          {on && <Check className="h-3 w-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-medium truncate">{c.name}</div>
            {c.integrated && <WBadge tone="strong">INTEGRATED</WBadge>}
            {recommended && <WBadge tone="strong">REC</WBadge>}
          </div>
          <div className="annotation mt-1">{c.standard} · {c.items} items · {c.version}</div>

        </div>
      </div>
    </button>
  );
}

function ChecklistEditor({ cl, onChange }: {
  cl: EditableChecklist;
  onChange: (updater: (items: ChecklistItem[]) => ChecklistItem[], note: string) => void;
}) {
  function addItem() {
    onChange((items) => [...items, {
      id: `i_${Date.now()}`, text: "New checklist item", section: "Unassigned", owner: "",
    }], "added");
  }
  function update(id: string, patch: Partial<ChecklistItem>) {
    onChange((items) => items.map((it) => it.id === id ? { ...it, ...patch } : it), `edited:${Object.keys(patch).join(",")}`);
  }
  function remove(id: string) {
    onChange((items) => items.filter((it) => it.id !== id), "removed");
  }
  return (
    <WCard
      title={`Edit · ${cl.name}`}
      hint={`${cl.standard} · ${cl.version}`}
      actions={<WBadge tone="outline">{cl.items.length} items</WBadge>}
    >
      <div className="grid grid-cols-12 text-[11px] annotation border-b border-border pb-2">
        <div className="col-span-1">#</div>
        <div className="col-span-5">ITEM</div>
        <div className="col-span-3">SECTION</div>
        <div className="col-span-2">OWNER</div>
        <div className="col-span-1"></div>
      </div>
      <ul className="divide-y divide-dashed divide-border">
        {cl.items.map((it, i) => (
          <li key={it.id} className="grid grid-cols-12 items-center gap-2 py-2 text-xs">
            <div className="col-span-1 text-muted-foreground">{i + 1}</div>
            <div className="col-span-5">
              <input value={it.text} onChange={(e) => update(it.id, { text: e.target.value })}
                className="w-full h-8 px-2 rounded border border-input bg-muted/30" />
              {it.clause && <div className="annotation mt-0.5">Clause {it.clause}</div>}
            </div>
            <div className="col-span-3">
              <input value={it.section} onChange={(e) => update(it.id, { section: e.target.value })}
                className="w-full h-8 px-2 rounded border border-input bg-muted/30" />
            </div>
            <div className="col-span-2">
              <input value={it.owner} onChange={(e) => update(it.id, { owner: e.target.value })}
                className="w-full h-8 px-2 rounded border border-input bg-muted/30" placeholder="Owner ID" />
            </div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => remove(it.id)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={addItem} className="mt-3 w-full h-9 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted inline-flex items-center justify-center gap-1.5">
        <Plus className="h-4 w-4" /> Add checklist item
      </button>
    </WCard>
  );
}

/* ---------------- approval ---------------- */

const STATUS_FLOW: ApprovalStatus[] = ["Pending", "Notified", "In Review", "Approved", "Rejected"];

function ApprovalStep({ approvers, updateApprover, changeStatus, addStage, removeStage }: {
  approvers: ApprovalStage[];
  updateApprover: (i: number, patch: Partial<ApprovalStage>, note: string) => void;
  changeStatus: (i: number, s: ApprovalStatus) => void;
  addStage: () => void;
  removeStage: (i: number) => void;
}) {
  return (
    <WCard title="Approval Workflow" hint="Sequential — status changes trigger email + in-app notifications"
      actions={<WBadge tone="outline"><Mail className="h-3 w-3 inline mr-1" />Notifications on</WBadge>}>
      <ol className="space-y-3">
        {approvers.map((a, i) => (
          <li key={i} className="rounded-md border border-border p-3">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full border border-border grid place-items-center text-xs font-semibold shrink-0">{i + 1}</div>
              <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                <div className="col-span-12 md:col-span-4">
                  <Annotation>STAGE</Annotation>
                  <div className="text-sm font-medium">{a.stage}</div>
                  <div className="text-[11px] text-muted-foreground">{a.role}</div>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <Annotation>APPROVER</Annotation>
                  <input className={inputCls + " w-full"} value={a.who}
                    onChange={(e) => updateApprover(i, { who: e.target.value }, "who")}
                    placeholder="Assign approver…" />
                </div>
                <div className="col-span-12 md:col-span-3 flex items-center gap-2 justify-end">
                  <WBadge tone={a.required ? "strong" : "outline"}>{a.required ? "Required" : "Optional"}</WBadge>
                  {!a.required && (
                    <button onClick={() => removeStage(i)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <ApprovalStatusBar status={a.status} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="annotation">SET STATUS:</span>
              {STATUS_FLOW.map((s) => (
                <button key={s} onClick={() => changeStatus(i, s)}
                  className={`h-7 px-2 rounded border text-[11px] ${a.status === s ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
                  {s}
                </button>
              ))}
              {a.updatedAt && <span className="annotation ml-auto">Updated {new Date(a.updatedAt).toLocaleTimeString()}</span>}
            </div>
          </li>
        ))}
      </ol>
      <button onClick={addStage} className="mt-3 w-full h-9 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted inline-flex items-center justify-center gap-1.5">
        <Plus className="h-4 w-4" /> Add approval stage
      </button>
      <div className="annotation pt-3 flex items-center gap-1.5"><Bell className="h-3 w-3" /> Every status change pushes an email to the approver and an in-app notice to the creator.</div>
    </WCard>
  );
}

function ApprovalStatusBar({ status }: { status: ApprovalStatus }) {
  const order: ApprovalStatus[] = ["Pending", "Notified", "In Review", "Approved"];
  const reached = status === "Rejected" ? -1 : order.indexOf(status);
  return (
    <div className="mt-3 grid grid-cols-4 gap-1">
      {order.map((s, i) => (
        <div key={s} className="space-y-1">
          <div className={`h-1 rounded ${
            status === "Rejected" ? "bg-muted" : i <= reached ? "bg-foreground" : "bg-muted"
          }`} />
          <div className="annotation">{s}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- review ---------------- */

function ReviewStep(p: {
  title: string; standard: string; objective: string; scope: string; criteria: string;
  department: string; location: string; startDate: string; endDate: string;
  lead: { id: string; name: string; role: string; cert: string[] }; team: { id: string; name: string; role: string; cert: string[] }[];
  checklists: EditableChecklist[];
  approvers: ApprovalStage[];
}) {
  const totalItems = p.checklists.reduce((a, c) => a + c.items.length, 0);
  return (
    <>
      <WCard title="Audit Plan Summary" hint="Verify details before submitting for approval"
        actions={<><WBadge tone="outline">Export PDF</WBadge><WBadge tone="outline">Save Draft</WBadge></>}>
        <div className="grid grid-cols-12 gap-4 text-xs">
          <Block className="col-span-12" label="Title">{p.title}</Block>
          <Block className="col-span-6" label="Standard">{p.standard}</Block>
          <Block className="col-span-6" label="Department · Location">{p.department} · {p.location}</Block>
          <Block className="col-span-12" label="Objective">{p.objective}</Block>
          <Block className="col-span-6" label="Scope">{p.scope}</Block>
          <Block className="col-span-6" label="Criteria">{p.criteria}</Block>
          <Block className="col-span-4" label="Start">{p.startDate}</Block>
          <Block className="col-span-4" label="End">{p.endDate}</Block>
          <Block className="col-span-4" label="Lead Auditor">{p.lead.name} · {p.lead.role}</Block>
        </div>
      </WCard>

      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 md:col-span-6" title={`Team · ${p.team.length} member${p.team.length !== 1 ? "s" : ""}`}>
          <ul className="space-y-2">
            {[p.lead, ...p.team.filter((t) => t.id !== p.lead.id)].map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-xs">
                <div className="h-7 w-7 rounded-full wire-box shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{u.name} {u.id === p.lead.id && <WBadge tone="strong">LEAD</WBadge>}</div>
                  <Annotation>{u.role}</Annotation>
                </div>
                <div className="flex flex-wrap gap-1">
                  {u.cert.map((c) => <WBadge key={c} tone="outline">{c}</WBadge>)}
                </div>
              </li>
            ))}
          </ul>
        </WCard>

        <WCard className="col-span-12 md:col-span-6" title={`Checklists · ${p.checklists.length} · ${totalItems} items`}>
          <ul className="space-y-2">
            {p.checklists.map((c) => (
              <li key={c.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <Annotation>{c.standard} · {c.items.length} items · {c.version}</Annotation>
                  </div>
                </div>
                <ul className="ml-6 mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                  {c.items.slice(0, 4).map((it) => (
                    <li key={it.id} className="truncate">· {it.text} <span className="opacity-70">({it.owner})</span></li>
                  ))}
                  {c.items.length > 4 && <li className="opacity-70">+ {c.items.length - 4} more</li>}
                </ul>
              </li>
            ))}
          </ul>
        </WCard>
      </div>

      <WCard title="Approval Routing">
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {p.approvers.map((a, i) => (
            <li key={i} className="rounded-md border border-border p-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full border border-border grid place-items-center text-[11px]">{i + 1}</div>
                <span className="font-medium truncate">{a.stage}</span>
              </div>
              <Annotation>APPROVER</Annotation>
              <div className="text-foreground">{a.who || "—"}</div>
              <div className="mt-2 flex items-center gap-1">
                <WBadge tone={a.required ? "strong" : "outline"}>{a.required ? "Required" : "Optional"}</WBadge>
                <WBadge tone="outline">{a.status}</WBadge>
              </div>
            </li>
          ))}
        </ol>
      </WCard>
    </>
  );
}

function Block({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-border p-3 bg-muted/20 ${className}`}>
      <Annotation>{label}</Annotation>
      <div className="text-foreground text-xs mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

/* ---------------- history & trail ---------------- */

function HistoryPanel({ planId }: { planId: string }) {
  const versions = useAuditStore((s) => s.versions[planId] ?? []);
  const trail = useAuditStore((s) => s.trail[planId] ?? []);
  const notifications = useAuditStore((s) => s.notifications);
  const [tab, setTab] = useState<"trail" | "versions" | "notifications">("trail");

  return (
    <WCard
      title="Audit Trail & Version History"
      hint="Every wizard change is captured automatically"
      actions={
        <div className="flex gap-1">
          <TabBtn active={tab === "trail"} onClick={() => setTab("trail")}><History className="h-3 w-3" /> Trail ({trail.length})</TabBtn>
          <TabBtn active={tab === "versions"} onClick={() => setTab("versions")}>Versions ({versions.length})</TabBtn>
          <TabBtn active={tab === "notifications"} onClick={() => setTab("notifications")}><Bell className="h-3 w-3" /> Notifications ({notifications.length})</TabBtn>
        </div>
      }
    >
      {tab === "trail" && (
        <ul className="divide-y divide-dashed divide-border text-xs max-h-72 overflow-auto">
          {trail.length === 0 && <li className="py-3 text-muted-foreground">No changes recorded yet.</li>}
          {[...trail].reverse().map((e, i) => (
            <li key={i} className="py-2 grid grid-cols-12 gap-2">
              <span className="col-span-3 annotation truncate">{new Date(e.ts).toLocaleTimeString()} · {e.step}</span>
              <span className="col-span-2 text-foreground truncate">{e.actor}</span>
              <span className="col-span-3 truncate"><Pencil className="h-3 w-3 inline opacity-50 mr-1" />{e.field}</span>
              <span className="col-span-4 text-muted-foreground truncate">
                {e.from !== undefined && <span className="line-through opacity-60 mr-1">{e.from}</span>}
                {e.to ?? e.note}
              </span>
            </li>
          ))}
        </ul>
      )}
      {tab === "versions" && (
        <ul className="divide-y divide-dashed divide-border text-xs max-h-72 overflow-auto">
          {versions.length === 0 && <li className="py-3 text-muted-foreground">No snapshots yet.</li>}
          {[...versions].reverse().map((v) => (
            <li key={v.v} className="py-2 grid grid-cols-12 gap-2 items-center">
              <span className="col-span-1"><WBadge tone="strong">v{v.v}</WBadge></span>
              <span className="col-span-3 annotation truncate">{new Date(v.ts).toLocaleString()}</span>
              <span className="col-span-2 truncate">{v.actor}</span>
              <span className="col-span-3 truncate">{v.step}</span>
              <span className="col-span-3 text-muted-foreground truncate">{v.note}</span>
            </li>
          ))}
        </ul>
      )}
      {tab === "notifications" && (
        <ul className="divide-y divide-dashed divide-border text-xs max-h-72 overflow-auto">
          {notifications.length === 0 && <li className="py-3 text-muted-foreground">No notifications yet.</li>}
          {notifications.map((n) => (
            <li key={n.id} className="py-2 grid grid-cols-12 gap-2 items-center">
              <span className="col-span-1">
                {n.channel === "email" ? <Mail className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
              </span>
              <span className="col-span-2 annotation truncate">{new Date(n.ts).toLocaleTimeString()}</span>
              <span className="col-span-3 truncate">{n.to}</span>
              <span className="col-span-6 truncate text-muted-foreground">{n.subject}</span>
            </li>
          ))}
        </ul>
      )}
    </WCard>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`h-7 px-2 rounded-md border text-[11px] inline-flex items-center gap-1 ${active ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
      {children}
    </button>
  );
}

/* ---------------- submitted ---------------- */

function Submitted({ planId, title, standard, startDate, endDate, lead, teamCount, items, approvers, onDashboard, onAnother, onCalendar }: {
  planId: string;
  title: string; standard: string; startDate: string; endDate: string; lead: string; teamCount: number; items: number;
  approvers: ApprovalStage[];
  onDashboard: () => void; onAnother: () => void; onCalendar: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto wire-card rounded-lg p-8 text-center space-y-5">
      <div className="mx-auto h-12 w-12 rounded-full bg-foreground text-background grid place-items-center">
        <Check className="h-6 w-6" />
      </div>
      <div>
        <Annotation>STATUS · PENDING APPROVAL</Annotation>
        <h2 className="text-xl font-semibold mt-1">Audit submitted for approval</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          <span className="font-medium text-foreground">{title}</span> is on the Audit Calendar and routed through the approval workflow. Approvers have been notified by email and in-app.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
        <Mini label="Reference" value={planId} />
        <Mini label="Standard" value={standard} />
        <Mini label="Dates" value={`${startDate} → ${endDate}`} />
        <Mini label="Lead" value={lead} />
        <Mini label="Team" value={`${teamCount + 1} members`} />
        <Mini label="Checklist Items" value={String(items)} />
        <Mini label="Stage" value={approvers.find((a) => a.status === "Notified")?.stage ?? approvers[1]?.stage ?? "—"} />
        <Mini label="ETA" value="2 business days" />
      </div>

      <div className="rounded-md border border-border p-4 text-left">
        <Annotation>APPROVAL TRACKER</Annotation>
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
          {approvers.slice(0, 4).map((a) => (
            <div key={a.stage}>
              <div className={`h-1.5 rounded ${
                a.status === "Approved" ? "bg-foreground" :
                a.status === "In Review" || a.status === "Notified" ? "bg-foreground/50" :
                a.status === "Rejected" ? "bg-foreground/20" : "bg-muted"
              }`} />
              <div className="annotation mt-1 truncate">{a.stage}</div>
              <div className="text-[11px] mt-0.5">{a.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button onClick={onAnother} className="h-9 px-4 rounded-md border border-border text-sm">Create Another</button>
        <button onClick={onCalendar} className="h-9 px-4 rounded-md border border-border text-sm">View on Calendar</button>
        <button onClick={onDashboard} className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-medium">Go to Dashboard</button>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <Annotation>{label}</Annotation>
      <div className="text-sm font-medium mt-1 truncate">{value}</div>
    </div>
  );
}
