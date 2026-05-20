import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { seedStandardProcesses } from "@/lib/seedProcesses";
import { PROCESSES } from "@/data/processAudit";
import { AppShell } from "@/components/app/AppShell";

type Auditor = { id: string; name: string; email: string | null; role: string | null };

export default function Onboarding() {
  const { currentOrg, refresh } = useOrg();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [newAuditor, setNewAuditor] = useState({ name: "", email: "", role: "auditor" });
  const [selectedKeys, setSelectedKeys] = useState<string[]>(PROCESSES.map((p) => p.key));
  const [assignments, setAssignments] = useState<Record<string, string[]>>({}); // process_key -> auditor_ids

  useEffect(() => {
    if (!currentOrg) return;
    supabase.from("auditors").select("id,name,email,role").eq("org_id", currentOrg.id)
      .then(({ data }) => setAuditors((data ?? []) as Auditor[]));
  }, [currentOrg]);

  if (!currentOrg) return <AppShell><div>Loading…</div></AppShell>;

  const addAuditor = async () => {
    if (!newAuditor.name.trim()) return;
    const { data, error } = await supabase.from("auditors").insert({
      org_id: currentOrg.id, ...newAuditor,
    }).select().single();
    if (error) return toast({ title: error.message, variant: "destructive" });
    setAuditors([...auditors, data as Auditor]);
    setNewAuditor({ name: "", email: "", role: "auditor" });
  };

  const finish = async () => {
    await seedStandardProcesses(currentOrg.id);
    // Persist assignments
    const { data: procs } = await supabase.from("org_processes")
      .select("id,key").eq("org_id", currentOrg.id);
    const procMap = Object.fromEntries((procs ?? []).map((p) => [p.key, p.id]));
    const rows: { org_id: string; process_id: string; auditor_id: string }[] = [];
    for (const [key, ids] of Object.entries(assignments)) {
      const pid = procMap[key];
      if (!pid) continue;
      for (const aid of ids) rows.push({ org_id: currentOrg.id, process_id: pid, auditor_id: aid });
    }
    if (rows.length) await supabase.from("process_assignments").insert(rows);
    await refresh();
    toast({ title: "Onboarding complete!", description: "Welcome to OAK Global." });
    navigate("/app");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

        {step === 1 && (
          <Section title="Step 1 · Add your audit team" subtitle="Add the auditors in your organization. You can invite them by email later.">
            <div className="space-y-3">
              {auditors.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                  <div><strong>{a.name}</strong> · <span className="text-muted-foreground">{a.email ?? "no email"}</span></div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{a.role}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-border p-4 md:grid-cols-4">
              <input className="input" placeholder="Full name" value={newAuditor.name} onChange={(e) => setNewAuditor({ ...newAuditor, name: e.target.value })} />
              <input className="input" placeholder="Email" type="email" value={newAuditor.email} onChange={(e) => setNewAuditor({ ...newAuditor, email: e.target.value })} />
              <select className="input" value={newAuditor.role} onChange={(e) => setNewAuditor({ ...newAuditor, role: e.target.value })}>
                <option value="lead_auditor">Lead Auditor</option>
                <option value="auditor">Auditor</option>
                <option value="auditee">Auditee</option>
              </select>
              <button onClick={addAuditor} className="pill-cta">Add</button>
            </div>
            <Footer onNext={() => setStep(2)} disabled={auditors.length === 0} />
          </Section>
        )}

        {step === 2 && (
          <Section title="Step 2 · Pick your processes" subtitle="Confirm the processes that operate in your organization.">
            <div className="grid gap-2 md:grid-cols-2">
              {PROCESSES.map((p) => {
                const checked = selectedKeys.includes(p.key);
                return (
                  <label key={p.key} className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition ${checked ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input type="checkbox" checked={checked} onChange={() =>
                      setSelectedKeys(checked ? selectedKeys.filter((k) => k !== p.key) : [...selectedKeys, p.key])
                    } />
                    <span><strong>{p.name}</strong><div className="text-xs text-muted-foreground">{p.scope}</div></span>
                  </label>
                );
              })}
            </div>
            <Footer onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </Section>
        )}

        {step === 3 && (
          <Section title="Step 3 · Assign auditors" subtitle="Tick which auditor covers which process.">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Process</th>
                    {auditors.map((a) => <th key={a.id} className="px-3 py-2 text-center">{a.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PROCESSES.filter((p) => selectedKeys.includes(p.key)).map((p) => (
                    <tr key={p.key} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      {auditors.map((a) => {
                        const ids = assignments[p.key] ?? [];
                        const on = ids.includes(a.id);
                        return (
                          <td key={a.id} className="px-3 py-2 text-center">
                            <input type="checkbox" checked={on} onChange={() => {
                              const next = on ? ids.filter((x) => x !== a.id) : [...ids, a.id];
                              setAssignments({ ...assignments, [p.key]: next });
                            }} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Footer onBack={() => setStep(2)} onNext={finish} nextLabel="Finish setup" />
          </Section>
        )}
      </div>
    </AppShell>
  );
}

const Section = ({ title, subtitle, children }: any) => (
  <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
    <h1 className="font-display text-2xl font-bold">{title}</h1>
    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    <div className="mt-6">{children}</div>
  </div>
);

const Footer = ({ onBack, onNext, disabled, nextLabel = "Continue" }: any) => (
  <div className="mt-8 flex justify-between">
    {onBack ? <button onClick={onBack} className="rounded-full border border-border px-5 py-2 text-sm">Back</button> : <span />}
    <button onClick={onNext} disabled={disabled} className="pill-cta disabled:opacity-50">{nextLabel}</button>
  </div>
);