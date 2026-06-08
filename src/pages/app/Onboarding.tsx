import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { PROCESSES } from "@/data/processAudit";
import { PROCESSES_14001 } from "@/data/processAudit14001";
import { PROCESSES_45001 } from "@/data/processAudit45001";
import { HSE_PROCESSES } from "@/data/standardsHse";
import { normalizeProcessKey } from "@/data/standards";

const ALL_STANDARD_PROCESSES = [
  ...PROCESSES,
  ...PROCESSES_14001,
  ...PROCESSES_45001,
  ...HSE_PROCESSES,
];

const UNIQUE_STANDARD_PROCESSES = Array.from(
  new Map(
    ALL_STANDARD_PROCESSES.map((p) => {
      const normKey = normalizeProcessKey(p.key);
      const canonical = PROCESSES.find(sp => sp.key === normKey) || p;
      return [normKey, { ...canonical, key: normKey }];
    })
  ).values()
);


import { AppShell } from "@/components/app/AppShell";

type Auditor = { id: string; name: string; email: string | null; role: string | null };

export default function Onboarding() {
  const { currentOrg, refresh } = useOrg();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [newAuditor, setNewAuditor] = useState({ name: "", email: "", role: "auditor", password: "" });
  const [busy, setBusy] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(UNIQUE_STANDARD_PROCESSES.map((p) => p.key));
  const [customProcesses, setCustomProcesses] = useState<{ name: string; scope: string }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customScope, setCustomScope] = useState("");
  const [assignments, setAssignments] = useState<Record<string, string[]>>({}); // process_key -> auditor_ids

  useEffect(() => {
    if (!currentOrg) return;
    supabase.from("auditors").select("id,name,email,role").eq("org_id", currentOrg.id)
      .then(({ data }) => setAuditors((data ?? []) as Auditor[]));
  }, [currentOrg]);

  useEffect(() => {
    if (currentOrg?.type === "individual" && step === 1) {
      setStep(2);
    }
  }, [currentOrg, step]);

  if (!currentOrg) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl animate-pulse space-y-8">
          <div className="flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-secondary/80" />
            <div className="h-1.5 flex-1 rounded-full bg-secondary/80" />
            <div className="h-1.5 flex-1 rounded-full bg-secondary/80" />
          </div>
          <div className="rounded-[28px] border border-border bg-card p-8 space-y-6">
            <div>
              <div className="h-6 w-48 bg-secondary/80 rounded-lg mb-2" />
              <div className="h-4 w-96 bg-secondary/70 rounded-md" />
            </div>
            <div className="space-y-3">
              <div className="h-14 w-full bg-secondary/60 rounded-xl" />
              <div className="h-14 w-full bg-secondary/60 rounded-xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }


  const addAuditor = async () => {
    if (!newAuditor.name.trim() || !newAuditor.email.trim() || !newAuditor.password.trim()) {
      return toast({ title: "Name, email, and password are required to create an auditor account", variant: "destructive" });
    }
    if (newAuditor.password.length < 8) {
      return toast({ title: "Password must be at least 8 characters long", variant: "destructive" });
    }

    setBusy(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://retlzhncvxiicmgmdgtk.supabase.co";
      const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldGx6aG5jdnhpaWNtZ21kZ3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjEyMTMsImV4cCI6MjA5NTA5NzIxM30.5VM0sUHMiZ_Q2cBMt8yW5qpEj1uVNQu2z73286eLCMg";

      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newAuditor.email.trim(),
          password: newAuditor.password.trim(),
          data: {
            full_name: newAuditor.name.trim(),
            account_type: "auditor",
            org_id: currentOrg.id,
          }
        })
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        throw new Error(signupData.message ?? "Could not register auditor account.");
      }

      const userUuid = signupData.id || signupData.user?.id;
      if (!userUuid) {
        throw new Error("Failed to retrieve user identifier from registration.");
      }

      const { data, error } = await supabase.from("auditors").insert({
        org_id: currentOrg.id,
        name: newAuditor.name.trim(),
        email: newAuditor.email.trim(),
        role: newAuditor.role,
        user_id: userUuid,
      }).select().single();

      if (error) throw error;

      setAuditors([...auditors, data as Auditor]);
      setNewAuditor({ name: "", email: "", role: "auditor", password: "" });
      toast({ title: "Auditor account created successfully" });
    } catch (err: any) {
      toast({ title: "Failed to create auditor", description: err.message ?? "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    const standardRows = UNIQUE_STANDARD_PROCESSES.filter((p) => selectedKeys.includes(p.key)).map((p) => ({
      org_id: currentOrg.id, key: p.key, name: p.name, scope: p.scope, is_custom: false,
    }));
    const customRows = customProcesses.map((p) => {
      const key = "custom_" + p.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
      return {
        org_id: currentOrg.id, key, name: p.name, scope: p.scope, is_custom: true,
      };
    });
    const rows = [...standardRows, ...customRows];
    if (rows.length) await supabase.from("org_processes").insert(rows);

    if (currentOrg.type === "organization") {
      // Persist assignments
      const { data: procs } = await supabase.from("org_processes")
        .select("id,key").eq("org_id", currentOrg.id);
      const procMap = Object.fromEntries((procs ?? []).map((p) => [p.key, p.id]));
      const assignmentRows: { org_id: string; process_id: string; auditor_id: string }[] = [];
      for (const [key, ids] of Object.entries(assignments)) {
        const pid = procMap[key];
        if (!pid) continue;
        for (const aid of ids) assignmentRows.push({ org_id: currentOrg.id, process_id: pid, auditor_id: aid });
      }
      if (assignmentRows.length) await supabase.from("process_assignments").insert(assignmentRows);
    }
    
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
            <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-border p-4 md:grid-cols-[1fr_1fr_1fr_1fr_100px] items-center">
              <input className="input" placeholder="Full name" value={newAuditor.name} onChange={(e) => setNewAuditor({ ...newAuditor, name: e.target.value })} />
              <input className="input" placeholder="Email" type="email" value={newAuditor.email} onChange={(e) => setNewAuditor({ ...newAuditor, email: e.target.value })} />
              <input className="input" placeholder="Password" type="password" value={newAuditor.password} onChange={(e) => setNewAuditor({ ...newAuditor, password: e.target.value })} />
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold pl-2">
                <input 
                  type="checkbox" 
                  checked={newAuditor.role === "lead_auditor"} 
                  onChange={(e) => setNewAuditor({ ...newAuditor, role: e.target.checked ? "lead_auditor" : "auditor" })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>Lead Auditor</span>
              </label>
              <button onClick={addAuditor} disabled={busy} className="pill-cta w-full">{busy ? "Adding..." : "Add"}</button>
            </div>
            <Footer onNext={() => setStep(2)} disabled={auditors.length === 0} />
          </Section>
        )}

        {step === 2 && (
          <Section title="Step 2 · Pick your processes" subtitle="Confirm the processes that operate in your organization, or add your own custom ones.">
            <div className="grid gap-2 md:grid-cols-2 max-h-[400px] overflow-y-auto pr-1">
              {UNIQUE_STANDARD_PROCESSES.map((p) => {
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
              {customProcesses.map((p, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 rounded-xl border border-primary bg-primary/5 p-3 text-sm">
                  <span><strong>{p.name}</strong><div className="text-xs text-muted-foreground">{p.scope}</div></span>
                  <button onClick={() => setCustomProcesses(customProcesses.filter((_, i) => i !== idx))} className="text-xs text-destructive font-semibold hover:underline">Remove</button>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <h3 className="text-sm font-semibold mb-2 text-foreground">Can't find a process? Add your own custom process:</h3>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Process Name</label>
                  <input 
                    className="input w-full" 
                    placeholder="e.g. Logistics & Transport" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
                <div className="flex-[2] min-w-[250px]">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Process Scope</label>
                  <input 
                    className="input w-full" 
                    placeholder="e.g. Dispatch, cargo loading, fleet maintenance" 
                    value={customScope}
                    onChange={(e) => setCustomScope(e.target.value)}
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    if (!customName.trim()) return;
                    setCustomProcesses([...customProcesses, { name: customName.trim(), scope: customScope.trim() }]);
                    setCustomName("");
                    setCustomScope("");
                  }}
                  className="pill-cta h-11 shrink-0"
                >
                  Add Custom
                </button>
              </div>
            </div>

            {currentOrg.type === "individual" ? (
              <Footer onNext={finish} nextLabel="Finish setup" />
            ) : (
              <Footer onBack={() => setStep(1)} onNext={() => setStep(3)} />
            )}
          </Section>
        )}

        {step === 3 && (() => {
          const activeProcesses = [
            ...UNIQUE_STANDARD_PROCESSES.filter((p) => selectedKeys.includes(p.key)).map(p => ({
              key: p.key,
              name: p.name,
              scope: p.scope
            })),
            ...customProcesses.map((p) => {
              const key = "custom_" + p.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
              return { key, name: p.name, scope: p.scope };
            })
          ];

          return (
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
                    {activeProcesses.map((p) => (
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
          );
        })()}
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