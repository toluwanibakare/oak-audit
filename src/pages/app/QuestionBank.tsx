import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { getQuestionsFor, STANDARDS, getProcessesFor, type StandardKey } from "@/data/standards";
import { ISO_CLAUSES_FOR_AUDIT } from "@/data/processAudit";
import { BookOpen, Settings, Search, Plus, Edit2, Check, X, Copy, HelpCircle, Layers } from "lucide-react";

type Audit = {
  id: string;
  title: string;
  standard: string;
  scope: string | null;
  status: string;
  created_at: string;
};

type CustomQuestion = {
  id: string;
  clause: string;
  text: string;
  evidence: string | null;
  reference: string | null;
  active: boolean;
};

type Answer = {
  id?: string;
  clause: string;
  kind: string;
  q_ref: string;
  question_text: string | null;
  note: string | null;
  status: string;
};

export default function QuestionBank() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"browse" | "manage">("browse");

  // Tab 1: Browse State
  const [browseStd, setBrowseStd] = useState<StandardKey>("9001");
  const [browseProc, setBrowseProc] = useState("");
  const browseProcessesList = useMemo(() => getProcessesFor(browseStd), [browseStd]);

  // Tab 2: Manage Audits State
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [auditProcs, setAuditProcs] = useState<{ id: string; key: string; name: string }[]>([]);
  const [selectedAuditProc, setSelectedAuditProc] = useState<string>("");

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Editing state
  const [editingQuestionKey, setEditingQuestionKey] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Adding state
  const [newQuestion, setNewQuestion] = useState({ clause: "", text: "", evidence: "", reference: "" });

  // Importing modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSrcStd, setImportSrcStd] = useState<StandardKey>("9001");
  const [importSrcProc, setImportSrcProc] = useState("");
  const [selectedImportKeys, setSelectedImportKeys] = useState<Set<string>>(new Set());

  const importProcessesList = useMemo(() => getProcessesFor(importSrcStd), [importSrcStd]);

  // Copy-to-another modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyTargetQuestion, setCopyTargetQuestion] = useState<{ text: string; evidence: string | null } | null>(null);
  const [copyDestStd, setCopyDestStd] = useState<StandardKey>("9001");
  const [copyDestProc, setCopyDestProc] = useState("");
  const [copyDestClause, setCopyDestClause] = useState("");

  const copyDestProcessesList = useMemo(() => getProcessesFor(copyDestStd), [copyDestStd]);

  // Restrict Copy & Text Selection globally inside the Question Bank workspace
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Access Restricted",
        description: "Copying text is disabled in the Question Bank to protect intellectual property.",
        variant: "destructive",
      });
    };
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
    };
  }, []);

  // Load basic data
  const loadBasicData = async () => {
    if (!currentOrg) return;
    // Load audits
    const { data: auditData } = await supabase
      .from("audits")
      .select("*")
      .eq("org_id", currentOrg.id)
      .order("created_at", { ascending: false });
    setAudits((auditData ?? []) as Audit[]);
  };

  useEffect(() => {
    loadBasicData();
  }, [currentOrg]);

  // Load processes linked to selected audit
  useEffect(() => {
    if (!selectedAudit || !currentOrg) {
      setAuditProcs([]);
      setSelectedAuditProc("");
      return;
    }

    const loadAuditProcs = async () => {
      // Fetch org processes linked to this audit
      const { data } = await supabase
        .from("audit_processes")
        .select("process_id, org_processes(id, key, name, scope)")
        .eq("audit_id", selectedAudit.id);
      
      const parsedProcs = (data ?? [])
        .map((ap: any) => ap.org_processes)
        .filter(Boolean)
        .map((p: any) => ({ id: p.id, key: p.key, name: p.name }));
      
      setAuditProcs(parsedProcs);
      if (parsedProcs.length > 0) {
        setSelectedAuditProc(parsedProcs[0].id);
      } else {
        setSelectedAuditProc("");
      }
    };

    loadAuditProcs();
  }, [selectedAudit, currentOrg]);

  // Load questionnaire questions + answers + custom questions for selected audit process
  const loadAuditQuestionsData = async () => {
    if (!selectedAudit || !selectedAuditProc || !currentOrg) return;
    const activeProc = auditProcs.find(p => p.id === selectedAuditProc);
    if (!activeProc) return;

    // Fetch answers / overrides
    const { data: answersData } = await supabase
      .from("audit_answers")
      .select("id, clause, kind, q_ref, question_text, note, status")
      .eq("audit_id", selectedAudit.id)
      .eq("process_id", selectedAuditProc);

    const amap: Record<string, Answer> = {};
    (answersData ?? []).forEach((ans: any) => {
      const key = `${selectedAuditProc}:${ans.clause}:${ans.kind}:${ans.q_ref}`;
      amap[key] = ans;
    });
    setAnswers(amap);

    // Fetch custom questions
    const { data: customData } = await supabase
      .from("custom_questions")
      .select("id, clause, text, evidence, reference, active")
      .eq("org_id", currentOrg.id)
      .eq("standard", selectedAudit.standard)
      .eq("process_key", activeProc.key);
    
    setCustomQuestions((customData ?? []) as CustomQuestion[]);
  };

  useEffect(() => {
    loadAuditQuestionsData();
  }, [selectedAudit, selectedAuditProc, auditProcs]);

  // Derived list of current questions for managing
  const currentManageQuestions = useMemo(() => {
    if (!selectedAudit || !selectedAuditProc) return [];
    const activeProc = auditProcs.find(p => p.id === selectedAuditProc);
    if (!activeProc) return [];

    // 1. Get standard questions
    const stdKey: StandardKey = selectedAudit.standard === "27001" ? "9001" : (selectedAudit.standard as StandardKey);
    const stdQuestions = getQuestionsFor(stdKey, activeProc.key as any) ?? [];

    const list: any[] = [];

    stdQuestions.forEach((clauseSet) => {
      // Generic
      clauseSet.generic.forEach((question, index) => {
        const qRef = `g${index}`;
        const key = `${selectedAuditProc}:${clauseSet.clause}:generic:${qRef}`;
        const answer = answers[key];
        list.push({
          id: key,
          clause: clauseSet.clause,
          kind: "generic",
          q_ref: qRef,
          originalText: question,
          text: answer?.question_text || question,
          evidence: clauseSet.evidence?.join(" · ") || null,
          reference: null,
          isCustom: false,
          answerId: answer?.id || null,
          answer: answer || null,
        });
      });

      // Specific
      clauseSet.specific.forEach((question, index) => {
        const qRef = `s${index}`;
        const key = `${selectedAuditProc}:${clauseSet.clause}:specific:${qRef}`;
        const answer = answers[key];
        list.push({
          id: key,
          clause: clauseSet.clause,
          kind: "specific",
          q_ref: qRef,
          originalText: question,
          text: answer?.question_text || question,
          evidence: clauseSet.evidence?.join(" · ") || null,
          reference: null,
          isCustom: false,
          answerId: answer?.id || null,
          answer: answer || null,
        });
      });
    });

    // 2. Add custom questions
    customQuestions.forEach((cq) => {
      const key = `${selectedAuditProc}:${cq.clause}:custom:${cq.id}`;
      const answer = answers[key];
      list.push({
        id: cq.id,
        clause: cq.clause,
        kind: "custom",
        q_ref: cq.id,
        originalText: cq.text,
        text: cq.text,
        evidence: cq.evidence,
        reference: cq.reference,
        isCustom: true,
        active: cq.active,
        answer: answer || null,
      });
    });

    const clauseSort = (a: string) => a.split(".").map((n) => parseInt(n, 10) || 0);

    return list.sort((a, b) => {
      const A = clauseSort(a.clause), B = clauseSort(b.clause);
      for (let i = 0; i < Math.max(A.length, B.length); i++) {
        const x = A[i] ?? 0, y = B[i] ?? 0;
        if (x !== y) return x - y;
      }
      if (a.isCustom !== b.isCustom) {
        return a.isCustom ? -1 : 1;
      }
      return 0;
    });
  }, [selectedAudit, selectedAuditProc, auditProcs, answers, customQuestions]);

  // Derived browse questions list
  const currentBrowseQuestions = useMemo(() => {
    if (!browseProc) return [];
    return getQuestionsFor(browseStd, browseProc as any) ?? [];
  }, [browseStd, browseProc]);

  // Auto pre-select process when standard changes
  useEffect(() => {
    if (browseProcessesList.length > 0) {
      setBrowseProc(browseProcessesList[0].key);
    } else {
      setBrowseProc("");
    }
  }, [browseStd, browseProcessesList]);

  // Auto pre-select process when copy destination standard changes
  useEffect(() => {
    if (copyDestProcessesList.length > 0) {
      setCopyDestProc(copyDestProcessesList[0].key);
    } else {
      setCopyDestProc("");
    }
  }, [copyDestStd, copyDestProcessesList]);

  const handleSaveRephrase = async (item: any) => {
    if (!selectedAudit || !selectedAuditProc) return;
    if (!editingText.trim()) return;

    if (item.isCustom) {
      // Update custom question
      const { error } = await supabase
        .from("custom_questions")
        .update({ text: editingText })
        .eq("id", item.id);
      
      if (error) {
        toast({ title: "Failed to update custom question", description: error.message, variant: "destructive" });
      } else {
        // Also update audit_answers if there is an existing answer for it
        await supabase
          .from("audit_answers")
          .update({ question_text: editingText })
          .eq("audit_id", selectedAudit.id)
          .eq("process_id", selectedAuditProc)
          .eq("clause", item.clause)
          .eq("kind", "custom")
          .eq("q_ref", item.id);

        toast({ title: "Custom question updated successfully." });
        loadAuditQuestionsData();
      }
    } else {
      // Update or Insert in audit_answers
      const key = `${selectedAuditProc}:${item.clause}:${item.kind}:${item.q_ref}`;
      const existing = answers[key];

      if (existing?.id) {
        const { error } = await supabase
          .from("audit_answers")
          .update({ question_text: editingText })
          .eq("id", existing.id);
        if (error) {
          toast({ title: "Failed to save rephrase", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Question rephrased successfully." });
          loadAuditQuestionsData();
        }
      } else {
        const { error } = await supabase
          .from("audit_answers")
          .insert({
            audit_id: selectedAudit.id,
            process_id: selectedAuditProc,
            clause: item.clause,
            kind: item.kind,
            q_ref: item.q_ref,
            question_text: editingText,
            status: "pending",
          });
        if (error) {
          toast({ title: "Failed to save rephrase", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Question rephrased successfully." });
          loadAuditQuestionsData();
        }
      }
    }

    setEditingQuestionKey(null);
  };

  // Add custom question
  const handleAddQuestion = async () => {
    if (!currentOrg || !user || !selectedAudit || !selectedAuditProc) return;
    const activeProc = auditProcs.find(p => p.id === selectedAuditProc);
    if (!activeProc) return;

    if (!newQuestion.clause || !newQuestion.text.trim()) {
      return toast({ title: "Please fill in Clause and Question text", variant: "destructive" });
    }

    const { error } = await supabase.from("custom_questions").insert({
      org_id: currentOrg.id,
      created_by: user.id,
      standard: selectedAudit.standard,
      process_key: activeProc.key,
      clause: newQuestion.clause,
      text: newQuestion.text,
      evidence: newQuestion.evidence || null,
      reference: newQuestion.reference || null,
      active: true,
    });

    if (error) {
      toast({ title: "Failed to add question", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Custom question added successfully." });
      setNewQuestion({ clause: "", text: "", evidence: "", reference: "" });
      loadAuditQuestionsData();
    }
  };

  // Delete custom question
  const handleDeleteCustom = async (id: string) => {
    const { error } = await supabase.from("custom_questions").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete question", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question deleted successfully." });
      loadAuditQuestionsData();
    }
  };

  // Copy/Import selected questions from source standard/proc
  const handleImportSelected = async () => {
    if (!currentOrg || !user || !selectedAudit || !selectedAuditProc) return;
    const activeProc = auditProcs.find(p => p.id === selectedAuditProc);
    if (!activeProc) return;

    if (selectedImportKeys.size === 0) {
      return toast({ title: "No questions selected", variant: "destructive" });
    }

    // Get source questions list
    const srcQuestions = getQuestionsFor(importSrcStd, importSrcProc as any) ?? [];
    const importPromises: any[] = [];

    srcQuestions.forEach((clauseSet) => {
      // Check generics
      clauseSet.generic.forEach((question, index) => {
        const key = `generic:${clauseSet.clause}:g${index}`;
        if (selectedImportKeys.has(key)) {
          importPromises.push(
            supabase.from("custom_questions").insert({
              org_id: currentOrg.id,
              created_by: user.id,
              standard: selectedAudit.standard,
              process_key: activeProc.key,
              clause: clauseSet.clause,
              text: `[Imported from ${importSrcStd.toUpperCase()}/${importSrcProc}] ${question}`,
              evidence: clauseSet.evidence?.join(" · ") || null,
              reference: `Copied from standard bank ${importSrcStd}`,
              active: true,
            })
          );
        }
      });

      // Check specifics
      clauseSet.specific.forEach((question, index) => {
        const key = `specific:${clauseSet.clause}:s${index}`;
        if (selectedImportKeys.has(key)) {
          importPromises.push(
            supabase.from("custom_questions").insert({
              org_id: currentOrg.id,
              created_by: user.id,
              standard: selectedAudit.standard,
              process_key: activeProc.key,
              clause: clauseSet.clause,
              text: `[Imported from ${importSrcStd.toUpperCase()}/${importSrcProc}] ${question}`,
              evidence: clauseSet.evidence?.join(" · ") || null,
              reference: `Copied from standard bank ${importSrcStd}`,
              active: true,
            })
          );
        }
      });
    });

    try {
      await Promise.all(importPromises);
      toast({ title: `Successfully imported ${importPromises.length} question(s).` });
      setIsImportModalOpen(false);
      setSelectedImportKeys(new Set());
      loadAuditQuestionsData();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    }
  };

  // Copy target question to destination
  const handleCopyQuestion = async () => {
    if (!currentOrg || !user || !copyTargetQuestion) return;
    if (!copyDestProc || !copyDestClause) {
      return toast({ title: "Please fill in target process and clause", variant: "destructive" });
    }

    const { error } = await supabase.from("custom_questions").insert({
      org_id: currentOrg.id,
      created_by: user.id,
      standard: copyDestStd,
      process_key: copyDestProc,
      clause: copyDestClause,
      text: copyTargetQuestion.text,
      evidence: copyTargetQuestion.evidence || null,
      reference: `Copied from another standard/process`,
      active: true,
    });

    if (error) {
      toast({ title: "Failed to copy question", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question successfully copied to destination." });
      setIsCopyModalOpen(false);
      setCopyTargetQuestion(null);
      loadAuditQuestionsData();
    }
  };

  // Toggle selection for import modal questions
  const toggleImportKey = (key: string) => {
    setSelectedImportKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Derived import list of questions based on selected source standard & process
  const importModalQuestions = useMemo(() => {
    if (!importSrcProc) return [];
    return getQuestionsFor(importSrcStd, importSrcProc as any) ?? [];
  }, [importSrcStd, importSrcProc]);

  return (
    <AppShell>
      <div className="select-none">
        <Header title="Question Banks" subtitle="Browse standard ISO question models or personalize requirements per audit run." />

        {/* Primary Navigation Tabs */}
        <div className="mt-6 flex border-b border-border">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === "browse" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <BookOpen className="h-4 w-4" />
            Pre-Audit Question Viewer
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === "manage" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Settings className="h-4 w-4" />
            Personalize Audit Questions
          </button>
        </div>

        {/* Tab 1: Pre-Audit Question Viewer */}
        {activeTab === "browse" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm max-w-3xl">
              <h3 className="font-display text-sm font-semibold text-foreground">Select Standard & Process</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-4">View standard compliance questions without needing to create or open an audit.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Standard</label>
                  <select
                    value={browseStd}
                    onChange={(e) => setBrowseStd(e.target.value as StandardKey)}
                    className="input w-full h-11"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s.key} value={s.key}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Process</label>
                  <select
                    value={browseProc}
                    onChange={(e) => setBrowseProc(e.target.value)}
                    className="input w-full h-11"
                  >
                    <option value="">-- Select Process --</option>
                    {browseProcessesList.map((p) => (
                      <option key={p.key} value={p.key}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {browseProc && currentBrowseQuestions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                No questions found for this process under this standard.
              </div>
            )}

            {browseProc && currentBrowseQuestions.map((clauseSet: any) => (
              <div key={clauseSet.clause} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-baseline gap-2 border-b border-border pb-3">
                  <span className="font-mono text-sm font-bold text-primary">{clauseSet.clause}</span>
                  <h3 className="font-display text-base font-semibold text-foreground">{clauseSet.title}</h3>
                </div>

                <div className="mt-4 space-y-4">
                  {clauseSet.generic?.map((question: string, i: number) => (
                    <div key={`bg-${i}`} className="flex items-start justify-between gap-3 border-l-2 border-border pl-3">
                      <div className="flex gap-3 text-sm">
                        <span className="font-mono text-xs text-muted-foreground shrink-0">G{i+1}</span>
                        <div>
                          <p className="text-foreground/90 font-medium">{question}</p>
                          {clauseSet.evidence && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Evidence: {clauseSet.evidence.join(" · ")}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCopyTargetQuestion({ text: question, evidence: clauseSet.evidence?.join(" · ") || null });
                          setCopyDestStd(browseStd);
                          setCopyDestClause(clauseSet.clause);
                          setIsCopyModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition shrink-0"
                        title="Copy to another process/standard"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {clauseSet.specific?.map((question: string, i: number) => (
                    <div key={`bs-${i}`} className="flex items-start justify-between gap-3 border-l-2 border-primary pl-3">
                      <div className="flex gap-3 text-sm">
                        <span className="font-mono text-xs text-primary shrink-0">S{i+1}</span>
                        <div>
                          <p className="text-foreground/90 font-medium">{question}</p>
                          {clauseSet.evidence && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Evidence: {clauseSet.evidence.join(" · ")}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCopyTargetQuestion({ text: question, evidence: clauseSet.evidence?.join(" · ") || null });
                          setCopyDestStd(browseStd);
                          setCopyDestClause(clauseSet.clause);
                          setIsCopyModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition shrink-0"
                        title="Copy to another process/standard"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Manage Audit Questions */}
        {activeTab === "manage" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm max-w-4xl space-y-4">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">Select Active Audit Run</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Customize the exact checklists, add bespoke questions, and copy requirements between standards.</p>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">My Audits</label>
                  <select
                    value={selectedAudit?.id || ""}
                    onChange={(e) => {
                      const audit = audits.find(a => a.id === e.target.value);
                      setSelectedAudit(audit || null);
                    }}
                    className="input w-full h-11"
                  >
                    <option value="">-- Choose Audit --</option>
                    {audits.map((a) => (
                      <option key={a.id} value={a.id}>{a.title} ({a.standard.toUpperCase()}) · {a.status}</option>
                    ))}
                  </select>
                </div>

                {selectedAudit && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Audited Process</label>
                    <select
                      value={selectedAuditProc}
                      onChange={(e) => setSelectedAuditProc(e.target.value)}
                      className="input w-full h-11"
                    >
                      <option value="">-- Choose Process --</option>
                      {auditProcs.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {selectedAudit && selectedAuditProc && (
              <div className="space-y-6">
                {/* Question list panel */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-4">
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">Audit Checklist Questions</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Edit wording or inject custom requirements for this process.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-secondary transition flex items-center gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Import Questions
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentManageQuestions.map((item) => {
                      const isEditing = editingQuestionKey === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4 transition duration-200 bg-background/50 hover:bg-background/80 ${isEditing ? "border-primary" : "border-border"}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Clause {item.clause}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${item.isCustom ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"}`}>
                                  {item.isCustom ? "Custom" : "Standard"}
                                </span>
                              </div>

                              {isEditing ? (
                                <div className="mt-1 flex gap-2">
                                  <input
                                    type="text"
                                    className="input flex-1 h-9 text-xs"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveRephrase(item)}
                                    className="rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shrink-0 h-9"
                                  >
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={() => setEditingQuestionKey(null)}
                                    className="rounded-xl border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:bg-secondary transition shrink-0 h-9"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-foreground/90 font-medium">{item.text}</p>
                                  {item.originalText !== item.text && (
                                    <p className="text-[11px] text-muted-foreground italic mt-0.5">Original: {item.originalText}</p>
                                  )}
                                </div>
                              )}

                              {item.evidence && (
                                <p className="text-[11px] text-muted-foreground"><strong>Evidence:</strong> {item.evidence}</p>
                              )}
                              {item.reference && (
                                <p className="text-[11px] text-muted-foreground"><strong>Reference:</strong> {item.reference}</p>
                              )}
                            </div>

                            {!isEditing && (
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingQuestionKey(item.id);
                                    setEditingText(item.text);
                                  }}
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                                  title="Rephrase / Edit question"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setCopyTargetQuestion({ text: item.text, evidence: item.evidence });
                                    setCopyDestStd(selectedAudit.standard as StandardKey);
                                    setCopyDestClause(item.clause);
                                    setIsCopyModalOpen(true);
                                  }}
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                                  title="Copy to another standard/process"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                {item.isCustom && (
                                  <button
                                    onClick={() => handleDeleteCustom(item.id)}
                                    className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition"
                                    title="Remove question"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {currentManageQuestions.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                        No questions mapped. Import or add questions to get started.
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Custom Question Form */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm max-w-xl">
                  <h3 className="font-display text-sm font-semibold text-foreground">Add Custom Question</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-4">Inject a brand new question specific to this audit process.</p>
                  <div className="space-y-3">
                    <div className="grid gap-2 grid-cols-3">
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Clause</label>
                        <select
                          value={newQuestion.clause}
                          onChange={(e) => setNewQuestion({ ...newQuestion, clause: e.target.value })}
                          className="input w-full h-10 text-xs"
                        >
                          <option value="">--</option>
                          {ISO_CLAUSES_FOR_AUDIT.map((c) => (
                            <option key={c.clause} value={c.clause}>{c.clause}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Question Text</label>
                        <input
                          type="text"
                          placeholder="Type question wording..."
                          value={newQuestion.text}
                          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                          className="input w-full h-10 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Expected Evidence</label>
                        <input
                          type="text"
                          placeholder="SOP logs, minutes, reports..."
                          value={newQuestion.evidence}
                          onChange={(e) => setNewQuestion({ ...newQuestion, evidence: e.target.value })}
                          className="input w-full h-10 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">SOP / Reference Ref</label>
                        <input
                          type="text"
                          placeholder="e.g. OAK-SOP-03"
                          value={newQuestion.reference}
                          onChange={(e) => setNewQuestion({ ...newQuestion, reference: e.target.value })}
                          className="input w-full h-10 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddQuestion}
                      className="pill-cta px-4 py-2 text-xs font-semibold"
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!selectedAudit && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                Select an audit above to begin managing and rephrasing questions.
              </div>
            )}
          </div>
        )}

        {/* Copy Target Question Modal Overlay */}
        {isCopyModalOpen && copyTargetQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setIsCopyModalOpen(false);
                  setCopyTargetQuestion(null);
                }}
                className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="mb-4">
                <h3 className="font-display text-base font-semibold text-foreground">Copy Question</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Copy the selected requirement to another standard process or clause.</p>
              </div>

              <div className="rounded-lg bg-secondary/35 p-3.5 text-xs text-foreground/80 mb-4 border border-border">
                <p className="font-medium">"{copyTargetQuestion.text}"</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Standard</label>
                  <select
                    value={copyDestStd}
                    onChange={(e) => setCopyDestStd(e.target.value as StandardKey)}
                    className="input w-full h-10 text-xs"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s.key} value={s.key}>{s.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Process</label>
                  <select
                    value={copyDestProc}
                    onChange={(e) => setCopyDestProc(e.target.value)}
                    className="input w-full h-10 text-xs"
                  >
                    <option value="">-- Choose Process --</option>
                    {copyDestProcessesList.map((p) => (
                      <option key={p.key} value={p.key}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Clause</label>
                  <select
                    value={copyDestClause}
                    onChange={(e) => setCopyDestClause(e.target.value)}
                    className="input w-full h-10 text-xs"
                  >
                    <option value="">-- Choose Clause --</option>
                    {ISO_CLAUSES_FOR_AUDIT.map((c) => (
                      <option key={c.clause} value={c.clause}>{c.clause} {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsCopyModalOpen(false);
                      setCopyTargetQuestion(null);
                    }}
                    className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCopyQuestion}
                    disabled={!copyDestProc || !copyDestClause}
                    className="pill-cta px-4 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    Copy & Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Import Modal Overlay */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-elevated animate-in zoom-in-95 duration-200 overflow-hidden">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-lg font-semibold text-foreground">Import Questions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Select a source standard and process to pull questions into the current active process.</p>
                
                {/* Selectors inside modal */}
                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source Standard</label>
                    <select
                      value={importSrcStd}
                      onChange={(e) => setImportSrcStd(e.target.value as StandardKey)}
                      className="input w-full h-10 text-xs"
                    >
                      {STANDARDS.map((s) => (
                        <option key={s.key} value={s.key}>{s.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source Process</label>
                    <select
                      value={importSrcProc}
                      onChange={(e) => setImportSrcProc(e.target.value)}
                      className="input w-full h-10 text-xs"
                    >
                      <option value="">-- Choose Process --</option>
                      {importProcessesList.map((p) => (
                        <option key={p.key} value={p.key}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal List Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {importSrcProc && importModalQuestions.map((clauseSet: any) => (
                  <div key={`import-${clauseSet.clause}`} className="space-y-2.5">
                    <div className="font-mono text-xs font-bold text-primary border-b border-border pb-1">
                      Clause {clauseSet.clause} · {clauseSet.title}
                    </div>
                    
                    {clauseSet.generic?.map((q: string, i: number) => {
                      const key = `generic:${clauseSet.clause}:g${i}`;
                      const isChecked = selectedImportKeys.has(key);
                      return (
                        <div
                          key={key}
                          onClick={() => toggleImportKey(key)}
                          className={`flex items-start gap-3 rounded-lg border p-3 text-xs cursor-pointer transition ${isChecked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by div click
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block mb-0.5">Generic G{i+1}</span>
                            <p className="text-foreground/90 font-medium">{q}</p>
                          </div>
                        </div>
                      );
                    })}

                    {clauseSet.specific?.map((q: string, i: number) => {
                      const key = `specific:${clauseSet.clause}:s${i}`;
                      const isChecked = selectedImportKeys.has(key);
                      return (
                        <div
                          key={key}
                          onClick={() => toggleImportKey(key)}
                          className={`flex items-start gap-3 rounded-lg border p-3 text-xs cursor-pointer transition ${isChecked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by div click
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-primary block mb-0.5">Specific S{i+1}</span>
                            <p className="text-foreground/90 font-medium">{q}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {!importSrcProc && (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    Select a source standard and process above to list questions.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-secondary/20 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setSelectedImportKeys(new Set());
                  }}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSelected}
                  disabled={selectedImportKeys.size === 0}
                  className="pill-cta px-4 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  Import Selected ({selectedImportKeys.size})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}