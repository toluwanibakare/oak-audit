import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  FolderLock,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/app/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AnalyticsAnswer,
  AnalyticsAudit,
  AnalyticsFinding,
  AnalyticsProcess,
  buildAuditTrend,
  buildFindingsBreakdown,
  buildProcessHotspots,
  buildResponseBreakdown,
  buildStandardPerformance,
  formatStandard,
} from "@/lib/auditAnalytics";
Ommo i want to leave this place as asap as possible
const AppDashboard = () => {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayName = fullName.split(" ")[0];
  const [stats, setStats] = useState({ audits: 0, findings: 0, licenses: 0, conformity: 0 });
  const [credits, setCredits] = useState<number | null>(null);
  const [needOnboarding, setNeedOnboarding] = useState(false);
  const [audits, setAudits] = useState<AnalyticsAudit[]>([]);
  const [answers, setAnswers] = useState<AnalyticsAnswer[]>([]);
  const [findings, setFindings] = useState<AnalyticsFinding[]>([]);
  const [processes, setProcesses] = useState<AnalyticsProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalNotice, setShowApprovalNotice] = useState(false);

  useEffect(() => {
    if (!currentOrg?.address) return;
    try {
      const addrData = JSON.parse(currentOrg.address);
      if (addrData?.reviewStatus === "approved") {
        const dismissKey = `oak.dismiss_approval_notice.${currentOrg.id}`;
        const dismissed = localStorage.getItem(dismissKey);
        if (!dismissed) {
          setShowApprovalNotice(true);
        }
      }
    } catch {
      // Ignored
    }
  }, [currentOrg]);

  const handleDismissApprovalNotice = () => {
    if (currentOrg) {
      localStorage.setItem(`oak.dismiss_approval_notice.${currentOrg.id}`, "true");
    }
    setShowApprovalNotice(false);
  };

  useEffect(() => {
    if (!currentOrg) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const [auditsResult, findingsResult, licensesResult, processesResult, walletResult] = await Promise.all([
        supabase
          .from("audits")
          .select("id, title, standard, status, scope, created_at")
          .eq("org_id", currentOrg.id)
          .order("created_at", { ascending: false }),
        supabase.from("findings").select("audit_id, type, status").eq("org_id", currentOrg.id),
        supabase.from("audit_licenses").select("id", { count: "exact", head: true }).eq("org_id", currentOrg.id).eq("active", true),
        supabase.from("org_processes").select("id, name").eq("org_id", currentOrg.id).order("name"),
        supabase.from("credit_wallets").select("balance").eq("org_id", currentOrg.id).maybeSingle(),
      ]);

      const nextAudits = (auditsResult.data ?? []) as AnalyticsAudit[];
      const auditIds = nextAudits.map((audit) => audit.id);
      const answersResult = auditIds.length
        ? await supabase.from("audit_answers").select("audit_id, status, process_id, clause").in("audit_id", auditIds)
        : { data: [] };

      if (cancelled) return;

      const nextAnswers = (answersResult.data ?? []) as AnalyticsAnswer[];
      const nextFindings = (findingsResult.data ?? []) as AnalyticsFinding[];
      const nextProcesses = (processesResult.data ?? []) as AnalyticsProcess[];
      const conformity = nextAnswers.length
        ? Math.round((nextAnswers.filter((answer) => answer.status === "conform").length / nextAnswers.length) * 100)
        : 0;

      setStats({
        audits: nextAudits.length,
        findings: nextFindings.filter((finding) => finding.status !== "closed").length,
        licenses: licensesResult.count ?? 0,
        conformity,
      });
      setNeedOnboarding(nextProcesses.length === 0);
      setCredits(walletResult.data?.balance ?? 0);
      setAudits(nextAudits);
      setAnswers(nextAnswers);
      setFindings(nextFindings);
      setProcesses(nextProcesses);

      window.setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, 220);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentOrg]);

  const recentAudits = audits.slice(0, 4);

  const statusTone = useMemo(
    () => ({
      closed: "bg-success/10 text-success",
      in_progress: "bg-info/10 text-info",
      draft: "bg-secondary text-foreground",
    }),
    [],
  );

  const responseMix = useMemo(() => buildResponseBreakdown(answers), [answers]);
  const findingsMix = useMemo(() => buildFindingsBreakdown(findings), [findings]);
  const trendData = useMemo(() => buildAuditTrend(audits, answers, findings), [audits, answers, findings]);
  const processHotspots = useMemo(() => buildProcessHotspots(answers, processes), [answers, processes]);
  const standardPerformance = useMemo(() => buildStandardPerformance(audits, answers, findings), [audits, answers, findings]);

  const topStandard = standardPerformance[0];
  const chartReady = !loading && answers.length > 0;

  return (
    <AppShell>
      {showApprovalNotice && (
        <div className="mb-6 rounded-[24px] border border-success/30 bg-success/10 p-5 sm:p-6 shadow-sm relative overflow-hidden animate-fade-in">
          {/* Subtle success colored glowing background decoration */}
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-success/20 blur-2xl -z-10 animate-pulse" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-success/20 text-success">
                <BadgeCheck className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Account approved & ready</h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  ISO AUDIT MANAGEMENT PORT compliance administrators have successfully activated your ISO environment. Go ahead, unlock an ISO standard, and start your compliance runs!
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-4">
                  <Link to="/app/licenses" className="inline-flex items-center gap-1.5 rounded-full bg-success px-4 py-2 text-xs font-bold text-success-foreground transition hover:opacity-90">
                    Go to ISO Library
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button 
                    onClick={handleDismissApprovalNotice} 
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition underline underline-offset-2"
                  >
                    Dismiss notice
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleDismissApprovalNotice}
              className="rounded-lg p-1 hover:bg-success/20 text-muted-foreground hover:text-foreground transition shrink-0"
              aria-label="Close announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <section className="analytics-panel rounded-[30px] border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</span>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
              {currentOrg?.type === "individual" ? `${displayName}'s Workspace` : currentOrg?.name ?? "Loading..."}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentOrg?.type === "organization" ? `${currentOrg?.industry ?? "Organization"} - audit command center` : "Individual auditor workspace"}
            </p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              Keep recent audits, audit health, and purchase actions in one well-ordered workspace so the dashboard feels like a control room instead of a long list.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border bg-background px-4 py-2 text-sm shadow-card">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Credits</span>
              <span className="ml-2 font-display text-base font-bold">
                {loading || credits === null ? <Skeleton className="inline-block h-5 w-12 align-middle" /> : credits}
              </span>
            </div>
            <Link to="/app/licenses" className="pill-cta">+ New audit</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard title="Unlocked packs" value={stats.licenses} hint="Ready to run" loading={loading} />
          <MetricCard title="Audits" value={stats.audits} hint="Across all standards" loading={loading} />
          <MetricCard title="Open findings" value={stats.findings} hint="Pending CAPA" loading={loading} />
          <MetricCard title="Conformity" value={`${stats.conformity}%`} hint="From all answers" loading={loading} />
        </div>
      </section>

      {needOnboarding && (
        <Link to="/app/onboarding" className="mt-6 block rounded-2xl border border-gold bg-gold/5 p-5 transition hover:shadow-elevated">
          <div className="flex items-center justify-between gap-4">
            <div>
              <strong className="font-display text-base">
                {currentOrg?.type === "individual" ? "Finish setting up your account ->" : "Finish setting up your organization ->"}
              </strong>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentOrg?.type === "individual" 
                  ? "Define your processes and checklists before you scale up more audits."
                  : "Add your audit team, processes, and assignment matrix before you scale up more audits."}
              </p>
            </div>
            <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium uppercase text-gold">Onboard</span>
          </div>
        </Link>
      )}

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_340px]">
        <div className="analytics-panel rounded-[28px] border border-border bg-card p-6 shadow-card" style={{ animationDelay: "90ms" }}>
          {(recentAudits.length > 0 || loading) ? (

            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    My audits
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold">Continue where you left off</h2>
                  <p className="mt-1 text-sm text-muted-foreground">The latest audit work stays up front, with clean cards and direct access back into execution.</p>
                </div>
                <Link to="/app/audits" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-secondary">
                  View all audits
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-3">
                {loading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border border-border bg-background/60 p-5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="mt-3 h-6 w-2/3" />
                      <Skeleton className="mt-3 h-4 w-1/2" />
                    </div>
                  ))}

                {!loading &&
                  recentAudits.map((audit) => (
                    <Link key={audit.id} to={`/app/audits/${audit.id}`} className="rounded-2xl border border-border bg-background/60 p-5 transition hover:-translate-y-0.5 hover:shadow-elevated">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{formatStandard(audit.standard)}</span>
                          <h3 className="mt-2 font-display text-lg font-semibold">{audit.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {audit.scope || "No scope added yet"} - {new Date(audit.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs ${statusTone[audit.status as keyof typeof statusTone] ?? "bg-secondary text-foreground"}`}>
                          {audit.status.replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </>
          ) : (
            <div className="py-8 text-center max-w-md mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
                <ClipboardCheck className="h-8 w-8" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-foreground">Welcome to ISO AUDIT MANAGEMENT PORT</h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Start auditing with absolute confidence. Unlock an ISO standard, IMS, or HSE Safety pack from our catalog, seed your question bank, and get going.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/app/licenses" className="pill-cta px-6 py-3 text-sm">Go to ISO Library</Link>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-5">
          <aside className="analytics-panel rounded-[28px] border border-border bg-card p-6 shadow-card" style={{ animationDelay: "140ms" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Workspace pulse
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-secondary p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Most active standard</div>
                {loading ? <Skeleton className="mt-2 h-7 w-32" /> : <div className="mt-2 font-display text-2xl font-bold">{topStandard?.standard ?? "None yet"}</div>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {topStandard ? `${topStandard.audits} audit(s) at ${topStandard.conformity}% conformity` : "Run more audits to populate trend data."}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Issue density</div>
                {loading ? <Skeleton className="mt-2 h-7 w-16" /> : <div className="mt-2 font-display text-2xl font-bold">{findings.length}</div>}
                <p className="mt-1 text-xs text-muted-foreground">Total findings currently represented in dashboard analytics.</p>
              </div>
            </div>
          </aside>

          <aside className="analytics-panel rounded-[28px] border border-border bg-card p-6 shadow-card" style={{ animationDelay: "180ms" }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <FolderLock className="h-3.5 w-3.5" />
              Expand access
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold">Unlock more packs</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add more standards when you need broader coverage for new teams, sites, or audit scopes.</p>
            <div className="mt-5 rounded-2xl border border-dashed border-border p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ready now</div>
              {loading ? <Skeleton className="mt-2 h-8 w-16" /> : <div className="mt-2 font-display text-3xl font-bold">{stats.licenses}</div>}
              <p className="mt-1 text-xs text-muted-foreground">Unlocked packs available today</p>
            </div>
            <Link to="/app/licenses" className="pill-cta mt-6 w-full">
              Unlock more packs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      {!loading && audits.length > 0 && (
        <section className="mt-6 grid gap-5">
          <AnalyticsCard
            title="Audit analytics"
            subtitle="Recent audit trend, with conformity paired against major and minor nonconformities."
            icon={<BarChart3 className="h-4 w-4" />}
            delay="220ms"
          >
            {chartReady ? (
              <ChartContainer
                className="h-[340px] w-full"
                config={{
                  conformity: { label: "Conformity", color: "hsl(var(--success))" },
                  major: { label: "Major NC", color: "hsl(var(--destructive))" },
                  minor: { label: "Minor NC", color: "hsl(var(--warning))" },
                }}
              >
                <ComposedChart data={trendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} width={34} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={34} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar yAxisId="left" dataKey="major" radius={[8, 8, 0, 0]} fill="var(--color-major)" isAnimationActive animationDuration={650} />
                  <Bar yAxisId="left" dataKey="minor" radius={[8, 8, 0, 0]} fill="var(--color-minor)" isAnimationActive animationDuration={720} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conformity"
                    stroke="var(--color-conformity)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-conformity)" }}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                    animationDuration={850}
                  />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <AnalyticsSkeleton />
            )}
          </AnalyticsCard>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
            <AnalyticsCard
              title="Response mix"
              subtitle="Overall answer breakdown from all captured audit responses."
              icon={<TrendingUp className="h-4 w-4" />}
              delay="260ms"
            >
              {chartReady ? (
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
                      innerRadius={68}
                      outerRadius={104}
                      paddingAngle={3}
                      isAnimationActive
                      animationDuration={800}
                    >
                      {responseMix.map((item) => (
                        <Cell key={item.status} fill={item.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <AnalyticsSkeleton compact />
              )}
            </AnalyticsCard>

            <AnalyticsCard
              title="Process hotspots"
              subtitle="Processes with the highest concentration of nonconformities and observations."
              icon={<ClipboardCheck className="h-4 w-4" />}
              delay="300ms"
            >
              {chartReady && processHotspots.length > 0 ? (
                <ChartContainer
                  className="h-[280px] w-full"
                  config={{ value: { label: "Issues", color: "hsl(var(--accent))" } }}
                >
                  <BarChart data={processHotspots} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={110} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={[0, 10, 10, 0]} isAnimationActive animationDuration={780} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <AnalyticsSkeleton compact />
              )}
            </AnalyticsCard>

            <AnalyticsCard
              title="Standard performance"
              subtitle="Audit volume, issue count, and conformity by standard."
              icon={<BarChart3 className="h-4 w-4" />}
              delay="340ms"
            >
              {chartReady && standardPerformance.length > 0 ? (
                <div className="space-y-3">
                  {standardPerformance.slice(0, 4).map((item) => (
                    <div key={item.standard} className="rounded-2xl border border-border bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-display text-lg font-semibold">{item.standard}</div>
                          <p className="text-xs text-muted-foreground">{item.audits} audit(s) - {item.findings} finding(s)</p>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl font-bold">{item.conformity}%</div>
                          <div className="text-xs text-muted-foreground">conformity</div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-gradient-to-r from-info via-accent to-success transition-all duration-700" style={{ width: `${item.conformity}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AnalyticsSkeleton compact />
              )}
            </AnalyticsCard>
          </div>

          <AnalyticsCard
            title="Finding categories"
            subtitle="See what kind of issues dominate your current audit portfolio."
            icon={<BarChart3 className="h-4 w-4" />}
            delay="380ms"
          >
            {chartReady && findingsMix.length > 0 ? (
              <ChartContainer
                className="h-[320px] w-full"
                config={Object.fromEntries(findingsMix.map((item) => [item.key, { label: item.label, color: item.fill }]))}
              >
                <BarChart data={findingsMix}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={64} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} isAnimationActive animationDuration={760}>
                    {findingsMix.map((item) => (
                      <Cell key={item.key} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <AnalyticsSkeleton compact />
            )}
          </AnalyticsCard>
        </section>
      )}
    </AppShell>
  );
};

const MetricCard = ({ title, value, hint, loading }: { title: string; value: number | string; hint: string; loading: boolean }) => (
  <div className="rounded-2xl border border-border bg-background/70 p-5 shadow-card">
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</span>
    <div className="mt-2 font-display text-3xl font-bold">
      {loading ? <Skeleton className="h-9 w-20" /> : value}
    </div>
    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
  </div>
);

const AnalyticsCard = ({
  title,
  subtitle,
  icon,
  delay,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  delay?: string;
  children: ReactNode;
}) => (
  <section className="analytics-panel rounded-[28px] border border-border bg-card p-6 shadow-card" style={delay ? { animationDelay: delay } : undefined}>
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      {title}
    </div>
    <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    <div className="mt-5">{children}</div>
  </section>
);

const AnalyticsSkeleton = ({ compact = false }: { compact?: boolean }) => (
  <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-[minmax(0,1fr)_160px]"}`}>
    <Skeleton className={`${compact ? "h-[220px]" : "h-[260px]"} w-full rounded-[24px]`} />
    {!compact && (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    )}
  </div>
);

export default AppDashboard;
