import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { PACKS, formatNaira } from "@/lib/packs";
import { PACK_CREDIT_COST, PACK_RPC_KEY } from "@/lib/credits";

type License = { id: string; pack: string; paid_amount_ngn: number; expires_at: string; active: boolean; purchased_at: string };

export default function Licenses() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [list, setList] = useState<License[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

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

  const unlock = async (packCode: keyof typeof PACK_CREDIT_COST) => {
    if (!currentOrg) return;
    const cost = PACK_CREDIT_COST[packCode];
    if (balance < cost) {
      toast({ title: "Not enough credits", description: `Top up your wallet - this pack costs ${cost} credit(s).`, variant: "destructive" });
      return;
    }

    setBusy(packCode);
    const { error } = await supabase.rpc("spend_credits_for_pack", {
      _org_id: currentOrg.id,
      _pack: PACK_RPC_KEY[packCode],
    });
    setBusy(null);

    if (error) {
      toast({ title: "Could not unlock", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Pack unlocked", description: `${cost} credit(s) spent. You can start an audit now.` });
    load();
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header title="Audit packs" subtitle="Unlock the standards and bundles you want to run next." />
        <Link to="/app/wallet" className="pill-cta">Wallet · {balance} credit{balance === 1 ? "" : "s"}</Link>
      </div>

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
            const cost = PACK_CREDIT_COST[p.code];
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
                  onClick={() => unlock(p.code)}
                  disabled={busy === p.code || balance < cost}
                  className="pill-cta mt-6 w-full disabled:opacity-50"
                >
                  {busy === p.code ? "Unlocking..." : balance < cost ? "Not enough credits" : `Unlock for ${cost} credit${cost === 1 ? "" : "s"}`}
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
            const cost = meta ? PACK_CREDIT_COST[meta.code] : null;

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
    </AppShell>
  );
}
