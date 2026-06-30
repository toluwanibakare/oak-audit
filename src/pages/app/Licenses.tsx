import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Shield,
  Users,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { PACKS } from "@/lib/packs";
import {
  PACK_TIER_PRICES,
  getUserTier,
  TIER_LABELS,
  formatNaira,
  type UserTier,
} from "@/lib/pricing";
import { isProcessInStandard } from "@/data/standards";

// ─── Features included in every audit pack ───────────────────────────────────
const AUDIT_FEATURES = [
  "Audit Planning",
  "Audit Execution",
  "Audit Reporting",
  "Report Analytics & Performance Dashboard",
  "CAPA Management",
  "Document Repository",
  "Email Notifications",
];

// ─── Tier max users (for display & Team enforcement) ─────────────────────────
export const TIER_MAX_USERS: Record<UserTier, number | null> = {
  "1-5": 5,
  "5-15": 15,
  "16+": null, // unlimited
};

// ─── Types ────────────────────────────────────────────────────────────────────
type License = {
  id: string;
  pack: string;
  paid_amount_ngn: number;
  expires_at: string;
  active: boolean;
  purchased_at: string;
  user_tier: UserTier | null;
  user_count: number | null;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Licenses() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [list, setList] = useState<License[]>([]);
  const [openAudits, setOpenAudits] = useState<{ id: string; standard: string }[]>([]);
  const [memberCount, setMemberCount] = useState<number>(1);
  const [busy, setBusy] = useState<string | null>(null);

  // Setup modal state
  const [configuringPack, setConfiguringPack] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — audit metadata
  const [auditTitle, setAuditTitle] = useState("");
  const [auditCriteria, setAuditCriteria] = useState("");
  const [auditScope, setAuditScope] = useState("");
  const [auditObject, setAuditObject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [auditOwner, setAuditOwner] = useState("");
  const [auditeeName, setAuditeeName] = useState("");
  const [auditeeEmail, setAuditeeEmail] = useState("");
  const [selectedAuditorId, setSelectedAuditorId] = useState("");
  const [auditors, setAuditors] = useState<{ id: string; name: string; role?: string | null }[]>([]);

  // ── Load licenses, open audits, member count ──────────────────────────────
  const load = async () => {
    if (!currentOrg) return;

    const [licResult, auditResult, memberResult] = await Promise.all([
      supabase
        .from("audit_licenses")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("purchased_at", { ascending: false }),
      supabase
        .from("audits")
        .select("id, standard")
        .eq("org_id", currentOrg.id)
        .neq("status", "closed"),
      supabase
        .from("auditors")
        .select("id", { count: "exact", head: true })
        .eq("org_id", currentOrg.id),
    ]);

    setList((licResult.data ?? []) as License[]);
    setOpenAudits((auditResult.data ?? []) as { id: string; standard: string }[]);
    setMemberCount(memberResult.count ?? 1);
  };

  useEffect(() => {
    if (!currentOrg) return;
    load();
  }, [currentOrg]);

  // ── Load auditors for lead-auditor picker ──────────────────────────────────
  useEffect(() => {
    if (!currentOrg || !user) return;
    (async () => {
      const { data: userAuditor } = await supabase
        .from("auditors")
        .select("id,name")
        .eq("org_id", currentOrg.id)
        .eq("user_id", user.id)
        .maybeSingle();

      let finalId = userAuditor?.id;
      if (!userAuditor) {
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin";
        const { data: na } = await supabase
          .from("auditors")
          .insert({
            org_id: currentOrg.id,
            name: fullName,
            email: user.email || "",
            role: "lead_auditor",
            user_id: user.id,
          })
          .select("id,name")
          .maybeSingle();
        finalId = na?.id;
      }

      const { data: all } = await supabase
        .from("auditors")
        .select("id,name,role")
        .eq("org_id", currentOrg.id)
        .order("name");

      const allList = (all ?? []) as { id: string; name: string; role?: string | null }[];
      setAuditors(allList);
      const found = allList.find((a) => a.id === finalId) || allList[0];
      if (found) setSelectedAuditorId(found.id);
    })();
  }, [currentOrg, user]);

  // ── Handle Paystack return (?ref= in URL) ─────────────────────────────────
  useEffect(() => {
    const ref =
      searchParams.get("ref") ??
      searchParams.get("reference") ??
      searchParams.get("trxref");
    if (!ref) return;

    (async () => {
      toast({ title: "Verifying payment…", description: "Please wait a moment." });
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference: ref },
      });

      if (error || !data?.ok) {
        toast({
          title: "Payment verification failed",
          description: error?.message ?? "Payment was not successful. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment confirmed! 🎉",
          description: "Your audit has been created. Redirecting to processes setup…",
        });
        await load();
        setTimeout(() => navigate("/app/processes"), 1500);
      }

      const next = new URLSearchParams(searchParams);
      next.delete("ref");
      next.delete("reference");
      next.delete("trxref");
      setSearchParams(next, { replace: true });
    })();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const hasLicense = (packCode: string) =>
    list.some((l) => l.pack === packCode && l.active && new Date(l.expires_at) > new Date());

  const hasOpenAudit = openAudits.length > 0;
  const openAuditForPack = (packCode: string) =>
    openAudits.find((a) => a.standard === packCode);

  const resetModal = () => {
    setConfiguringPack(null);
    setStep(1);
    setAuditTitle("");
    setAuditCriteria("");
    setAuditScope("");
    setAuditObject("");
    setStartDate("");
    setEndDate("");
    setAuditOwner("");
    setAuditeeName("");
    setAuditeeEmail("");
  };

  const openModal = (packCode: string) => {
    if (currentOrg?.type === "individual") {
      setAuditeeName(currentOrg.name || "");
      setAuditeeEmail(user?.email || "");
    }
    setConfiguringPack(packCode);
    setStep(1);
  };

  // ── Auto-computed tier & price from actual member count ────────────────────
  const autoTier = getUserTier(memberCount) as UserTier;
  const autoPrice = configuringPack
    ? (PACK_TIER_PRICES[configuringPack]?.[autoTier] ?? 0)
    : 0;

  // ── Step 1 validation ──────────────────────────────────────────────────────
  const step1Valid =
    auditTitle.trim().length > 0 &&
    auditeeName.trim().length > 0 &&
    auditeeEmail.trim().length > 0;

  // ── Proceed to Paystack payment ────────────────────────────────────────────
  const handleProceedToPayment = async () => {
    if (!currentOrg || !user || !configuringPack) return;

    const active = openAuditForPack(configuringPack);
    if (active) {
      toast({
        title: "Active audit in progress",
        description: "Close your current audit before starting a new one.",
        variant: "destructive",
      });
      return;
    }

    setBusy(configuringPack);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-initiate", {
        body: {
          org_id: currentOrg.id,
          pack: configuringPack,
          user_count: memberCount,
          email: user.email,
          audit_title: auditTitle.trim(),
          audit_criteria: auditCriteria.trim() || null,
          audit_scope: auditScope.trim() || null,
          audit_object: auditObject.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          audit_owner:
            currentOrg.type !== "individual"
              ? currentOrg.name
              : auditOwner.trim() || null,
          auditee_name: auditeeName.trim(),
          auditee_email: auditeeEmail.trim(),
          lead_auditor_id: selectedAuditorId || null,
        },
      });

      if (error || !data?.authorization_url) {
        toast({
          title: "Could not initiate payment",
          description: error?.message ?? data?.error ?? "Unexpected error.",
          variant: "destructive",
        });
        setBusy(null);
        return;
      }

      window.location.href = data.authorization_url;
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
      setBusy(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <Header
        title="ISO Audit Library"
        subtitle="Select a standard or bundle, pay securely via Paystack, and your audit is activated immediately."
      />

      {/* Active audit warning */}
      {hasOpenAudit && (
        <div className="mt-6 rounded-3xl border border-warning/35 bg-warning/5 p-5 shadow-card animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className="font-display text-base font-bold text-foreground">
                Active Audit In Progress
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You currently have an audit running. Close it before starting a new one.
              </p>
            </div>
            <button
              onClick={() => navigate("/app/audits")}
              className="pill-cta bg-warning hover:bg-warning/90 text-white shrink-0 text-xs"
            >
              View Active Audits →
            </button>
          </div>
        </div>
      )}

      {/* Member count pill */}
      <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-card text-sm">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">Your workspace:</span>
        <span className="font-bold text-foreground">{memberCount} user{memberCount === 1 ? "" : "s"}</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          {TIER_LABELS[autoTier]}
        </span>
      </div>

      {/* Pack cards */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PACKS.map((pack) => {
          const active = hasLicense(pack.code);
          const openAudit = openAuditForPack(pack.code);
          const isBundle = pack.code === "hse" || pack.code === "ims";
          // Price for this org's auto-detected tier
          const tierPrice = PACK_TIER_PRICES[pack.code]?.[autoTier] ?? 0;

          return (
            <div
              key={pack.code}
              className="group relative flex flex-col rounded-[28px] border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elevated"
            >
              {/* Badges */}
              {isBundle && !active && (
                <span className="absolute top-5 right-5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Bundle
                </span>
              )}
              {active && (
                <span className="absolute top-5 right-5 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                  Licensed
                </span>
              )}

              {/* Icon + label */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {pack.label}
                  </p>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {pack.description}
                  </h3>
                </div>
              </div>

              {/* Standards chips */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {pack.standards.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    ISO {s}
                  </span>
                ))}
              </div>

              {/* Pricing tiers */}
              <div className="mt-5 rounded-2xl border border-border/60 bg-secondary/30 overflow-hidden">
                <div className="px-3 py-2 border-b border-border/40 bg-secondary/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pricing — Per Audit Run
                  </p>
                </div>
                {(["1-5", "5-15", "16+"] as UserTier[]).map((tier) => (
                  <div
                    key={tier}
                    className={`flex items-center justify-between px-3 py-2.5 border-b last:border-0 border-border/30 transition-colors ${
                      tier === autoTier ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3 w-3 shrink-0" />
                      {TIER_LABELS[tier]}
                      {tier === autoTier && (
                        <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                          your tier
                        </span>
                      )}
                    </span>
                    <span
                      className={`font-display text-sm font-bold ${
                        tier === autoTier ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {formatNaira(PACK_TIER_PRICES[pack.code][tier])}
                    </span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mt-5 space-y-1.5">
                {AUDIT_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-6 pt-4 border-t border-border/40">
                {openAudit ? (
                  <button
                    onClick={() => navigate(`/app/audits/${openAudit.id}`)}
                    className="pill-cta w-full justify-center bg-primary hover:bg-primary/90 text-white text-sm"
                  >
                    Go to Active Audit →
                  </button>
                ) : (
                  <button
                    onClick={() => openModal(pack.code)}
                    disabled={hasOpenAudit && !openAudit}
                    className="pill-cta w-full justify-center text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="h-4 w-4" />
                    {active ? "Run Another Audit" : `Start Audit · ${formatNaira(tierPrice)}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase history */}
      {list.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-base font-semibold">Purchase History</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {list.map((license) => {
              const meta = PACKS.find((p) => p.code === license.pack);
              const expired = new Date(license.expires_at) < new Date();
              return (
                <div
                  key={license.id}
                  className="rounded-[24px] border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold">
                          {meta?.label ?? license.pack}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatNaira(license.paid_amount_ngn)} paid
                          {license.user_tier && (
                            <> · {TIER_LABELS[license.user_tier]} tier</>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        expired
                          ? "bg-destructive/10 text-destructive"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {expired ? "Expired" : "Active"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Purchased {new Date(license.purchased_at).toLocaleDateString()} · expires{" "}
                    {new Date(license.expires_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Setup Modal ──────────────────────────────────────────────────────── */}
      {configuringPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-[32px] border border-border bg-card shadow-elevated animate-scale-up overflow-hidden">
            {/* Modal header */}
            <div className="border-b border-border/50 bg-secondary/30 px-7 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {step === 1 ? <FileText className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {step === 1 ? "Audit Details" : "Confirm & Pay"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {PACKS.find((p) => p.code === configuringPack)?.label} ·{" "}
                    {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 flex gap-2">
                <div className="h-1 flex-1 rounded-full bg-primary" />
                <div className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-border"}`} />
              </div>
            </div>

            <div className="p-7 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* ── STEP 1: Audit metadata ──────────────────────────────── */}
              {step === 1 && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Audit Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        className="input w-full font-sans text-sm"
                        value={auditTitle}
                        onChange={(e) => setAuditTitle(e.target.value)}
                        placeholder="e.g. Q3 2026 Internal Audit"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Audit Criteria
                      </label>
                      <input
                        className="input w-full font-sans text-sm"
                        value={auditCriteria}
                        onChange={(e) => setAuditCriteria(e.target.value)}
                        placeholder="e.g. ISO 9001:2015"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Audit Scope
                      </label>
                      <input
                        className="input w-full font-sans text-sm"
                        value={auditScope}
                        onChange={(e) => setAuditScope(e.target.value)}
                        placeholder="e.g. Operations, Warehouse"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Audit Objective
                      </label>
                      <input
                        className="input w-full font-sans text-sm"
                        value={auditObject}
                        onChange={(e) => setAuditObject(e.target.value)}
                        placeholder="e.g. Quality improvement"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Owner / Auditee Organisation
                      </label>
                      <input
                        type="text"
                        className={`input w-full font-sans text-sm ${
                          currentOrg?.type !== "individual"
                            ? "bg-secondary/40 opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                        value={
                          currentOrg?.type !== "individual"
                            ? currentOrg?.name || ""
                            : auditOwner
                        }
                        onChange={(e) => {
                          if (currentOrg?.type === "individual") setAuditOwner(e.target.value);
                        }}
                        disabled={currentOrg?.type !== "individual"}
                        placeholder="Organisation name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Lead Auditor
                      </label>
                      <select
                        className="input w-full font-sans text-sm"
                        value={selectedAuditorId}
                        onChange={(e) => setSelectedAuditorId(e.target.value)}
                      >
                        {auditors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Auditee Contact Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        className={`input w-full font-sans text-sm ${
                          currentOrg?.type === "individual"
                            ? "bg-secondary/40 opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                        value={auditeeName}
                        onChange={(e) => {
                          if (currentOrg?.type !== "individual") setAuditeeName(e.target.value);
                        }}
                        disabled={currentOrg?.type === "individual"}
                        placeholder="e.g. Samuel Auditee"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Auditee Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        className={`input w-full font-sans text-sm ${
                          currentOrg?.type === "individual"
                            ? "bg-secondary/40 opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                        value={auditeeEmail}
                        onChange={(e) => {
                          if (currentOrg?.type !== "individual") setAuditeeEmail(e.target.value);
                        }}
                        disabled={currentOrg?.type === "individual"}
                        placeholder="auditee@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="input w-full font-sans text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="input w-full font-sans text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-border/50">
                    <button onClick={resetModal} className="pill-secondary flex-1 justify-center">
                      Cancel
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!step1Valid}
                      className="pill-cta flex-1 justify-center disabled:opacity-50"
                    >
                      Next: Review & Pay →
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 2: Auto-detected tier + payment ─────────────────── */}
              {step === 2 && (
                <>
                  {/* Auto-detected member count */}
                  <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Your workspace currently has
                      </p>
                      <p className="font-display text-xl font-bold text-foreground">
                        {memberCount} user{memberCount === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tier automatically set to{" "}
                        <strong className="text-foreground">{TIER_LABELS[autoTier]}</strong>
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Max users in tier
                      </p>
                      <p className="font-display text-lg font-bold text-foreground">
                        {TIER_MAX_USERS[autoTier] ?? "Unlimited"}
                      </p>
                    </div>
                  </div>

                  {/* Tier enforcement notice */}
                  <div className="rounded-2xl border border-warning/30 bg-warning/5 p-3 flex gap-2.5 text-xs text-warning">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Your paid tier allows up to{" "}
                      <strong>{TIER_MAX_USERS[autoTier] ?? "unlimited"} users</strong>. Adding more
                      team members beyond this limit will require a new payment at the higher tier.
                    </span>
                  </div>

                  {/* Price summary */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {PACKS.find((p) => p.code === configuringPack)?.label} ·{" "}
                          {TIER_LABELS[autoTier]}
                        </p>
                        <p className="mt-1 font-display text-3xl font-extrabold text-foreground">
                          {formatNaira(autoPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          One-time payment · All features included
                        </p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-border/50">
                    <button onClick={() => setStep(1)} className="pill-secondary flex-1 justify-center">
                      ← Back
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={busy !== null}
                      className="pill-cta flex-1 justify-center disabled:opacity-50"
                    >
                      {busy ? (
                        "Redirecting to Paystack…"
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Pay {formatNaira(autoPrice)} via Paystack
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
