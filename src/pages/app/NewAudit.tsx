import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { PACKS, packGrantsStandard } from "@/lib/packs";

const STANDARDS = [
  { code: "9001", label: "ISO 9001 — Quality" },
  { code: "14001", label: "ISO 14001 — Environment" },
  { code: "45001", label: "ISO 45001 — OH&S" },
  { code: "27001", label: "ISO 27001 — InfoSec" },
  { code: "ims", label: "IMS — Integrated (9001+14001+45001+27001)" },
  { code: "hse", label: "HSE — Site Inspection" },
];

export default function NewAudit() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/app/licenses", { replace: true });
  }, [navigate]);

  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<{ pack: string; expires_at: string }[]>([]);
  const [procs, setProcs] = useState<{ id: string; name: string; key: string }[]>([]);
  const [auditors, setAuditors] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ standard: "9001", title: "", scope: "", lead: "" });
  const [picked, setPicked] = useState<Record<string, string>>({}); // process_id -> auditor_id

  useEffect(() => {
    if (!currentOrg) return;
    Promise.all([
      supabase.from("audit_licenses").select("pack,expires_at,active").eq("org_id", currentOrg.id),
      supabase.from("org_processes").select("id,name,key").eq("org_id", currentOrg.id).order("name"),
      supabase.from("auditors").select("id,name").eq("org_id", currentOrg.id),
    ]).then(([l, p, a]) => {
      setLicenses((l.data ?? []).filter((x) => x.active && new Date(x.expires_at) > new Date()));
      setProcs((p.data ?? []) as any);
      setAuditors((a.data ?? []) as any);
    });
  }, [currentOrg]);

  // Dynamic automatic seeding of HSE processes when HSE is selected
  useEffect(() => {
    if (!currentOrg || form.standard !== "hse") return;

    const seedHseProcesses = async () => {
      const { data: existing } = await supabase
        .from("org_processes")
        .select("id,name,key")
        .eq("org_id", currentOrg.id);

      const existingKeys = new Set((existing ?? []).map((p) => p.key));
      const { HSE_PROCESSES } = await import("@/data/standardsHse");
      
      const toInsert = HSE_PROCESSES.filter((p) => !existingKeys.has(p.key)).map((p) => ({
        org_id: currentOrg.id,
        key: p.key,
        name: p.name,
      }));

      if (toInsert.length > 0) {
        const { error } = await supabase.from("org_processes").insert(toInsert);
        if (error) {
          console.error("Failed to seed HSE processes:", error);
          return;
        }
      }

      // Re-fetch all processes
      const { data: updatedProcs } = await supabase
        .from("org_processes")
        .select("id,name,key")
        .eq("org_id", currentOrg.id)
        .order("name");

      if (updatedProcs) {
        setProcs(updatedProcs as any);
        // HSE site inspection checklist should start completely unchecked
        setPicked({});
      }
    };

    seedHseProcesses();
  }, [currentOrg, form.standard]);

  const hasLicense = (std: string) => {
    if (std === "hse") {
      // HSE standard is granted if the organization has either "hse", "ims", "14001", or "45001" licenses active.
      return licenses.some((l) => l.pack === "hse" || l.pack === "ims" || l.pack === "14001" || l.pack === "45001");
    }
    return licenses.some((l) => packGrantsStandard(l.pack as any, std === "ims" ? "9001" : std)) &&
      (std !== "ims" || licenses.some((l) => l.pack === "ims"));
  };

  const create = async () => {
    if (!currentOrg || !user) return;
    if (!form.title.trim()) return toast({ title: "Add a title", variant: "destructive" });
    if (!hasLicense(form.standard)) return toast({ title: "No active license for that standard", description: "Spend credits on the ISO Library page.", variant: "destructive" });

    const { data: audit, error } = await supabase.from("audits").insert({
      org_id: currentOrg.id, standard: form.standard, title: form.title, scope: form.scope,
      lead_auditor_id: form.lead || null, status: "in_progress", started_at: new Date().toISOString(),
      created_by: user.id,
    }).select().single();
    if (error || !audit) return toast({ title: error?.message ?? "Failed", variant: "destructive" });

    const rows = Object.entries(picked).map(([process_id, auditor_id]) => ({
      audit_id: audit.id, process_id, auditor_id: auditor_id || null,
    }));
    if (rows.length) await supabase.from("audit_processes").insert(rows);

    navigate(`/app/audits/${audit.id}`);
  };

  const visibleProcs = procs.filter((p) => {
    const isHseProc = p.key && p.key.startsWith("hse_");
    return form.standard === "hse" ? isHseProc : !isHseProc;
  });

  return (
    <AppShell>
      <Header title="New Audit" subtitle="Configure scope, processes, and assignments." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <Field label="Standard">
            <select className="input" value={form.standard} onChange={(e) => setForm({ ...form, standard: e.target.value })}>
              {STANDARDS.map((s) => <option key={s.code} value={s.code}>{s.label} {hasLicense(s.code) ? "✓" : "(locked)"}</option>)}
            </select>
          </Field>
          <Field label="Audit title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Q3 HSE Site Inspection" /></Field>
          <Field label="Scope"><textarea className="input min-h-[80px]" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} placeholder="Departments / sites covered" /></Field>
          <Field label="Lead auditor">
            <select className="input" value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })}>
              <option value="">— None —</option>
              {auditors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <button onClick={create} className="pill-cta w-full">Start audit →</button>
        </div>

        <div className="min-h-0 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold">Processes in scope</h3>
          <p className="mt-1 text-xs text-muted-foreground">Tick processes and optionally assign each to an auditor.</p>
          <div className="mt-4 space-y-2">
            {visibleProcs.map((p) => {
              const checked = p.id in picked;
              return (
                <div key={p.id} className={`flex items-center justify-between rounded-xl border p-3 text-sm ${checked ? "border-primary bg-primary/5" : "border-border"}`}>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={checked} onChange={() => {
                      const next = { ...picked };
                      if (checked) delete next[p.id]; else next[p.id] = "";
                      setPicked(next);
                    }} />
                    <span><strong>{p.name}</strong></span>
                  </label>
                  {checked && (
                    <select className="input w-48" value={picked[p.id]} onChange={(e) => setPicked({ ...picked, [p.id]: e.target.value })}>
                      <option value="">— Assign auditor —</option>
                      {auditors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  )}
                </div>
              );
            })}
            {visibleProcs.length === 0 && <div className="text-sm text-muted-foreground">No processes yet — add some on the Processes page first.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium">{label}</span>
    {children}
  </label>
);
