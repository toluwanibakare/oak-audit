import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Download, PieChart as PieChartIcon, Printer, Radar, Table, FileText, Mail } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { parseAuditNote } from "@/lib/auditEvidence";
import { exportAuditReport } from "@/lib/exportAuditReport";
import { exportCarReport, generateCarReportHtml } from "@/lib/exportCarReport";
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "capa" | "responses">("analytics");
  const [audit, setAudit] = useState<AnalyticsAudit | null>(null);
  const [answers, setAnswers] = useState<ReportAnswer[]>([]);
  const [findings, setFindings] = useState<ReportFinding[]>([]);
  const [processes, setProcesses] = useState<AnalyticsProcess[]>([]);
  const [auditeeEmail, setAuditeeEmail] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const [auditResult, answersResult, findingsResult, processesResult] = await Promise.all([
        supabase.from("audits").select("id, title, standard, status, scope, created_at, started_at, closed_at").eq("id", id).single(),
        supabase.from("audit_answers").select("audit_id, status, process_id, clause, question_text, note, kind, q_ref").eq("audit_id", id),
        supabase.from("findings").select("id, audit_id, type, clause, description, capa, owner, status, created_at, due_date, root_cause").eq("audit_id", id).order("created_at"),
        supabase.from("org_processes").select("id, name").eq("org_id", currentOrg?.id ?? "").limit(100),
      ]);

      if (cancelled) return;

      setAudit((auditResult.data ?? null) as AnalyticsAudit | null);
      setAnswers((answersResult.data ?? []) as ReportAnswer[]);
      setFindings((findingsResult.data ?? []) as ReportFinding[]);
      setProcesses((processesResult.data ?? []) as AnalyticsProcess[]);

      window.setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, 180);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, currentOrg]);

  const processMap = useMemo(() => Object.fromEntries(processes.map((process) => [process.id, process.name])), [processes]);

  const total = answers.length;
  const conform = answers.filter((answer) => answer.status === "conform").length;
  const major = answers.filter((answer) => answer.status === "major").length;
  const minor = answers.filter((answer) => answer.status === "minor").length;
  const observation = answers.filter((answer) => answer.status === "observation").length;
  const conformity = total ? Math.round((conform / total) * 100) : 0;

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
        auditTitle: audit.title,
        standard: formatStandard(audit.standard),
        scope: audit.scope,
        status: audit.status,
        startedAt: audit.started_at,
        closedAt: audit.closed_at,
        orgType: currentOrg?.type,
        auditorName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Auditor",
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
      })),
      logoUrl: currentOrg?.logo_url || undefined,
    });
  };

  const handleExportCar = () => {
    if (!audit) return;
    const auditorName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Auditor";
    exportCarReport({
      meta: {
        organization: currentOrg?.name ?? "Organization",
        auditTitle: audit.title,
        standard: formatStandard(audit.standard),
        scope: audit.scope,
        status: audit.status,
        startedAt: audit.started_at,
        closedAt: audit.closed_at,
        orgType: currentOrg?.type,
        auditorName,
      },
      findings: findings.map((finding) => ({
        id: finding.id,
        clause: finding.clause,
        type: finding.type,
        description: finding.description,
        capa: finding.capa,
        owner: finding.owner,
        due_date: finding.due_date,
        status: finding.status,
        root_cause: finding.root_cause,
        created_at: finding.created_at,
      })),
      processMap,
    });
  };

  const handleShareCar = async () => {
    if (!auditeeEmail.trim()) {
      alert("Please enter a valid auditee email address.");
      return;
    }
    setSharing(true);
    try {
      const auditorName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Auditor";
      const meta = {
        organization: currentOrg?.name ?? "Organization",
        auditTitle: audit?.title || "ISO Audit",
        standard: formatStandard(audit?.standard || ""),
        scope: audit?.scope,
        status: audit?.status || "in_progress",
        startedAt: audit?.started_at,
        closedAt: audit?.closed_at,
        orgType: currentOrg?.type,
        auditorName,
      };

      const findingsForCar = findings.map(f => ({
        id: f.id,
        clause: f.clause,
        type: f.type,
        description: f.description,
        capa: f.capa,
        owner: f.owner,
        due_date: f.due_date,
        status: f.status,
        root_cause: f.root_cause,
        created_at: f.created_at,
      }));

      const htmlContent = generateCarReportHtml({
        meta,
        findings: findingsForCar,
        processMap,
      });

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: auditeeEmail.trim(),
          subject: `Corrective Action Report (CAR) - ${audit?.title}`,
          html: htmlContent,
        }
      });

      if (error) throw error;
      alert(`CAR successfully shared to ${auditeeEmail}`);
    } catch (err: any) {
      console.error("Failed to share email via edge function:", err);
      const mailtoLink = `mailto:${auditeeEmail.trim()}?subject=${encodeURIComponent(`Corrective Action Report (CAR) - ${audit?.title}`)}&body=${encodeURIComponent("Please find the Corrective Action Report (CAR) details in the attachment or print-out.")}`;
      window.location.href = mailtoLink;
      alert("Opening mail client client-side fallback...");
    } finally {
      setSharing(false);
    }
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


  const downloadCapaCsv = () => {
    const headers = [
      "Finding #",
      "Process",
      "Clause",
      "Type",
      "Severity",
      "Finding Statement",
      "Evidence",
      "Correction (Containment)",
      "Root Cause (RCA)",
      "Corrective Action (CAPA)",
      "Owner",
      "Due Date",
      "Status"
    ];

    const rows = findings.map((finding, idx) => {
      const meta = parseFindingMeta(finding.root_cause);
      const procName = meta?.processId ? (processMap[meta.processId] || "-") : "-";
      const clauseVal = finding.clause || meta?.qRef || "-";
      
      let matchingAnswer = null;
      if (meta) {
        matchingAnswer = answers.find(
          (ans) =>
            ans.process_id === meta.processId &&
            ans.clause === finding.clause &&
            ans.kind === meta.kind &&
            ans.q_ref === meta.qRef
        );
      }
      
      const parsedNote = parseAuditNote(matchingAnswer?.note);
      const evidenceStr = parsedNote.evidence.length > 0
        ? parsedNote.evidence.map((ev) => `${ev.name} (${ev.url})`).join("; ")
        : "-";

      const typeStr = FINDING_TYPE_META[finding.type]?.label ?? finding.type;
      const severityStr = meta?.severity ?? (finding.type === "major" ? "High" : finding.type === "minor" ? "Medium" : "Low");
      const correctionStr = meta?.correction || "-";
      const rootCauseStr = meta?.rootCauseText || "-";
      const capaStr = finding.capa || "-";
      const ownerStr = finding.owner || "-";
      const dueDateStr = finding.due_date ? new Date(finding.due_date).toLocaleDateString() : "-";
      const statusStr = finding.status || "-";

      return [
        idx + 1,
        procName,
        clauseVal,
        typeStr,
        severityStr,
        finding.description,
        evidenceStr,
        correctionStr,
        rootCauseStr,
        capaStr,
        ownerStr,
        dueDateStr,
        statusStr
      ];
    });

    const escapeCsvCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map(row => row.map(escapeCsvCell).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ISO_CAPA_Report_${audit?.title.replace(/\s+/g, "_") || "Audit"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="flex justify-between print:hidden">
        <Link to={`/app/audits/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to audit
        </Link>
        <button onClick={handleExportPdf} className="pill-cta">
          <Printer className="h-4 w-4" />
          Download PDF / Print Report
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-10 shadow-card print:border-none print:shadow-none relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img src={logo} alt="OAK Logo" className="h-14 w-auto object-contain shrink-0" />
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">OAK Global International - Audit Report</span>
                <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold">{audit.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{currentOrg?.name} - Standard {formatStandard(audit.standard)}</p>
              </div>
            </div>
          <div className="rounded-2xl bg-secondary px-4 py-3 text-right text-xs text-muted-foreground">
            <div>Started: {audit.started_at ? new Date(audit.started_at).toLocaleDateString() : "-"}</div>
            <div>Closed: {audit.closed_at ? new Date(audit.closed_at).toLocaleDateString() : "-"}</div>
            <div>Status: {audit.status.replace("_", " ")}</div>
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
            { id: "capa", label: "CAR Report", icon: <FileText className="h-4 w-4" /> },
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
                title="Response profile"
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
                title="Finding categories"
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
                title="Risk hotspots"
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
              <div className="rounded-[28px] border border-border bg-background/80 p-5">
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

        {/* Corrective Action Report (CAR) Tab */}
        {activeTab === "capa" && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border/60 pb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Corrective Action Report (CAR)</h2>
                <p className="text-sm text-muted-foreground">Issue, print, or share official Corrective Action Reports for compliance findings.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Auditee's Email"
                    value={auditeeEmail}
                    onChange={(e) => setAuditeeEmail(e.target.value)}
                    className="input h-10 w-60 text-xs font-semibold"
                    disabled={findings.length === 0}
                  />
                  <button
                    onClick={handleShareCar}
                    disabled={sharing || findings.length === 0 || !auditeeEmail.trim()}
                    className="pill-secondary h-10 px-4 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4" />
                    {sharing ? "Sharing..." : "Share via Email"}
                  </button>
                </div>
                
                <button
                  onClick={handleExportCar}
                  disabled={findings.length === 0}
                  className="pill-cta h-10 px-5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download CAR Report (PDF)
                </button>
              </div>
            </div>

            {findings.length === 0 ? (
              <EmptyBlock message="No findings or nonconformities found. Add nonconforming answers to populate the CAR tracker." />
            ) : (
              <div className="space-y-8 max-w-4xl mx-auto">
                {findings.map((finding, idx) => {
                  const meta = parseFindingMeta(finding.root_cause);
                  const procName = meta?.processId ? (processMap[meta.processId] || "-") : "-";
                  const clauseVal = finding.clause || meta?.qRef || "-";
                  const correction = meta?.correction || "-";
                  const rootCauseText = meta?.rootCauseText || "-";

                  return (
                    <div key={finding.id} className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary font-bold">Corrective Action Report (CAR)</span>
                          <h3 className="font-display text-xl font-extrabold text-foreground mt-1">Finding No.: CAR-{String(idx + 1).padStart(3, "0")}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground font-semibold">Date Raised</span>
                          <div className="text-xs font-mono font-bold mt-0.5">{new Date(finding.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 rounded-2xl bg-secondary/20 p-4 border border-border/50 text-xs">
                        <div>
                          <span className="text-muted-foreground block font-medium">Audit Reference</span>
                          <strong className="text-foreground mt-1 block">{audit?.title}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Auditor / Lead</span>
                          <strong className="text-foreground mt-1 block">
                            {currentOrg?.type === "individual"
                              ? (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Auditor")
                              : currentOrg?.name
                            }
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Auditee / Department</span>
                          <strong className="text-foreground mt-1 block">{procName}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">Target Closure Date</span>
                          <strong className="text-foreground mt-1 block">{finding.due_date ? new Date(finding.due_date).toLocaleDateString() : "-"}</strong>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Statement of Audit Finding</h4>
                          <div className="text-xs text-foreground bg-secondary/10 p-3 rounded-xl border border-border/30 leading-relaxed whitespace-pre-wrap">{finding.description}</div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Applicable ISO Standard Clause</h4>
                          <div className="text-xs text-foreground bg-secondary/10 p-3 rounded-xl border border-border/30 leading-relaxed">
                            Clause {clauseVal} of Standard {audit?.standard.toUpperCase()}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Finding Classification</h4>
                          <div className="flex gap-4 items-center p-3 rounded-xl border border-border/30 bg-secondary/10 text-xs">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" checked={finding.type === "major"} readOnly className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                              <span className={finding.type === "major" ? "font-bold text-foreground" : "text-muted-foreground"}>Major Non-Conformity</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" checked={finding.type === "minor"} readOnly className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                              <span className={finding.type === "minor" ? "font-bold text-foreground" : "text-muted-foreground"}>Minor Non-Conformity</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" checked={finding.type === "observation"} readOnly className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                              <span className={finding.type === "observation" ? "font-bold text-foreground" : "text-muted-foreground"}>Observation / OFI</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">4. Immediate Corrections (Containment Actions)</h4>
                          <div className="text-xs text-foreground bg-secondary/10 p-3 rounded-xl border border-border/30 leading-relaxed whitespace-pre-wrap">{correction}</div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">5. Root Cause Analysis</h4>
                          <div className="text-xs text-foreground bg-secondary/10 p-3 rounded-xl border border-border/30 leading-relaxed whitespace-pre-wrap">{rootCauseText}</div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">6. Corrective Actions</h4>
                          <div className="text-xs text-foreground bg-secondary/10 p-3 rounded-xl border border-border/30 leading-relaxed whitespace-pre-wrap">{finding.capa || "-"}</div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">7. Corrective Action Plan Details</h4>
                          <div className="overflow-x-auto rounded-xl border border-border bg-background">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-secondary/40 font-semibold text-muted-foreground uppercase">
                                <tr className="border-b border-border">
                                  <th className="p-3">Corrective Action Item</th>
                                  <th className="p-3 w-1/4">Responsible</th>
                                  <th className="p-3 w-1/5">Target Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="p-3 border-r border-border font-medium text-foreground">{finding.capa || "-"}</td>
                                  <td className="p-3 border-r border-border text-foreground">{finding.owner || "-"}</td>
                                  <td className="p-3 font-mono">{finding.due_date ? new Date(finding.due_date).toLocaleDateString() : "-"}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">8. Evaluation of Effectiveness of Actions</h4>
                          <div className="overflow-x-auto rounded-xl border border-border bg-background">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-secondary/40 font-semibold text-muted-foreground uppercase">
                                <tr className="border-b border-border">
                                  <th className="p-3">Evaluation Method</th>
                                  <th className="p-3 w-1/5">Date Verified</th>
                                  <th className="p-3 w-1/4">Result / Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="p-3 border-r border-border text-muted-foreground">Verification completed by lead auditor prior to subsequent surveillance cycle.</td>
                                  <td className="p-3 border-r border-border font-mono">{finding.status === "closed" ? new Date().toLocaleDateString() : "-"}</td>
                                  <td className="p-3 capitalize font-bold text-foreground">Status: {finding.status.replace("_", " ")}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">9. Closure and Sign-Off</h4>
                          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border bg-secondary/10 p-4 text-xs">
                            <div>
                              <span className="text-muted-foreground block font-medium">CAR Status</span>
                              <strong className="text-foreground mt-1 block uppercase">{finding.status.replace("_", " ")}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground block font-medium">Closure Date</span>
                              <strong className="text-foreground mt-1 block">{finding.status === "closed" ? new Date().toLocaleDateString() : "Open / Pending Verification"}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Detailed Responses Tab */}
        {activeTab === "responses" && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <h2 className="font-display text-xl font-bold">Detailed responses</h2>
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
