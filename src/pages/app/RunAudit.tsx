import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, FileUp, Link2, Lock, Unlock, User, RefreshCw, CheckCircle2, Clock, X, Search, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionsFor, isProcessInStandard, type StandardKey } from "@/data/standards";
import { useToast } from "@/hooks/use-toast";
import { parseAuditNote, serializeAuditNote, safeEvidenceName, type EvidenceItem } from "@/lib/auditEvidence";
import { HSE_CHECKLIST_DATA } from "@/data/hseInspectionChecklist";

type Audit = { id: string; title: string; standard: string; scope: string | null; status: string; org_id: string };
type Proc = { id: string; key: string; name: string };
type AuditProc = { process_id: string; auditor_id: string | null };
type Answer = { id?: string; clause: string; kind: string; q_ref: string; question_text: string | null; note: string | null; status: string };
type Custom = { id: string; clause: string; text: string };
type FindingRow = {
  id: string;
  clause: string | null;
  description: string;
  capa: string | null;
  owner: string | null;
  due_date: string | null;
  status: string;
  type: string;
  root_cause: string | null;
};

const STATUSES = ["pending", "conform", "minor", "major", "observation", "na"];
const NONCONFORMING = new Set(["major", "minor", "observation"]);
const AUTO_FINDING_PREFIX = "AUTO_META:";

export default function RunAudit() {
  const { id } = useParams();
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [audit, setAudit] = useState<Audit | null>(null);
  const [procs, setProcs] = useState<Proc[]>([]);
  const [activeProc, setActiveProc] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [custom, setCustom] = useState<Custom[]>([]);
  const [findingsMap, setFindingsMap] = useState<Record<string, FindingRow>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  
  const [auditors, setAuditors] = useState<{ id: string; name: string; user_id: string | null }[]>([]);
  const [auditProcesses, setAuditProcesses] = useState<{ process_id: string; auditor_id: string | null }[]>([]);
  const [tempAuditorId, setTempAuditorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showHseChecklist, setShowHseChecklist] = useState(false);
  const [checkedHseItems, setCheckedHseItems] = useState<Set<number>>(new Set());
  const [hseSearch, setHseSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    const key = `hse_checked_items_${id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setCheckedHseItems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Error loading checked hse items", e);
      }
    }
  }, [id]);

  const toggleHseItem = (itemId: number) => {
    const next = new Set(checkedHseItems);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setCheckedHseItems(next);
    if (id) {
      localStorage.setItem(`hse_checked_items_${id}`, JSON.stringify(Array.from(next)));
    }
  };

  const stdForBank: StandardKey =
    audit?.standard === "27001" ? "9001" : ((audit?.standard as StandardKey) ?? "9001");

  useEffect(() => {
    setTempAuditorId("");
  }, [activeProc]);

  useEffect(() => {
    if (!id || !currentOrg) return;
    (async () => {
      // 1. Fetch audit details
      const { data: auditRow } = await supabase.from("audits").select("*").eq("id", id).single();
      if (!auditRow) return;
      const currentAudit = auditRow as Audit;
      setAudit(currentAudit);

      // 2. Fetch existing organization processes
      const { data: orgProcs } = await supabase.from("org_processes").select("id,key,name").eq("org_id", currentOrg.id).order("name");
      let finalProcs = orgProcs ?? [];

      const std = currentAudit.standard;

      // 3. Filter procs by standard to match the active scope
      const visibleProcs = finalProcs.filter((p) => {
        return isProcessInStandard(std as StandardKey, p.key);
      });

      // 4. Fetch audit processes
      const { data: auditProcs } = await supabase.from("audit_processes").select("process_id,auditor_id").eq("audit_id", id);
      let finalAuditProcs = auditProcs ?? [];

      // If no processes are linked to this audit, auto-link ALL visible processes!
      if (finalAuditProcs.length === 0 && visibleProcs.length > 0) {
        // Resolve default auditor
        let auditorId = currentAudit.lead_auditor_id;
        if (!auditorId) {
          const { data: team } = await supabase.from("auditors").select("id").eq("org_id", currentOrg.id).limit(1);
          if (team && team.length > 0) {
            auditorId = team[0].id;
          } else if (user) {
            // Silently seed a default auditor for them
            const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Auditor";
            const { data: newAuditor } = await supabase.from("auditors").insert({
              org_id: currentOrg.id,
              name: fullName,
              email: user.email || "",
              role: "Lead Auditor",
              user_id: user.id
            }).select("id").single();
            if (newAuditor) auditorId = newAuditor.id;
          }
        }

        const rowsToInsert = visibleProcs.map((p) => ({
          audit_id: id,
          process_id: p.id,
          auditor_id: auditorId || null,
        }));

        if (rowsToInsert.length > 0) {
          await supabase.from("audit_processes").insert(rowsToInsert);
          const { data: updatedAuditProcs } = await supabase.from("audit_processes").select("process_id,auditor_id").eq("audit_id", id);
          if (updatedAuditProcs) finalAuditProcs = updatedAuditProcs;
        }
      }
      setAuditProcesses(finalAuditProcs as any);

      // Filter procs list to only show processes linked to this audit
      const auditProcIds = new Set(finalAuditProcs.map((ap) => ap.process_id));
      const activeAuditProcs = visibleProcs.filter((p) => auditProcIds.has(p.id));
      setProcs(activeAuditProcs);
      if (activeAuditProcs.length > 0) setActiveProc(activeAuditProcs[0].id);

      // 5. Fetch auditors inside the organization
      const { data: auditorsList } = await supabase.from("auditors").select("id,name,user_id").eq("org_id", currentOrg.id);
      setAuditors((auditorsList ?? []) as any);

      // 6. Fetch answer rows
      const { data: answerRows } = await supabase.from("audit_answers").select("id,clause,kind,q_ref,question_text,note,status,process_id").eq("audit_id", id);
      const ansMap: Record<string, Answer> = {};
      (answerRows ?? []).forEach((row: any) => {
        ansMap[buildAnswerKey(row.process_id, row.clause, row.kind, row.q_ref)] = row as Answer;
      });
      setAnswers(ansMap);

      // 7. Load findings
      const { data: findings } = await supabase
        .from("findings")
        .select("id,clause,description,capa,owner,due_date,status,type,root_cause")
        .eq("audit_id", id);
      
      const findingMap: Record<string, FindingRow> = {};
      (findings ?? []).forEach((finding) => {
        const meta = parseFindingMeta(finding.root_cause);
        if (!meta) return;
        findingMap[buildAnswerKey(meta.processId, finding.clause ?? "", meta.kind, meta.qRef)] = finding as FindingRow;
      });
      setFindingsMap(findingMap);
    })();
  }, [id, currentOrg, user]);

  useEffect(() => {
    if (!currentOrg || !audit || !activeProc) return;
    const proc = procs.find((process) => process.id === activeProc);
    if (!proc) return;
    supabase
      .from("custom_questions")
      .select("id,clause,text")
      .eq("org_id", currentOrg.id)
      .eq("standard", audit.standard)
      .eq("process_key", proc.key)
      .eq("active", true)
      .then(({ data }) => setCustom((data ?? []) as Custom[]));
  }, [currentOrg, audit, activeProc, procs]);

  const activeProcMeta = procs.find((process) => process.id === activeProc);
  const clauseSets = useMemo(() => {
    if (!activeProcMeta) return [];
    try {
      return getQuestionsFor(stdForBank, activeProcMeta.key as any) ?? [];
    } catch {
      return [];
    }
  }, [activeProcMeta, stdForBank]);

  const saveAnswer = async (answer: Answer & { process_id: string; evidence?: EvidenceItem[] }) => {
    if (!id) return;
    const key = buildAnswerKey(answer.process_id, answer.clause, answer.kind, answer.q_ref);
    const existing = answers[key];
    const notePayload = serializeAuditNote(answer.note ?? "", answer.evidence ?? parseAuditNote(existing?.note).evidence);

    if (existing?.id) {
      await supabase.from("audit_answers").update({ status: answer.status, note: notePayload, question_text: answer.question_text }).eq("id", existing.id);
      setAnswers((prev) => ({ ...prev, [key]: { ...prev[key], status: answer.status, note: notePayload, question_text: answer.question_text } }));
    } else {
      const { data } = await supabase.from("audit_answers").insert({
        audit_id: id,
        process_id: answer.process_id,
        clause: answer.clause,
        kind: answer.kind,
        q_ref: answer.q_ref,
        question_text: answer.question_text,
        note: notePayload,
        status: answer.status,
      }).select().single();
      if (data) setAnswers((prev) => ({ ...prev, [key]: data as any }));
    }
  };

  const syncFinding = async ({
    processId,
    clause,
    kind,
    qRef,
    questionText,
    answerStatus,
    description,
    capa,
    owner,
    dueDate,
    correction,
    rootCauseText,
    severity,
  }: {
    processId: string;
    clause: string;
    kind: string;
    qRef: string;
    questionText: string;
    answerStatus: string;
    description: string;
    capa: string;
    owner: string;
    dueDate: string;
    correction?: string;
    rootCauseText?: string;
    severity?: string;
  }) => {
    if (!id || !currentOrg) return;
    const key = buildAnswerKey(processId, clause, kind, qRef);
    const existing = findingsMap[key];

    if (!NONCONFORMING.has(answerStatus)) {
      if (existing?.id) {
        await supabase.from("findings").delete().eq("id", existing.id);
        setFindingsMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
      return;
    }

    const deriveSeverity = (type: string) => {
      if (type === "major") return "High";
      if (type === "minor") return "Medium";
      return "Low";
    };

    const rootCausePayload = `${AUTO_FINDING_PREFIX}${JSON.stringify({
      processId,
      kind,
      qRef,
      correction: (correction ?? "").trim(),
      rootCauseText: (rootCauseText ?? "").trim(),
      severity: severity || deriveSeverity(answerStatus),
    })}`;

    const payload = {
      audit_id: id,
      org_id: currentOrg.id,
      clause,
      type: answerStatus,
      description: description.trim() || questionText,
      capa: capa.trim() || null,
      owner: owner.trim() || null,
      due_date: dueDate || null,
      status: existing?.status || "open",
      root_cause: rootCausePayload,
    };

    if (existing?.id) {
      const { data } = await supabase.from("findings").update(payload).eq("id", existing.id).select().single();
      if (data) setFindingsMap((prev) => ({ ...prev, [key]: data as FindingRow }));
      return;
    }

    const { data } = await supabase.from("findings").insert(payload).select().single();
    if (data) setFindingsMap((prev) => ({ ...prev, [key]: data as FindingRow }));
  };

  const uploadEvidence = async (params: {
    processId: string;
    clause: string;
    kind: string;
    qRef: string;
    files: FileList | null;
    currentNote: string;
  }) => {
    if (!id || !currentOrg || !params.files?.length) return;
    const answerKey = buildAnswerKey(params.processId, params.clause, params.kind, params.qRef);
    setUploadingFor(answerKey);

    try {
      const existing = parseAuditNote(answers[answerKey]?.note ?? "");
      const nextEvidence = [...existing.evidence];

      for (const file of Array.from(params.files)) {
        const path = `${currentOrg.id}/${id}/${params.processId}/${Date.now()}-${safeEvidenceName(file.name)}`;
        const { error } = await supabase.storage.from("audit-evidence").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("audit-evidence").getPublicUrl(path);
        nextEvidence.push({ name: file.name, url: data.publicUrl, kind: file.type || "file" });
      }

      await saveAnswer({
        process_id: params.processId,
        clause: params.clause,
        kind: params.kind,
        q_ref: params.qRef,
        question_text: answers[answerKey]?.question_text ?? null,
        note: params.currentNote,
        status: answers[answerKey]?.status ?? "pending",
        evidence: nextEvidence,
      });
      toast({ title: "Evidence uploaded", description: `${params.files.length} file(s) attached to this audit response.` });
      return nextEvidence;
    } catch (error: any) {
      toast({ title: "Upload failed", description: error?.message ?? "Could not upload evidence.", variant: "destructive" });
    } finally {
      setUploadingFor(null);
    }
  };

  const handleAssignAuditor = async (auditorId: string) => {
    if (!id || !activeProc) return;
    const { error } = await supabase
      .from("audit_processes")
      .update({ auditor_id: auditorId })
      .eq("audit_id", id)
      .eq("process_id", activeProc);

    if (error) {
      toast({ title: "Failed to assign auditor", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Auditor assigned successfully" });
      setAuditProcesses((prev) =>
        prev.map((ap) => (ap.process_id === activeProc ? { ...ap, auditor_id: auditorId } : ap))
      );
    }
  };


  const currentAssignment = useMemo(() => {
    return auditProcesses.find((ap) => ap.process_id === activeProc);
  }, [auditProcesses, activeProc]);

  const assignedAuditorId = currentAssignment?.auditor_id;
  const assignedAuditor = useMemo(() => {
    return auditors.find((a) => a.id === assignedAuditorId);
  }, [auditors, assignedAuditorId]);

  const currentAuditor = useMemo(() => {
    return auditors.find((a) => a.user_id === user?.id);
  }, [auditors, user]);

  const isAssignedToMe = currentAuditor && assignedAuditorId === currentAuditor.id;
  const isUnassigned = !assignedAuditorId;
  const canEdit = true; // Always allow editing to support collaborative updates and remove view-only locks

  const total = Object.values(answers).length;
  const conformity = total > 0 ? Math.round((Object.values(answers).filter((answer) => answer.status === "conform").length / total) * 100) : 0;

  // ── Question Checklist Completion Tracking ───────────────────
  const allAuditQuestions = useMemo(() => {
    let list: { processId: string; clause: string; kind: string; qRef: string; text: string }[] = [];
    procs.forEach((p) => {
      const clauses = getQuestionsFor(stdForBank, p.key as any) ?? [];
      clauses.forEach((c) => {
        (c.generic ?? []).forEach((q, idx) => {
          list.push({ processId: p.id, clause: c.clause, kind: "generic", qRef: idx.toString(), text: q });
        });
        (c.specific ?? []).forEach((q, idx) => {
          list.push({ processId: p.id, clause: c.clause, kind: "specific", qRef: idx.toString(), text: q });
        });
      });
    });
    return list;
  }, [procs, stdForBank]);

  const pendingCount = useMemo(() => {
    let pending = 0;
    allAuditQuestions.forEach((q) => {
      const key = buildAnswerKey(q.processId, q.clause, q.kind, q.qRef);
      const ans = answers[key];
      if (!ans || ans.status === "pending" || !ans.status) {
        pending++;
      }
    });
    return pending;
  }, [allAuditQuestions, answers]);

  if (!audit) return <AppShell><div>Loading...</div></AppShell>;

  const submitAudit = async () => {
    if (!id) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("audits")
      .update({ status: "generating", closed_at: new Date().toISOString() })
      .eq("id", id);
      
    setIsSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Audit Submitted Successfully", description: "Your ISO compliance report is being compiled." });
    setAudit(audit ? { ...audit, status: "generating", closed_at: new Date().toISOString() } : null);
  };

  const closeAudit = async () => {
    if (!id) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("audits")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", id);
      
    setIsSubmitting(false);
    if (error) {
      toast({ title: "Failed to close audit", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Audit Closed Successfully", description: "This audit has been closed and archived." });
    setAudit(audit ? { ...audit, status: "closed", closed_at: new Date().toISOString() } : null);
  };

  if (audit.status === "generating") {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto mt-12 text-center p-8 border border-border bg-card rounded-[32px] shadow-card space-y-6 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <RefreshCw className="h-10 w-10 animate-spin text-primary" style={{ animationDuration: "3s" }} />
          </div>
          
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Generating ISO Compliance Report</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              ISO AUDIT PORT's compliance engine is currently compiling your audit checklists, calculating standard conformity scores, cross-mapping nonconformities, and preparing your formal regulatory audit reports.
            </p>
            <div className="py-2.5 px-4 bg-secondary/50 rounded-2xl text-xs text-muted-foreground inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              This usually takes a few minutes. Please check back shortly.
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex justify-center gap-3">
            <button
              onClick={async () => {
                setLoading(true);
                setTimeout(async () => {
                  await supabase.from("audits").update({ status: "closed" }).eq("id", id);
                  setAudit(audit ? { ...audit, status: "closed" } : null);
                  setLoading(false);
                  toast({ title: "Compliance Report Compiled!", description: "You can now review your final reports." });
                }, 1500);
              }}
              disabled={loading}
              className="pill-cta px-6 py-2.5 font-bold flex items-center gap-2"
            >
              {loading ? "Checking Status..." : "Check Report Status"}
            </button>
            <Link to="/app" className="pill-secondary px-6 py-2.5 font-bold">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (audit.status === "closed") {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto mt-12 border border-border bg-card rounded-[32px] p-6 sm:p-10 shadow-card space-y-6 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-success/5 blur-3xl" />
          
          <div className="flex items-center justify-between border-b border-border/60 pb-5">
            <div>
              <span className="text-[10px] font-mono font-bold bg-success/10 border border-success/20 px-2 py-0.5 rounded text-success uppercase tracking-wider">
                Audit Concluded & Archived
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight mt-2">{audit.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">Concluded standard: {audit.standard.toUpperCase()}</p>
            </div>
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>

          <div className="space-y-4 leading-relaxed text-sm text-muted-foreground font-sans">
            <p>
              This compliance audit has been formally <strong>signed off, locked, and securely archived</strong>.
            </p>
            <p>
              In accordance with international ISO standards (ISO 19011) and ISO AUDIT PORT's proprietary data protection policy, <strong>all checklists, answer logs, and evidence links are permanently frozen</strong> to maintain regulatory integrity, compliance traceability, and prevent post-audit tampering.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="bg-secondary/40 border border-border/50 p-4 rounded-2xl">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase">Conformity Score</span>
                <span className="text-2xl font-extrabold text-foreground">{conformity}%</span>
              </div>
              <div className="bg-secondary/40 border border-border/50 p-4 rounded-2xl">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase">Archive Date</span>
                <span className="text-sm font-bold text-foreground block mt-1.5 font-mono">
                  {audit.closed_at ? new Date(audit.closed_at).toLocaleDateString("en-NG", { dateStyle: "medium" }) : new Date().toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row gap-3">
            <Link to={`/app/audits/${audit.id}/report`} className="pill-cta justify-center flex items-center gap-1.5 py-3 text-sm font-bold">
              Access Final Compliance Report
            </Link>
            <Link to="/app" className="pill-secondary justify-center py-3 text-sm font-bold">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{audit.standard.toUpperCase()}</span>
          <h1 className="mt-1 font-display text-3xl font-bold">{audit.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{audit.scope}</p>
        </div>
        <div className="flex items-center gap-3">
          {audit.standard === "hse" && (
            <button
              onClick={() => setShowHseChecklist(true)}
              className="pill-cta bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Inspection Checklist</span>
            </button>
          )}
          <span className="text-sm text-muted-foreground">Conformity: <strong className="text-foreground">{conformity}%</strong></span>
          <Link to={`/app/audits/${audit.id}/report`} className="pill-secondary">Report</Link>
          {audit.status === "in_progress" && (
            pendingCount > 0 ? (
              <button
                disabled
                className="pill-secondary cursor-not-allowed opacity-60 flex items-center gap-1.5"
                title="All checklist questions must be completed first"
              >
                <Lock className="h-3.5 w-3.5" />
                Submit Audit ({pendingCount} pending)
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={closeAudit}
                  disabled={isSubmitting}
                  className="pill-secondary flex items-center gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Lock className="h-3.5 w-3.5" />
                  {isSubmitting ? "Closing..." : "Close Audit"}
                </button>
                <button
                  onClick={submitAudit}
                  disabled={isSubmitting}
                  className="pill-cta animate-pulse flex items-center gap-1.5"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  {isSubmitting ? "Submitting..." : "Submit & Generate Report"}
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-2xl border border-border bg-card p-3 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <h3 className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Processes</h3>
          <ul className="space-y-1">
            {procs.map((proc) => (
              <li key={proc.id}>
                <button
                  onClick={() => setActiveProc(proc.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${activeProc === proc.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                >
                  {proc.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-h-0 space-y-4 flex-1">
          {!activeProc && <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">Pick a process on the left to begin.</div>}

          {activeProc && isUnassigned && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center max-w-xl mx-auto mt-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Assign Auditor to Proceed</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                To begin auditing <strong>{activeProcMeta?.name}</strong>, you must first assign a certified auditor. Once assigned, only that auditor will have access to record answers, upload evidence, and sync findings.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 justify-center">
                <select
                  className="input w-64 text-xs font-semibold"
                  value={tempAuditorId}
                  onChange={(e) => setTempAuditorId(e.target.value)}
                >
                  <option value="">— Select Auditor —</option>
                  {auditors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignAuditor(tempAuditorId)}
                  disabled={!tempAuditorId}
                  className="pill-cta text-xs px-4 py-2 shrink-0 disabled:opacity-50"
                >
                  Assign Auditor & Start
                </button>
              </div>
            </div>
          )}

          {activeProc && !isUnassigned && (
            <>
              {/* Premium Assignment Banner */}
              {isAssignedToMe ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Unlock className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">
                      ✓ You are the assigned auditor for <strong>{activeProcMeta?.name}</strong>. You have full edit access.
                    </span>
                  </div>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">Assigned to You</span>
                </div>
              ) : (
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Unlock className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">
                      ✓ This process is assigned to <strong>{assignedAuditor?.name || "another auditor"}</strong>. You have collaborative edit access.
                    </span>
                  </div>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">Collaborate Mode</span>
                </div>
              )}

              {clauseSets.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No questions found for this process under this standard.</div>
              )}

              {clauseSets.map((clauseSet: any) => (
                <div key={clauseSet.clause} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm font-semibold">{clauseSet.clause}</span>
                    <h3 className="font-display text-base font-semibold">{clauseSet.title}</h3>
                  </div>

                  {(clauseSet.evidence?.length ?? 0) > 0 && (
                    <div className="mt-3 rounded-xl border border-dashed border-border bg-background/70 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        <FileUp className="h-3.5 w-3.5" />
                        Evidence you should upload
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {clauseSet.evidence.map((item: string, index: number) => (
                          <span key={`${clauseSet.clause}-e-${index}`} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {(clauseSet.generic ?? []).map((question: string, index: number) => (
                      <Row
                        key={`g${index}`}
                        processId={activeProc}
                        clause={clauseSet.clause}
                        kind="generic"
                        qRef={`g${index}`}
                        q={question}
                        answers={answers}
                        finding={findingsMap[buildAnswerKey(activeProc, clauseSet.clause, "generic", `g${index}`)]}
                        evidenceHints={clauseSet.evidence ?? []}
                        uploading={uploadingFor === buildAnswerKey(activeProc, clauseSet.clause, "generic", `g${index}`)}
                        onSave={saveAnswer}
                        onSyncFinding={syncFinding}
                        onUploadEvidence={uploadEvidence}
                        readOnly={!canEdit}
                      />
                    ))}
                    {(clauseSet.specific ?? []).map((question: string, index: number) => (
                      <Row
                        key={`s${index}`}
                        processId={activeProc}
                        clause={clauseSet.clause}
                        kind="specific"
                        qRef={`s${index}`}
                        q={question}
                        answers={answers}
                        finding={findingsMap[buildAnswerKey(activeProc, clauseSet.clause, "specific", `s${index}`)]}
                        evidenceHints={clauseSet.evidence ?? []}
                        uploading={uploadingFor === buildAnswerKey(activeProc, clauseSet.clause, "specific", `s${index}`)}
                        onSave={saveAnswer}
                        onSyncFinding={syncFinding}
                        onUploadEvidence={uploadEvidence}
                        readOnly={!canEdit}
                      />
                    ))}
                    {custom.filter((item) => item.clause === clauseSet.clause).map((item) => (
                      <Row
                        key={item.id}
                        processId={activeProc}
                        clause={clauseSet.clause}
                        kind="custom"
                        qRef={item.id}
                        q={item.text}
                        answers={answers}
                        finding={findingsMap[buildAnswerKey(activeProc, clauseSet.clause, "custom", item.id)]}
                        evidenceHints={clauseSet.evidence ?? []}
                        uploading={uploadingFor === buildAnswerKey(activeProc, clauseSet.clause, "custom", item.id)}
                        onSave={saveAnswer}
                        onSyncFinding={syncFinding}
                        onUploadEvidence={uploadEvidence}
                        badge="Custom"
                        readOnly={!canEdit}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* HSE Inspection Checklist Modal */}
      {showHseChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="flex h-[85vh] w-full max-w-5xl flex-col rounded-[28px] border border-border bg-card shadow-elevated overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="border-b border-border/80 px-6 py-4 flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-500">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">HSE Site Inspection Checklist</h2>
                  <p className="text-xs text-muted-foreground">OIS HSE Site Inspection Reference Checklist (150 Items)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={hseSearch}
                    onChange={(e) => setHseSearch(e.target.value)}
                    placeholder="Search 150 checklist items..."
                    className="input pl-9 pr-4 py-1.5 text-xs h-9 w-full bg-background"
                  />
                  {hseSearch && (
                    <button
                      onClick={() => setHseSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-secondary text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowHseChecklist(false)}
                  className="rounded-xl p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                  aria-label="Close checklist"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Checklist Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Progress Tracker */}
              <div className="rounded-2xl border border-emerald-600/20 bg-emerald-600/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Walkthrough Progress</span>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-500/80 mt-0.5">Use this interactive helper to check off items as you tour the facility.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-foreground">{checkedHseItems.size} <span className="text-xs text-muted-foreground">/ 150</span></span>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Checked Items</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to reset your checklist tour progress?")) {
                        setCheckedHseItems(new Set());
                        if (id) localStorage.removeItem(`hse_checked_items_${id}`);
                      }
                    }}
                    className="text-xs text-destructive hover:underline font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Render Categories and Items */}
              <div className="space-y-6">
                {HSE_CHECKLIST_DATA.map((cat) => {
                  const filteredItems = cat.items.filter(item => 
                    item.item.toLowerCase().includes(hseSearch.toLowerCase()) || 
                    item.evidence.toLowerCase().includes(hseSearch.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={cat.title} className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
                      <h3 className="font-display text-sm font-bold text-foreground border-b border-border pb-2 flex items-center justify-between">
                        <span>{cat.title}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {cat.items.filter(i => checkedHseItems.has(i.id)).length} / {cat.items.length} done
                        </span>
                      </h3>
                      
                      <div className="grid gap-2.5">
                        {filteredItems.map((i) => {
                          const isChecked = checkedHseItems.has(i.id);
                          return (
                            <div 
                              key={i.id}
                              onClick={() => toggleHseItem(i.id)}
                              className={`flex items-start gap-3 rounded-xl p-3 border transition cursor-pointer select-none ${
                                isChecked 
                                  ? "border-emerald-600/30 bg-emerald-600/5 text-foreground" 
                                  : "border-border/60 hover:bg-secondary/40 text-foreground"
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0"
                              />
                              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                                <div className="text-xs font-medium leading-relaxed">
                                  <span className="font-bold text-muted-foreground mr-1.5">{i.id}.</span>
                                  {i.item}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono shrink-0">
                                  Evidence: {i.evidence}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Row({
  processId,
  clause,
  kind,
  qRef,
  q,
  answers,
  finding,
  evidenceHints,
  uploading,
  onSave,
  onSyncFinding,
  onUploadEvidence,
  badge,
  readOnly,
}: any) {
  const { toast } = useToast();
  const key = buildAnswerKey(processId, clause, kind, qRef);
  const answer = answers[key] ?? { clause, kind, q_ref: qRef, question_text: q, note: "", status: "pending" };
  const parsed = parseAuditNote(answer.note ?? "");
  
  const deriveSeverity = (type: string) => {
    if (type === "major") return "High";
    if (type === "minor") return "Medium";
    return "Low";
  };

  const [status, setStatus] = useState(answer.status);
  const [note, setNote] = useState(parsed.text);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(parsed.evidence);
  const [description, setDescription] = useState(finding?.description ?? (answer.question_text || q));
  const [capa, setCapa] = useState(finding?.capa ?? "");
  const [owner, setOwner] = useState(finding?.owner ?? "");
  const [dueDate, setDueDate] = useState(finding?.due_date ?? "");

  const meta = parseFindingMeta(finding?.root_cause ?? null);
  const [correction, setCorrection] = useState(meta?.correction ?? "");
  const [rootCauseText, setRootCauseText] = useState(meta?.rootCauseText ?? "");
  const [severity, setSeverity] = useState(meta?.severity ?? deriveSeverity(finding?.type ?? status));

  useEffect(() => {
    const latest = parseAuditNote(answer.note ?? "");
    const latestMeta = parseFindingMeta(finding?.root_cause ?? null);
    setStatus(answer.status);
    setNote(latest.text);
    setEvidence(latest.evidence);
    setDescription(finding?.description ?? (answer.question_text || q));
    setCapa(finding?.capa ?? "");
    setOwner(finding?.owner ?? "");
    setDueDate(finding?.due_date ?? "");
    setCorrection(latestMeta?.correction ?? "");
    setRootCauseText(latestMeta?.rootCauseText ?? "");
    setSeverity(latestMeta?.severity ?? deriveSeverity(finding?.type ?? answer.status));
  }, [answer.id, answer.note, answer.status, finding?.id, q]);

  const persistAnswer = async (nextStatus: string, nextNote: string, nextEvidence = evidence) => {
    await onSave({
      process_id: processId,
      clause,
      kind,
      q_ref: qRef,
      question_text: q,
      status: nextStatus,
      note: nextNote,
      evidence: nextEvidence,
    });
  };

  const persistFinding = async (nextStatus = status) => {
    await onSyncFinding({
      processId,
      clause,
      kind,
      qRef,
      questionText: q,
      answerStatus: nextStatus,
      description,
      capa,
      owner,
      dueDate,
      correction,
      rootCauseText,
      severity,
    });
  };

  const handleAutoDeclare = async () => {
    const nextStatus = "minor";
    const nextDescText = `Clause ${clause} requirement is not fully met: ${q}`;
    const nextCapa = "Perform root cause analysis, revise operational procedure to address discrepancy, and conduct training session for relevant personnel.";
    const nextOwner = "Process Owner";
    const nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const nextCorrection = "Immediately contain the issue, quarantine affected areas/items, and inform the team.";
    const nextRootCause = "Lack of formal training and standard operational compliance monitoring.";
    const nextSeverity = "Medium";

    setStatus(nextStatus);
    setDescription(nextDescText);
    setCapa(nextCapa);
    setOwner(nextOwner);
    setDueDate(nextDueDate);
    setCorrection(nextCorrection);
    setRootCauseText(nextRootCause);
    setSeverity(nextSeverity);

    // Save answer as 'minor' status
    await onSave({
      process_id: processId,
      clause,
      kind,
      q_ref: qRef,
      question_text: q,
      status: nextStatus,
      note: note || "Finding automatically declared during audit.",
      evidence,
    });

    // Auto-sync finding details to the registry
    await onSyncFinding({
      processId,
      clause,
      kind,
      qRef,
      questionText: q,
      answerStatus: nextStatus,
      description: nextDescText,
      capa: nextCapa,
      owner: nextOwner,
      dueDate: nextDueDate,
      correction: nextCorrection,
      rootCauseText: nextRootCause,
      severity: nextSeverity,
    });

    toast({
      title: "Finding declared automatically",
      description: "Successfully registered as a minor non-conformity with a default CAPA plan, assigned owner, and 30-day due date.",
    });
  };

  return (
    <div className="rounded-xl border border-border p-4 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[280px]">
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {answer.question_text || q}
            {badge && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold">{badge}</span>}
          </p>
          {evidenceHints.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Suggested evidence: {evidenceHints.slice(0, 2).join(" · ")}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!NONCONFORMING.has(status) && !readOnly && (
            <button
              onClick={handleAutoDeclare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-warning/35 bg-warning/5 px-3.5 py-2 text-xs font-semibold text-warning transition hover:bg-warning/10"
              title="Automatically declare this question as an audit finding"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Auto-declare finding
            </button>
          )}
          <select
            value={status}
            onChange={async (e) => {
              const nextStatus = e.target.value;
              setStatus(nextStatus);
              await persistAnswer(nextStatus, note);
              await persistFinding(nextStatus);
            }}
            disabled={readOnly}
            className="input w-32 text-xs animate-none"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item === "na" ? "N/A" : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => persistAnswer(status, note)}
        placeholder={readOnly ? "No notes recorded." : "Auditor notes and observations..."}
        disabled={readOnly}
        className="input mt-3 min-h-[72px] text-sm"
      />

      <div className="mt-3 rounded-xl border border-dashed border-border bg-background/70 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              Evidence uploads
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Upload records, photos, screenshots, reports, approvals, logs, or signed documents that support this answer.</p>
          </div>
          {!readOnly && (
            <label className="pill-secondary cursor-pointer animate-none">
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.mp4,.wav,.mp3"
                onChange={async (e) => {
                  const uploaded = await onUploadEvidence({ processId, clause, kind, qRef, files: e.target.files, currentNote: note });
                  if (uploaded) setEvidence(uploaded);
                  e.currentTarget.value = "";
                }}
              />
              {uploading ? "Uploading..." : "Upload evidence"}
            </label>
          )}
        </div>

        {evidence.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {evidence.map((item) => (
              <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>

      {NONCONFORMING.has(status) && (
        <div className="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Finding record auto-created
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Just specify the issue details below. This will feed the findings register and the final report automatically.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Finding statement</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => persistFinding()} disabled={readOnly} className="input min-h-[76px] text-sm" />
            </div>
            
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Correction / Containment Action (Immediate containment)</label>
              <textarea value={correction} onChange={(e) => setCorrection(e.target.value)} onBlur={() => persistFinding()} placeholder={readOnly ? "No containment action specified." : "Contain the problem, isolate/quarantine affected items, clean up immediately..."} disabled={readOnly} className="input min-h-[76px] text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Root Cause Analysis (RCA) Details</label>
              <textarea value={rootCauseText} onChange={(e) => setRootCauseText(e.target.value)} onBlur={() => persistFinding()} placeholder={readOnly ? "No RCA recorded." : "Why did this occur? Trace back to procedural, tool, training, or systemic root causes..."} disabled={readOnly} className="input min-h-[76px] text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Corrective & Preventive Action (CAPA)</label>
              <textarea value={capa} onChange={(e) => setCapa(e.target.value)} onBlur={() => persistFinding()} placeholder={readOnly ? "No CAPA specified." : "Long-term actions to prevent recurrence..."} disabled={readOnly} className="input min-h-[76px] text-sm" />
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Severity Rating</label>
              <select value={severity} onChange={(e) => {
                const nextSeverity = e.target.value;
                setSeverity(nextSeverity);
                onSyncFinding({
                  processId,
                  clause,
                  kind,
                  qRef,
                  questionText: q,
                  answerStatus: status,
                  description,
                  capa,
                  owner,
                  dueDate,
                  correction,
                  rootCauseText,
                  severity: nextSeverity,
                });
              }} disabled={readOnly} className="input text-xs">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Owner</label>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} onBlur={() => persistFinding()} disabled={readOnly} className="input" placeholder="Responsible person" />
            </div>
            
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} onBlur={() => persistFinding()} disabled={readOnly} className="input w-full md:w-1/2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildAnswerKey(processId: string, clause: string, kind: string, qRef: string) {
  return `${processId}|${clause}|${kind}|${qRef}`;
}

function parseFindingMeta(rootCause: string | null) {
  if (!rootCause?.startsWith(AUTO_FINDING_PREFIX)) return null;
  try {
    return JSON.parse(rootCause.slice(AUTO_FINDING_PREFIX.length)) as {
      processId: string;
      kind: string;
      qRef: string;
      correction?: string;
      rootCauseText?: string;
      severity?: string;
    };
  } catch {
    return null;
  }
}
