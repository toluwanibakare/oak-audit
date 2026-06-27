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
  const [processes, setProcesses] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ audit_id: "", type: "minor", clause: "", description: "", capa: "", owner: "", due_date: "" });

  const load = async () => {
    if (!currentOrg) return;

    // Fetch processes list to translate process ID to Name
    const { data: procs } = await supabase
      .from("org_processes")
      .select("id,name")
      .eq("org_id", currentOrg.id);
    
    const pMap: Record<string, string> = {};
    (procs ?? []).forEach((p) => {
      pMap[p.id] = p.name;
    });
    setProcesses(pMap);

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
      <Header title="Findings & CAR" subtitle="Non-conformities, observations, and corrective action reports." />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusCard label="Open" value={summary.open} hint="Awaiting action" icon={<AlertTriangle className="h-4 w-4" />} />
        <StatusCard label="In progress" value={summary.progress} hint="Currently being worked" icon={<Clock3 className="h-4 w-4" />} />
        <StatusCard label="Closed" value={summary.closed} hint="Resolved items" icon={<CheckCircle2 className="h-4 w-4" />} />
      </section>

      <section className="mt-6 rounded-[28px] border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-xl font-semibold">Add a finding</h2>
        <p className="mt-1 text-sm text-muted-foreground">Capture a new issue quickly and keep the CAR register current.</p>
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

      <section className="mt-6 overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Clause</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Severity</th>
              <th className="px-4 py-3 text-left">Process</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((finding) => {
              const meta = parseFindingMeta(finding.root_cause);
              const procName = meta?.processId ? (processes[meta.processId] || "N/A") : "N/A";
              const severity = finding.type === "major" ? "Major" : finding.type === "minor" ? "Minor" : "Observation";
              
              return (
                <tr key={finding.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground truncate max-w-[80px]" title={finding.id}>
                    #{finding.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {finding.clause || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground leading-normal max-w-sm">
                    <p className="line-clamp-2" title={finding.description}>{finding.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      finding.type === "major" 
                        ? "bg-destructive/10 text-destructive border border-destructive/20" 
                        : finding.type === "minor"
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : "bg-blue-600/10 text-blue-500 border border-blue-500/20"
                    }`}>
                      {severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {procName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {finding.owner || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">
                    {finding.due_date ? new Date(finding.due_date).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={finding.status} 
                      onChange={(e) => setStatus(finding.id, e.target.value)} 
                      className="input py-1 px-2 h-8 text-[11px] font-semibold w-28"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No findings recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

function parseFindingMeta(rootCause: string | null) {
  if (!rootCause?.startsWith("AUTO_META:")) return null;
  try {
    return JSON.parse(rootCause.slice("AUTO_META:".length)) as {
      processId: string;
      kind: string;
      qRef: string;
      severity?: string;
    };
  } catch {
    return null;
  }
}
