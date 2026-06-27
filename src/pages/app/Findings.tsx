import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { useToast } from "@/hooks/use-toast";
import { getClauseRequirement } from "@/data/isoClauses";

export default function Findings() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [processes, setProcesses] = useState<Record<string, string>>({}); // id -> name
  const [processOwners, setProcessOwners] = useState<Record<string, string>>({}); // id -> process_owner
  const [form, setForm] = useState({ audit_id: "", type: "minor", clause: "", description: "", capa: "", owner: "", due_date: "" });

  // CAR Modal States
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);
  const [carForm, setCarForm] = useState({
    correction: "",
    rootCauseText: "",
    capa: "",
    description: "",
    nonConformityStatement: "",
    standardRequirement: "",
  });

  const load = async () => {
    if (!currentOrg) return;

    // Fetch processes list to translate process ID to Name and Owner
    const { data: procs } = await supabase
      .from("org_processes")
      .select("id,name,process_owner")
      .eq("org_id", currentOrg.id);
    
    const pMap: Record<string, string> = {};
    const oMap: Record<string, string> = {};
    (procs ?? []).forEach((p) => {
      pMap[p.id] = p.name;
      if (p.process_owner) oMap[p.id] = p.process_owner;
    });
    setProcesses(pMap);
    setProcessOwners(oMap);

    const { data, error } = await supabase.from("findings").select("*,audits(title,standard)").eq("org_id", currentOrg.id).order("created_at", { ascending: false });
    if (error) console.error("Findings load error:", error);
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

  const openCarModal = (finding: any) => {
    const meta = parseFindingMeta(finding.root_cause);
    
    // Look up clause requirement from the standard
    const stdKey = finding.audits?.standard;
    const clauseNum = finding.clause;
    const matchedClause = getClauseRequirement(stdKey, clauseNum);
    
    setSelectedFinding(finding);
    setCarForm({
      correction: meta?.correction ?? "",
      rootCauseText: meta?.rootCauseText ?? "",
      capa: finding.capa ?? "",
      description: finding.description ?? "",
      nonConformityStatement: meta?.nonConformityStatement ?? "",
      standardRequirement: meta?.standardRequirement || (matchedClause ? matchedClause.requirement : ""),
    });
  };

  const saveCar = async () => {
    if (!selectedFinding) return;

    const meta = parseFindingMeta(selectedFinding.root_cause) || {};
    const updatedMeta = {
      ...meta,
      correction: carForm.correction.trim(),
      rootCauseText: carForm.rootCauseText.trim(),
      nonConformityStatement: carForm.nonConformityStatement.trim(),
      standardRequirement: carForm.standardRequirement.trim(),
    };

    const rootCausePayload = `AUTO_META:${JSON.stringify(updatedMeta)}`;

    const { error } = await supabase
      .from("findings")
      .update({
        description: carForm.description.trim(),
        capa: carForm.capa.trim(),
        root_cause: rootCausePayload,
      })
      .eq("id", selectedFinding.id);

    if (error) {
      return toast({ title: "Failed to save CAR details", description: error.message, variant: "destructive" });
    }

    toast({ title: "CAR and Root Cause details updated successfully." });
    setSelectedFinding(null);
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((finding, index) => {
              const meta = parseFindingMeta(finding.root_cause);
              const procName = meta?.processId ? (processes[meta.processId] || "N/A") : "N/A";
              const severity = finding.type === "major" ? "Major" : finding.type === "minor" ? "Minor" : "Observation";
              const resolvedOwner = meta?.processId
                ? (processOwners[meta.processId] || finding.owner || finding.audits?.owner || currentOrg?.name || "—")
                : (finding.owner || finding.audits?.owner || currentOrg?.name || "—");
              
              return (
                <tr key={finding.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-muted-foreground whitespace-nowrap" title={finding.id}>
                    {`F-${String(list.length - index).padStart(4, "0")}`}
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
                    {resolvedOwner}
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
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => openCarModal(finding)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Manage CAR
                    </button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No findings recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* CAR / RCA Action Plan Modal */}
      {selectedFinding && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in cursor-pointer"
          onClick={() => setSelectedFinding(null)}
        >
          <div 
            className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-elevated space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto font-sans cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                Manage Corrective Actions (CAR / RCA)
              </h3>
              <button
                onClick={() => setSelectedFinding(null)}
                className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Process Owner</label>
                <input
                  type="text"
                  value={(() => {
                    const meta = parseFindingMeta(selectedFinding?.root_cause);
                    return meta?.processId
                      ? (processOwners[meta.processId] || selectedFinding?.owner || "—")
                      : (selectedFinding?.owner || "—");
                  })()}
                  disabled
                  className="input opacity-65 cursor-not-allowed bg-secondary/30 w-full text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Objective Evidence/Statement of Problem</label>
                <textarea
                  value={carForm.description}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  placeholder="Enter objective evidence or statement of problem..."
                  className="input min-h-[70px] w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Statement of non-conformity</label>
                <textarea
                  value={carForm.nonConformityStatement}
                  onChange={(e) => setCarForm({ ...carForm, nonConformityStatement: e.target.value })}
                  placeholder="Enter statement of non-conformity..."
                  className="input min-h-[70px] w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Requirement/Statement of the Standard not met</label>
                <textarea
                  value={carForm.standardRequirement}
                  onChange={(e) => {
                    const meta = parseFindingMeta(selectedFinding?.root_cause);
                    if (!meta || meta.kind === "custom") {
                      setCarForm({ ...carForm, standardRequirement: e.target.value });
                    }
                  }}
                  disabled={(() => {
                    const meta = parseFindingMeta(selectedFinding?.root_cause);
                    return meta ? meta.kind !== "custom" : false;
                  })()}
                  placeholder="Enter standard requirement..."
                  className={`input min-h-[70px] w-full ${
                    (() => {
                      const meta = parseFindingMeta(selectedFinding?.root_cause);
                      return meta && meta.kind !== "custom" ? "opacity-65 cursor-not-allowed bg-secondary/30" : "";
                    })()
                  }`}
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Correction / Containment Action (Immediate containment)</label>
                <textarea
                  value={carForm.correction}
                  onChange={(e) => setCarForm({ ...carForm, correction: e.target.value })}
                  placeholder="Immediate action to contain, isolate, or neutralize the issue..."
                  className="input min-h-[70px] w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Root Cause Analysis (RCA)</label>
                <textarea
                  value={carForm.rootCauseText}
                  onChange={(e) => setCarForm({ ...carForm, rootCauseText: e.target.value })}
                  placeholder="Detail the procedural, human, or systemic root causes behind the discrepancy..."
                  className="input min-h-[70px] w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Corrective Action Plan (CAR / CAPA)</label>
                <textarea
                  value={carForm.capa}
                  onChange={(e) => setCarForm({ ...carForm, capa: e.target.value })}
                  placeholder="Describe the long-term corrective action planned to prevent recurrence..."
                  className="input min-h-[70px] w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedFinding(null)}
                className="pill-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveCar}
                className="pill-cta"
              >
                Save Action Plan
              </button>
            </div>
          </div>
        </div>
      )}
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
      correction?: string;
      rootCauseText?: string;
      nonConformityStatement?: string;
      standardRequirement?: string;
    };
  } catch {
    return null;
  }
}
