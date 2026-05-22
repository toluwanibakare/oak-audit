import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, PieChart as PieChartIcon, Printer, Radar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { useOrg } from "@/hooks/useOrg";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/lib/auditAnalytics";

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
};

type ReportAnswer = AnalyticsAnswer & {
  question_text?: string | null;
  note?: string | null;
};

const AuditReport = () => {
  const { id } = useParams();
  const { currentOrg } = useOrg();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AnalyticsAudit | null>(null);
  const [answers, setAnswers] = useState<ReportAnswer[]>([]);
  const [findings, setFindings] = useState<ReportFinding[]>([]);
  const [processes, setProcesses] = useState<AnalyticsProcess[]>([]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const [auditResult, answersResult, findingsResult, processesResult] = await Promise.all([
        supabase.from("audits").select("id, title, standard, status, scope, created_at, started_at, closed_at").eq("id", id).single(),
        supabase.from("audit_answers").select("audit_id, status, process_id, clause, question_text, note").eq("audit_id", id),
        supabase.from("findings").select("id, audit_id, type, clause, description, capa, owner, status, created_at, due_date").eq("audit_id", id).order("created_at"),
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
    });
  };

  if (loading || !audit) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-40 w-full rounded-[28px]" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-72 w-full rounded-[28px]" />
            <Skeleton className="h-72 w-full rounded-[28px]" />
            <Skeleton className="h-72 w-full rounded-[28px]" />
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
        <button onClick={handleExportPdf} className="pill-cta">
          <Printer className="h-4 w-4" />
          Download PDF / Print Report
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-10 shadow-card print:border-none print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">OAK Global International - Audit Report</span>
            <h1 className="mt-2 font-display text-4xl font-bold">{audit.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{currentOrg?.name} - Standard {formatStandard(audit.standard)}</p>
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

        <section className="mt-10 grid gap-5 xl:grid-cols-3">
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

        <section className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
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

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Detailed responses</h2>
          <table className="mt-3 w-full text-xs">
            <thead className="border-b border-border text-left uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Process</th><th>Clause</th><th>Question</th><th>Status</th><th>Notes</th><th>Evidence</th></tr>
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
                            <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                              {item.name}
                            </a>
                          ))}
                        </div>
                      ) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
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
