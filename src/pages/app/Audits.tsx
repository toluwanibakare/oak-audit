import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { isProcessInStandard } from "@/data/standards";
import { ArrowRight, ClipboardCheck, Play, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState<Audit[]>([]);
  const [currentUserAuditor, setCurrentUserAuditor] = useState<any | null>(null);

  // States for process assignment and launching audits
  const [selectedAuditForAssign, setSelectedAuditForAssign] = useState<Audit | null>(null);
  const [auditors, setAuditors] = useState<{ id: string; name: string }[]>([]);
  const [modalProcs, setModalProcs] = useState<{ id: string; key: string; name: string }[]>([]);
  const [processAuditorMap, setProcessAuditorMap] = useState<Record<string, string>>({});
  const [selectedLeadAuditorId, setSelectedLeadAuditorId] = useState("");
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (!currentOrg || !selectedAuditForAssign) return;
    
    // Fetch auditors
    supabase
      .from("auditors")
      .select("id, name")
      .eq("org_id", currentOrg.id)
      .then(({ data }) => setAuditors(data ?? []));
      
    // Fetch org processes
    supabase
      .from("org_processes")
      .select("id, key, name")
      .eq("org_id", currentOrg.id)
      .then(({ data }) => {
        const finalProcs = data ?? [];
        // Filter to standard matching processes
        const visible = finalProcs.filter((p) => isProcessInStandard(selectedAuditForAssign.standard as any, p.key));
        setModalProcs(visible);
      });
  }, [selectedAuditForAssign, currentOrg]);

  const loadAudits = () => {
    if (!currentOrg) return;
    supabase
      .from("audits")
      .select("*")
      .eq("org_id", currentOrg.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setList((data ?? []) as Audit[]));
  };

  const handleLaunchAudit = async () => {
    if (!selectedAuditForAssign || !currentOrg || !user) return;
    
    let leadAuditorId = selectedLeadAuditorId;
    
    // Fallback for lead auditor if not selected or if individual
    if (!leadAuditorId) {
      const { data: existing } = await supabase
        .from("auditors")
        .select("id")
        .eq("org_id", currentOrg.id)
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        leadAuditorId = existing.id;
      } else {
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Auditor";
        const { data: created } = await supabase
          .from("auditors")
          .insert({
            org_id: currentOrg.id,
            name: fullName,
            email: user.email || "",
            role: "Lead Auditor",
            user_id: user.id
          })
          .select("id")
          .single();
        if (created?.id) {
          leadAuditorId = created.id;
        }
      }
    }

    if (!leadAuditorId) {
      toast({
        title: "Auditor required",
        description: "Please register or select a lead auditor to assign this audit.",
        variant: "destructive",
      });
      return;
    }

    setLaunching(true);

    try {
      // 1. Create audit process rows in database
      const rows = modalProcs.map((p) => ({
        audit_id: selectedAuditForAssign.id,
        process_id: p.id,
        auditor_id: processAuditorMap[p.id] || leadAuditorId,
      }));

      if (rows.length > 0) {
        const { error: seedError } = await supabase.from("audit_processes").insert(rows);
        if (seedError) throw seedError;
      }

      // 2. Update audit status to in_progress
      const { error: updateError } = await supabase
        .from("audits")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
          lead_auditor_id: leadAuditorId
        })
        .eq("id", selectedAuditForAssign.id);

      if (updateError) throw updateError;

      toast({ title: "Audit launched successfully!", description: "Seeded processes and redirected to audit workspace." });
      setSelectedAuditForAssign(null);
      navigate(`/app/audits/${selectedAuditForAssign.id}`);
    } catch (err: any) {
      toast({ title: "Failed to launch audit", description: err.message, variant: "destructive" });
    } finally {
      setLaunching(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, [currentOrg]);

  useEffect(() => {
    if (!user || !currentOrg) return;
    supabase
      .from("auditors")
      .select("id, role")
      .eq("org_id", currentOrg.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setCurrentUserAuditor(data));
  }, [user, currentOrg]);

  const isAuditor = currentUserAuditor?.role === "auditor";

  const statusSummary = useMemo(() => ({
    active: list.filter((audit) => audit.status === "in_progress").length,
    closed: list.filter((audit) => audit.status === "closed").length,
    draft: list.filter((audit) => audit.status !== "in_progress" && audit.status !== "closed").length,
  }), [list]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header title="Audits" subtitle="All audit runs across your standards." />
        {!isAuditor && <Link to="/app/licenses" className="pill-cta">+ New audit</Link>}
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
          {list.map((audit) => {
            const isDraft = audit.status === "draft";
            if (isDraft) {
              return (
                <div
                  key={audit.id}
                  className="app-surface-soft block p-5 border border-border/80 bg-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{STD_LABEL[audit.standard] ?? audit.standard}</span>
                      <h3 className="mt-2 font-display text-xl font-semibold">{audit.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{audit.scope || "No scope captured yet"} · {new Date(audit.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full px-3 py-1 text-xs bg-amber-500/10 text-amber-500 font-semibold uppercase tracking-wider text-[10px]">
                        draft
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedAuditForAssign(audit);
                        }}
                        className="pill-cta text-xs py-1.5 px-4 flex items-center gap-1.5"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        Start Audit
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={audit.id} to={`/app/audits/${audit.id}`} className="app-surface-soft block p-5 transition hover:-translate-y-0.5 hover:shadow-elevated">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{STD_LABEL[audit.standard] ?? audit.standard}</span>
                    <h3 className="mt-2 font-display text-xl font-semibold">{audit.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{audit.scope || "No scope captured yet"} · {new Date(audit.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider text-[10px] font-semibold ${audit.status === "closed" ? "bg-success/10 text-success" : "bg-info/10 text-info"}`}>
                      {audit.status.replace("_", " ")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}

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

      {/* Assignment Modal */}
      {selectedAuditForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-[32px] border border-border bg-card p-8 shadow-elevated animate-scale-up space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-xl font-bold">Assign Process Auditors</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Audit: <strong className="text-foreground">{selectedAuditForAssign.title}</strong> ({STD_LABEL[selectedAuditForAssign.standard] ?? selectedAuditForAssign.standard.toUpperCase()})
                </p>
              </div>
              <button
                onClick={() => setSelectedAuditForAssign(null)}
                className="rounded-full border border-border p-1.5 hover:bg-secondary transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3 font-sans shadow-sm">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Assign Lead Auditor
                  </label>
                  <select
                    className="input w-full font-sans text-xs"
                    value={selectedLeadAuditorId}
                    onChange={(e) => setSelectedLeadAuditorId(e.target.value)}
                  >
                    <option value="">— Select Lead Auditor —</option>
                    {auditors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentOrg?.type !== "individual" && (
                <div className="max-h-60 overflow-y-auto border border-border rounded-2xl p-4 bg-secondary/10 space-y-4 font-sans">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Process Name</span>
                    <span>Assign Auditor</span>
                  </div>
                  {modalProcs.map((p) => (
                    <div key={p.id} className="flex justify-between items-center gap-4 text-xs font-semibold py-1">
                      <span>{p.name}</span>
                      <select
                        className="input w-48 font-sans text-xs py-1 h-8"
                        value={processAuditorMap[p.id] || ""}
                        onChange={(e) => {
                          setProcessAuditorMap({
                            ...processAuditorMap,
                            [p.id]: e.target.value,
                          });
                        }}
                      >
                        <option value="">— Select Auditor —</option>
                        {auditors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {modalProcs.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-4">No active processes configured. Please set up processes first.</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setSelectedAuditForAssign(null)}
                  className="pill-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunchAudit}
                  disabled={launching || (currentOrg?.type !== "individual" && modalProcs.some((p) => !processAuditorMap[p.id]))}
                  className="pill-cta flex-1 justify-center disabled:opacity-50"
                >
                  {launching ? "Launching..." : "Launch Audit →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
