import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { PACKS, formatNaira } from "@/lib/packs";
import { PACK_CREDIT_COST, PACK_RPC_KEY } from "@/lib/credits";

type License = { id: string; pack: string; paid_amount_ngn: number; expires_at: string; active: boolean; purchased_at: string };

export default function Licenses() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [list, setList] = useState<License[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  // Pack setup state
  const [configuringPack, setConfiguringPack] = useState<string | null>(null);
  const [auditTitle, setAuditTitle] = useState("");
  const [selectedAuditorId, setSelectedAuditorId] = useState("");
  const [auditors, setAuditors] = useState<{ id: string; name: string }[]>([]);



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
  };

  useEffect(() => {
    load();
  }, [currentOrg]);

  useEffect(() => {
    if (!currentOrg) return;
    supabase.from("auditors").select("id,name").eq("org_id", currentOrg.id).order("name")
      .then(({ data }) => setAuditors((data ?? []) as { id: string; name: string }[]));
  }, [currentOrg]);

  const handleUnlockAndLaunch = async () => {
    if (!currentOrg || !configuringPack || !selectedAuditorId || !user) return;
    const cost = customPricing?.[configuringPack] !== undefined 
      ? Number(customPricing[configuringPack]) 
      : PACK_CREDIT_COST[configuringPack as keyof typeof PACK_CREDIT_COST];
    if (balance < cost) {
      toast({ title: "Not enough credits", description: `Top up your wallet - this pack costs ${cost} credit(s).`, variant: "destructive" });
      return;
    }

    setBusy(configuringPack);

    // 1. Spend credits for pack & insert into audit_licenses
    const { data: licenseId, error: spendError } = await supabase.rpc("spend_credits_for_pack", {
      _org_id: currentOrg.id,
      _pack: PACK_RPC_KEY[configuringPack as keyof typeof PACK_CREDIT_COST],
    });

    if (spendError) {
      toast({ title: "Could not unlock", description: spendError.message, variant: "destructive" });
      setBusy(null);
      return;
    }

    // 2. Fetch processes inside the organization
    const { data: orgProcs } = await supabase
      .from("org_processes")
      .select("id,key,name")
      .eq("org_id", currentOrg.id);

    // If configuring hse, ensure we seed HSE processes first
    let finalProcs = orgProcs ?? [];
    if (configuringPack === "hse") {
      const existingKeys = new Set(finalProcs.map((p) => p.key));
      const { HSE_PROCESSES } = await import("@/data/standardsHse");
      const toInsert = HSE_PROCESSES.filter((p) => !existingKeys.has(p.key)).map((p) => ({
        org_id: currentOrg.id,
        key: p.key,
        name: p.name,
      }));

      if (toInsert.length > 0) {
        await supabase.from("org_processes").insert(toInsert);
        const { data: updatedProcs } = await supabase
          .from("org_processes")
          .select("id,key,name")
          .eq("org_id", currentOrg.id);
        if (updatedProcs) finalProcs = updatedProcs;
      }
    }

    // 3. Create the audit record directly
    const { data: newAudit, error: auditError } = await supabase
      .from("audits")
      .insert({
        org_id: currentOrg.id,
        standard: configuringPack,
        title: auditTitle.trim(),
        lead_auditor_id: selectedAuditorId,
        status: "in_progress",
        started_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (auditError || !newAudit) {
      toast({ title: "Failed to start audit", description: auditError?.message ?? "Database error", variant: "destructive" });
      setBusy(null);
      return;
    }

    // 4. Seed audit processes and assign them to the selected auditor
    const visibleProcs = finalProcs.filter((p) => {
      const isHseProc = p.key && p.key.startsWith("hse_");
      return configuringPack === "hse" ? isHseProc : !isHseProc;
    });

    const rows = visibleProcs.map((p) => ({
      audit_id: newAudit.id,
      process_id: p.id,
      auditor_id: selectedAuditorId,
    }));

    if (rows.length > 0) {
      await supabase.from("audit_processes").insert(rows);
    }

    toast({ title: "Audit pack unlocked & launched!", description: `${cost} credit(s) spent. Redirecting you...` });
    setBusy(null);
    setConfiguringPack(null);
    navigate(`/app/audits/${newAudit.id}`);
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header title="Audit packs" subtitle="Unlock the standards and bundles you want to run next." />
        <Link to="/app/wallet" className="pill-cta">Wallet · {balance} credit{balance === 1 ? "" : "s"}</Link>
      </div>

      {!isProfileComplete && (
        <div className="mt-6 rounded-3xl border border-warning/35 bg-warning/5 p-6 shadow-card animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-2xl">
              <h3 className="font-display text-lg font-bold text-foreground">Complete your Profile Settings to proceed</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Before you can purchase or unlock any audit packs, you are required to complete your organization profile details. This helps OAK Global International verify your GRC workspace and activate licensing permissions.
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
            const affordable = balance >= cost;

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
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-display text-4xl font-bold">{cost}</div>
                    <p className="mt-1 text-xs text-muted-foreground">credit{cost === 1 ? "" : "s"}</p>
                  </div>
                  <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    {formatNaira(p.price)} value
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.standards.map((standard) => (
                    <span key={standard} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                      {standard}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (isProfileComplete) {
                      setConfiguringPack(p.code);
                      setAuditTitle(`Q3 ${p.label}`);
                      setSelectedAuditorId("");
                    }
                  }}
                  disabled={busy !== null || balance < cost || !isProfileComplete}
                  className="pill-cta mt-6 w-full disabled:opacity-50"
                >
                  {busy === p.code ? "Unlocking..." : !isProfileComplete ? "Profile setup required" : balance < cost ? "Not enough credits" : `Unlock for ${cost} credit${cost === 1 ? "" : "s"}`}
                </button>

                {!affordable && (
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
                      {cost !== null && <p className="text-xs text-muted-foreground">Bought for {cost} credit{cost === 1 ? "" : "s"}</p>}
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
          <div className="w-full max-w-md rounded-[32px] border border-border bg-card p-8 shadow-elevated animate-scale-up space-y-6">
            <div>
              <h3 className="font-display text-2xl font-bold">Configure Audit Setup</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Unlock this pack, assign it to an auditor, and launch your GRC workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Audit Title</label>
                <input
                  className="input w-full"
                  value={auditTitle}
                  onChange={(e) => setAuditTitle(e.target.value)}
                  placeholder="e.g. Q3 2026 ISO 9001 Audit"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Auditor in Charge</label>
                <select
                  className="input w-full font-sans text-sm font-semibold"
                  value={selectedAuditorId}
                  onChange={(e) => setSelectedAuditorId(e.target.value)}
                >
                  <option value="">— Select Auditor —</option>
                  {auditors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {auditors.length === 0 && (
                  <p className="mt-2 text-xs text-warning leading-normal">
                    ⚠️ No auditors registered. Please register at least one auditor in{" "}
                    <Link to="/app/team" className="underline font-bold text-foreground hover:text-primary">
                      My Team
                    </Link>{" "}
                    first.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50 text-xs text-muted-foreground leading-relaxed">
              <strong>Weekly Pricing & Locks Notice:</strong>
              <p className="mt-1">
                This audit is pay-per-standard and pay-per-auditor. Access to this audit pack is valid for exactly 1 week from activation. Once created, the audit title and assigned auditor cannot be changed.
              </p>
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
                      <Link to="/app/wallet" className="mt-2.5 inline-flex items-center gap-1.5 font-bold underline hover:text-destructive/80 transition">
                        Go to Wallet & Fund Account →
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfiguringPack(null)}
                      className="pill-secondary flex-1 justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnlockAndLaunch}
                      disabled={!auditTitle.trim() || !selectedAuditorId || busy !== null || isInsufficient}
                      className="pill-cta flex-1 justify-center disabled:opacity-50"
                    >
                      {busy ? "Activating..." : "Launch Audit →"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </AppShell>
  );
}
