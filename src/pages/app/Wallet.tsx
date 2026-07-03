import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { walletApi } from "@/api/wallet";
import { formatNaira } from "@/lib/credits";
import { PACKS } from "@/lib/packs";

type License = {
  id: string;
  pack: string;
  paid_amount_ngn: number;
  active: boolean;
  purchased_at: string;
  expires_at: string;
};

export default function Wallet() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);

  const load = async () => {
    if (!currentOrg) return;
    const data = await walletApi.licenses(currentOrg.id).catch(() => []);
    setLicenses(data as License[]);
  };

  useEffect(() => {
    if (!currentOrg) return;
    load();
  }, [currentOrg]);

  const totalSpent = licenses.reduce((sum, l) => sum + Number(l.paid_amount_ngn), 0);

  return (
    <AppShell>
      <Header
        title="Payment History"
        subtitle="Pay-as-you-use via Paystack. All your audit purchases in one place."
      />

      {/* Summary card */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total spent (all time)</p>
              <p className="font-display text-3xl font-bold">{formatNaira(totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active audit licenses</p>
              <p className="font-display text-3xl font-bold">{licenses.filter((l) => l.active).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA to buy */}
      <div className="mt-6 rounded-[28px] border border-primary/20 bg-primary/5 p-6 shadow-card flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Pay-as-you-go Auditing</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select an ISO standard, pay once via Paystack, and run your audit immediately. No subscriptions, no credits.
          </p>
        </div>
        <Link to="/app/licenses" className="pill-cta shrink-0 gap-2">
          Buy an Audit <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Purchase history */}
      <section className="mt-6 app-surface overflow-x-auto">
        <div className="border-b border-border px-6 py-5">
          <h2 className="font-display text-xl font-semibold">Purchase History</h2>
          <p className="mt-1 text-sm text-muted-foreground">Every audit you've paid for via Paystack.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Pack</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((lic) => {
              const pack = PACKS.find((p) => p.code === lic.pack);
              const expired = new Date(lic.expires_at) < new Date();
              return (
                <tr key={lic.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(lic.purchased_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-semibold">{pack?.label ?? lic.pack}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNaira(Number(lic.paid_amount_ngn))}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${expired ? "text-destructive" : "text-success"}`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {expired ? "Expired" : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {licenses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No purchases yet.{" "}
                  <Link to="/app/licenses" className="text-primary font-semibold hover:underline">Buy your first audit</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
