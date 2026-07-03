import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ClipboardCheck, PieChart as PieChartIcon, Printer, Radar, FileText, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { auditsApi } from "@/api/audits";
import { answersApi } from "@/api/answers";
import { findingsApi } from "@/api/findings";
import { processesApi } from "@/api/processes";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { parseAuditNote } from "@/lib/auditEvidence";
import { exportAuditReport } from "@/lib/exportAuditReport";
import {
  AnalyticsAnswer,
  AnalyticsAudit,
  AnalyticsProcess,
  buildClauseHotspots,
  buildFindingsBreakdown,
  buildProcessHotspots,
  buildResponseBreakdown,
  formatStandard,
  FINDING_TYPE_META,
} from "@/lib/auditAnalytics";
import logo from "@/assets/logo.png";

type ReportFinding = {
  id: string;
  audit_id: string;
  type: string;
  clause: string | null;
  description: string;
  capa: string | null;
  owner: string | null;
  status: string;
  created_at: string;
  due_date: string | null;
  root_cause: string | null;
};

type ReportAnswer = AnalyticsAnswer & {
  question_text?: string | null;
  note?: string | null;
  kind?: string | null;
  q_ref?: string | null;
};

function parseFindingMeta(rootCause: string | null) {
  if (!rootCause?.startsWith("AUTO_META:")) return null;
  try {
    return JSON.parse(rootCause.slice("AUTO_META:".length)) as {
      processId: string;
      kind: string;
      qRef: string;
      correction?: string;
      rootCauseText?: string;
      severity?: string;
    };
  } catch {
    return null;
  }
}

const AuditReport = () => {
  const { id } = useParams();
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "responses">("analytics");
  const [audit, setAudit] = useState<any | null>(null);
  const [answers, setAnswers] = useState<ReportAnswer[]>([]);
  const [findings, setFindings] = useState<ReportFinding[]>([]);
  const [processes, setProcesses] = useState<AnalyticsProcess[]>([]);

  const [showDownloadChoice, setShowDownloadChoice] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportCriteria, setReportCriteria] = useState("");
  const [reportObject, setReportObject] = useState("");
  const [reportConclusion, setReportConclusion] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [auditResult, answersResult, findingsResult, processesResult] = await Promise.all([
          auditsApi.get(currentOrg?.id ?? "", id!),
          answersApi.list(id!).catch(() => []),
          findingsApi.list(currentOrg?.id ?? "", id!).catch(() => []),
          currentOrg ? processesApi.list(currentOrg.id).catch(() => []) : [],
        ]).catch((e) => { console.error(e); return [null, [], [], []]; });

        if (cancelled) return;

        setAudit((auditResult ?? null) as any);
        setAnswers((answersResult ?? []) as ReportAnswer[]);
        setFindings((findingsResult ?? []) as ReportFinding[]);
        setProcesses((processesResult ?? []) as AnalyticsProcess[]);
      } catch (e) {
        console.error(e);
      }

      window.setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, 180);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, currentOrg]);

  const [originalData, setOriginalData] = useState({ title: "", criteria: "", object: "", conclusion: "" });

  useEffect(() => {
    if (audit) {
      setReportTitle(audit.title || "");
      setReportCriteria(audit.criteria || "");
      setReportObject(audit.object || "");
      setReportConclusion(audit.conclusion || "");
      setOriginalData({
        title: audit.title || "",
        criteria: audit.criteria || "",
        object: audit.object || "",
        conclusion: audit.conclusion || ""
      });
    }
  }, [audit]);

  const hasChanges = 
    reportTitle.trim() !== originalData.title ||
    reportCriteria.trim() !== originalData.criteria ||
    reportObject.trim() !== originalData.object ||
    reportConclusion.trim() !== originalData.conclusion;

  const handleSaveChanges = async () => {
    if (!id || !currentOrg) return;
    setSaving(true);
    try {
      await auditsApi.update(currentOrg.id, id, {
        title: reportTitle.trim(),
        criteria: reportCriteria.trim(),
        object: reportObject.trim(),
        conclusion: reportConclusion.trim()
      });
      toast({ title: "Report details updated successfully." });
      setOriginalData({
        title: reportTitle.trim(),
        criteria: reportCriteria.trim(),
        object: reportObject.trim(),
        conclusion: reportConclusion.trim()
      });
      setAudit((prev: any) => prev ? { ...prev, title: reportTitle.trim(), criteria: reportCriteria.trim(), object: reportObject.trim(), conclusion: reportConclusion.trim() } : null);
    } catch (err: any) {
      toast({ title: "Failed to save changes", description: err?.message || "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const processMap = useMemo(() => Object.fromEntries(processes.map((process) => [process.id, process.name])), [processes]);

  const total = answers.length;
  const conform = answers.filter((answer) => answer.status === "conform" || answer.status === "conformant").length;
  const major = answers.filter((answer) => answer.status === "major").length;
  const minor = answers.filter((answer) => answer.status === "minor").length;
  const observation = answers.filter((answer) => answer.status === "observation" || answer.status === "ofi").length;
  const na = answers.filter((answer) => answer.status === "na").length;
  const pending = answers.filter((answer) => answer.status === "pending" || !answer.status).length;
  const conformity = total ? Math.round((conform / (total - na - pending || 1)) * 100) : 0;

  const responseMix = useMemo(() => buildResponseBreakdown(answers), [answers]);
  const findingMix = useMemo(() => buildFindingsBreakdown(findings, "type"), [findings]);
  const findingStatusMix = useMemo(() => buildFindingsBreakdown(findings, "status"), [findings]);
  const processHotspots = useMemo(() => buildProcessHotspots(answers, processes), [answers, processes]);
  const clauseHotspots = useMemo(() => buildClauseHotspots(answers), [answers]);

  const handleExportPdf = () => {
    if (!audit) return;
    exportAuditReport({
      meta: {
        organization: currentOrg?.name ?? "Organization",
        auditTitle: reportTitle || audit.title,
        standard: formatStandard(audit.standard),
        scope: audit.scope,
        status: audit.status,
        startedAt: audit.started_at,
        closedAt: audit.closed_at,
        orgType: currentOrg?.type,
        auditorName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Auditor",
        criteria: reportCriteria,
        object: reportObject,
        conclusion: reportConclusion,
      },
      answers: answers.map((answer) => ({
        process: processMap[answer.process_id] ?? "-",
        clause: answer.clause,
        question: answer.question_text,
        status: answer.status,
        note: parseAuditNote(answer.note).text,
        evidence: parseAuditNote(answer.note).evidence,
      })),
      findings: findings.map((finding) => ({
        type: finding.type,
        clause: finding.clause,
        description: finding.description,
        capa: finding.capa,
        owner: finding.owner,
        status: finding.status,
        dueDate: finding.due_date,
        root_cause: finding.root_cause,
      })),
      logoUrl: currentOrg?.logo_url || undefined,
    });
  };



  if (loading || !audit) {
    return (
      <AppShell>
        <div className="flex justify-between animate-pulse">
          <Skeleton className="h-5 w-28 bg-secondary/80 rounded" />
          <Skeleton className="h-10 w-48 bg-secondary/80 rounded-full" />
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-10 shadow-card animate-pulse space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl bg-secondary/80" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-48 bg-secondary/80 rounded" />
                <Skeleton className="h-8 w-72 bg-secondary/80 rounded-xl" />
                <Skeleton className="h-4 w-60 bg-secondary/80 rounded" />
              </div>
            </div>
            <Skeleton className="h-14 w-48 bg-secondary/80 rounded-2xl" />
          </div>

          <section className="grid gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background/80 p-4 space-y-2">
                <Skeleton className="h-3 w-16 bg-secondary/70 rounded" />
                <Skeleton className="h-7 w-12 bg-secondary/85 rounded-lg" />
              </div>
            ))}
          </section>

          <div className="flex border-b border-border pb-px">
            <Skeleton className="h-10 w-36 bg-secondary/80 rounded-t-lg" />
            <Skeleton className="h-10 w-36 bg-secondary/80 rounded-t-lg ml-2" />
            <Skeleton className="h-10 w-36 bg-secondary/80 rounded-t-lg ml-2" />
          </div>

          <div className="space-y-4 pt-4">
            <Skeleton className="h-40 w-full bg-secondary/65 rounded-[28px]" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-72 w-full bg-secondary/65 rounded-[28px]" />
              <Skeleton className="h-72 w-full bg-secondary/65 rounded-[28px]" />
              <Skeleton className="h-72 w-full bg-secondary/65 rounded-[28px]" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }




  return (
    <AppShell>
      <div className="flex justify-between print:hidden">
        <Link to={`/app/audits/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to audit
        </Link>
        {(audit.standard === "hse" || audit.standard === "ims") ? (
          <button onClick={() => setShowDownloadChoice(true)} className="pill-cta">
            <Printer className="h-4 w-4" />
            Download Report
          </button>
        ) : (
          <button onClick={handleExportPdf} className="pill-cta">
            <Printer className="h-4 w-4" />
            Download PDF / Print Report
          </button>
        )}
      </div>

      {/* HSE / IMS Download Choice Modal */}
      {showDownloadChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-elevated animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowDownloadChoice(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary transition"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Select Report Type</h3>
            <p className="text-xs text-muted-foreground mb-6">Choose which report you want to download for this {audit.standard.toUpperCase()} audit.</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowDownloadChoice(false);
                  handleExportPdf();
                }}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary px-4 py-3.5 text-left transition group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{audit.standard.toUpperCase()} Audit Report</div>
                  <div className="text-xs text-muted-foreground">Full compliance findings & analytics</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowDownloadChoice(false);
                  // Open the inspection checklist modal via RunAudit — navigate back with flag, or print inline
                  window.print();
                }}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary px-4 py-3.5 text-left transition group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Inspection Checklist Report</div>
                  <div className="text-xs text-muted-foreground">Site inspection checklist summary</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-border bg-card p-10 shadow-card print:border-none print:shadow-none relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img src={logo} alt="OAK Logo" className="h-14 w-auto object-contain shrink-0" />
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">OakAudix - Audit Report</span>
                <div className="mt-1.5 space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase block">Report Title</label>
                  <input
                    type="text"
                    className="w-full bg-transparent font-display text-2xl sm:text-3xl font-bold border-b border-dashed border-border/80 focus:border-primary focus:outline-none pb-1 text-foreground"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{currentOrg?.name} - Standard {formatStandard(audit.standard)}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-secondary px-4 py-3 text-right text-xs text-muted-foreground">
              <div>Started: {audit.started_at ? new Date(audit.started_at).toLocaleDateString() : "-"}</div>
              <div>Closed: {audit.closed_at ? new Date(audit.closed_at).toLocaleDateString() : "-"}</div>
              <div>Status: {audit.status.replace("_", " ")}</div>
            </div>
          </div>

          {/* Criteria & Objective Editable Blocks */}
          <div className="grid gap-5 md:grid-cols-2 mt-6 pb-6 border-b border-border">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Audit Criteria</label>
              <textarea
                rows={2}
                className="input w-full font-sans text-xs"
                placeholder="List audit criteria (e.g. ISO Standard Clauses, legal requirements...)"
                value={reportCriteria}
                onChange={(e) => setReportCriteria(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Audit Objective</label>
              <textarea
                rows={2}
                className="input w-full font-sans text-xs"
                placeholder="State audit objective (e.g. Evaluate system conformity, identify opportunities...)"
                value={reportObject}
                onChange={(e) => setReportObject(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5 bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <label className="text-[10px] font-bold text-primary uppercase tracking-wider block">Audit Conclusion</label>
              <textarea
                rows={3}
                className="input w-full font-sans text-xs bg-background"
                placeholder="State the final summary / audit conclusion..."
                value={reportConclusion}
                onChange={(e) => setReportConclusion(e.target.value)}
              />
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveChanges}
                  disabled={saving || !hasChanges}
                  className="pill-cta text-xs px-5 py-1.5 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving Changes..." : "Save Report Header & Conclusion"}
                </button>
              </div>
            </div>
          </div>

        <section className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            ["Conformity", `${conformity}%`],
            ["Total questions", total],
            ["Major NCs", major],
            ["Minor NCs", minor],
            ["Observations", observation],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-background/80 p-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 font-display text-2xl font-bold">{value}</div>
            </div>
          ))}
        </section>

        {/* Tab switch bar */}
        <div className="mt-8 flex border-b border-border print:hidden">
          {[
            { id: "analytics", label: "Visual Analytics", icon: <PieChartIcon className="h-4 w-4" /> },
            { id: "responses", label: "Detailed Responses", icon: <Radar className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Analytics Tab Content */}
        {activeTab === "analytics" && (
          <div className="mt-8 space-y-10 animate-fade-in">
            <section className="grid gap-5 xl:grid-cols-3">
              <AnalyticsBlock
                id="response-profile-chart"
                title="Response Profile"
                subtitle="See how the audit answers split between conforming items and gaps."
                icon={<PieChartIcon className="h-4 w-4" />}
              >
                {responseMix.length > 0 ? (
                  <ChartContainer
                    className="h-[280px] w-full"
                    config={Object.fromEntries(responseMix.map((item) => [item.status, { label: item.label, color: item.fill }]))}
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={responseMix}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={62}
                        outerRadius={100}
                        paddingAngle={3}
                        isAnimationActive
                        animationDuration={820}
                      >
                        {responseMix.map((item) => (
                          <Cell key={item.status} fill={item.fill} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <EmptyBlock message="No answered questions yet." />
                )}
              </AnalyticsBlock>

              <AnalyticsBlock
                id="finding-categories-chart"
                title="Finding Categories"
                subtitle="Visual breakdown of the issues raised in this audit."
                icon={<AlertTriangle className="h-4 w-4" />}
              >
                {findingMix.length > 0 ? (
                  <ChartContainer
                    className="h-[280px] w-full"
                    config={Object.fromEntries(findingMix.map((item) => [item.key, { label: item.label, color: item.fill }]))}
                  >
                    <BarChart data={findingMix}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={64} />
                      <YAxis tickLine={false} axisLine={false} width={28} />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} isAnimationActive animationDuration={760}>
                        {findingMix.map((item) => (
                          <Cell key={item.key} fill={item.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <EmptyBlock message="No findings recorded yet." />
                )}
              </AnalyticsBlock>

              <AnalyticsBlock
                id="risk-hotspots-chart"
                title="Risk Hotspots"
                subtitle="The process areas and clauses drawing the most exceptions."
                icon={<Radar className="h-4 w-4" />}
              >
                {processHotspots.length > 0 || clauseHotspots.length > 0 ? (
                  <div className="space-y-4">
                    {processHotspots.length > 0 && (
                      <ChartContainer
                        className="h-[160px] w-full"
                        config={{ value: { label: "Issues", color: "hsl(var(--accent))" } }}
                      >
                        <BarChart data={processHotspots.slice(0, 4)} layout="vertical" margin={{ left: 8 }}>
                          <CartesianGrid horizontal={false} />
                          <XAxis type="number" tickLine={false} axisLine={false} />
                          <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={100} />
                          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                          <Bar dataKey="value" fill="var(--color-value)" radius={[0, 10, 10, 0]} isAnimationActive animationDuration={780} />
                        </BarChart>
                      </ChartContainer>
                    )}

                    {clauseHotspots.length > 0 && (
                      <div className="grid gap-2">
                        {clauseHotspots.slice(0, 4).map((item) => (
                          <div key={item.label} className="rounded-2xl border border-border bg-background/70 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium">Clause {item.label}</div>
                              <div className="font-mono text-sm text-muted-foreground">{item.value} issue(s)</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyBlock message="No hotspots yet because there are no nonconforming answers." />
                )}
              </AnalyticsBlock>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
              <div className="rounded-[28px] border border-border bg-background/80 p-5 overflow-x-auto">
                <h2 className="font-display text-xl font-bold">Findings register</h2>
                {findings.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No findings recorded.</p>
                ) : (
                  <table className="mt-3 w-full text-sm">
                    <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr><th className="py-2">Type</th><th>Clause</th><th>Description</th><th>CAPA</th><th>Owner</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {findings.map((finding) => (
                        <tr key={finding.id} className="border-b border-border align-top">
                          <td className="py-2 capitalize">{finding.type}</td>
                          <td>{finding.clause ?? "-"}</td>
                          <td className="max-w-md">{finding.description}</td>
                          <td className="max-w-md">{finding.capa || "-"}</td>
                          <td>{finding.owner || "-"}</td>
                          <td>{finding.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div id="resolution-pulse-chart" className="relative rounded-[28px] border border-border bg-background/80 p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Resolution pulse</h2>
                  <button
                    onClick={async () => {
                      try {
                        const el = document.getElementById("resolution-pulse-chart");
                        if (!el) return;
                        const html2canvas = (await import("html2canvas")).default;
                        const canvas = await html2canvas(el, { useCORS: true, scale: 2.5, backgroundColor: "#ffffff" });
                        const dataUrl = canvas.toDataURL("image/png");
                        const a = document.createElement("a");
                        a.href = dataUrl;
                        a.download = "resolution_pulse_chart.png";
                        a.click();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    title="Download chart as PNG"
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
                
                {findingStatusMix.length > 0 ? (
                  <ChartContainer
                    className="mt-4 h-[260px] w-full"
                    config={Object.fromEntries(findingStatusMix.map((item) => [item.key, { label: item.label, color: item.fill }]))}
                  >
                    <BarChart data={findingStatusMix}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={28} />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="hsl(var(--info))" isAnimationActive animationDuration={720} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <EmptyBlock message="No finding status analytics yet." className="mt-4" />
                )}
              </div>
            </section>
          </div>
        )}



        {/* Detailed Responses Tab */}
        {activeTab === "responses" && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <h2 className="font-display text-xl font-bold">Detailed responses</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
              <thead className="border-b border-border text-left uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Process</th>
                  <th>Clause</th>
                  <th>Question</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((answer, index) => {
                  const parsed = parseAuditNote(answer.note);
                  return (
                    <tr key={`${answer.audit_id}-${answer.process_id}-${answer.clause}-${index}`} className="border-b border-border align-top">
                      <td className="py-2">{processMap[answer.process_id] ?? "-"}</td>
                      <td>{answer.clause || "-"}</td>
                      <td className="max-w-sm">{answer.question_text || "-"}</td>
                      <td className="capitalize">{answer.status}</td>
                      <td className="max-w-sm">{parsed.text || "-"}</td>
                      <td className="max-w-sm">
                        {parsed.evidence.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {parsed.evidence.map((item) => (
                              <a
                                key={item.url}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                              >
                                {item.name}
                              </a>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>
        )}

        </div>
      </div>

      <style>{`@media print { @page { size: A4; margin: 12mm; } body { background: white; } header, aside, .print\\:hidden { display: none !important; } main { padding: 0 !important; } }`}</style>
    </AppShell>
  );
};

const AnalyticsBlock = ({
  id,
  title,
  subtitle,
  icon,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) => {
  const handleDownload = async () => {
    try {
      const el = document.getElementById(id);
      if (!el) return;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: 2.5,
        backgroundColor: "#ffffff",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_chart.png`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id={id} className="relative analytics-panel rounded-[28px] border border-border bg-background/80 p-5 shadow-card group">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        <button
          onClick={handleDownload}
          title="Download chart as PNG"
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground pr-8">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
};

const EmptyBlock = ({ message, className = "" }: { message: string; className?: string }) => (
  <div className={`grid h-[220px] place-items-center rounded-[24px] border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground ${className}`}>
    {message}
  </div>
);

export default AuditReport;
