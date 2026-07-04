import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Download, ArrowLeft, FileText, Image, ExternalLink } from "lucide-react";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";
import { useToast } from "@/hooks/use-toast";
import { getClauseRequirement } from "@/data/isoClauses";
import { auditorsApi } from "@/api/auditors";
import { findingsApi } from "@/api/findings";
import { auditsApi } from "@/api/audits";
import { processesApi } from "@/api/processes";
import { notificationsApi } from "@/api/notifications";

export default function Findings() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentUserAuditor, setCurrentUserAuditor] = useState<any | undefined>(undefined);
  const [list, setList] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [processes, setProcesses] = useState<Record<string, string>>({}); // id -> name
  const [processOwners, setProcessOwners] = useState<Record<string, string>>({}); // id -> process_owner
  const [form, setForm] = useState({ audit_id: "", type: "minor", clause: "", description: "", capa: "", owner: "", due_date: "" });
  const [tableLoading, setTableLoading] = useState(true);

  // CAR Sub-page States
  const [viewingFinding, setViewingFinding] = useState<any | null>(null);
  const [carForm, setCarForm] = useState({
    correction: "",
    rootCauseText: "",
    capa: "",
    description: "",
    nonConformityStatement: "",
    standardRequirement: "",
  });
  const [auditorComment, setAuditorComment] = useState("");
  const [evidence, setEvidence] = useState<{ url: string; name: string }[]>([]);

  const load = async () => {
    if (!currentOrg) return;
    setTableLoading(true);

    try {
      // Fetch processes list
      const procs = await processesApi.list(currentOrg.id);
      const pMap: Record<string, string> = {};
      const oMap: Record<string, string> = {};
      procs.forEach((p: any) => {
        pMap[p.id] = p.name;
        if (p.process_owner) oMap[p.id] = p.process_owner;
      });
      setProcesses(pMap);
      setProcessOwners(oMap);

      const data = await findingsApi.list(currentOrg.id);
      setList(data ?? []);

      const auditList = await auditsApi.list(currentOrg.id);
      setAudits(auditList ?? []);
    } catch (err) {
      console.error("Findings load error:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentOrg]);

  useEffect(() => {
    if (!user || !currentOrg) return;
    (async () => {
      try {
        const data = await auditorsApi.list(currentOrg.id);
        const match = data.find((a: any) => a.user_id === user.id) ?? null;
        setCurrentUserAuditor(match);
      } catch { setCurrentUserAuditor(null); }
    })();
  }, [user, currentOrg]);

  const isAuditor = currentUserAuditor?.role === "auditor";

  const add = async () => {
    if (!currentOrg || !form.audit_id || !form.description.trim()) return;
    try {
      await findingsApi.create(currentOrg.id, { org_id: currentOrg.id, ...form, due_date: form.due_date || null });
      setForm({ audit_id: form.audit_id, type: "minor", clause: "", description: "", capa: "", owner: "", due_date: "" });
      load();
    } catch (err: any) {
      toast({ title: err?.message || "Failed to create finding", variant: "destructive" });
    }
  };

  const setStatus = async (id: string, status: string) => {
    try { await findingsApi.update(id, { status }); } catch { /* ignore */ }
    load();
  };

  const openCarView = (finding: any) => {
    const meta = parseFindingMeta(finding.root_cause);
    const matchedClause = getClauseRequirement(finding.audit?.standard, finding.clause);
    setEvidence((meta?.evidence || []).map((e: any) => {
      if (typeof e === 'string') {
        try { return JSON.parse(e); } catch { return { url: e, name: e.split('/').pop() || 'File' }; }
      }
      return e;
    }));
    setAuditorComment(finding.auditor_comment || "");
    setCarForm({
      correction: meta?.correction ?? "",
      rootCauseText: meta?.rootCauseText ?? "",
      capa: finding.capa ?? "",
      description: finding.description ?? "",
      nonConformityStatement: meta?.nonConformityStatement ?? "",
      standardRequirement: meta?.standardRequirement || (matchedClause ? matchedClause.requirement : ""),
    });
    setViewingFinding(finding);
  };

  const saveCar = async () => {
    if (!viewingFinding) return;

    const meta = parseFindingMeta(viewingFinding.root_cause) || {};
    const updatedMeta = {
      ...meta,
      correction: carForm.correction.trim(),
      rootCauseText: carForm.rootCauseText.trim(),
      nonConformityStatement: carForm.nonConformityStatement.trim(),
      standardRequirement: carForm.standardRequirement.trim(),
    };

    const rootCausePayload = `AUTO_META:${JSON.stringify(updatedMeta)}`;

    try {
      await findingsApi.update(viewingFinding.id, {
        description: carForm.description.trim(),
        capa: carForm.capa.trim(),
        root_cause: rootCausePayload,
        auditor_comment: auditorComment.trim() || null,
      });
      toast({ title: "CAR and Root Cause details updated successfully." });
    } catch (err: any) {
      return toast({ title: "Failed to save CAR details", description: err?.message || "Error", variant: "destructive" });
    }
    setViewingFinding(null);
    load();
  };

  const approveAndCloseCar = async () => {
    if (!viewingFinding) return;
    if (viewingFinding.status === "open") {
      return toast({ title: "Cannot approve", description: "Awaiting auditee resubmission.", variant: "destructive" });
    }
    try {
      await findingsApi.update(viewingFinding.id, { status: "closed" });

      // Send approval email to the auditee
      const auditeeEmail = viewingFinding.audit?.auditee_email;
      const auditeeName = viewingFinding.audit?.auditee_name || "Auditee";
      if (auditeeEmail) {
        const portalUrl = `${window.location.origin}/auditee/car/${viewingFinding.id}`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background: #16a34a; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </div>
            <h2 style="color: #16a34a; text-align: center; margin-top: 0;">Corrective Action Plan Approved</h2>
            <p>Hello ${auditeeName},</p>
            <p>Your submitted Corrective Action Plan (CAR) for the audit <strong>"${viewingFinding.audit?.title}"</strong> has been reviewed and <strong style="color: #16a34a;">approved</strong> by the auditor.</p>
            <p>This finding is now closed. You can view the final status using the link below.</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${portalUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Status</a>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This is an automated notification from ISO Audit Management Port. Please do not reply directly to this email.</p>
          </div>
        `;

        try {
          await notificationsApi.sendEmail(
            auditeeEmail.trim(),
            `Approved: CAR Closed - ${viewingFinding.audit?.title}`,
            emailHtml
          );
        } catch (emailErr) {
          console.error("Failed to send approval email to auditee:", emailErr);
        }
      }

      toast({ title: "Finding approved and closed successfully." });
    } catch (err: any) {
      return toast({ title: "Failed to close finding", description: err?.message || "Error", variant: "destructive" });
    }
    setViewingFinding(null);
    load();
  };

  const rejectAndResendCar = async () => {
    if (!viewingFinding) return;
    if (viewingFinding.status === "open") {
      return toast({ title: "Cannot reject", description: "Awaiting auditee resubmission.", variant: "destructive" });
    }
    if (!auditorComment.trim()) {
      return toast({
        title: "Feedback comment required",
        description: "Please specify why you are returning this CAR so the auditee knows what to fix.",
        variant: "destructive"
      });
    }

    try {
      await findingsApi.update(viewingFinding.id, {
        status: "open",
        auditor_comment: auditorComment.trim()
      });

      // Send email to the auditee notifying them that the CAR was returned
      const auditeeEmail = viewingFinding.audit?.auditee_email;
      const auditeeName = viewingFinding.audit?.auditee_name || "Auditee";
      if (auditeeEmail) {
        const portalUrl = `${window.location.origin}/auditee/car/${viewingFinding.id}`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #ea580c; margin-top: 0;">Corrective Action Plan Returned for Updates</h2>
            <p>Hello ${auditeeName},</p>
            <p>The auditor has reviewed your submitted Corrective Action Plan (CAR) for the audit <strong>"${viewingFinding.audit?.title}"</strong> and has requested updates.</p>
            
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #fee2e2;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">Auditor Feedback / Rejection Reason:</p>
              <p style="margin: 8px 0 0 0; color: #7f1d1d; font-family: monospace; white-space: pre-wrap;">${auditorComment.trim()}</p>
            </div>

            <p>Please click the button below to update your Correction, Root Cause Analysis, and Action Plan:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${portalUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Update CAR Action Plan</a>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This is an automated notification from ISO Audit Management Port. Please do not reply directly to this email.</p>
          </div>
        `;

        try {
          await notificationsApi.sendEmail(
            auditeeEmail.trim(),
            `Action Required: CAR Returned - ${viewingFinding.audit?.title}`,
            emailHtml
          );
        } catch (emailErr) {
          console.error("Failed to send rejection email to auditee:", emailErr);
        }
      }
    } catch (err: any) {
      return toast({ title: "Failed to return CAR", description: err?.message || "Error", variant: "destructive" });
    }

    toast({ title: "CAR returned to auditee and notification email sent." });
    setViewingFinding(null);
    load();
  };

  const summary = useMemo(() => ({
    open: list.filter((finding) => finding.status === "open").length,
    progress: list.filter((finding) => finding.status === "in_progress" || finding.status === "under_review").length,
    closed: list.filter((finding) => finding.status === "closed").length,
  }), [list]);

  if (currentUserAuditor === undefined) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {viewingFinding ? (
        <>
          {/* CAR Evaluation Sub-page */}
          <button
            onClick={() => setViewingFinding(null)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to CAR Management
          </button>

          <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-card space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                Manage Corrective Actions (CAR / RCA)
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">Process Owner</label>
                <input
                  type="text"
                  value={(() => {
                    const meta = parseFindingMeta(viewingFinding?.root_cause);
                    return meta?.processId
                      ? (processOwners[meta.processId] || viewingFinding?.owner || "—")
                      : (viewingFinding?.owner || "—");
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
                    const meta = parseFindingMeta(viewingFinding?.root_cause);
                    if (!meta || meta.kind === "custom") {
                      setCarForm({ ...carForm, standardRequirement: e.target.value });
                    }
                  }}
                  disabled={(() => {
                    const meta = parseFindingMeta(viewingFinding?.root_cause);
                    return meta ? meta.kind !== "custom" : false;
                  })()}
                  placeholder="Enter standard requirement..."
                  className={`input min-h-[70px] w-full ${
                    (() => {
                      const meta = parseFindingMeta(viewingFinding?.root_cause);
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

              {evidence.length > 0 && (
                <div>
                  <label className="mb-1.5 block font-bold uppercase tracking-wider text-muted-foreground">Evidence Attached by Auditee</label>
                  <div className="space-y-1.5">
                    {evidence.map((ev, i) => (
                      <a
                        key={i}
                        href={ev.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2.5 bg-secondary/20 border border-border/40 rounded-xl text-xs text-primary hover:bg-primary/5 transition-colors"
                      >
                        {(ev.url || "").match(/\.(png|jpg|jpeg|gif|webp|svg)/i) ? (
                          <Image className="h-4 w-4 shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate">{ev.name || "File"}</span>
                        <ExternalLink className="h-3 w-3 ml-auto shrink-0 text-muted-foreground/50" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border/80 pt-3 mt-2">
                <label className="mb-1 block font-bold uppercase tracking-wider text-destructive">Auditor Feedback / Return Comments</label>
                <textarea
                  value={auditorComment}
                  onChange={(e) => setAuditorComment(e.target.value)}
                  placeholder="Explain why you are returning this CAR for updates, or note review findings..."
                  className="input min-h-[70px] w-full border-destructive/30 focus:ring-destructive/20"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setViewingFinding(null)}
                className="pill-secondary justify-center"
              >
                Close
              </button>
              <div className="flex flex-col sm:flex-row gap-2">
                {viewingFinding.status === "open" ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Awaiting Auditee Resubmission...
                  </div>
                ) : (
                  <>
                    <button
                      onClick={saveCar}
                      className="rounded-full bg-secondary hover:bg-secondary/80 text-foreground px-5 py-2.5 text-xs font-semibold transition"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={rejectAndResendCar}
                      className="rounded-full bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-xs font-semibold transition"
                      title="Resend to the auditee for corrections"
                    >
                      Reject & Return
                    </button>
                    <button
                      onClick={approveAndCloseCar}
                      className="rounded-full bg-success hover:bg-success/90 text-success-foreground px-5 py-2.5 text-xs font-semibold transition"
                      title="Approve corrective action plan and close the finding"
                    >
                      Approve & Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Header 
            title="CAR Management" 
            subtitle="Non-conformities, observations, and corrective action reports." 
            action={!isAuditor ? (
              <a
                href="/CAPA_Management_Tool.xlsx"
                download="CAPA_Management_Tool.xlsx"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold shadow-card transition hover:bg-primary/90 hover:scale-[1.02] active:scale-95 duration-200"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download CAPA Tracker</span><span className="sm:hidden">CAPA</span>
              </a>
            ) : undefined}
          />

          <section className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
            <StatusCard label="Open" value={summary.open} hint="Awaiting action" icon={<AlertTriangle className="h-4 w-4" />} />
            <StatusCard label="In progress" value={summary.progress} hint="Currently being worked" icon={<Clock3 className="h-4 w-4" />} />
            <StatusCard label="Closed" value={summary.closed} hint="Resolved items" icon={<CheckCircle2 className="h-4 w-4" />} />
          </section>

          <section className="mt-6 rounded-[28px] border border-border bg-card p-4 sm:p-5 shadow-card">
            <h2 className="font-display text-xl font-semibold">Add a finding</h2>
            <p className="mt-1 text-sm text-muted-foreground">Capture a new issue quickly and keep the CAR register current.</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <select className="input min-w-[140px] flex-1" value={form.audit_id} onChange={(e) => setForm({ ...form, audit_id: e.target.value })}>
                <option value="">Select audit...</option>
                {audits.map((audit) => <option key={audit.id} value={audit.id}>{audit.title}</option>)}
              </select>
              <select className="input min-w-[100px] flex-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="observation">Observation</option>
                <option value="opportunity">Opportunity</option>
              </select>
              <input className="input min-w-[80px] flex-1" placeholder="Clause" value={form.clause} onChange={(e) => setForm({ ...form, clause: e.target.value })} />
              <input className="input min-w-[140px] flex-[2]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button onClick={add} className="rounded-full bg-primary px-3 sm:px-4 py-2 text-xs font-semibold text-primary-foreground shadow-elevated whitespace-nowrap hover:opacity-90 transition shrink-0">Add finding</button>
            </div>
          </section>

          <section className="mt-6 overflow-x-auto rounded-[28px] border border-border bg-card shadow-card">
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
                {tableLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-secondary/40 rounded animate-pulse" style={{ width: j === 2 ? "70%" : j === 5 ? "50%" : "80%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No findings recorded yet.
                    </td>
                  </tr>
                ) : (
                  list.map((finding, index) => {
                    const meta = parseFindingMeta(finding.root_cause);
                    const procName = meta?.processId ? (processes[meta.processId] || "N/A") : "N/A";
                    const severity = finding.type === "major" ? "Major" : finding.type === "minor" ? "Minor" : "Observation";
                    const resolvedOwner = meta?.processId
                      ? (processOwners[meta.processId] || finding.owner || finding.audits?.owner || currentOrg?.name || "—")
                      : (finding.owner || finding.audits?.owner || currentOrg?.name || "—");
                    
                    return (
                      <tr key={finding.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold text-muted-foreground" title={finding.id}>
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
                        <td className="px-4 py-3 text-muted-foreground font-medium">
                          {finding.due_date ? new Date(finding.due_date).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select 
                              value={finding.status} 
                              onChange={(e) => setStatus(finding.id, e.target.value)} 
                              className={`input py-1 px-2 h-8 text-[11px] font-semibold w-28 ${
                                finding.status === "under_review" ? "border-amber-500 bg-amber-500/10 text-amber-600 font-bold" : ""
                              }`}
                            >
                              <option value="open">Open</option>
                              <option value="under_review">Under Review</option>
                              <option value="closed">Closed</option>
                            </select>
                            {finding.status === "under_review" && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => openCarView(finding)}
                            className="text-xs text-primary font-bold hover:underline"
                          >
                            Evaluate CAR
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </AppShell>
  );
}

const StatusCard = ({ label, value, hint, icon }: { label: string; value: number; hint: string; icon: React.ReactNode }) => (
  <div className="app-surface-soft p-3 sm:p-5">
    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {icon}
      {label}
    </div>
    <div className="mt-1 sm:mt-2 font-display text-2xl sm:text-3xl font-bold">{value}</div>
    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">{hint}</p>
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
      evidence?: { url: string; name: string }[];
    };
  } catch {
    return null;
  }
}
