import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { useToast } from "@/hooks/use-toast";

export default function Findings() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [form, setForm] = useState({ audit_id: "", type: "minor", clause: "", description: "", capa: "", owner: "", due_date: "" });

  const load = async () => {
    if (!currentOrg) return;
    const { data } = await supabase.from("findings").select("*,audits(title,standard)").eq("org_id", currentOrg.id).order("created_at", { ascending: false });
    setList(data ?? []);
    const { data: auditList } = await supabase.from("audits").select("id,title").eq("org_id", currentOrg.id).order("created_at", { ascending: false });
    setAudits(auditList ?? []);
  };
  useEffect(() => {
    load();
  }, [currentOrg]);

  const add = async () => {
    if (!currentOrg || !form.audit_id || !form.description.trim()) return;
    const { error } = await supabase.from("findings").insert({
      org_id: currentOrg.id,
      ...form,
      due_date: form.due_date || null,
    });
    if (error) return toast({ title: error.message, variant: "destructive" });
    setForm({ audit_id: form.audit_id, type: "minor", clause: "", description: "", capa: "", owner: "", due_date: "" });
    load();
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("findings").update({ status }).eq("id", id);
    load();
  };

  const summary = useMemo(() => ({
    open: list.filter((finding) => finding.status === "open").length,
    progress: list.filter((finding) => finding.status === "in_progress").length,
    closed: list.filter((finding) => finding.status === "closed").length,
  }), [list]);

  return (
    <AppShell>
      <Header title="Findings & CAPA" subtitle="Non-conformities, observations, and corrective actions." />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusCard label="Open" value={summary.open} hint="Awaiting action" icon={<AlertTriangle className="h-4 w-4" />} />
        <StatusCard label="In progress" value={summary.progress} hint="Currently being worked" icon={<Clock3 className="h-4 w-4" />} />
        <StatusCard label="Closed" value={summary.closed} hint="Resolved items" icon={<CheckCircle2 className="h-4 w-4" />} />
      </section>

      <section className="mt-6 rounded-[28px] border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-xl font-semibold">Add a finding</h2>
        <p className="mt-1 text-sm text-muted-foreground">Capture a new issue quickly and keep the CAPA register current.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-7">
          <select className="input md:col-span-2" value={form.audit_id} onChange={(e) => setForm({ ...form, audit_id: e.target.value })}>
            <option value="">Select audit...</option>
            {audits.map((audit) => <option key={audit.id} value={audit.id}>{audit.title}</option>)}
          </select>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
            <option value="observation">Observation</option>
            <option value="opportunity">Opportunity</option>
          </select>
          <input className="input" placeholder="Clause" value={form.clause} onChange={(e) => setForm({ ...form, clause: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button onClick={add} className="pill-cta">Add finding</button>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {list.map((finding) => (
          <div key={finding.id} className="app-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs uppercase">{finding.type}</span>
                  <span className="text-xs text-muted-foreground">{finding.audits?.title} · clause {finding.clause || "-"}</span>
                </div>
                <p className="mt-3 text-sm leading-6">{finding.description}</p>
                {finding.capa && <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">CAPA:</strong> {finding.capa}</p>}
              </div>
              <select value={finding.status} onChange={(e) => setStatus(finding.id, e.target.value)} className="input w-40 text-xs">
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No findings yet.</div>}
      </section>
    </AppShell>
  );
}

const StatusCard = ({ label, value, hint, icon }: { label: string; value: number; hint: string; icon: React.ReactNode }) => (
  <div className="app-surface-soft p-5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {icon}
      {label}
    </div>
    <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
  </div>
);
