import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, FileUp, Link2, Lock, Unlock, User, RefreshCw, CheckCircle2, Clock, X, Search, ClipboardCheck, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionsFor, isProcessInStandard, type StandardKey } from "@/data/standards";
import { useToast } from "@/hooks/use-toast";
import { parseAuditNote, serializeAuditNote, safeEvidenceName, type EvidenceItem } from "@/lib/auditEvidence";
import { HSE_CHECKLIST_DATA } from "@/data/hseInspectionChecklist";
import { IMS_CHECKLIST_DATA } from "@/data/imsInspectionChecklist";
import { Skeleton } from "@/components/ui/skeleton";


type Audit = { id: string; title: string; standard: string; scope: string | null; status: string; org_id: string; lead_auditor_id: string | null; owner: string | null };
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

const getApplicableStandards = (auditStd: string): string[] => {
  if (auditStd === "ims") return ["9001", "14001", "45001", "ims"];
  if (auditStd === "hse") return ["14001", "45001", "hse"];
  if (auditStd === "27001") return ["9001", "27001"];
  return [auditStd];
};

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
  const [allCustom, setAllCustom] = useState<any[]>([]);
  const [findingsMap, setFindingsMap] = useState<Record<string, FindingRow>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  
  const [auditors, setAuditors] = useState<{ id: string; name: string; user_id: string | null }[]>([]);
  const [auditProcesses, setAuditProcesses] = useState<{ process_id: string; auditor_id: string | null }[]>([]);
  const [tempAuditorId, setTempAuditorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLead, setIsLead] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [showHseChecklist, setShowHseChecklist] = useState(false);
  const [hseSearch, setHseSearch] = useState("");
  const [checklistAnswers, setChecklistAnswers] = useState<Record<number, { status: string; note: string; evidence: EvidenceItem[] }>>({});
  const [uploadingChecklistFor, setUploadingChecklistFor] = useState<number | null>(null);

  // Delegated modal states for configuring findings
  const [editingFinding, setEditingFinding] = useState<any | null>(null);
  const [modalProcessId, setModalProcessId] = useState("");
  const [modalDueDate, setModalDueDate] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalSeverity, setModalSeverity] = useState("Medium");

  useEffect(() => {
    if (editingFinding) {
      setModalProcessId(editingFinding.processId);
      setModalDueDate(editingFinding.finding?.due_date ?? "");
      setModalDescription(editingFinding.finding?.description ?? "");
      const meta = parseFindingMeta(editingFinding.finding?.root_cause ?? null);
      setModalSeverity(meta?.severity ?? (editingFinding.finding?.type === "major" ? "High" : editingFinding.finding?.type === "minor" ? "Medium" : "Low"));
    }
  }, [editingFinding]);

  useEffect(() => {
    if (!id) return;
    const ckKey = `checklist_answers_${id}`;
    const ckSaved = localStorage.getItem(ckKey);
    if (ckSaved) {
      try {
        setChecklistAnswers(JSON.parse(ckSaved));
      } catch (e) {
        console.error("Error loading checklist answers", e);
      }
    }
  }, [id]);

  const saveChecklistAnswer = (itemId: number, status: string, note: string, evidence: EvidenceItem[]) => {
    const updated = {
      ...checklistAnswers,
      [itemId]: { status, note, evidence }
    };
    setChecklistAnswers(updated);
    if (id) {
      localStorage.setItem(`checklist_answers_${id}`, JSON.stringify(updated));
    }
  };

  const uploadChecklistEvidence = async (itemId: number, files: FileList | null, currentNote: string, currentStatus: string) => {
    if (!id || !currentOrg || !files?.length) return;
    setUploadingChecklistFor(itemId);
    try {
      const existing = checklistAnswers[itemId]?.evidence ?? [];
      const nextEvidence = [...existing];

      for (const file of Array.from(files)) {
        const path = `${currentOrg.id}/${id}/checklist/${itemId}/${Date.now()}-${safeEvidenceName(file.name)}`;
        const { error } = await supabase.storage.from("audit-evidence").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("audit-evidence").getPublicUrl(path);
        nextEvidence.push({ name: file.name, url: data.publicUrl, kind: file.type || "file" });
      }

      saveChecklistAnswer(itemId, currentStatus, currentNote, nextEvidence);
      toast({ title: "Evidence uploaded", description: `${files.length} file(s) attached to checklist item.` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error?.message ?? "Could not upload evidence.", variant: "destructive" });
    } finally {
      setUploadingChecklistFor(null);
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

        // Query default process assignments from onboarding/settings
        const { data: assignmentsData } = await supabase
          .from("process_assignments")
          .select("process_id, auditor_id")
          .eq("org_id", currentOrg.id);

        const assignmentMap = new Map<string, string>();
        if (assignmentsData) {
          assignmentsData.forEach((a) => {
            assignmentMap.set(a.process_id, a.auditor_id);
          });
        }

        const rowsToInsert = visibleProcs.map((p) => ({
          audit_id: id,
          process_id: p.id,
          auditor_id: assignmentMap.get(p.id) || auditorId || null,
        }));

        if (rowsToInsert.length > 0) {
          await supabase.from("audit_processes").insert(rowsToInsert);
          const { data: updatedAuditProcs } = await supabase.from("audit_processes").select("process_id,auditor_id").eq("audit_id", id);
          if (updatedAuditProcs) finalAuditProcs = updatedAuditProcs;
        }
      }
      setAuditProcesses(finalAuditProcs as any);

      // 4.5. Check user's role to see if they are an auditor
      let currentAuditorId = null;
      let userIsLead = false;
      if (user) {
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("org_id", currentOrg.id)
          .maybeSingle();

        const { data: auditorRow } = await supabase
          .from("auditors")
          .select("id, role")
          .eq("org_id", currentOrg.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (auditorRow) {
          currentAuditorId = auditorRow.id;
          if (auditorRow.role === "lead_auditor" || auditorRow.id === currentAudit.lead_auditor_id) {
            userIsLead = true;
          }
        }

        if (userRole?.role === "admin" || userRole?.role === "owner" || !auditorRow) {
          userIsLead = true;
        }
      }
      setIsLead(userIsLead);

      // Filter procs list to only show processes linked to this audit and assigned to this auditor (or all if lead/admin)
      const auditProcIds = new Set(
        finalAuditProcs
          .filter((ap) => userIsLead || !currentAuditorId || ap.auditor_id === currentAuditorId)
          .map((ap) => ap.process_id)
      );
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
      setPageLoading(false);
    })();
  }, [id, currentOrg, user]);

  useEffect(() => {
    if (!currentOrg || !audit || !activeProc) return;
    const proc = procs.find((process) => process.id === activeProc);
    if (!proc) return;
    const applicableStds = getApplicableStandards(audit.standard);
    supabase
      .from("custom_questions")
      .select("id,clause,text,created_at")
      .eq("org_id", currentOrg.id)
      .in("standard", applicableStds)
      .eq("process_key", proc.key)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setCustom((data ?? []) as Custom[]));
  }, [currentOrg, audit, activeProc, procs]);

  useEffect(() => {
    if (!currentOrg || !audit) return;
    const applicableStds = getApplicableStandards(audit.standard);
    supabase
      .from("custom_questions")
      .select("id,clause,text,process_key,created_at")
      .eq("org_id", currentOrg.id)
      .in("standard", applicableStds)
      .eq("active", true)
      .then(({ data }) => setAllCustom(data ?? []));
  }, [currentOrg, audit]);

  const activeProcMeta = procs.find((process) => process.id === activeProc);
  const clauseSets = useMemo(() => {
    if (!activeProcMeta) return [];
    try {
      const allSets = getQuestionsFor(stdForBank, activeProcMeta.key as any) ?? [];
      return allSets.filter(c => c.clause !== "Checklist");
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
      // Add custom questions for this process
      const procCustom = allCustom.filter((item) => item.process_key === p.key);
      procCustom.forEach((item) => {
        list.push({ processId: p.id, clause: item.clause, kind: "custom", qRef: item.id, text: item.text });
      });

      const clauses = getQuestionsFor(stdForBank, p.key as any) ?? [];
      clauses.forEach((c) => {
        if (c.clause === "Checklist") return; // Skip inspection checklist items from audit questions
        (c.generic ?? []).forEach((q, idx) => {
          list.push({ processId: p.id, clause: c.clause, kind: "generic", qRef: `g${idx}`, text: q });
        });
        (c.specific ?? []).forEach((q, idx) => {
          list.push({ processId: p.id, clause: c.clause, kind: "specific", qRef: `s${idx}`, text: q });
        });
      });
    });
    return list;
  }, [procs, stdForBank, allCustom]);

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

  if (pageLoading || !audit) {
    return (
      <AppShell>
        <div className="flex flex-wrap items-end justify-between gap-3 animate-pulse">
          <div>
            <Skeleton className="h-3.5 w-20 bg-secondary/80 rounded" />
            <Skeleton className="mt-2 h-9 w-72 bg-secondary/80 rounded-xl" />
            <Skeleton className="mt-2.5 h-4 w-96 bg-secondary/80 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24 bg-secondary/80 rounded" />
            <Skeleton className="h-10 w-24 bg-secondary/80 rounded-full" />
            <Skeleton className="h-10 w-36 bg-secondary/80 rounded-full" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start animate-pulse">
          <aside className="rounded-[24px] border border-border bg-card p-4 lg:h-[calc(100vh-8rem)]">
            <Skeleton className="h-4 w-24 bg-secondary/85 rounded-md mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full bg-secondary/70 rounded-xl" />
              <Skeleton className="h-9 w-full bg-secondary/70 rounded-xl" />
              <Skeleton className="h-9 w-full bg-secondary/70 rounded-xl" />
              <Skeleton className="h-9 w-full bg-secondary/70 rounded-xl" />
              <Skeleton className="h-9 w-full bg-secondary/70 rounded-xl" />
            </div>
          </aside>

          <div className="min-h-0 space-y-5 flex-1">
            <div className="rounded-[24px] border border-border bg-card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-48 bg-secondary/80 rounded-lg" />
                <Skeleton className="h-9 w-32 bg-secondary/80 rounded-full" />
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[24px] border border-border bg-card p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-56 bg-secondary/80 rounded-lg" />
                    <Skeleton className="h-6 w-20 bg-secondary/80 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full bg-secondary/70 rounded" />
                  <Skeleton className="h-4 w-5/6 bg-secondary/70 rounded" />
                  <div className="flex gap-2.5 pt-2">
                    <Skeleton className="h-9 w-24 bg-secondary/70 rounded-xl" />
                    <Skeleton className="h-9 w-24 bg-secondary/70 rounded-xl" />
                    <Skeleton className="h-9 w-24 bg-secondary/70 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }


  const submitAudit = async () => {
    if (!id) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("audits")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", id);
      
    setIsSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Audit Submitted Successfully", description: "Your ISO compliance report has been generated." });
    setAudit(audit ? { ...audit, status: "closed", closed_at: new Date().toISOString() } : null);
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
              ISO AUDIT MANAGEMENT PORT's compliance engine is currently compiling your audit checklists, calculating standard conformity scores, cross-mapping nonconformities, and preparing your formal regulatory audit reports.
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
                const { error } = await supabase.from("audits").update({ status: "closed" }).eq("id", id);
                setLoading(false);
                if (error) {
                  toast({ title: "Status Check Failed", description: error.message, variant: "destructive" });
                  return;
                }
                setAudit(audit ? { ...audit, status: "closed" } : null);
                toast({ title: "Compliance Report Compiled!", description: "You can now review your final reports." });
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
              In accordance with international ISO standards (ISO 19011) and ISO AUDIT MANAGEMENT PORT's proprietary data protection policy, <strong>all checklists, answer logs, and evidence links are permanently frozen</strong> to maintain regulatory integrity, compliance traceability, and prevent post-audit tampering.
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
          {(audit.standard === "hse" || audit.standard === "ims") && (
            <button
              onClick={() => setShowHseChecklist(true)}
              className="pill-cta bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Inspection Checklist</span>
            </button>
          )}
          <span className="text-sm text-muted-foreground">Conformity: <strong className="text-foreground">{conformity}%</strong></span>
          {audit.status === "in_progress" && (
            isLead ? (
              pendingCount > 0 ? (
                <button
                  disabled
                  className="pill-secondary cursor-not-allowed opacity-60 flex items-center gap-1.5"
                  title="All process audit questions must be completed first"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Submit & Generate Report ({pendingCount} pending)
                </button>
              ) : (
                <button
                  onClick={submitAudit}
                  disabled={isSubmitting}
                  className="pill-cta animate-pulse flex items-center gap-1.5"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  {isSubmitting ? "Submitting..." : "Submit & Generate Report"}
                </button>
              )
            ) : (
              pendingCount > 0 ? (
                <button
                  disabled
                  className="pill-secondary cursor-not-allowed opacity-60 flex items-center gap-1.5"
                  title="All of your assigned process questions must be completed first"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Submit My Allocation ({pendingCount} pending)
                </button>
              ) : (
                <button
                  onClick={() => {
                    toast({
                      title: "Allocation Completed Successfully",
                      description: "Your assigned processes are complete. The Lead Auditor/Admin will generate the final report when all processes are finished.",
                    });
                  }}
                  className="pill-cta bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  Submit My Allocation
                </button>
              )
            )
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-2xl border border-border bg-card p-3 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-2 border-b border-border/40 mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Processes</h3>
            <Link 
              to="/app/processes" 
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-secondary"
              title="Manage Processes"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>
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
          {!activeProc && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
              <span>Pick a process on the left to begin.</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">Or manage your organization's processes:</span>
                <Link 
                  to="/app/processes" 
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Manage Processes
                </Link>
              </div>
            </div>
          )}

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

              {custom.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <span className="font-mono text-base font-bold text-primary">★</span>
                    <h3 className="font-display text-base font-bold text-foreground">Added Custom Questions</h3>
                  </div>
                  <div className="space-y-3">
                    {custom.map((item, index) => (
                      <Row
                        key={item.id}
                        index={index + 1}
                        processId={activeProc}
                        clause={item.clause}
                        kind="custom"
                        qRef={item.id}
                        q={item.text}
                        answers={answers}
                        finding={findingsMap[buildAnswerKey(activeProc, item.clause, "custom", item.id)]}
                        evidenceHints={[]}
                        uploading={uploadingFor === buildAnswerKey(activeProc, item.clause, "custom", item.id)}
                        onSave={saveAnswer}
                        onSyncFinding={syncFinding}
                        onUploadEvidence={uploadEvidence}
                        badge="Custom"
                        readOnly={!canEdit}
                        orgName={currentOrg?.name}
                        onConfigureFinding={setEditingFinding}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                let questionIndex = custom.length;
                return clauseSets.map((clauseSet: any) => (
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
                      {(clauseSet.generic ?? []).map((question: string, index: number) => {
                        questionIndex++;
                        return (
                          <Row
                            key={`g${index}`}
                            index={questionIndex}
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
                            orgName={currentOrg?.name}
                            onConfigureFinding={setEditingFinding}
                          />
                        );
                      })}
                      {(clauseSet.specific ?? []).map((question: string, index: number) => {
                        questionIndex++;
                        return (
                          <Row
                            key={`s${index}`}
                            index={questionIndex}
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
                            orgName={currentOrg?.name}
                            onConfigureFinding={setEditingFinding}
                          />
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </>
          )}
        </div>
      </div>

      {/* HSE / IMS Inspection Checklist Modal */}
      {showHseChecklist && (() => {
        const isIms = audit?.standard === "ims";
        const checklistData = isIms ? IMS_CHECKLIST_DATA : HSE_CHECKLIST_DATA;
        const totalItems = isIms ? 30 : 150;
        const titleText = isIms ? "IMS Site Inspection Checklist" : "HSE Site Inspection Checklist";
        const subtitleText = isIms ? "IMS Site Inspection Reference Checklist (30 Items)" : "OIS HSE Site Inspection Reference Checklist (150 Items)";
        const searchPlaceholder = isIms ? "Search 30 checklist items..." : "Search 150 checklist items...";
        const answeredItemsCount = Object.values(checklistAnswers).filter(a => a && a.status !== "pending").length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-fade-in">
            <div className="flex h-[85vh] w-full max-w-5xl flex-col rounded-[28px] border border-border bg-card shadow-elevated overflow-hidden animate-fade-in-up">
              
              {/* Modal Header */}
              <div className="border-b border-border/80 px-6 py-4 flex items-center justify-between bg-secondary/30">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-500">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">{titleText}</h2>
                    <p className="text-xs text-muted-foreground">{subtitleText}</p>
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
                      placeholder={searchPlaceholder}
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
                    onClick={() => {
                      setShowHseChecklist(false);
                      setHseSearch("");
                    }}
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
                      <span className="text-lg font-extrabold text-foreground">{answeredItemsCount} <span className="text-xs text-muted-foreground">/ {totalItems}</span></span>
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Answered Items</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (window.confirm("Are you sure you want to reset your checklist tour progress?")) {
                          setChecklistAnswers({});
                          if (id) localStorage.removeItem(`checklist_answers_${id}`);
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
                  {checklistData.map((cat) => {
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
                            {cat.items.filter(i => {
                              const ans = checklistAnswers[i.id];
                              return ans && ans.status !== "pending";
                            }).length} / {cat.items.length} answered
                          </span>
                        </h3>
                        
                        <div className="grid gap-2.5">
                          {filteredItems.map((i) => {
                            const ans = checklistAnswers[i.id] ?? { status: "pending", note: "", evidence: [] };
                            return (
                              <div key={i.id} className="rounded-xl border border-border p-4 bg-card space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex-1 min-w-[280px]">
                                    <p className="text-xs font-semibold leading-relaxed text-foreground">
                                      <span className="font-bold text-muted-foreground mr-1.5">{i.id}.</span>
                                      {i.item}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground">Suggested evidence: {i.evidence}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={ans.status}
                                      onChange={(e) => {
                                        saveChecklistAnswer(i.id, e.target.value, ans.note, ans.evidence);
                                      }}
                                      className="input w-32 text-xs py-1 h-8 animate-none"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="done">Done / Conform</option>
                                      <option value="not_done">Not Done</option>
                                      <option value="partial">Partial</option>
                                      <option value="na">N/A</option>
                                    </select>
                                  </div>
                                </div>

                                <textarea
                                  value={ans.note}
                                  onChange={(e) => {
                                    saveChecklistAnswer(i.id, ans.status, e.target.value, ans.evidence);
                                  }}
                                  placeholder="Checklist notes/observations..."
                                  className="input min-h-[50px] text-xs py-1.5 font-sans"
                                />

                                <div className="rounded-lg border border-dashed border-border bg-background/50 p-2.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                      <Link2 className="h-3 w-3" />
                                      Evidence Uploads
                                    </div>
                                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2 py-1 text-[10px] font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                                      <FileUp className="h-3 w-3" />
                                      {uploadingChecklistFor === i.id ? "Uploading..." : "Upload File"}
                                      <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        disabled={uploadingChecklistFor !== null}
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files.length > 0) {
                                            uploadChecklistEvidence(i.id, e.target.files, ans.note, ans.status);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>

                                  {ans.evidence && ans.evidence.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {ans.evidence.map((file: any, fileIdx: number) => (
                                        <div key={fileIdx} className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/30 px-2 py-0.5 text-[10px] text-foreground">
                                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="max-w-[120px] truncate hover:underline" title={file.name}>
                                            {file.name}
                                          </a>
                                          <button
                                            onClick={() => {
                                              const nextEv = ans.evidence.filter((_: any, idx: number) => idx !== fileIdx);
                                              saveChecklistAnswer(i.id, ans.status, ans.note, nextEv);
                                            }}
                                            className="rounded-full p-0.5 hover:bg-secondary text-muted-foreground hover:text-foreground"
                                          >
                                            <X className="h-2.5 w-2.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
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
        );
      })()}

      {editingFinding && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in cursor-pointer"
          onClick={() => setEditingFinding(null)}
        >
          <div 
            className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-elevated space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto font-sans cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                Configure Audit Finding (Clause {editingFinding.clause})
              </h3>
              <button
                onClick={() => setEditingFinding(null)}
                className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Audit</label>
                <input
                  type="text"
                  value={audit?.title ?? ""}
                  disabled
                  className="input opacity-65 cursor-not-allowed bg-secondary/30 w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Owner</label>
                <input
                  type="text"
                  value={audit?.owner ?? currentOrg?.name ?? "Auditee"}
                  disabled
                  className="input opacity-65 cursor-not-allowed bg-secondary/30 w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Severity Rating</label>
                <select
                  value={modalSeverity}
                  onChange={(e) => setModalSeverity(e.target.value)}
                  className="input w-full"
                >
                  <option value="High">Major</option>
                  <option value="Medium">Minor</option>
                  <option value="Low">Observation</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Process</label>
                <select
                  value={modalProcessId}
                  onChange={(e) => setModalProcessId(e.target.value)}
                  className="input w-full"
                >
                  {procs.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Due Date</label>
                <input
                  type="date"
                  value={modalDueDate}
                  onChange={(e) => setModalDueDate(e.target.value)}
                  className="input w-full md:w-1/2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Finding Statement / Description</label>
                <textarea
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="input min-h-[80px] w-full"
                  placeholder="Describe the discrepancy or compliance gap..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setEditingFinding(null)}
                className="pill-secondary"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const mappedStatus = modalSeverity === "High" ? "major" : modalSeverity === "Medium" ? "minor" : "observation";
                  
                  await saveAnswer({
                    process_id: editingFinding.processId,
                    clause: editingFinding.clause,
                    kind: editingFinding.kind,
                    q_ref: editingFinding.qRef,
                    question_text: editingFinding.questionText,
                    status: mappedStatus,
                    note: "Finding details updated in modal.",
                    evidence: [],
                  });

                  const meta = parseFindingMeta(editingFinding.finding?.root_cause ?? null);
                  await syncFinding({
                    processId: modalProcessId,
                    clause: editingFinding.clause,
                    kind: editingFinding.kind,
                    qRef: editingFinding.qRef,
                    questionText: editingFinding.questionText,
                    answerStatus: mappedStatus,
                    description: modalDescription,
                    capa: editingFinding.finding?.capa ?? "",
                    owner: audit?.owner || currentOrg?.name || "Auditee",
                    dueDate: modalDueDate,
                    correction: meta?.correction ?? "",
                    rootCauseText: meta?.rootCauseText ?? "",
                    severity: modalSeverity,
                  });

                  setEditingFinding(null);
                  toast({ title: "Finding saved successfully." });
                }}
                className="pill-cta"
              >
                Save Finding
              </button>
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
  onConfigureFinding,
  badge,
  readOnly,
  index,
  currentUser,
  orgName,
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

  const ownerName = orgName || "Auditee";

  useEffect(() => {
    const latest = parseAuditNote(answer.note ?? "");
    setStatus(answer.status);
    setNote(latest.text);
    setEvidence(latest.evidence);
  }, [answer.id, answer.note, answer.status, finding?.id, q]);

  const persistAnswer = async (nextStatus: string, nextNote: string, nextEvidence = evidence) => {
    await onSave({
      process_id: processId,
      clause,
      kind,
      q_ref: qRef,
      question_text: answer.question_text || q,
      status: nextStatus,
      note: nextNote,
      evidence: nextEvidence,
    });
  };

  const persistFinding = async (nextStatus = status) => {
    const meta = parseFindingMeta(finding?.root_cause ?? null);
    await onSyncFinding({
      processId,
      clause,
      kind,
      qRef,
      questionText: answer.question_text || q,
      answerStatus: nextStatus,
      description: finding?.description ?? "",
      capa: finding?.capa ?? "",
      owner: ownerName,
      dueDate: finding?.due_date ?? "",
      correction: meta?.correction ?? "",
      rootCauseText: meta?.rootCauseText ?? "",
      severity: meta?.severity ?? (finding?.type === "major" ? "High" : finding?.type === "minor" ? "Medium" : "Low"),
    });
  };

  // Debounced auto-save effect for notes
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialNote = parseAuditNote(answer.note ?? "").text;
      if (note !== initialNote) {
        persistAnswer(status, note);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [note]);

  const handleAutoDeclare = async () => {
    const nextStatus = "minor";
    setStatus(nextStatus);
    await persistAnswer(nextStatus, note);
    onConfigureFinding({ processId, clause, kind, qRef, questionText: answer.question_text || q, finding });
  };

  const handleCancelFinding = async () => {
    const nextStatus = "pending";
    setStatus(nextStatus);
    
    const nextNote = note === "Finding automatically declared during audit." ? "" : note;
    setNote(nextNote);

    await onSave({
      process_id: processId,
      clause,
      kind,
      q_ref: qRef,
      question_text: answer.question_text || q,
      status: nextStatus,
      note: nextNote,
      evidence,
    });

    await onSyncFinding({
      processId,
      clause,
      kind,
      qRef,
      questionText: answer.question_text || q,
      answerStatus: nextStatus,
      description: "",
      capa: "",
      owner: ownerName,
      dueDate: "",
      correction: "",
      rootCauseText: "",
      severity: "Medium",
    });

    toast({
      title: "Finding cancelled",
      description: "The non-conformity finding has been removed.",
    });
  };

  return (
    <div className="rounded-xl border border-border p-4 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[280px]">
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {index ? <span className="font-bold text-muted-foreground mr-1.5">{index}.</span> : null}
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
          {NONCONFORMING.has(status) && !readOnly && (
            <button
              onClick={handleCancelFinding}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              title="Cancel and remove this audit finding"
            >
              <X className="h-3.5 w-3.5" />
              Cancel finding
            </button>
          )}
          <select
            value={status}
            onChange={async (e) => {
              const nextStatus = e.target.value;
              setStatus(nextStatus);
              await persistAnswer(nextStatus, note);
              if (NONCONFORMING.has(nextStatus)) {
                onConfigureFinding({ processId, clause, kind, qRef, questionText: answer.question_text || q, finding });
              } else {
                await persistFinding(nextStatus);
              }
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
        <div className="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>Finding details declared</span>
          </div>
          <button
            onClick={() => onConfigureFinding({ processId, clause, kind, qRef, questionText: answer.question_text || q, finding })}
            className="pill-secondary py-1.5 px-3.5 text-xs bg-warning/10 border-warning/20 hover:bg-warning/20 text-warning"
          >
            Configure Finding Details
          </button>
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
