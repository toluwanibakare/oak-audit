import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight, CheckCircle2, Circle, Lock, Clock, AlertTriangle, Bell, Users,
  ClipboardList, CalendarDays, Smartphone, FileWarning, Wrench, ShieldCheck,
  FileCheck, LineChart, Plus, X, Trash2, Download, Play, ThumbsUp, ThumbsDown,
  MessageSquare, Shield, ChevronRight,
} from "lucide-react";
import {
  workflow, useWorkflow, useProgramme, can,
} from "@/lib/workflow/store";
import { STAGE_ORDER } from "@/lib/workflow/config";
import type {
  AuditProgramme, AuditType, Standard, StageId, StageStatus, Role,
  FindingCategory, ChecklistQuestion, QuestionType, RiskPriority,
} from "@/lib/workflow/types";

export const Route = createFileRoute("/workflow")({
  head: () => ({
    meta: [
      { title: "Workflow Engine — OakAudix" },
      { name: "description", content: "State-driven audit workflow with approvals, RBAC, notifications and analytics." },
    ],
  }),
  component: WorkflowPage,
});

const AUDIT_TYPES: AuditType[] = ["Internal","Supplier","HSE","Quality","Environmental","Information Security","Integrated","Operational","Compliance","Regulatory"];
const STANDARDS: Standard[] = ["ISO 9001","ISO 14001","ISO 45001","ISO 27001","ISO 37301","ISO 19011","Custom Standard"];
const RISKS: RiskPriority[] = ["Low","Medium","High","Critical"];

const STAGE_ICON: Record<StageId, typeof ClipboardList> = {
  programme: ClipboardList, scheduling: CalendarDays, checklist: FileCheck,
  inspection: Smartphone, findings: FileWarning, capa: Wrench,
  verification: ShieldCheck, closure: CheckCircle2, history: LineChart,
};

function statusTone(s: StageStatus) {
  switch (s) {
    case "Approved": case "Completed": return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "Pending Approval": return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "In Progress": case "Scheduled": return "bg-sky-500/15 text-sky-700 border-sky-500/30";
    case "Rejected": case "Cancelled": return "bg-rose-500/15 text-rose-700 border-rose-500/30";
    case "Locked": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    default: return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  }
}

function WorkflowPage() {
  const programmes = useWorkflow(s => s.programmes);
  const role = useWorkflow(s => s.role);
  const [selected, setSelected] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="container-page py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Workflow Engine</p>
            <h1 className="text-2xl font-bold text-slate-900">Enterprise audit workflow</h1>
            <p className="text-sm text-slate-600">State-driven lifecycle · role: <strong>{role}</strong></p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">Dashboard</Link>
            <Link to="/workflow-admin" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">Admin</Link>
            {can(role, "programme", "create") && (
              <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--teal,#0d9488)] px-3 py-2 text-sm font-semibold text-white hover:brightness-110">
                <Plus className="h-4 w-4" /> New programme
              </button>
            )}
          </div>
        </div>

        {programmes.length === 0 ? (
          <EmptyState onCreate={() => setShowNew(true)} canCreate={can(role, "programme", "create")} />
        ) : (
          <div className="grid gap-3">
            {programmes.map(p => <ProgrammeCard key={p.id} p={p} onOpen={() => setSelected(p.id)} />)}
          </div>
        )}

        <NotificationsPanel />
        <AuditTrailPanel />
      </div>

      {showNew && <NewProgrammeDialog onClose={() => setShowNew(false)} />}
      {selected && <ProgrammeDetail id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function TopBar() {
  const role = useWorkflow(s => s.role);
  const notifications = useWorkflow(s => s.notifications);
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <Shield className="h-5 w-5 text-[var(--teal,#0d9488)]" /> OakAudix
        </Link>
        <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
          <Link to="/workflow" className="hover:text-slate-900" activeProps={{ className: "text-slate-900 font-semibold" }}>Workflow</Link>
          <Link to="/dashboard" className="hover:text-slate-900" activeProps={{ className: "text-slate-900 font-semibold" }}>Dashboard</Link>
          <Link to="/checklists" className="hover:text-slate-900">Checklists</Link>
          <Link to="/process-audits" className="hover:text-slate-900">Process audits</Link>
          <Link to="/workflow-admin" className="hover:text-slate-900" activeProps={{ className: "text-slate-900 font-semibold" }}>Admin</Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-4 w-4 text-slate-500" />
            {unread > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white">{unread}</span>}
          </div>
          <RoleSwitcher />
          <span className="text-xs text-slate-500">as {role}</span>
        </div>
      </div>
    </div>
  );
}

function RoleSwitcher() {
  const role = useWorkflow(s => s.role);
  const roles: Role[] = ["Administrator","Audit Manager","Lead Auditor","Auditor","Reviewer","Department Head","CAPA Owner","Executive","Read Only"];
  return (
    <select value={role} onChange={e => workflow.setRole(e.target.value as Role)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs">
      {roles.map(r => <option key={r}>{r}</option>)}
    </select>
  );
}

function EmptyState({ onCreate, canCreate }: { onCreate: () => void; canCreate: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <ClipboardList className="mx-auto h-10 w-10 text-slate-400" />
      <h3 className="mt-3 font-semibold text-slate-900">No audit programmes yet</h3>
      <p className="mt-1 text-sm text-slate-600">Create your first programme to see the 9-stage workflow in action.</p>
      {canCreate && (
        <button onClick={onCreate} className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[var(--teal,#0d9488)] px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> New audit programme
        </button>
      )}
    </div>
  );
}

function ProgrammeCard({ p, onOpen }: { p: AuditProgramme; onOpen: () => void }) {
  const cur = p.stages[p.currentStage];
  const overallPct = Math.round(
    STAGE_ORDER.reduce((sum, id) => sum + p.stages[id].completion, 0) / STAGE_ORDER.length
  );
  return (
    <button onClick={onOpen} className="group w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-[var(--teal,#0d9488)] hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">{p.code}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusTone(cur.status)}`}>{cur.status}</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">{p.type}</span>
            {p.standards.map(s => <span key={s} className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">{s}</span>)}
          </div>
          <h3 className="mt-1.5 font-semibold text-slate-900">{p.title}</h3>
          <p className="text-xs text-slate-500">{p.site} · {p.department} · Lead: {p.leadAuditor || "—"} · Due {p.targetDate}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Overall</p>
          <p className="text-lg font-bold text-slate-900">{overallPct}%</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 overflow-x-auto">
        {STAGE_ORDER.map((sid, i) => {
          const st = p.stages[sid];
          const Icon = STAGE_ICON[sid];
          return (
            <div key={sid} className="flex items-center gap-1">
              <div title={`${sid}: ${st.status}`} className={`flex h-8 w-8 items-center justify-center rounded-full border ${statusTone(st.status)}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {i < STAGE_ORDER.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            </div>
          );
        })}
        <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[var(--teal,#0d9488)]" />
      </div>
    </button>
  );
}

// ================ New Programme dialog ================

function NewProgrammeDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<{
    title: string; type: AuditType; standards: Standard[]; site: string; department: string;
    objectives: string; scope: string; criteria: string; leadAuditor: string; teamMembers: string;
    approvers: string; riskPriority: RiskPriority; targetDate: string; estimatedDurationDays: number;
  }>({
    title: "", type: "Internal", standards: ["ISO 9001"], site: "", department: "",
    objectives: "", scope: "", criteria: "", leadAuditor: "", teamMembers: "",
    approvers: "", riskPriority: "Medium",
    targetDate: new Date(Date.now() + 30*86400000).toISOString().slice(0,10),
    estimatedDurationDays: 5,
  });

  const submit = () => {
    if (!form.title.trim()) return alert("Title required");
    workflow.createProgramme({
      title: form.title.trim(), type: form.type, standards: form.standards,
      site: form.site, department: form.department, objectives: form.objectives,
      scope: form.scope, criteria: form.criteria, leadAuditor: form.leadAuditor,
      teamMembers: form.teamMembers.split(",").map(s => s.trim()).filter(Boolean),
      approvers: form.approvers.split(",").map(s => s.trim()).filter(Boolean),
      riskPriority: form.riskPriority, targetDate: form.targetDate,
      estimatedDurationDays: form.estimatedDurationDays,
    });
    onClose();
  };

  const toggleStd = (s: Standard) => setForm(f => ({
    ...f, standards: f.standards.includes(s) ? f.standards.filter(x => x !== s) : [...f.standards, s],
  }));

  return (
    <Modal title="New audit programme" onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title *"><input className={inputCls} value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></Field>
        <Field label="Audit type">
          <select className={inputCls} value={form.type} onChange={e => setForm({...form, type: e.target.value as AuditType})}>
            {AUDIT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Standards" full>
          <div className="flex flex-wrap gap-1.5">
            {STANDARDS.map(s => (
              <button key={s} type="button" onClick={() => toggleStd(s)}
                className={`rounded-full border px-2.5 py-1 text-xs ${form.standards.includes(s) ? "border-[var(--teal,#0d9488)] bg-[var(--teal,#0d9488)]/10 text-[var(--teal,#0d9488)]" : "border-slate-300 text-slate-600"}`}>{s}</button>
            ))}
          </div>
        </Field>
        <Field label="Site"><input className={inputCls} value={form.site} onChange={e => setForm({...form, site: e.target.value})} /></Field>
        <Field label="Department"><input className={inputCls} value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></Field>
        <Field label="Objectives" full><textarea rows={2} className={inputCls} value={form.objectives} onChange={e => setForm({...form, objectives: e.target.value})} /></Field>
        <Field label="Scope" full><textarea rows={2} className={inputCls} value={form.scope} onChange={e => setForm({...form, scope: e.target.value})} /></Field>
        <Field label="Audit criteria" full><textarea rows={2} className={inputCls} value={form.criteria} onChange={e => setForm({...form, criteria: e.target.value})} /></Field>
        <Field label="Lead auditor"><input className={inputCls} value={form.leadAuditor} onChange={e => setForm({...form, leadAuditor: e.target.value})} /></Field>
        <Field label="Team (comma-separated)"><input className={inputCls} value={form.teamMembers} onChange={e => setForm({...form, teamMembers: e.target.value})} /></Field>
        <Field label="Approvers (comma-separated)"><input className={inputCls} value={form.approvers} onChange={e => setForm({...form, approvers: e.target.value})} /></Field>
        <Field label="Risk priority">
          <select className={inputCls} value={form.riskPriority} onChange={e => setForm({...form, riskPriority: e.target.value as RiskPriority})}>
            {RISKS.map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Target date"><input type="date" className={inputCls} value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} /></Field>
        <Field label="Estimated days"><input type="number" min={1} className={inputCls} value={form.estimatedDurationDays} onChange={e => setForm({...form, estimatedDurationDays: Number(e.target.value)})} /></Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
        <button onClick={submit} className="rounded-md bg-[var(--teal,#0d9488)] px-4 py-2 text-sm font-semibold text-white">Create draft</button>
      </div>
    </Modal>
  );
}

// ================ Programme detail with stage cards ================

function ProgrammeDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const p = useProgramme(id);
  const role = useWorkflow(s => s.role);
  const [activeStage, setActiveStage] = useState<StageId>(p?.currentStage ?? "programme");
  if (!p) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/50" onClick={onClose}>
      <div className="ml-auto flex h-full w-full max-w-6xl flex-col bg-slate-50" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono">{p.code}</span>
              <h2 className="text-lg font-bold text-slate-900">{p.title}</h2>
            </div>
            <p className="text-xs text-slate-500">{p.type} · {p.standards.join(", ")} · {p.site} · {p.department}</p>
          </div>
          <button onClick={onClose} className="rounded p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-3 border-b border-slate-200 bg-white px-6 py-4 md:grid-cols-9">
          {STAGE_ORDER.map(sid => {
            const st = p.stages[sid];
            const cfg = workflow.get().stageConfig.find(c => c.id === sid)!;
            const Icon = STAGE_ICON[sid];
            const active = sid === activeStage;
            const gate = cfg.entryCriteria(p);
            return (
              <button key={sid} onClick={() => setActiveStage(sid)}
                className={`rounded-lg border p-2 text-left transition ${active ? "border-[var(--teal,#0d9488)] bg-[var(--teal,#0d9488)]/5 ring-1 ring-[var(--teal,#0d9488)]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-[10px] font-mono text-slate-500">{STAGE_ORDER.indexOf(sid)+1}</span>
                  {!gate.ok && st.status === "Locked" && <Lock className="h-3 w-3 text-slate-400" />}
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-900 leading-tight">{cfg.shortLabel}</p>
                <span className={`mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[9px] ${statusTone(st.status)}`}>{st.status}</span>
                <div className="mt-1 h-1 rounded-full bg-slate-100">
                  <div className="h-1 rounded-full bg-[var(--teal,#0d9488)]" style={{ width: `${st.completion}%` }} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <StageView p={p} stage={activeStage} role={role} />
        </div>
      </div>
    </div>
  );
}

function StageView({ p, stage, role }: { p: AuditProgramme; stage: StageId; role: Role }) {
  const cfg = workflow.get().stageConfig.find(c => c.id === stage)!;
  const st = p.stages[stage];
  const gate = cfg.entryCriteria(p);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">{cfg.label}</h3>
            <p className="text-xs text-slate-500">
              Status: <strong>{st.status}</strong> · Completion {st.completion}% · Approval: {st.approvalStatus ?? "—"}
              {st.approvedBy && ` · Approved by ${st.approvedBy}`}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span title="Responsible"><Users className="mr-1 inline h-3 w-3" />{st.responsible ?? p.leadAuditor ?? "—"}</span>
            <span title="Due date"><Clock className="mr-1 inline h-3 w-3" />{st.dueDate ?? p.targetDate}</span>
            <span title="Evidence"><FileCheck className="mr-1 inline h-3 w-3" />{st.evidenceCount}</span>
            <span title="Notifications"><Bell className="mr-1 inline h-3 w-3" />{st.notificationsSent}</span>
          </div>
        </div>
        {!gate.ok && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800">
            <Lock className="h-3.5 w-3.5" /> Entry criteria not met: {gate.reason}
          </div>
        )}
      </div>

      <StageBody p={p} stage={stage} role={role} disabled={!gate.ok} />
      <ApprovalPanel p={p} stage={stage} role={role} disabled={!gate.ok} />
      <CommentsPanel p={p} stage={stage} />
      <ActivityTimeline auditId={p.id} stage={stage} />
    </div>
  );
}

function StageBody({ p, stage, role, disabled }: { p: AuditProgramme; stage: StageId; role: Role; disabled: boolean }) {
  if (disabled) return null;
  switch (stage) {
    case "programme": return <ProgrammeStage p={p} role={role} />;
    case "scheduling": return <SchedulingStage p={p} />;
    case "checklist": return <ChecklistStage p={p} />;
    case "inspection": return <InspectionStage p={p} />;
    case "findings": return <FindingsStage p={p} />;
    case "capa": return <CAPAStage p={p} role={role} />;
    case "verification": return <VerificationStage p={p} />;
    case "closure": return <ClosureStage p={p} />;
    case "history": return <HistoryStage p={p} />;
  }
}

function ProgrammeStage({ p, role }: { p: AuditProgramme; role: Role }) {
  const canEdit = can(role, "programme", "edit") && p.stages.programme.status === "Draft";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <Kv k="Objectives" v={p.objectives || "—"} />
        <Kv k="Scope" v={p.scope || "—"} />
        <Kv k="Criteria" v={p.criteria || "—"} />
        <Kv k="Lead auditor" v={p.leadAuditor || "—"} />
        <Kv k="Team" v={p.teamMembers.join(", ") || "—"} />
        <Kv k="Approvers" v={p.approvers.join(", ") || "—"} />
        <Kv k="Risk priority" v={p.riskPriority} />
        <Kv k="Target date" v={p.targetDate} />
        <Kv k="Estimated days" v={String(p.estimatedDurationDays)} />
      </div>
      {canEdit && <p className="mt-3 text-xs text-slate-500">Submit for approval below to move to scheduling.</p>}
    </div>
  );
}

function SchedulingStage({ p }: { p: AuditProgramme }) {
  const [start, setStart] = useState(p.schedule?.start ?? p.targetDate + "T09:00");
  const [end, setEnd] = useState(p.schedule?.end ?? p.targetDate + "T17:00");
  const [assignees, setAssignees] = useState((p.schedule?.assignees ?? [p.leadAuditor, ...p.teamMembers]).join(", "));
  const [location, setLocation] = useState(p.schedule?.location ?? p.site);
  const [reminders, setReminders] = useState((p.schedule?.reminders ?? [7,3,1]).join(", "));

  const save = () => {
    try {
      workflow.setSchedule(p.id, {
        start, end,
        assignees: assignees.split(",").map(s => s.trim()).filter(Boolean),
        location,
        reminders: reminders.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n)),
      });
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Start"><input type="datetime-local" className={inputCls} value={start} onChange={e => setStart(e.target.value)} /></Field>
        <Field label="End"><input type="datetime-local" className={inputCls} value={end} onChange={e => setEnd(e.target.value)} /></Field>
        <Field label="Location"><input className={inputCls} value={location} onChange={e => setLocation(e.target.value)} /></Field>
        <Field label="Assignees (comma)"><input className={inputCls} value={assignees} onChange={e => setAssignees(e.target.value)} /></Field>
        <Field label="Reminders (days before, comma)"><input className={inputCls} value={reminders} onChange={e => setReminders(e.target.value)} /></Field>
      </div>
      <button onClick={save} className="mt-3 rounded-md bg-[var(--teal,#0d9488)] px-3 py-2 text-sm font-semibold text-white">Save schedule</button>
      <p className="mt-2 text-xs text-slate-500">Auditor conflicts across programmes are detected automatically.</p>
    </div>
  );
}

const QTYPES: QuestionType[] = ["yes_no","pass_fail","rating","dropdown","text","photo","video","gps","barcode","qr","date","number","file"];

function ChecklistStage({ p }: { p: AuditProgramme }) {
  const [items, setItems] = useState<ChecklistQuestion[]>(p.checklist);
  const add = () => setItems([...items, { id: crypto.randomUUID(), text: "", type: "yes_no", mandatory: false }]);
  const del = (id: string) => setItems(items.filter(i => i.id !== id));
  const upd = (id: string, patch: Partial<ChecklistQuestion>) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const save = () => { workflow.setChecklist(p.id, items); workflow.submitForApproval(p.id, "checklist"); };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Checklist questions ({items.length})</p>
        <button onClick={add} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs"><Plus className="h-3 w-3" /> Add</button>
      </div>
      <div className="space-y-2">
        {items.map((q, i) => (
          <div key={q.id} className="rounded border border-slate-200 p-2 text-xs">
            <div className="grid gap-2 md:grid-cols-[auto_1fr_120px_120px_auto]">
              <span className="text-slate-500">{i+1}.</span>
              <input placeholder="Question text" className={inputCls} value={q.text} onChange={e => upd(q.id, { text: e.target.value })} />
              <input placeholder="Clause" className={inputCls} value={q.clause ?? ""} onChange={e => upd(q.id, { clause: e.target.value })} />
              <select className={inputCls} value={q.type} onChange={e => upd(q.id, { type: e.target.value as QuestionType })}>
                {QTYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => del(q.id)} className="rounded p-1 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-1 flex gap-3 text-[11px] text-slate-600">
              <label><input type="checkbox" checked={!!q.mandatory} onChange={e => upd(q.id, { mandatory: e.target.checked })} /> Mandatory</label>
              <label><input type="checkbox" checked={!!q.photoRequired} onChange={e => upd(q.id, { photoRequired: e.target.checked })} /> Photo required</label>
              <label><input type="checkbox" checked={!!q.evidenceRequired} onChange={e => upd(q.id, { evidenceRequired: e.target.checked })} /> Evidence required</label>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="rounded border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500">No questions yet.</p>}
      </div>
      <button onClick={save} disabled={!items.length} className="mt-3 rounded-md bg-[var(--teal,#0d9488)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Save & submit for approval</button>
    </div>
  );
}

function InspectionStage({ p }: { p: AuditProgramme }) {
  const responses = new Map(p.inspection.map(r => [r.questionId, r]));
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs text-slate-500">Offline-capable · GPS · timestamps · signatures (browser-simulated)</p>
      <div className="space-y-2">
        {p.checklist.map((q, i) => {
          const r = responses.get(q.id);
          return (
            <div key={q.id} className="rounded border border-slate-200 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{i+1}. {q.text}</p>
                  <p className="text-[11px] text-slate-500">{q.clause ? `${q.clause} · ` : ""}{q.type}{q.mandatory ? " · required" : ""}</p>
                </div>
              </div>
              <div className="mt-2">
                <InspectionInput q={q} value={r?.value ?? null} onChange={(value) => workflow.recordInspection(p.id, {
                  questionId: q.id, value, timestamp: new Date().toISOString(),
                  notes: r?.notes, evidence: r?.evidence, gps: r?.gps,
                })} />
              </div>
              <input placeholder="Notes" defaultValue={r?.notes ?? ""}
                onBlur={e => workflow.recordInspection(p.id, {
                  questionId: q.id, value: r?.value ?? null, notes: e.target.value,
                  timestamp: new Date().toISOString(), evidence: r?.evidence, gps: r?.gps,
                })}
                className={`mt-2 ${inputCls}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InspectionInput({ q, value, onChange }: { q: ChecklistQuestion; value: unknown; onChange: (v: string | number | boolean | null) => void }) {
  switch (q.type) {
    case "yes_no": return (
      <div className="flex gap-2">
        {["Yes","No","N/A"].map(o => (
          <button key={o} onClick={() => onChange(o)} className={`rounded border px-3 py-1 text-xs ${value === o ? "border-[var(--teal,#0d9488)] bg-[var(--teal,#0d9488)]/10" : "border-slate-300"}`}>{o}</button>
        ))}
      </div>
    );
    case "pass_fail": return (
      <div className="flex gap-2">
        {["Pass","Fail"].map(o => (
          <button key={o} onClick={() => onChange(o)} className={`rounded border px-3 py-1 text-xs ${value === o ? "border-[var(--teal,#0d9488)] bg-[var(--teal,#0d9488)]/10" : "border-slate-300"}`}>{o}</button>
        ))}
      </div>
    );
    case "rating": return (
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => <button key={n} onClick={() => onChange(n)} className={`h-8 w-8 rounded border text-xs ${value === n ? "border-[var(--teal,#0d9488)] bg-[var(--teal,#0d9488)]/10" : "border-slate-300"}`}>{n}</button>)}
      </div>
    );
    case "date": return <input type="date" className={inputCls} value={String(value ?? "")} onChange={e => onChange(e.target.value)} />;
    case "number": return <input type="number" className={inputCls} value={String(value ?? "")} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)} />;
    case "dropdown": return (
      <select className={inputCls} value={String(value ?? "")} onChange={e => onChange(e.target.value)}>
        <option value="">Select…</option>
        {(q.options ?? ["Option A","Option B","Option C"]).map(o => <option key={o}>{o}</option>)}
      </select>
    );
    case "photo": case "video": case "file": return (
      <input type="file" className="text-xs" onChange={e => onChange(e.target.files?.[0]?.name ?? null)} />
    );
    case "gps": return (
      <button onClick={() => navigator.geolocation?.getCurrentPosition(pos => onChange(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`), () => onChange("GPS denied"))} className="rounded border border-slate-300 px-3 py-1 text-xs">Capture GPS · {String(value ?? "not set")}</button>
    );
    case "barcode": case "qr": return <input placeholder={`Scan/enter ${q.type}`} className={inputCls} value={String(value ?? "")} onChange={e => onChange(e.target.value)} />;
    default: return <input className={inputCls} value={String(value ?? "")} onChange={e => onChange(e.target.value)} />;
  }
}

function FindingsStage({ p }: { p: AuditProgramme }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Findings ({p.findings.length})</p>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-1 rounded-md bg-[var(--teal,#0d9488)] px-3 py-1.5 text-xs font-semibold text-white"><Plus className="h-3 w-3" /> Log finding</button>
      </div>
      <div className="space-y-2">
        {p.findings.map(f => (
          <div key={f.id} className="rounded border border-slate-200 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                f.category === "Major NC" ? "bg-rose-100 text-rose-700"
                : f.category === "Minor NC" ? "bg-amber-100 text-amber-700"
                : f.category === "Observation" ? "bg-sky-100 text-sky-700"
                : "bg-emerald-100 text-emerald-700"}`}>{f.category}</span>
              {f.clause && <span className="text-[11px] font-mono text-slate-500">{f.clause}</span>}
              <span className="text-[11px] text-slate-500">Risk {f.severity}×{f.probability}={f.severity * f.probability}</span>
              <span className="ml-auto text-[11px] text-slate-500">Owner: {f.owner} · Due {f.targetDate}</span>
            </div>
            <p className="mt-1 text-slate-800">{f.description}</p>
            {f.rootCause && <p className="text-xs text-slate-500">Root cause: {f.rootCause}</p>}
          </div>
        ))}
        {p.findings.length === 0 && <p className="rounded border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500">No findings logged.</p>}
      </div>
      {show && <FindingDialog p={p} onClose={() => setShow(false)} />}
    </div>
  );
}

function FindingDialog({ p, onClose }: { p: AuditProgramme; onClose: () => void }) {
  const [f, setF] = useState({
    description: "", category: "Minor NC" as FindingCategory, clause: "", requirement: "",
    severity: 3 as 1|2|3|4|5, probability: 3 as 1|2|3|4|5, owner: "", targetDate: p.targetDate,
    rootCause: "", impact: "",
  });
  const submit = () => {
    if (!f.description.trim() || !f.owner.trim()) return alert("Description and owner required");
    workflow.addFinding(p.id, { ...f, evidence: [] });
    onClose();
  };
  return (
    <Modal title="Log finding" onClose={onClose}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Category">
          <select className={inputCls} value={f.category} onChange={e => setF({...f, category: e.target.value as FindingCategory})}>
            {["Major NC","Minor NC","Observation","Opportunity for Improvement","Positive Practice"].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Clause"><input className={inputCls} value={f.clause} onChange={e => setF({...f, clause: e.target.value})} /></Field>
        <Field label="Description" full><textarea rows={2} className={inputCls} value={f.description} onChange={e => setF({...f, description: e.target.value})} /></Field>
        <Field label="Root cause" full><textarea rows={2} className={inputCls} value={f.rootCause} onChange={e => setF({...f, rootCause: e.target.value})} /></Field>
        <Field label="Severity (1-5)"><input type="number" min={1} max={5} className={inputCls} value={f.severity} onChange={e => setF({...f, severity: Number(e.target.value) as 1|2|3|4|5})} /></Field>
        <Field label="Probability (1-5)"><input type="number" min={1} max={5} className={inputCls} value={f.probability} onChange={e => setF({...f, probability: Number(e.target.value) as 1|2|3|4|5})} /></Field>
        <Field label="Owner"><input className={inputCls} value={f.owner} onChange={e => setF({...f, owner: e.target.value})} /></Field>
        <Field label="Target date"><input type="date" className={inputCls} value={f.targetDate} onChange={e => setF({...f, targetDate: e.target.value})} /></Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
        <button onClick={submit} className="rounded-md bg-[var(--teal,#0d9488)] px-4 py-2 text-sm font-semibold text-white">Log finding</button>
      </div>
    </Modal>
  );
}

function CAPAStage({ p, role }: { p: AuditProgramme; role: Role }) {
  const groups: Record<string, typeof p.capas> = {};
  for (const c of p.capas) (groups[c.status] ??= []).push(c);
  const order = ["Open","In Progress","Awaiting Review","Overdue","Verified","Closed"];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {order.map(col => (
        <div key={col} className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{col} ({groups[col]?.length ?? 0})</p>
          <div className="space-y-2">
            {(groups[col] ?? []).map(c => {
              const overdue = new Date(c.dueDate) < new Date() && c.status !== "Verified" && c.status !== "Closed";
              return (
                <div key={c.id} className={`rounded border p-2 text-xs ${overdue ? "border-rose-300 bg-rose-50" : "border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      c.priority === "Critical" ? "bg-rose-100 text-rose-700"
                      : c.priority === "High" ? "bg-amber-100 text-amber-700"
                      : c.priority === "Medium" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"}`}>{c.priority}</span>
                    <span className="text-slate-500">Due {c.dueDate}</span>
                  </div>
                  <p className="mt-1">Owner: <strong>{c.owner}</strong></p>
                  <textarea placeholder="Corrective action" defaultValue={c.correctiveAction}
                    onBlur={e => workflow.updateCAPA(p.id, c.id, { correctiveAction: e.target.value })}
                    className={`mt-1 ${inputCls} text-xs`} rows={2} />
                  <div className="mt-1 flex items-center gap-2">
                    <input type="range" min={0} max={100} step={10} defaultValue={c.completionPct}
                      onChange={e => workflow.updateCAPA(p.id, c.id, { completionPct: Number(e.target.value), status: Number(e.target.value) >= 100 ? "Awaiting Review" : "In Progress" })} />
                    <span>{c.completionPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function VerificationStage({ p }: { p: AuditProgramme }) {
  const toVerify = p.capas.filter(c => c.status === "Awaiting Review" || c.status === "In Progress");
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs text-slate-500">Verifier must differ from CAPA owner. Effectiveness confirmed = CAPA verified.</p>
      <div className="space-y-2">
        {toVerify.map(c => {
          const f = p.findings.find(x => x.id === c.findingId);
          return (
            <div key={c.id} className="rounded border border-slate-200 p-3 text-sm">
              <p className="font-medium">{f?.description}</p>
              <p className="text-xs text-slate-500">Owner {c.owner} · Action: {c.correctiveAction || "—"}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => { const cmt = prompt("Verification comment"); if (cmt !== null) try { workflow.verifyCAPA(p.id, c.id, { effective: true, comment: cmt }); } catch (e) { alert((e as Error).message); } }}
                  className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"><ThumbsUp className="h-3 w-3" /> Effective</button>
                <button onClick={() => { const cmt = prompt("What needs rework?") ?? ""; try { workflow.verifyCAPA(p.id, c.id, { effective: false, comment: cmt }); } catch (e) { alert((e as Error).message); } }}
                  className="inline-flex items-center gap-1 rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white"><ThumbsDown className="h-3 w-3" /> Return</button>
              </div>
            </div>
          );
        })}
        {toVerify.length === 0 && <p className="rounded border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500">Nothing awaiting verification.</p>}
      </div>
    </div>
  );
}

function ClosureStage({ p }: { p: AuditProgramme }) {
  const [summary, setSummary] = useState(p.reportSummary ?? "");
  const gate = workflow.get().stageConfig.find(c => c.id === "closure")!.entryCriteria(p);
  const report = useMemo(() => buildReport(p), [p]);
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-semibold">Executive summary</p>
        <textarea rows={4} className={inputCls} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Key outcomes, risks, recommendations, lessons learned…" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={!gate.ok || !summary.trim()}
            onClick={() => { try { workflow.closeAudit(p.id, summary); } catch (e) { alert((e as Error).message); } }}
            className="rounded-md bg-[var(--teal,#0d9488)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Submit for closure approval</button>
          <button onClick={() => download(`${p.code}-report.json`, "application/json", JSON.stringify({ ...p, generatedAt: new Date().toISOString() }, null, 2))}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs"><Download className="h-3 w-3" /> Export JSON</button>
          <button onClick={() => download(`${p.code}-report.html`, "text/html", report)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs"><Download className="h-3 w-3" /> Export HTML</button>
        </div>
        {!gate.ok && <p className="mt-2 text-xs text-rose-600">Blocked: {gate.reason}</p>}
      </div>
    </div>
  );
}

function HistoryStage({ p }: { p: AuditProgramme }) {
  const total = p.findings.length;
  const major = p.findings.filter(f => f.category === "Major NC").length;
  const closedCapa = p.capas.filter(c => c.status === "Verified" || c.status === "Closed").length;
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Stat label="Findings" value={total} />
      <Stat label="Major NC" value={major} tone={major ? "warn" : "ok"} />
      <Stat label="CAPA closed" value={`${closedCapa}/${p.capas.length}`} />
      <Stat label="Compliance" value={`${computeCompliance(p)}%`} />
    </div>
  );
}

// ================ Approvals / comments / trail ================

function ApprovalPanel({ p, stage, role, disabled }: { p: AuditProgramme; stage: StageId; role: Role; disabled: boolean }) {
  const st = p.stages[stage];
  const cfg = workflow.get().stageConfig.find(c => c.id === stage)!;
  const canApprove = (cfg.approverRoles.includes(role) || role === "Administrator") && st.approvalStatus === "Pending";
  if (disabled) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-semibold">Actions</p>
      <div className="flex flex-wrap gap-2">
        {st.status === "Draft" && cfg.requiresApproval && (
          <button onClick={() => { try { workflow.submitForApproval(p.id, stage); } catch (e) { alert((e as Error).message); } }}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--teal,#0d9488)] px-3 py-2 text-xs font-semibold text-white"><Play className="h-3 w-3" /> Submit for approval</button>
        )}
        {st.status === "Draft" && !cfg.requiresApproval && (
          <button onClick={() => { try { workflow.submitForApproval(p.id, stage); } catch (e) { alert((e as Error).message); } }}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--teal,#0d9488)] px-3 py-2 text-xs font-semibold text-white"><Play className="h-3 w-3" /> Mark complete</button>
        )}
        {canApprove && (
          <>
            <button onClick={() => { const c = prompt("Approval comment") ?? undefined; try { workflow.approve(p.id, stage, c); } catch (e) { alert((e as Error).message); } }}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"><ThumbsUp className="h-3 w-3" /> Approve</button>
            <button onClick={() => { const r = prompt("Rejection reason"); if (r) try { workflow.reject(p.id, stage, r); } catch (e) { alert((e as Error).message); } }}
              className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white"><ThumbsDown className="h-3 w-3" /> Reject</button>
          </>
        )}
        {cfg.requiresApproval && st.approvalStatus === "Pending" && !canApprove && (
          <span className="text-xs text-slate-500">Awaiting {cfg.approverRoles.join(" or ")}</span>
        )}
      </div>
    </div>
  );
}

function CommentsPanel({ p, stage }: { p: AuditProgramme; stage: StageId }) {
  const [text, setText] = useState("");
  const st = p.stages[stage];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 flex items-center gap-1 text-sm font-semibold"><MessageSquare className="h-3.5 w-3.5" /> Comments ({st.comments.length})</p>
      <div className="space-y-1.5">
        {st.comments.map(c => (
          <div key={c.id} className="rounded bg-slate-50 p-2 text-xs">
            <span className="font-semibold">{c.by}</span> · <span className="text-slate-500">{new Date(c.at).toLocaleString()}</span>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input placeholder="Add a comment…" value={text} onChange={e => setText(e.target.value)} className={inputCls} />
        <button onClick={() => { if (text.trim()) { workflow.addComment(p.id, stage, text.trim()); setText(""); } }}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white">Post</button>
      </div>
    </div>
  );
}

function ActivityTimeline({ auditId, stage }: { auditId: string; stage: StageId }) {
  const trail = useWorkflow(s => s.trail.filter(t => t.target === auditId && (!t.stage || t.stage === stage)).slice(0, 20));
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-semibold">Activity timeline</p>
      <ol className="space-y-1.5 text-xs">
        {trail.map(t => (
          <li key={t.id} className="flex gap-2">
            <Circle className="mt-1 h-2 w-2 shrink-0 text-slate-400" />
            <div>
              <span className="font-medium">{t.action}</span>
              <span className="text-slate-500"> · {t.actor} ({t.role}) · {new Date(t.at).toLocaleString()}</span>
              {t.reason && <p className="text-slate-500">"{t.reason}"</p>}
            </div>
          </li>
        ))}
        {trail.length === 0 && <li className="text-slate-500">No activity yet.</li>}
      </ol>
    </div>
  );
}

// ================ Notifications & audit trail ================

function NotificationsPanel() {
  const list = useWorkflow(s => s.notifications.slice(0, 10));
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Notifications</p>
        <span className="text-xs text-slate-500">In-app only in this build · email/SMS/Teams/Slack adapters stubbed</span>
      </div>
      <ul className="space-y-1.5 text-xs">
        {list.map(n => (
          <li key={n.id} className={`rounded border p-2 ${n.read ? "border-slate-200 bg-white" : "border-sky-200 bg-sky-50"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase">{n.channel}</span>
                <span className="ml-2 font-medium">{n.subject}</span>
                <p className="text-slate-600">to {n.to} · {n.body}</p>
              </div>
              <button onClick={() => workflow.markNotificationRead(n.id)} className="text-[10px] text-slate-500 hover:text-slate-700">mark read</button>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="text-slate-500">No notifications yet.</li>}
      </ul>
    </div>
  );
}

function AuditTrailPanel() {
  const trail = useWorkflow(s => s.trail.slice(0, 20));
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Audit trail</p>
        <span className="text-xs text-slate-500">Append-only · never editable</span>
      </div>
      <ol className="max-h-60 space-y-1 overflow-y-auto text-xs">
        {trail.map(t => (
          <li key={t.id} className="border-b border-slate-100 py-1">
            <span className="text-slate-500">{new Date(t.at).toLocaleString()}</span> · <strong>{t.actor}</strong> <span className="text-slate-500">({t.role})</span> — {t.action}
            {t.stage && <span className="text-slate-500"> · {t.stage}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ================ helpers ================

const inputCls = "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-[var(--teal,#0d9488)] focus:ring-1 focus:ring-[var(--teal,#0d9488)]";

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return <div><span className="text-xs text-slate-500">{k}</span><p className="text-sm text-slate-900">{v}</p></div>;
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "warn" | "ok" }) {
  return (
    <div className={`rounded-lg border p-3 ${tone === "warn" ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Modal({ title, children, onClose, wide }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className={`max-h-[90vh] w-full ${wide ? "max-w-3xl" : "max-w-xl"} overflow-y-auto rounded-lg bg-white p-6 shadow-xl`} onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function download(name: string, mime: string, body: string) {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function computeCompliance(p: AuditProgramme) {
  const total = p.checklist.length || 1;
  const passed = p.inspection.filter(r => r.value === "Yes" || r.value === "Pass" || (typeof r.value === "number" && r.value >= 4)).length;
  return Math.round((passed / total) * 100);
}

function buildReport(p: AuditProgramme) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${p.code} Report</title>
<style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#0f172a}h1{border-bottom:2px solid #0d9488}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{text-align:left;padding:.5rem;border-bottom:1px solid #e2e8f0;font-size:14px}</style>
</head><body>
<h1>${p.code} — ${p.title}</h1>
<p><strong>Type:</strong> ${p.type} · <strong>Standards:</strong> ${p.standards.join(", ")}<br/>
<strong>Site:</strong> ${p.site} · <strong>Department:</strong> ${p.department}<br/>
<strong>Lead auditor:</strong> ${p.leadAuditor}</p>
<h2>Executive summary</h2><p>${(p.reportSummary ?? "—").replace(/\n/g, "<br/>")}</p>
<h2>Findings summary</h2>
<table><tr><th>Cat</th><th>Clause</th><th>Description</th><th>Owner</th><th>Due</th></tr>
${p.findings.map(f => `<tr><td>${f.category}</td><td>${f.clause ?? ""}</td><td>${f.description}</td><td>${f.owner}</td><td>${f.targetDate}</td></tr>`).join("")}
</table>
<h2>CAPA summary</h2>
<table><tr><th>Priority</th><th>Status</th><th>Owner</th><th>Due</th><th>Action</th></tr>
${p.capas.map(c => `<tr><td>${c.priority}</td><td>${c.status}</td><td>${c.owner}</td><td>${c.dueDate}</td><td>${c.correctiveAction}</td></tr>`).join("")}
</table>
<h2>Compliance</h2><p>${computeCompliance(p)}%</p>
</body></html>`;
}
