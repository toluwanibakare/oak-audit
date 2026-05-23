import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { TOPUP_BUNDLES, NAIRA_PER_CREDIT, formatNaira, PACK_CREDIT_COST } from "@/lib/credits";
import { PACKS } from "@/lib/packs";

type Tx = {
  id: string;
  kind: string;
  credits: number;
  naira_amount: number | null;
  reference: string | null;
  pack: string | null;
  created_at: string;
};

export default function Wallet() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [balance, setBalance] = useState<number>(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [customCredits, setCustomCredits] = useState<string>("");

  const numericCredits = parseInt(customCredits, 10) || 0;

  const load = async () => {
    if (!currentOrg) return;
    const [wallet, transactions] = await Promise.all([
      supabase.from("credit_wallets").select("balance").eq("org_id", currentOrg.id).maybeSingle(),
      supabase.from("credit_transactions").select("*").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).limit(50),
    ]);
    setBalance(wallet.data?.balance ?? 0);
    setTxs((transactions.data ?? []) as Tx[]);
  };

  useEffect(() => {
    if (!currentOrg) return;
    load();

    // Real-time subscription to auto-refresh credits and transactions list!
    const channel = supabase
      .channel(`wallet_page_${currentOrg.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credit_wallets",
          filter: `org_id=eq.${currentOrg.id}`,
        },
        () => {
          load();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credit_transactions",
          filter: `org_id=eq.${currentOrg.id}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrg]);

  useEffect(() => {
    const ref = params.get("ref") ?? params.get("reference") ?? params.get("trxref");
    if (!ref) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke("paystack-verify", { body: { reference: ref } });
      if (error) toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      else if (data?.ok) toast({ title: "Top-up confirmed", description: `${data.credits} credit(s) added to your wallet.` });
      else toast({ title: "Payment not successful", variant: "destructive" });
      params.delete("ref");
      params.delete("reference");
      params.delete("trxref");
      setParams(params, { replace: true });
      load();
    })();
  }, []);

  const topUp = async (credits: number) => {
    if (!currentOrg || !user) return;
    setBusy(credits);
    const { error } = await supabase.rpc("bypass_topup_credits", {
      _org_id: currentOrg.id,
      _credits: credits,
    });
    setBusy(null);
    if (error) {
      toast({
        title: "Top-up failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Top-up confirmed",
      description: `${credits} credit(s) added to your wallet (Bypassed payment).`,
    });
    load();
  };

  return (
    <AppShell>
      <Header title="Wallet" subtitle="Top up credits and spend them on any audit you want to run." />

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="page-hero">
          <div className="eyebrow-chip">Current balance</div>
          <div className="mt-4 font-display text-6xl font-bold">{balance}</div>
          <p className="mt-3 text-sm text-muted-foreground">{balance === 1 ? "credit" : "credits"} · approx {formatNaira(balance * NAIRA_PER_CREDIT)}</p>
        </div>

        <div className="app-surface p-6">
          <h3 className="font-display text-xl font-semibold">What audits cost</h3>
          <p className="mt-1 text-sm text-muted-foreground">1 credit = {formatNaira(NAIRA_PER_CREDIT)}. Each audit you run debits credits from this wallet.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PACKS.map((pack) => (
              <div key={pack.code} className="app-surface-soft flex items-center justify-between px-4 py-3 text-sm">
                <span>{pack.label}</span>
                <span className="font-mono text-xs">{PACK_CREDIT_COST[pack.code]} credit{PACK_CREDIT_COST[pack.code] === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 app-surface p-6">
        <h2 className="font-display text-xl font-semibold">Top up credits</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a bundle and add credits to the workspace instantly after checkout.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TOPUP_BUNDLES.map((bundle) => (
            <div key={bundle.credits} className={`rounded-[24px] border p-5 shadow-card ${bundle.popular ? "border-gold bg-card" : "border-border bg-background/80"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Bundle</span>
                {bundle.popular && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">Popular</span>}
              </div>
              <div className="mt-4 font-display text-5xl font-bold">{bundle.credits}</div>
              <p className="text-xs text-muted-foreground">credit{bundle.credits === 1 ? "" : "s"}</p>
              <div className="mt-4 font-display text-2xl">{formatNaira(bundle.credits * NAIRA_PER_CREDIT)}</div>
              <button onClick={() => topUp(bundle.credits)} disabled={busy === bundle.credits} className="pill-cta mt-6 w-full disabled:opacity-50">
                {busy === bundle.credits ? "Redirecting..." : "Top up"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md p-6 shadow-card max-w-xl">
          <h3 className="font-display text-base font-bold">Or Top Up a Custom Amount</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Fund your wallet with any custom credit count. 1 credit = {formatNaira(NAIRA_PER_CREDIT)}.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="number"
                min="1"
                className="input w-full pr-16 text-sm font-semibold"
                placeholder="Enter credit count (e.g. 5)"
                value={customCredits}
                onChange={(e) => setCustomCredits(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-muted-foreground uppercase">
                Credits
              </span>
            </div>
            <button
              onClick={() => numericCredits > 0 && topUp(numericCredits)}
              disabled={numericCredits <= 0 || busy !== null}
              className="pill-cta w-full sm:w-auto shrink-0 justify-center text-xs py-2.5 px-4"
            >
              {busy ? "Redirecting..." : `Top Up ${numericCredits > 0 ? `(${formatNaira(numericCredits * NAIRA_PER_CREDIT)})` : ""}`}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 app-surface overflow-hidden">
        <div className="border-b border-border px-6 py-5">
          <h2 className="font-display text-xl font-semibold">Recent activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track every top-up and every credit movement in one place.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Detail</th>
              <th className="px-4 py-3 text-right">Credits</th>
              <th className="px-4 py-3 text-right">Naira</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{tx.kind}</td>
                <td className="px-4 py-3 font-mono text-xs">{tx.pack ?? tx.reference ?? "-"}</td>
                <td className={`px-4 py-3 text-right font-mono ${tx.credits >= 0 ? "text-success" : "text-destructive"}`}>
                  {tx.credits > 0 ? `+${tx.credits}` : tx.credits}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{tx.naira_amount ? formatNaira(tx.naira_amount) : "-"}</td>
              </tr>
            ))}
            {txs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions yet. Top up credits to get started.</td></tr>}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
