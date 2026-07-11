import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ModulePage, WCard, WBadge, Annotation } from "@/components/module-page";
import { auditStore, useAuditStore } from "@/lib/audit-store";
import { CHECKLIST_LIBRARY, recommendedFor, asQuestion, defaultEvidenceFor, type ClauseQuestion } from "@/lib/iso-checklists";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/execution/conduct")({
  head: () => ({ meta: [{ title: "Conduct Audit — AuditOS" }, { name: "description", content: "Live audit execution with checklist responses, evidence, and findings." }] }),
  component: Page,
});

const RESULTS = ["Conforms", "Minor NC", "Major NC", "N/A"] as const;
const ALL_DEPTS_KEY = "__all__";

function Page() {
  const plans = useAuditStore((s) => Object.values(s.plans));
  const responses = useAuditStore((s) => s.collections.responses ?? {});
  const applicability = useAuditStore((s) => s.collections.applicability ?? {});
  const [planId, setPlanId] = useState<string>("");
  const [checklistId, setChecklistId] = useState<string>("");
  const [activeDept, setActiveDept] = useState<string>(ALL_DEPTS_KEY);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => { if (!planId && plans.length) setPlanId(plans[0].id); }, [plans, planId]);

  const plan = plans.find((p) => p.id === planId);
  const planDepts = useMemo(
    () => (plan?.department ?? "").split(",").map((d) => d.trim()).filter(Boolean),
    [plan?.department],
  );

  // Recommend checklists for this plan's standard, else all
  const availableChecklists = useMemo(() => {
    if (!plan) return CHECKLIST_LIBRARY;
    const rec = recommendedFor(plan.standard);
    return rec.length ? rec : CHECKLIST_LIBRARY;
  }, [plan]);

  useEffect(() => {
    if (availableChecklists.length && !availableChecklists.find((c) => c.id === checklistId)) {
      setChecklistId(availableChecklists[0].id);
    }
  }, [availableChecklists, checklistId]);

  const checklist = CHECKLIST_LIBRARY.find((c) => c.id === checklistId);
  const questions: ClauseQuestion[] = checklist?.questions ?? [];

  useEffect(() => {
    if (questions.length && !questions.find((q) => q.id === activeId)) setActiveId(questions[0].id);
  }, [questions, activeId]);

  // Per-department applicability keyed by `${planId}:${dept}:${itemId}`
  function applicabilityKey(dept: string, itemId: string) {
    return `${planId}:${checklistId}:${dept}:${itemId}`;
  }
  function isApplicable(dept: string, itemId: string, defaultApplicable: boolean): boolean {
    const rec = applicability[applicabilityKey(dept, itemId)];
    if (rec) return !!rec.applicable;
    return defaultApplicable;
  }
  function setApplicable(dept: string, itemId: string, applicable: boolean) {
    if (!planId) { toast.error("Pick an audit plan first"); return; }
    const id = applicabilityKey(dept, itemId);
    if (applicability[id]) auditStore.update("applicability", id, { applicable });
    else auditStore.create("applicability", { id, planId, checklistId, dept, itemId, applicable }, "APP");
  }
  function bulkSetDept(dept: string, applicable: boolean) {
    questions.forEach((q) => setApplicable(dept, q.id, applicable));
    toast.success(`${applicable ? "Applied" : "Excluded"} all clauses for ${dept}`);
  }
  function autoSelectByHint(dept: string) {
    questions.forEach((q) => {
      const yes = !q.applicableDepartments || q.applicableDepartments.includes(dept);
      setApplicable(dept, q.id, yes);
    });
    toast.success(`Auto-selected relevant clauses for ${dept}`);
  }

  // Filtered questions for active department view
  const shownQuestions = useMemo(() => {
    if (activeDept === ALL_DEPTS_KEY) return questions;
    return questions.filter((q) => isApplicable(activeDept, q.id, !q.applicableDepartments || q.applicableDepartments.includes(activeDept)));
  }, [questions, activeDept, applicability, planId, checklistId]);

  const active = shownQuestions.find((q) => q.id === activeId) ?? questions.find((q) => q.id === activeId);

  const planResponses = useMemo(
    () => Object.values(responses).filter((r: any) => r.auditId === planId && r.checklistId === checklistId),
    [responses, planId, checklistId],
  );
  const current: any = planResponses.find((r: any) => r.itemId === activeId && (activeDept === ALL_DEPTS_KEY ? true : r.dept === activeDept));

  function saveResponse(patch: Partial<{ result: string; notes: string }>) {
    if (!planId || !active) { toast.error("Pick or create an audit plan first"); return; }
    const dept = activeDept === ALL_DEPTS_KEY ? "_" : activeDept;
    const id = `${planId}_${checklistId}_${dept}_${active.id}`;
    if (responses[id]) auditStore.update("responses", id, { ...patch });
    else auditStore.create("responses", { id, auditId: planId, checklistId, dept, itemId: active.id, clause: active.clause, result: "Conforms", notes: "", ...patch }, "RESP");
  }

  function raiseFinding() {
    if (!planId || !active) { toast.error("Pick an audit plan first"); return; }
    const sev = current?.result === "Major NC" ? "Major" : current?.result === "Minor NC" ? "Minor" : "Observation";
    const created = auditStore.create(
      "nonconformities",
      {
        clause: active.clause,
        description: current?.notes || `Issue identified during ${plan?.title ?? "audit"} on clause ${active.clause}`,
        severity: sev,
        department: activeDept === ALL_DEPTS_KEY ? (plan?.department ?? "—") : activeDept,
        owner: plan?.lead ?? "—",
        auditor: plan?.lead ?? "—",
        due: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10),
        status: "Open",
        raisedAt: new Date().toISOString().slice(0, 10),
      },
      "F",
    );
    auditStore.notify({ channel: "in-app", to: plan?.lead ?? "Quality Manager", subject: `Finding ${created.id} raised`, body: `Clause ${active.clause}` });
  }

  const answeredForActive = planResponses.filter((r: any) => activeDept === ALL_DEPTS_KEY ? true : r.dept === activeDept).length;
  const totalForActive = shownQuestions.length;
  const pct = totalForActive ? Math.round((answeredForActive / totalForActive) * 100) : 0;

  return (
    <ModulePage annotation="03 · EXECUTION" title="Conduct Audit">
      {/* Audit & checklist picker */}
      <div className="wire-card rounded-lg p-3 flex flex-wrap items-center gap-2">
        <span className="annotation">AUDIT</span>
        <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs min-w-[260px]">
          <option value="">— Select audit plan —</option>
          {plans.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.title}</option>)}
        </select>
        <span className="annotation ml-2">CHECKLIST</span>
        <select value={checklistId} onChange={(e) => setChecklistId(e.target.value)} className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs min-w-[260px]">
          {availableChecklists.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {plan && <WBadge tone="outline">{plan.standard}</WBadge>}
        <div className="ml-auto"><Annotation>{answeredForActive} of {totalForActive} answered · {pct}%</Annotation></div>
      </div>

      {/* Department tabs (from the plan's selected departments) */}
      {planDepts.length > 0 && (
        <div className="wire-card rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Annotation>DEPARTMENTS IN SCOPE</Annotation>
            <button
              onClick={() => setActiveDept(ALL_DEPTS_KEY)}
              className={`h-7 px-2 rounded border text-[11px] ${activeDept === ALL_DEPTS_KEY ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}
            >All ({questions.length})</button>
            {planDepts.map((d) => {
              const applicableCount = questions.filter((q) => isApplicable(d, q.id, !q.applicableDepartments || q.applicableDepartments.includes(d))).length;
              return (
                <button
                  key={d}
                  onClick={() => setActiveDept(d)}
                  className={`h-7 px-2 rounded border text-[11px] ${activeDept === d ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}
                >{d} <span className="opacity-70">({applicableCount})</span></button>
              );
            })}
            {activeDept !== ALL_DEPTS_KEY && (
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => autoSelectByHint(activeDept)} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted">Auto-select relevant</button>
                <button onClick={() => bulkSetDept(activeDept, true)}  className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted">Applicable: All</button>
                <button onClick={() => bulkSetDept(activeDept, false)} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted">Applicable: None</button>
              </div>
            )}
          </div>
          {activeDept !== ALL_DEPTS_KEY && (
            <div className="annotation mt-2">↳ Toggle the checkbox next to each clause to mark it applicable for <span className="text-foreground">{activeDept}</span>.</div>
          )}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Checklist */}
        <WCard className="col-span-12 xl:col-span-4" title="Checklist" hint={`${totalForActive} of ${questions.length} shown`}>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {questions.map((q) => {
              const inScope = activeDept === ALL_DEPTS_KEY
                ? true
                : isApplicable(activeDept, q.id, !q.applicableDepartments || q.applicableDepartments.includes(activeDept));
              const r: any = planResponses.find((x: any) => x.itemId === q.id && (activeDept === ALL_DEPTS_KEY ? true : x.dept === activeDept));
              return (
                <div
                  key={q.id}
                  className={`flex items-start gap-2 p-2 rounded text-xs border ${q.id === activeId ? "border-foreground bg-muted" : "border-transparent hover:bg-muted/40"} ${inScope ? "" : "opacity-40"}`}
                >
                  {activeDept !== ALL_DEPTS_KEY ? (
                    <button
                      title="Applicable for this department"
                      onClick={() => setApplicable(activeDept, q.id, !inScope)}
                      className={`h-4 w-4 mt-0.5 shrink-0 rounded border grid place-items-center ${inScope ? "bg-foreground border-foreground text-background" : "border-border"}`}
                    >{inScope && <Check className="h-3 w-3" />}</button>
                  ) : (
                    <input type="checkbox" readOnly checked={!!r} className="mt-0.5" />
                  )}
                  <button onClick={() => setActiveId(q.id)} className="text-left flex-1 min-w-0">
                    <div className="annotation">CLAUSE {q.clause}{r?.result ? ` · ${r.result}` : ""}</div>
                    <div className="truncate">{q.text}</div>
                  </button>
                </div>
              );
            })}
            {questions.length === 0 && <div className="text-xs text-muted-foreground p-2">Pick a checklist to load questions.</div>}
          </div>
        </WCard>

        {/* Response */}
        <WCard className="col-span-12 xl:col-span-5" title={active ? `Clause ${active.clause} — Audit Question` : "Select a clause"} hint={active?.section}>
          {active && (
            <>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <Annotation>AUDIT QUESTION</Annotation>
                <div className="text-sm mt-1 leading-relaxed">{asQuestion(active)}</div>
                <div className="annotation mt-2 opacity-70">↳ Underlying requirement: {active.text}</div>
              </div>

              <div className="mt-3 rounded-md border border-dashed border-border p-3">
                <Annotation>EXPECTED / SAMPLE EVIDENCE</Annotation>
                <ul className="mt-1.5 space-y-1 text-xs">
                  {defaultEvidenceFor(active).map((e, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
                <div className="annotation mt-2 opacity-70">↳ Collect one or more of the above and attach via the Evidence module.</div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                {RESULTS.map((r) => (
                  <button
                    key={r}
                    onClick={() => saveResponse({ result: r })}
                    className={"h-9 rounded-md border " + (current?.result === r ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted")}
                  >{r}</button>
                ))}
              </div>
              <Annotation>AUDITOR RESPONSE{activeDept !== ALL_DEPTS_KEY ? ` · ${activeDept}` : ""}</Annotation>
              <textarea
                value={current?.notes ?? ""}
                onChange={(e) => saveResponse({ notes: e.target.value })}
                className="w-full min-h-[120px] mt-1 rounded-md border border-input bg-muted/30 p-2 text-xs"
                placeholder="Record objective evidence, interview notes, observations…"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={raiseFinding} className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted">+ Raise Finding</button>
                <button onClick={() => {
                  const list = shownQuestions;
                  const next = list[list.findIndex(q => q.id === activeId) + 1];
                  if (next) setActiveId(next.id); else toast.success("Checklist complete");
                }} className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90">Save & Next →</button>
              </div>
            </>
          )}
        </WCard>


        {/* Progress */}
        <WCard className="col-span-12 xl:col-span-3" title="Progress" hint="Coverage of applicable clauses">
          <div className="text-3xl font-semibold">{pct}%</div>
          <div className="h-2 bg-muted rounded mt-2 overflow-hidden"><div className="h-full bg-foreground" style={{ width: `${pct}%` }} /></div>
          <div className="text-xs mt-1 text-muted-foreground">{answeredForActive} of {totalForActive} answered</div>
          <div className="mt-3 pt-3 border-t border-border">
            <Annotation>RESULTS</Annotation>
            {RESULTS.map((r) => {
              const n = planResponses.filter((x: any) => x.result === r && (activeDept === ALL_DEPTS_KEY ? true : x.dept === activeDept)).length;
              return <div key={r} className="flex justify-between text-xs py-0.5"><span>{r}</span><span className="font-medium">{n}</span></div>;
            })}
          </div>
          {planDepts.length > 0 && activeDept === ALL_DEPTS_KEY && (
            <div className="mt-3 pt-3 border-t border-border">
              <Annotation>PER-DEPARTMENT APPLICABILITY</Annotation>
              {planDepts.map((d) => {
                const n = questions.filter((q) => isApplicable(d, q.id, !q.applicableDepartments || q.applicableDepartments.includes(d))).length;
                return <div key={d} className="flex justify-between text-xs py-0.5"><span className="truncate">{d}</span><span className="font-medium">{n}/{questions.length}</span></div>;
              })}
            </div>
          )}
        </WCard>
      </div>
    </ModulePage>
  );
}
