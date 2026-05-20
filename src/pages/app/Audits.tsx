import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";

type Audit = { id: string; title: string; standard: string; status: string; scope: string | null; created_at: string };

const STD_LABEL: Record<string, string> = {
  "9001": "ISO 9001",
  "14001": "ISO 14001",
  "45001": "ISO 45001",
  "27001": "ISO 27001",
  "ims": "IMS",
};

export default function Audits() {
  const { currentOrg } = useOrg();
  const [list, setList] = useState<Audit[]>([]);

  useEffect(() => {
    if (!currentOrg) return;
    supabase
      .from("audits")
      .select("*")
      .eq("org_id", currentOrg.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setList((data ?? []) as Audit[]));
  }, [currentOrg]);

  const statusSummary = useMemo(() => ({
    active: list.filter((audit) => audit.status === "in_progress").length,
    closed: list.filter((audit) => audit.status === "closed").length,
    draft: list.filter((audit) => audit.status !== "in_progress" && audit.status !== "closed").length,
  }), [list]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header title="Audits" subtitle="All audit runs across your standards." />
        <Link to="/app/audits/new" className="pill-cta">+ New audit</Link>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total audits" value={list.length} hint="All recorded audit runs" />
        <SummaryCard label="In progress" value={statusSummary.active} hint="Open audits still moving" />
        <SummaryCard label="Closed" value={statusSummary.closed} hint="Completed and report-ready" />
      </section>

      <section className="mt-6 rounded-[28px] border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow-chip">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Audit index
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold">Audit workspace history</h2>
            <p className="mt-1 text-sm text-muted-foreground">Open, review, or continue any audit from one clean list.</p>
          </div>
          <div className="rounded-2xl bg-secondary px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Standards covered</div>
            <div className="mt-1 font-display text-xl font-semibold">{new Set(list.map((audit) => audit.standard)).size}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {list.map((audit) => (
            <Link key={audit.id} to={`/app/audits/${audit.id}`} className="app-surface-soft block p-5 transition hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{STD_LABEL[audit.standard] ?? audit.standard}</span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{audit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{audit.scope || "No scope captured yet"} · {new Date(audit.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${audit.status === "closed" ? "bg-success/10 text-success" : audit.status === "in_progress" ? "bg-info/10 text-info" : "bg-secondary"}`}>
                    {audit.status.replace("_", " ")}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}

          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-background/70 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">No audits yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Start your first audit and it will appear here with status, scope, and quick access.</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

const SummaryCard = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
  <div className="app-surface-soft p-5">
    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
    <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
  </div>
);
