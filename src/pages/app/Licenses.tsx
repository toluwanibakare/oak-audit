import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lock, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { PACKS, formatNaira } from "@/lib/packs";
import { PACK_CREDIT_COST, PACK_RPC_KEY } from "@/lib/credits";
import { isProcessInStandard, getQuestionsFor, type StandardKey } from "@/data/standards";

type License = { id: string; pack: string; paid_amount_ngn: number; expires_at: string; active: boolean; purchased_at: string };

export default function Licenses() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [list, setList] = useState<License[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [hasOpenAudit, setHasOpenAudit] = useState(false);
  const [openAudits, setOpenAudits] = useState<{ id: string; standard: string }[]>([]);

  const hasLicense = (packCode: string) => {
    return list.some((l) => l.pack === packCode && l.active && new Date(l.expires_at) > new Date());
  };

  const getApplicableStandards = (auditStd: string): string[] => {
    if (auditStd === "ims") return ["9001", "14001", "45001", "ims"];
    if (auditStd === "hse") return ["14001", "45001", "hse"];
    if (auditStd === "27001") return ["9001", "27001"];
    return [auditStd];
  };

  // Pack setup state
  const [configuringPack, setConfiguringPack] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [auditTitle, setAuditTitle] = useState("");
  const [auditCriteria, setAuditCriteria] = useState("");
  const [auditScope, setAuditScope] = useState("");
  const [auditObject, setAuditObject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [auditOwner, setAuditOwner] = useState("");
  const [selectedAuditorId, setSelectedAuditorId] = useState("");
  const [auditeeName, setAuditeeName] = useState("");
  const [auditeeEmail, setAuditeeEmail] = useState("");
  const [auditors, setAuditors] = useState<{ id: string; name: string; role?: string | null }[]>([]);
  const [modalProcs, setModalProcs] = useState<{ id: string; key: string; name: string }[]>([]);
  const [assignmentType, setAssignmentType] = useState<"all" | "some">("all");
  const [selectedProcIds, setSelectedProcIds] = useState<string[]>([]);
  const [processAuditorMap, setProcessAuditorMap] = useState<Record<string, string>>({});
  const [customQuestionCounts, setCustomQuestionCounts] = useState<Record<string, number>>({});



  const isProfileComplete = useMemo(() => {
    if (!currentOrg) return true;
    if (currentOrg.type !== "organization") return true;

    const hasIndustry = !!currentOrg.industry;
    const addr = currentOrg.address ?? "";
    if (addr.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(addr);
        return !!(
          hasIndustry &&
          parsed.phone?.trim() &&
          parsed.website?.trim() &&
          parsed.size?.trim() &&
          parsed.address?.trim() &&
          parsed.description?.trim()
        );
      } catch {
        return false;
      }
    }
    return false;
  }, [currentOrg]);

  const customPricing = useMemo(() => {
    if (!currentOrg?.address) return null;
    if (!currentOrg.address.trim().startsWith("{")) return null;
    try {
      const parsed = JSON.parse(currentOrg.address);
      return parsed.customPricing || null;
    } catch {
      return null;
    }
  }, [currentOrg]);

  const load = () => {
    if (!currentOrg) return;
    supabase.from("audit_licenses").select("*").eq("org_id", currentOrg.id).order("purchased_at", { ascending: false })
      .then(({ data }) => setList((data ?? []) as License[]));
    supabase.from("credit_wallets").select("balance").eq("org_id", currentOrg.id).maybeSingle()
      .then(({ data }) => setBalance(data?.balance ?? 0));
    supabase.from("audits").select("id, standard").eq("org_id", currentOrg.id).neq("status", "closed")
      .then(({ data }) => {
        const openList = (data ?? []) as { id: string; standard: string }[];
        setOpenAudits(openList);
        setHasOpenAudit(openList.length > 0);
      });
  };

  useEffect(() => {
    if (!currentOrg) return;
    load();

    // Real-time wallet balance subscription to ensure licenses page matches
    const channel = supabase
      .channel(`licenses_wallet_${currentOrg.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credit_wallets",
          filter: `org_id=eq.${currentOrg.id}`,
        },
        (payload: any) => {
          setBalance(payload.new?.balance ?? 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrg]);

  useEffect(() => {
    if (!currentOrg || !user) return;
    (async () => {
      // Check if current user is already registered in the auditors table for this org
      const { data: userAuditor } = await supabase
        .from("auditors")
        .select("id,name")
        .eq("org_id", currentOrg.id)
        .eq("user_id", user.id)
        .maybeSingle();

      let finalUserAuditorId = userAuditor?.id;

      if (!userAuditor) {
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin/Organization";
        const { data: newAuditor } = await supabase
          .from("auditors")
          .insert({
            org_id: currentOrg.id,
            name: fullName,
            email: user.email || "",
            role: "lead_auditor",
            user_id: user.id
          })
          .select("id,name")
          .maybeSingle();
        if (newAuditor) {
          finalUserAuditorId = newAuditor.id;
        }
      }

      // Fetch all auditors for the organization
      const { data: auditorsList } = await supabase
        .from("auditors")
        .select("id,name,role")
        .eq("org_id", currentOrg.id)
        .order("name");

      const list = (auditorsList ?? []) as { id: string; name: string; role?: string | null }[];
      setAuditors(list);

      // Pre-select the logged-in user as the lead auditor by default
      const loggedInAuditor = list.find((a) => a.id === finalUserAuditorId) || list[0];
      if (loggedInAuditor) {
        setSelectedAuditorId(loggedInAuditor.id);
      }
    })();
  }, [currentOrg, user]);

  useEffect(() => {
    if (!currentOrg || !configuringPack) {
      setModalProcs([]);
      setSelectedProcIds([]);
      setAssignmentType("all");
      setCustomQuestionCounts({});
      setProcessAuditorMap({});
      return;
    }
    
    (async () => {
      const { data: orgProcs } = await supabase
        .from("org_processes")
        .select("id,key,name")
        .eq("org_id", currentOrg.id);
      
      if (orgProcs) {
        const visible = orgProcs.filter((p) => isProcessInStandard(configuringPack as any, p.key));
        setModalProcs(visible);
        setSelectedProcIds(visible.map(p => p.id));

        // Fetch custom questions count
        const { data: customQs } = await supabase
          .from("custom_questions")
          .select("process_key")
          .eq("org_id", currentOrg.id)
          .in("standard", getApplicableStandards(configuringPack))
          .eq("active", true);

        const counts: Record<string, number> = {};
        if (customQs) {
          customQs.forEach((q) => {
            counts[q.process_key] = (counts[q.process_key] || 0) + 1;
          });
        }
        setCustomQuestionCounts(counts);

        // Initialize auditor assignment map with default auditor
        const defaultAuditor = selectedAuditorId || (auditors.length > 0 ? auditors[0].id : "");
        const initialMap: Record<string, string> = {};
        visible.forEach((p) => {
          initialMap[p.id] = defaultAuditor;
        });
        setProcessAuditorMap(initialMap);
      }
    })();
  }, [configuringPack, currentOrg, selectedAuditorId, auditors]);

  const handleUnlockAndCreateDraft = async () => {
    if (!currentOrg || !configuringPack || !user) return;

    if (!auditTitle.trim()) {
      toast({
        title: "Missing Audit Title",
        description: "Please enter a title for the audit.",
        variant: "destructive"
      });
      return;
    }

    if (!auditeeName.trim() || !auditeeEmail.trim()) {
      toast({
        title: "Missing Auditee Information",
        description: "Please fill in the Auditee Contact Name and Email fields.",
        variant: "destructive"
      });
      return;
    }

    // Check if there are any active audits in progress (draft is okay, only check for non-draft / non-closed audits)
    const { data: openAudits } = await supabase
      .from("audits")
      .select("id, title")
      .eq("org_id", currentOrg.id)
      .neq("status", "closed")
      .neq("status", "draft");

    if (openAudits && openAudits.length > 0) {
      toast({
        title: "Active Audit in Progress",
        description: `You have an open audit in progress ("${openAudits[0].title}"). You must submit and close it before you can unlock or start another audit.`,
        variant: "destructive",
      });
      return;
    }

    const activeLicense = list.find((l) => l.pack === configuringPack && l.active && new Date(l.expires_at) > new Date());
    const cost = activeLicense 
      ? 0 
      : (customPricing?.[configuringPack] !== undefined 
          ? Number(customPricing[configuringPack]) 
          : PACK_CREDIT_COST[configuringPack as keyof typeof PACK_CREDIT_COST]);

    if (cost > 0 && balance < cost) {
      toast({ title: "Not enough credits", description: `Top up your wallet - this pack costs ${cost} credit(s).`, variant: "destructive" });
      return;
    }

    setBusy(configuringPack);

    // 1. Spend credits for pack & insert into audit_licenses (only if we don't have an active license!)
    let licenseId = activeLicense?.id || null;
    if (!activeLicense) {
      const { data: spentId, error: spendError } = await supabase.rpc("spend_credits_for_pack", {
        _org_id: currentOrg.id,
        _pack: PACK_RPC_KEY[configuringPack as keyof typeof PACK_CREDIT_COST],
      });

      if (spendError) {
        toast({ title: "Could not unlock", description: spendError.message, variant: "destructive" });
        setBusy(null);
        return;
      }
      licenseId = spentId;
    }

    // 2. Create the audit record directly as "draft" status
    const { data: newAudit, error: auditError } = await supabase
      .from("audits")
      .insert({
        org_id: currentOrg.id,
        standard: configuringPack,
        title: auditTitle.trim(),
        criteria: auditCriteria.trim() || null,
        scope: auditScope.trim() || null,
        object: auditObject.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        owner: currentOrg.type !== "individual" ? currentOrg.name : (auditOwner || null),
        status: "draft",
        created_by: user.id,
        auditee_name: auditeeName.trim() || null,
        auditee_email: auditeeEmail.trim() || null,
      })
      .select()
      .single();

    if (auditError || !newAudit) {
      toast({ title: "Failed to create audit draft", description: auditError?.message ?? "Database error", variant: "destructive" });
      setBusy(null);
      return;
    }

    if (activeLicense) {
      toast({ title: "Audit draft created under active license!", description: "Proceeding to processes configuration." });
    } else {
      toast({ title: "ISO Standard unlocked & draft created!", description: `${cost} credit(s) spent. Redirecting you...` });
    }
    
    setBusy(null);
    setConfiguringPack(null);
    navigate(`/app/processes`);
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header title="ISO Library" subtitle="Unlock the standards and bundles you want to run next." />
        <Link to="/app/wallet" className="pill-cta">Wallet · {balance} credit{balance === 1 ? "" : "s"}</Link>
      </div>

      {!isProfileComplete && (
        <div className="mt-6 rounded-3xl border border-warning/35 bg-warning/5 p-6 shadow-card animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-2xl">
              <h3 className="font-display text-lg font-bold text-foreground">Complete your Profile Settings to proceed</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Before you can purchase or unlock any ISO standards, you are required to complete your organization profile details. This helps OAK Global International verify your ISO workspace and activate licensing permissions.
              </p>
              <p className="mt-2 text-xs text-warning font-semibold tracking-wide uppercase">
                Required fields: Website, Phone number, Industry, Company size, Address, and Description.
              </p>
            </div>
            <Link to="/app/settings" className="pill-cta bg-warning hover:bg-warning/90 text-white shrink-0">
              Complete Profile Settings →
            </Link>
          </div>
        </div>
      )}

      {hasOpenAudit && (
        <div className="mt-6 rounded-3xl border border-warning/35 bg-warning/5 p-6 shadow-card animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-2xl">
              <h3 className="font-display text-lg font-bold text-foreground">Active Audit In Progress</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                You currently have an active audit in progress. OAK Global International's compliance rules require you to submit and generate your active audit's report before you can unlock or setup another audit run.
              </p>
            </div>
            <Link to="/app/audits" className="pill-cta bg-warning hover:bg-warning/90 text-white shrink-0">
              View Active Audits →
            </Link>
          </div>
        </div>
      )}

      <section className="mt-8 rounded-[28px] border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Available packs</span>
            <h2 className="mt-2 font-display text-2xl font-semibold">Buy only what you need</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each pack unlocks a standard or bundle for your workspace and is paid for with credits.
            </p>
          </div>
          <div className="rounded-2xl bg-secondary px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Current balance</div>
            <div className="mt-1 font-display text-3xl font-bold">{balance}</div>
            <p className="text-xs text-muted-foreground">credit{balance === 1 ? "" : "s"} ready to spend</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PACKS.map((p) => {
            const cost = customPricing?.[p.code] !== undefined ? Number(customPricing[p.code]) : PACK_CREDIT_COST[p.code];
            const active = hasLicense(p.code);
            const affordable = balance >= cost || active;

            return (
              <div
                key={p.code}
                className={`group rounded-[24px] border p-5 shadow-card transition ${affordable ? "border-border bg-card hover:-translate-y-1 hover:shadow-elevated" : "border-border bg-card/80"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{p.label}</span>
                    <h3 className="mt-2 font-display text-lg font-semibold">{p.description}</h3>
                  </div>
                  {active ? (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success">
                      <Unlock className="h-4.5 w-4.5" />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-display text-3xl font-extrabold text-foreground">{formatNaira(p.price)}</div>
                    {active ? (
                      <p className="mt-1 text-[10px] text-success font-bold uppercase tracking-wider">Active License</p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground font-semibold">{cost} credit{cost === 1 ? "" : "s"}</p>
                    )}
                  </div>
                  {p.price !== 10000 && (
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      Bundle pack
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.standards.map((standard) => (
                    <span key={standard} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                      {standard}
                    </span>
                  ))}
                </div>

                {(() => {
                  const activeAuditForPack = openAudits.find(a => a.standard === p.code);
                  if (activeAuditForPack) {
                    return (
                      <button
                        onClick={() => navigate(`/app/audits/${activeAuditForPack.id}`)}
                        className="pill-cta mt-6 w-full bg-primary hover:bg-primary/95 font-semibold text-white"
                      >
                        Go to Audit
                      </button>
                    );
                  }
                  return (
                    <button
                      onClick={() => {
                        if (isProfileComplete && !hasOpenAudit) {
                          setConfiguringPack(p.code);
                          setCurrentStep(1);
                          setAuditTitle("");
                          setAuditCriteria("");
                          setAuditScope("");
                          setAuditObject("");
                          setStartDate("");
                          setEndDate("");
                          setAuditOwner("");
                          setSelectedAuditorId("");
                          if (currentOrg?.type === "individual") {
                            setAuditeeName(currentOrg.name || "");
                            setAuditeeEmail(user?.email || "");
                          } else {
                            setAuditeeName("");
                            setAuditeeEmail("");
                          }
                        }
                      }}
                      disabled={busy !== null || (!active && balance < cost) || !isProfileComplete || hasOpenAudit}
                      className="pill-cta mt-6 w-full disabled:opacity-50"
                    >
                      {busy === p.code ? "Unlocking..." : !isProfileComplete ? "Profile setup required" : hasOpenAudit ? "Active audit in progress" : active ? "Setup Audit (Licensed)" : balance < cost ? "Not enough credits" : `Unlock for ${cost} credit${cost === 1 ? "" : "s"}`}
                    </button>
                  );
                })()}

                {!affordable && !active && (
                  <Link to="/app/wallet" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
                    Add credits in wallet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-base font-semibold">Unlocked packs</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((license) => {
            const meta = PACKS.find((pack) => pack.code === license.pack);
            const expired = new Date(license.expires_at) < new Date();
            const cost = meta 
              ? (customPricing?.[meta.code] !== undefined ? Number(customPricing[meta.code]) : PACK_CREDIT_COST[meta.code]) 
              : null;

            return (
              <div key={license.id} className="rounded-[24px] border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{meta?.label ?? license.pack}</h3>
                      {cost !== null && meta && (
                        <p className="text-xs text-muted-foreground">
                          Bought for {cost} credit{cost === 1 ? "" : "s"} ({formatNaira(meta.price)} value)
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${expired ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                    {expired ? "Expired" : "Active"}
                  </span>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Unlocked {new Date(license.purchased_at).toLocaleDateString()} · expires {new Date(license.expires_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}

          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No packs unlocked yet. Buy one above to get started.
            </div>
          )}
        </div>
      </section>

      {configuringPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-[32px] border border-border bg-card p-8 shadow-elevated animate-scale-up space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold">Configure Audit Setup</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the audit metadata (Scope, Criteria, Objectives, and Auditee info) to create a draft audit.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Audit Title <span className="text-destructive">*</span></label>
                  <input
                    className="input w-full font-sans text-sm"
                    value={auditTitle}
                    onChange={(e) => setAuditTitle(e.target.value)}
                    placeholder="e.g. Q3 2026 Internal Audit"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Audit Criteria</label>
                  <input
                    className="input w-full font-sans text-sm"
                    value={auditCriteria}
                    onChange={(e) => setAuditCriteria(e.target.value)}
                    placeholder="e.g. ISO 14001:2015 & ISO 45001:2018"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Audit Scope</label>
                  <input
                    className="input w-full font-sans text-sm"
                    value={auditScope}
                    onChange={(e) => setAuditScope(e.target.value)}
                    placeholder="e.g. Operations, Warehouse, and HR"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Audit Objective</label>
                  <input
                    className="input w-full font-sans text-sm"
                    value={auditObject}
                    onChange={(e) => setAuditObject(e.target.value)}
                    placeholder="e.g. Health, Safety & Environmental Management"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Owner / Auditee (Who the audit is for)</label>
                  <input
                    type="text"
                    className={`input w-full font-sans text-sm ${currentOrg?.type !== "individual" ? "bg-secondary/40 opacity-70 cursor-not-allowed" : ""}`}
                    value={currentOrg?.type !== "individual" ? (currentOrg?.name || "") : auditOwner}
                    onChange={(e) => {
                      if (currentOrg?.type === "individual") {
                        setAuditOwner(e.target.value);
                      }
                    }}
                    disabled={currentOrg?.type !== "individual"}
                    placeholder={currentOrg?.type === "individual" ? "Type owner/auditee name..." : currentOrg?.name || ""}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {currentOrg?.type === "individual" ? "Process Owner (Organization)" : "Auditee Contact Name / Process Owner"} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input w-full font-sans text-sm ${currentOrg?.type === "individual" ? "bg-secondary/40 opacity-70 cursor-not-allowed" : ""}`}
                    value={auditeeName}
                    onChange={(e) => {
                      if (currentOrg?.type !== "individual") {
                        setAuditeeName(e.target.value);
                      }
                    }}
                    disabled={currentOrg?.type === "individual"}
                    placeholder="e.g. Samuel Auditee"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {currentOrg?.type === "individual" ? "Process Owner Email" : "Auditee Email"} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    className={`input w-full font-sans text-sm ${currentOrg?.type === "individual" ? "bg-secondary/40 opacity-70 cursor-not-allowed" : ""}`}
                    value={auditeeEmail}
                    onChange={(e) => {
                      if (currentOrg?.type !== "individual") {
                        setAuditeeEmail(e.target.value);
                      }
                    }}
                    disabled={currentOrg?.type === "individual"}
                    placeholder="e.g. auditee@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    className="input w-full font-sans text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    className="input w-full font-sans text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {(() => {
                const activeCost = customPricing?.[configuringPack] !== undefined 
                  ? Number(customPricing[configuringPack]) 
                  : PACK_CREDIT_COST[configuringPack as keyof typeof PACK_CREDIT_COST];
                const isInsufficient = balance < activeCost;

                return (
                  <>
                    {isInsufficient && (
                      <div className="rounded-2xl border border-destructive/35 bg-destructive/5 p-4 text-xs text-destructive leading-relaxed">
                        <strong>⚠️ Insufficient Balance:</strong>
                        <p className="mt-1">
                          Your workspace wallet balance ({balance} credit{balance === 1 ? "" : "s"}) is insufficient to activate this audit. This pack requires {activeCost} credit{activeCost === 1 ? "" : "s"}.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-border/50">
                      <button
                        onClick={() => {
                          setConfiguringPack(null);
                        }}
                        className="pill-secondary flex-1 justify-center"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUnlockAndCreateDraft}
                        disabled={!auditTitle.trim() || !auditeeName.trim() || !auditeeEmail.trim() || busy !== null || isInsufficient}
                        className="pill-cta flex-1 justify-center disabled:opacity-50"
                      >
                        {busy ? "Activating..." : "Select Processes →"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
