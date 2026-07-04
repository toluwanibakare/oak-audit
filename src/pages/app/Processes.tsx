import { useEffect, useState, useMemo, useRef } from "react";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { processesApi } from "@/api/processes";
import { questionsApi } from "@/api/questions";
import { walletApi } from "@/api/wallet";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { useToast } from "@/hooks/use-toast";
import { getQuestionsFor, normalizeProcessKey } from "@/data/standards";
import { PROCESSES } from "@/data/processAudit";
import { PROCESSES_14001 } from "@/data/processAudit14001";
import { PROCESSES_45001 } from "@/data/processAudit45001";
import { HSE_PROCESSES } from "@/data/standardsHse";
import { Plus, X, ArrowLeft, Check, ClipboardCopy, HelpCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


const ALL_STANDARD_PROCESSES = [
  ...PROCESSES,
  ...PROCESSES_14001,
  ...PROCESSES_45001,
  ...HSE_PROCESSES,
];

const UNIQUE_STANDARD_PROCESSES = Array.from(
  new Map(
    ALL_STANDARD_PROCESSES.map((p) => {
      const normKey = normalizeProcessKey(p.key);
      const canonical = PROCESSES.find(sp => sp.key === normKey) || p;
      return [normKey, { ...canonical, key: normKey }];
    })
  ).values()
);


type Proc = { id: string; key: string; name: string; scope: string | null; is_custom: boolean; process_owner: string | null; process_owner_email?: string | null };

export default function Processes() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Proc[]>([]);
  const [form, setForm] = useState({ name: "", scope: "", process_owner: "", process_owner_email: "" });
  // Tracks the process owner name per standard process key during selection
  const [standardProcessOwners, setStandardProcessOwners] = useState<Record<string, string>>({});
  const [standardProcessOwnersEmail, setStandardProcessOwnersEmail] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSubmitClicked, setCustomSubmitClicked] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<Proc | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProcIdsMain, setSelectedProcIdsMain] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const pendingSuggestionRef = useRef<{ name: string; key: string; scope: string } | null>(null);

  // Memoized process autocompletion suggestions
  const suggestions = useMemo(() => {
    const query = form.name.trim().toLowerCase();
    if (!query) return [];
    return UNIQUE_STANDARD_PROCESSES.filter((p) => 
      p.name.toLowerCase().includes(query) || 
      p.key.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [form.name]);

  // Selection states for standard processes
  const [selectedStandardKeys, setSelectedStandardKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Custom Process Question Setup Modal states
  const [showCustomSetupModal, setShowCustomSetupModal] = useState(false);
  const [createdCustomProcessKey, setCreatedCustomProcessKey] = useState("");
  const [createdCustomProcessName, setCreatedCustomProcessName] = useState("");
  
  // Custom Question Form
  const [importFromKey, setImportFromKey] = useState("");
  const [importToStandard, setImportToStandard] = useState("");
  const [importing, setImporting] = useState(false);
  
  const [customQuestion, setCustomQuestion] = useState({
    standard: "9001",
    clause: "4.1",
    text: "",
    evidence: "",
  });
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [loading, setLoading] = useState(true);

  // Loaded custom questions for management
  const [customQuestions, setCustomQuestions] = useState<{ id: string; standard: string; clause: string; text: string; evidence: string | null }[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const loadCustomQuestionsForProcess = async (processKey: string) => {
    if (!currentOrg) return;
    setLoadingQuestions(true);
    try {
      const data = await questionsApi.list(currentOrg.id, { process_key: processKey, active: true });
      setCustomQuestions(data.map((q: any) => ({ id: q.id, standard: q.standard, clause: q.clause, text: q.text, evidence: q.evidence })));
    } catch (err: any) {
      console.error("Failed to load custom questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (showCustomSetupModal && createdCustomProcessKey) {
      loadCustomQuestionsForProcess(createdCustomProcessKey);
    } else {
      setCustomQuestions([]);
    }
  }, [showCustomSetupModal, createdCustomProcessKey]);

  const handleDeleteCustomQuestion = async (qId: string) => {
    if (!window.confirm("Are you sure you want to delete this custom question?")) return;
    try {
      await questionsApi.remove(qId, true);
      toast({ title: "Question deleted successfully" });
      if (createdCustomProcessKey) {
        loadCustomQuestionsForProcess(createdCustomProcessKey);
      }
    } catch (err: any) {
      toast({ title: "Failed to delete question", description: err.message, variant: "destructive" });
    }
  };

  const [purchasedLicenses, setPurchasedLicenses] = useState<string[]>([]);

  const load = async () => {
    if (!currentOrg) return;
    try {
      // Load processes
      const processesList = await processesApi.list(currentOrg.id) as Proc[];
      const uniqueListMap = new Map<string, Proc>();
      processesList.forEach((p) => {
        const normKey = p.is_custom ? p.key : normalizeProcessKey(p.key);
        if (!uniqueListMap.has(normKey)) {
          uniqueListMap.set(normKey, { ...p, key: normKey });
        }
      });
      const finalProcessesList = Array.from(uniqueListMap.values());
      setList(finalProcessesList);
      
      // Pre-fill selection keys with currently selected standard processes (normalized)
      setSelectedStandardKeys(finalProcessesList.filter(p => !p.is_custom).map(p => p.key));
      const ownersMap: Record<string, string> = {};
      const emailsMap: Record<string, string> = {};
      finalProcessesList.forEach(p => {
        if (!p.is_custom) {
          if (p.process_owner) ownersMap[p.key] = p.process_owner;
          if (p.process_owner_email) emailsMap[p.key] = p.process_owner_email;
        }
      });
      setStandardProcessOwners(ownersMap);
      setStandardProcessOwnersEmail(emailsMap);

      // Load paid standards/licenses
      const licenses = await walletApi.licenses(currentOrg.id);
      const activePacks = (licenses ?? []).map((l: any) => l.pack.toLowerCase());
      const standardsUnlocked = new Set<string>();
      activePacks.forEach(pack => {
        if (pack === "ims") {
          standardsUnlocked.add("9001");
          standardsUnlocked.add("14001");
          standardsUnlocked.add("45001");
          standardsUnlocked.add("ims");
        } else if (pack === "hse") {
          standardsUnlocked.add("14001");
          standardsUnlocked.add("45001");
          standardsUnlocked.add("hse");
        } else {
          standardsUnlocked.add(pack);
        }
      });
      setPurchasedLicenses(Array.from(standardsUnlocked));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentOrg]);

  // Set default custom question standard select option based on paid licenses
  useEffect(() => {
    if (purchasedLicenses.length > 0) {
      const firstPaid = purchasedLicenses.find(std => ["9001", "14001", "45001"].includes(std));
      if (firstPaid) {
        setCustomQuestion(prev => ({ ...prev, standard: firstPaid }));
      }
    }
  }, [purchasedLicenses]);



  const saveStandardSelection = async () => {
    if (!currentOrg) return;
    setSaving(true);
    try {
      // Remove any existing processes whose key matches a selected standard key
      // (regardless of is_custom flag) to eliminate duplicates from previous buggy saves
      const existing = await processesApi.list(currentOrg.id);
      const keysToRemove = new Set(selectedStandardKeys);
      await Promise.all(
        existing
          .filter((p: any) => keysToRemove.has(p.is_custom ? normalizeProcessKey(p.key) : p.key))
          .map((p: any) => processesApi.remove(currentOrg.id, p.id))
      );

      // Insert selected ones with their process owner names
      const toInsert = UNIQUE_STANDARD_PROCESSES.filter(sp => selectedStandardKeys.includes(sp.key));
      await Promise.all(toInsert.map(sp =>
        processesApi.create(currentOrg.id, {
          org_id: currentOrg.id,
          key: sp.key,
          name: sp.name,
          scope: sp.scope || "",
          is_custom: false,
          process_owner: standardProcessOwners[sp.key]?.trim() || null,
          process_owner_email: standardProcessOwnersEmail[sp.key]?.trim() || null,
        })
      ));

      toast({ title: "Processes list updated successfully!" });
      load();
    } catch (err: any) {
      toast({ title: "Failed to update standard processes", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const add = async () => {
    setCustomSubmitClicked(true);
    if (!currentOrg || !form.name.trim() || !form.process_owner.trim() || !form.process_owner_email.trim()) return;

    const cleanName = form.name.trim();
    const cleanNameLower = cleanName.toLowerCase();
    const pending = pendingSuggestionRef.current;
    pendingSuggestionRef.current = null;

    const matchingStandard = pending
      ? UNIQUE_STANDARD_PROCESSES.find(sp => sp.key === pending.key)
      : UNIQUE_STANDARD_PROCESSES.find(
          sp => sp.name.toLowerCase() === cleanNameLower || sp.key === cleanNameLower
        );

    let key = "";
    let isCustom = true;
    
    if (matchingStandard) {
      key = matchingStandard.key;
      if (pending) {
        setForm(prev => ({ ...prev, name: matchingStandard.name, scope: matchingStandard.scope || "" }));
      }
      isCustom = false;
    } else {
      key = "custom_" + cleanNameLower.replace(/[^a-z0-9]+/g, "_").slice(0, 40);
      isCustom = true;
    }

    try {
      await processesApi.create(currentOrg.id, {
        org_id: currentOrg.id,
        key,
        name: cleanName,
        scope: form.scope,
        is_custom: isCustom,
        process_owner: form.process_owner.trim() || null,
        process_owner_email: form.process_owner_email.trim() || null,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(". ") : err?.message || "Failed";
      return toast({ title: msg, variant: "destructive" });
    }

    setForm({ name: "", scope: "", process_owner: "", process_owner_email: "" });
    setShowSuggestions(false);
    setCustomSubmitClicked(false);
    setIsModalOpen(false);
    await load();

    if (isCustom) {
      setCreatedCustomProcessKey(key);
      setCreatedCustomProcessName(cleanName);
      setImportFromKey("");
      setShowCustomSetupModal(true);
    } else {
      toast({ title: "Standard process added successfully." });
    }
  };

  const remove = async (id: string) => {
    if (!currentOrg) return;
    try {
      await processesApi.remove(currentOrg.id, id);
      load();
    } catch {}
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedProcIdsMain([]);
  };

  const handleToggleSelectMain = (id: string) => {
    setSelectedProcIdsMain(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!currentOrg || selectedProcIdsMain.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove the ${selectedProcIdsMain.length} selected processes?`)) return;
    try {
      await Promise.all(selectedProcIdsMain.map(id => processesApi.remove(currentOrg.id, id)));
      toast({ title: `${selectedProcIdsMain.length} processes removed successfully` });
      setIsSelectMode(false);
      setSelectedProcIdsMain([]);
      await load();
    } catch (err: any) {
      toast({ title: "Failed to delete processes", description: err.message, variant: "destructive" });
    }
  };

  // Import standard questions for a custom process key
  const handleImportQuestions = async () => {
    if (!currentOrg || !createdCustomProcessKey || !importFromKey || !importToStandard) {
      return toast({ title: "Import failed", description: "Please select both a template process and target standard.", variant: "destructive" });
    }
    if (purchasedLicenses.length === 0) {
      return toast({ title: "Import failed", description: "You do not have any active purchased standards to copy from. Please purchase a standard pack first.", variant: "destructive" });
    }
    setImporting(true);
    try {
      const std = importToStandard;
      const insertRows: any[] = [];
      const userUuid = user?.id || currentOrg.id;

      const qSets = getQuestionsFor(std as any, importFromKey as any);
      if (qSets && qSets.length > 0) {
        qSets.forEach((qs) => {
          (qs.specific ?? []).forEach((qText) => {
            insertRows.push({
              org_id: currentOrg.id,
              standard: std,
              process_key: createdCustomProcessKey,
              clause: qs.clause,
              kind: "specific",
              text: qText,
              evidence: qs.evidence ? qs.evidence.join(", ") : null,
              created_by: userUuid,
              active: true
            });
          });
        });
      }

      if (insertRows.length > 0) {
        await Promise.all(insertRows.map(row => questionsApi.create(currentOrg.id, row)));
        toast({ title: "Questions imported successfully", description: `${insertRows.length} questions copied from standard ${std.toUpperCase()} (Process: ${importFromKey}).` });
        if (createdCustomProcessKey) {
          loadCustomQuestionsForProcess(createdCustomProcessKey);
        }
      } else {
        toast({ title: `No questions found to import for ${std.toUpperCase()} and process ${importFromKey}.` });
      }
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  // Add individual custom question
  const handleAddCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !createdCustomProcessKey || !customQuestion.text.trim()) return;
    setAddingQuestion(true);
    try {
      await questionsApi.create(currentOrg.id, {
        org_id: currentOrg.id,
        standard: customQuestion.standard,
        process_key: createdCustomProcessKey,
        clause: customQuestion.clause,
        kind: "specific",
        text: customQuestion.text.trim(),
        evidence: customQuestion.evidence.trim() || null,
        created_by: user?.id || currentOrg.id,
        active: true,
      });
      toast({ title: "Custom question added successfully" });
      setCustomQuestion({ ...customQuestion, text: "", evidence: "" });
      if (createdCustomProcessKey) {
        loadCustomQuestionsForProcess(createdCustomProcessKey);
      }
    } catch (err: any) {
      toast({ title: "Failed to add question", description: err.message, variant: "destructive" });
    } finally {
      setAddingQuestion(false);
    }
  };

  const showSelectionGrid = list.length === 0;

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-wrap items-center justify-between gap-4 animate-pulse">
          <div>
            <Skeleton className="h-9 w-48 bg-secondary/80 rounded-xl" />
            <Skeleton className="mt-2 h-4 w-96 bg-secondary/70 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-48 bg-secondary/80 rounded-full" />
            <Skeleton className="h-10 w-32 bg-secondary/80 rounded-full" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[24px] border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-5 w-40 bg-secondary/80 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-secondary/60 rounded" />
                <Skeleton className="h-4 w-5/6 bg-secondary/60 rounded" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-8 w-20 bg-secondary/80 rounded-full" />
                <Skeleton className="h-8 w-14 bg-secondary/85 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  return (

    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Header 
          title="Processes" 
          subtitle={showSelectionGrid ? "Select the standard processes operating in your organization." : "Manage and define your organizational processes."} 
        />
        <div className="flex items-center gap-3">
          {!showSelectionGrid && (
            <button 
              onClick={toggleSelectMode} 
              className={`rounded-full border px-4 py-2 text-sm transition font-semibold ${
                isSelectMode ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"
              }`}
            >
              {isSelectMode ? "Cancel Selection" : "Select Multiple"}
            </button>
          )}
          {!showSelectionGrid && isSelectMode && (
            <button 
              onClick={() => {
                if (selectedProcIdsMain.length === list.length) {
                  setSelectedProcIdsMain([]);
                } else {
                  setSelectedProcIdsMain(list.map(p => p.id));
                }
              }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:bg-secondary font-semibold"
            >
              {selectedProcIdsMain.length === list.length ? "Deselect All" : "Select All"}
            </button>
          )}
          {!showSelectionGrid && isSelectMode && selectedProcIdsMain.length > 0 && (
            <button 
              onClick={handleBulkDelete} 
              className="pill-cta bg-destructive hover:bg-destructive/95 text-white px-4 py-2 text-sm font-semibold"
            >
              Remove Selected ({selectedProcIdsMain.length})
            </button>
          )}
          {!showSelectionGrid && !isSelectMode && (
            <button onClick={() => setIsModalOpen(true)} className="pill-cta px-4 py-2 text-sm font-semibold flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Process
            </button>
          )}
        </div>
      </div>

      {showSelectionGrid ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-card space-y-6 animate-fade-in-up">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h3 className="font-display text-lg font-bold">Standard Processes Checklist</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Check all the processes that apply or add a custom process to get started.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (selectedStandardKeys.length === UNIQUE_STANDARD_PROCESSES.length) {
                    setSelectedStandardKeys([]);
                  } else {
                    setSelectedStandardKeys(UNIQUE_STANDARD_PROCESSES.map(sp => sp.key));
                  }
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                {selectedStandardKeys.length === UNIQUE_STANDARD_PROCESSES.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 max-h-[480px] overflow-y-auto pr-1">
            {UNIQUE_STANDARD_PROCESSES.map((sp) => {
              const checked = selectedStandardKeys.includes(sp.key);
              return (
                <div 
                  key={sp.key} 
                  className={`flex flex-col gap-3 rounded-2xl border p-4 text-sm transition ${
                    checked ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30 bg-background/50"
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary mt-0.5"
                      checked={checked} 
                      onChange={() =>
                        setSelectedStandardKeys(
                          checked 
                            ? selectedStandardKeys.filter((k) => k !== sp.key) 
                            : [...selectedStandardKeys, sp.key]
                        )
                      } 
                    />
                    <div>
                      <strong className="block text-foreground">{sp.name}</strong>
                      <span className="text-xs text-muted-foreground mt-1 block leading-normal">{sp.scope}</span>
                    </div>
                  </label>
                  {checked && (
                    <div className="space-y-2 mt-1">
                      <div>
                        <input
                          type="text"
                          placeholder="Process Owner name (required)..."
                          className="input h-8 text-xs w-full"
                          value={standardProcessOwners[sp.key] ?? ""}
                          onChange={(e) => setStandardProcessOwners(prev => ({ ...prev, [sp.key]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Process Owner email (required)..."
                          className="input h-8 text-xs w-full"
                          value={standardProcessOwnersEmail[sp.key] ?? ""}
                          onChange={(e) => setStandardProcessOwnersEmail(prev => ({ ...prev, [sp.key]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold hover:bg-secondary transition flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Custom Process
            </button>
            <button 
              onClick={saveStandardSelection}
              disabled={
                saving ||
                selectedStandardKeys.length === 0 ||
                selectedStandardKeys.some(k => !(standardProcessOwners[k]?.trim()) || !(standardProcessOwnersEmail[k]?.trim()))
              }
              className="pill-cta px-6 py-2 text-sm font-semibold disabled:opacity-50"
              title={selectedStandardKeys.some(k => !(standardProcessOwners[k]?.trim()) || !(standardProcessOwnersEmail[k]?.trim())) ? "All selected processes must have a process owner and email" : ""}
            >
              {saving ? "Saving Changes..." : "Save Selected Processes"}
            </button>
          </div>
        </section>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.map((p) => {
            const isChecked = selectedProcIdsMain.includes(p.id);
            return (
              <div 
                key={p.id} 
                onClick={() => {
                  if (isSelectMode) {
                    handleToggleSelectMain(p.id);
                  }
                }}
                className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-sm transition flex flex-col justify-between ${
                  isSelectMode ? "cursor-pointer select-none" : ""
                } ${
                  isChecked ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:shadow-card hover:border-muted-foreground/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isSelectMode && (
                        <input
                          type="checkbox"
                          className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary"
                          checked={isChecked}
                          onChange={() => {}} // handled by onClick of parent
                        />
                      )}
                      <h3 className="font-display text-base font-bold text-foreground">{p.name}</h3>
                    </div>
                    {!isSelectMode && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setProcessToDelete(p);
                        }} 
                        className="inline-flex items-center text-muted-foreground hover:text-destructive transition"
                        title="Remove process"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{p.scope || "No description mapped."}</p>
                  {p.process_owner && (
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-xs font-semibold text-foreground/70">Owner: <span className="text-foreground">{p.process_owner}</span></p>
                      {p.process_owner_email && (
                        <p className="text-[11px] text-muted-foreground">Email: <span className="text-foreground/80 font-medium">{p.process_owner_email}</span></p>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!p.is_custom && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary">
                        Standard
                      </span>
                    )}
                    {p.is_custom && !isSelectMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreatedCustomProcessKey(p.key);
                          setCreatedCustomProcessName(p.name);
                          setImportFromKey("");
                          setImportToStandard("");
                          setShowCustomSetupModal(true);
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Manage Questions
                      </button>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{p.key}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Process Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-4 sm:p-8 shadow-elevated animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setIsModalOpen(false); setShowSuggestions(false); pendingSuggestionRef.current = null; }}
              className="absolute top-5 right-5 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-5">
              <h3 className="font-display text-xl font-bold text-foreground">Add Custom Process</h3>
              <p className="text-xs text-muted-foreground mt-1">Define your own customized corporate workflow to audit.</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Process Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fleet Logistics"
                  className="input w-full h-11"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && showSuggestions && suggestions.length > 0) {
                      e.preventDefault();
                      const first = suggestions[0];
                      pendingSuggestionRef.current = { name: first.name, key: first.key, scope: first.scope || "" };
                      setForm(prev => ({ ...prev, name: first.name, scope: first.scope || "" }));
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-elevated p-1 space-y-0.5 animate-in fade-in duration-100 text-xs">
                    <p className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Matching Standard Processes</p>
                    {suggestions.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pendingSuggestionRef.current = { name: p.name, key: p.key, scope: p.scope || "" };
                          setForm(prev => ({ ...prev, name: p.name, scope: p.scope || "" }));
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-secondary text-foreground font-semibold flex flex-col gap-0.5 transition"
                      >
                        <span>{p.name}</span>
                        {p.scope && <span className="text-[10px] text-muted-foreground font-normal line-clamp-1">{p.scope}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Scope / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Managing supplier shipments, truck maintenance..."
                  className="input w-full h-11"
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Process Owner <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className={`input w-full h-11 ${
                    customSubmitClicked && !form.process_owner.trim() ? "border-destructive focus:ring-destructive/30" : ""
                  }`}
                  value={form.process_owner}
                  onChange={(e) => setForm({ ...form, process_owner: e.target.value })}
                />
                {customSubmitClicked && !form.process_owner.trim() && (
                  <p className="mt-1 text-[11px] text-destructive">Process owner name is required</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Process Owner Email *</label>
                <input
                  type="email"
                  placeholder="e.g. johndoe@company.com"
                  className={`input w-full h-11 ${
                    customSubmitClicked && !form.process_owner_email.trim() ? "border-destructive focus:ring-destructive/30" : ""
                  }`}
                  value={form.process_owner_email}
                  onChange={(e) => setForm({ ...form, process_owner_email: e.target.value })}
                />
                {customSubmitClicked && !form.process_owner_email.trim() && (
                  <p className="mt-1 text-[11px] text-destructive">Process owner email is required</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => { setIsModalOpen(false); setShowSuggestions(false); pendingSuggestionRef.current = null; }}
                  className="rounded-xl border border-border bg-card px-5 py-2 text-sm font-semibold hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={add}
                  disabled={!form.name.trim() || !form.process_owner.trim() || !form.process_owner_email.trim()}
                  className="pill-cta px-5 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Add Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Process Warning Modal */}
      {processToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-elevated animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-bold text-foreground">Remove Process</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to remove the process <strong>{processToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setProcessToDelete(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await remove(processToDelete.id);
                  setProcessToDelete(null);
                }}
                className="rounded-xl bg-destructive text-white px-4 py-2 text-sm font-semibold hover:bg-destructive/90 transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Process Setup Helper Popup Modal */}
      {showCustomSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-[32px] border border-border bg-card p-4 sm:p-8 shadow-elevated animate-in zoom-in-95 duration-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCustomSetupModal(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Custom Process Question Setup</span>
              <h3 className="font-display text-2xl font-extrabold text-foreground mt-1">Configure {createdCustomProcessName} Checklist</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                By default, this custom process contains standard QMS clause generic questions. You can copy the question bank of another standard process or write your own custom questions now.
              </p>
            </div>

            {/* List of current custom questions */}
            <div className="border border-border/80 rounded-2xl p-5 bg-secondary/30 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                Current Checklist Questions ({customQuestions.length})
              </div>
              
              {loadingQuestions ? (
                <div className="text-xs text-muted-foreground py-2 animate-pulse">Loading questions...</div>
              ) : customQuestions.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">No custom questions added yet.</div>
              ) : (
                <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {customQuestions.map((q) => (
                    <div key={q.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-muted-foreground uppercase mr-1.5">[ISO {q.standard} - Clause {q.clause}]</span>
                        <p className="mt-1 text-foreground leading-relaxed font-medium">{q.text}</p>
                        {q.evidence && <p className="mt-1 text-[10px] text-muted-foreground font-mono">Evidence: {q.evidence}</p>}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleDeleteCustomQuestion(q.id)}
                        className="text-xs text-destructive hover:underline font-semibold shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Option 1: Import questions */}
            <div className="border border-border/80 rounded-2xl p-5 bg-secondary/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <ClipboardCopy className="h-4 w-4 text-primary" />
                Import Questions from Standard Process
              </div>
              
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] text-muted-foreground font-semibold uppercase mb-1">Standard Process Template</label>
                  <select
                    className="input w-full font-sans text-xs font-semibold"
                    value={importFromKey}
                    onChange={(e) => setImportFromKey(e.target.value)}
                  >
                    <option value="">— Select Template Process —</option>
                    {UNIQUE_STANDARD_PROCESSES.map((sp) => (
                      <option key={sp.key} value={sp.key}>{sp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] text-muted-foreground font-semibold uppercase mb-1">Import To Standard</label>
                  <select
                    className="input w-full font-sans text-xs font-semibold"
                    value={importToStandard}
                    onChange={(e) => setImportToStandard(e.target.value)}
                  >
                    <option value="">— Select Target Standard —</option>
                    {purchasedLicenses.length === 0 ? (
                      <option value="">No Active Standards</option>
                    ) : (
                      purchasedLicenses.map(std => {
                        let label = std.toUpperCase();
                        if (std === "9001") label = "ISO 9001 (Quality)";
                        else if (std === "14001") label = "ISO 14001 (Env)";
                        else if (std === "45001") label = "ISO 45001 (OH&S)";
                        else if (std === "27001") label = "ISO 27001 (InfoSec)";
                        else if (std === "ims") label = "IMS Integrated";
                        else if (std === "hse") label = "HSE Integrated";
                        return <option key={std} value={std}>{label}</option>;
                      })
                    )}
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={handleImportQuestions}
                  disabled={importing || !importFromKey || !importToStandard}
                  className="pill-cta h-11 shrink-0 font-semibold px-4 disabled:opacity-50"
                >
                  {importing ? "Importing..." : "Copy Question Bank"}
                </button>
              </div>
            </div>

            {/* Option 2: Add single custom question */}
            <form onSubmit={handleAddCustomQuestion} className="border border-border/80 rounded-2xl p-5 bg-secondary/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <HelpCircle className="h-4 w-4 text-primary" />
                Add Individual Custom Question
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold uppercase mb-1">Standard</label>
                  <select
                    className="input w-full font-sans text-xs font-semibold"
                    value={customQuestion.standard}
                    onChange={(e) => setCustomQuestion({ ...customQuestion, standard: e.target.value })}
                  >
                    {purchasedLicenses.length === 0 ? (
                      <option value="">No Active Standards</option>
                    ) : (
                      purchasedLicenses.map(std => {
                        let label = std.toUpperCase();
                        if (std === "9001") label = "ISO 9001 (Quality)";
                        else if (std === "14001") label = "ISO 14001 (Env)";
                        else if (std === "45001") label = "ISO 45001 (OH&S)";
                        else if (std === "27001") label = "ISO 27001 (InfoSec)";
                        else if (std === "ims") label = "IMS Integrated";
                        else if (std === "hse") label = "HSE Integrated";
                        return <option key={std} value={std}>{label}</option>;
                      })
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] text-muted-foreground font-semibold uppercase mb-1">Clause</label>
                  <input
                    type="text"
                    className="input w-full font-sans text-xs font-semibold"
                    placeholder="e.g. 4.1 or 8.2"
                    value={customQuestion.clause}
                    onChange={(e) => setCustomQuestion({ ...customQuestion, clause: e.target.value })}
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-muted-foreground font-semibold uppercase mb-1">Question Text</label>
                  <textarea
                    rows={2}
                    className="input w-full font-sans text-xs leading-normal py-2"
                    placeholder="Type the specific query/check the auditor should verify..."
                    value={customQuestion.text}
                    onChange={(e) => setCustomQuestion({ ...customQuestion, text: e.target.value })}
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-muted-foreground font-semibold uppercase mb-1">Expected Evidence (Optional)</label>
                  <input
                    type="text"
                    className="input w-full font-sans text-xs"
                    placeholder="e.g. Logistics invoices, dispatch logs..."
                    value={customQuestion.evidence}
                    onChange={(e) => setCustomQuestion({ ...customQuestion, evidence: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingQuestion || !customQuestion.text.trim()}
                  className="pill-cta h-10 px-5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {addingQuestion ? "Adding..." : "Add Question"}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowCustomSetupModal(false)}
                className="pill-secondary px-8 py-2 font-bold uppercase tracking-wider"
              >
                Close & Finish Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}