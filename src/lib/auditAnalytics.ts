export type AnalyticsAudit = {
  id: string;
  title: string;
  standard: string;
  status: string;
  created_at: string;
  scope?: string | null;
  started_at?: string | null;
  closed_at?: string | null;
};

export type AnalyticsAnswer = {
  audit_id: string;
  status: string;
  process_id: string;
  clause?: string | null;
};

export type AnalyticsFinding = {
  audit_id: string;
  type: string;
  status: string;
};

export type AnalyticsProcess = {
  id: string;
  name: string;
};

export const ANSWER_STATUS_META: Record<string, { label: string; color: string }> = {
  conform: { label: "Conform", color: "hsl(var(--success))" },
  major: { label: "Major NC", color: "hsl(var(--destructive))" },
  minor: { label: "Minor NC", color: "hsl(var(--warning))" },
  observation: { label: "Observation", color: "hsl(var(--accent))" },
  pending: { label: "Pending", color: "hsl(var(--muted-foreground))" },
  na: { label: "N/A", color: "hsl(var(--border))" },
};

export const FINDING_TYPE_META: Record<string, { label: string; color: string }> = {
  major: { label: "Major NC", color: "hsl(var(--destructive))" },
  minor: { label: "Minor NC", color: "hsl(var(--warning))" },
  observation: { label: "Observation", color: "hsl(var(--accent))" },
  opportunity: { label: "Opportunity", color: "hsl(var(--info))" },
};

const shortDate = new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" });

export function formatStandard(standard: string) {
  const map: Record<string, string> = {
    "9001": "ISO 9001",
    "14001": "ISO 14001",
    "45001": "ISO 45001",
    "27001": "ISO 27001",
    "ims": "IMS",
    "hse": "HSE",
  };

  return map[standard] ?? standard.toUpperCase();
}

export function getConformityRate(answers: AnalyticsAnswer[]) {
  if (!answers.length) return 0;
  return Math.round((answers.filter((answer) => answer.status === "conform").length / answers.length) * 100);
}

export function isNonConforming(status: string) {
  return status === "major" || status === "minor" || status === "observation";
}

export function buildResponseBreakdown(answers: AnalyticsAnswer[]) {
  return Object.entries(ANSWER_STATUS_META)
    .map(([status, meta]) => ({
      status,
      label: meta.label,
      value: answers.filter((answer) => answer.status === status).length,
      fill: meta.color,
    }))
    .filter((item) => item.value > 0);
}

export function buildFindingsBreakdown(findings: AnalyticsFinding[], key: "type" | "status" = "type") {
  const map = new Map<string, number>();
  findings.forEach((finding) => {
    const itemKey = finding[key] || "unknown";
    map.set(itemKey, (map.get(itemKey) ?? 0) + 1);
  });

  return Array.from(map.entries())
    .map(([itemKey, value]) => ({
      key: itemKey,
      label: key === "type" ? (FINDING_TYPE_META[itemKey]?.label ?? titleCase(itemKey)) : titleCase(itemKey),
      value,
      fill: key === "type" ? (FINDING_TYPE_META[itemKey]?.color ?? "hsl(var(--info))") : "hsl(var(--info))",
    }))
    .sort((left, right) => right.value - left.value);
}

export function buildAuditTrend(audits: AnalyticsAudit[], answers: AnalyticsAnswer[], findings: AnalyticsFinding[], limit = 6) {
  return [...audits]
    .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
    .slice(-limit)
    .map((audit) => {
      const auditAnswers = answers.filter((answer) => answer.audit_id === audit.id);
      const auditFindings = findings.filter((finding) => finding.audit_id === audit.id);
      const labelBase = audit.title.trim() || formatStandard(audit.standard);

      return {
        auditId: audit.id,
        label: labelBase.length > 18 ? `${labelBase.slice(0, 18)}...` : labelBase,
        conformity: getConformityRate(auditAnswers),
        major: auditAnswers.filter((answer) => answer.status === "major").length,
        minor: auditAnswers.filter((answer) => answer.status === "minor").length,
        observation: auditAnswers.filter((answer) => answer.status === "observation").length,
        findings: auditFindings.length,
        date: shortDate.format(new Date(audit.created_at)),
      };
    });
}

export function buildProcessHotspots(answers: AnalyticsAnswer[], processes: AnalyticsProcess[], limit = 6) {
  const processNameById = new Map(processes.map((process) => [process.id, process.name]));
  const counts = new Map<string, number>();

  answers.filter((answer) => isNonConforming(answer.status)).forEach((answer) => {
    const label = processNameById.get(answer.process_id) ?? "Unmapped process";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}

export function buildStandardPerformance(audits: AnalyticsAudit[], answers: AnalyticsAnswer[], findings: AnalyticsFinding[]) {
  const grouped = new Map<string, { audits: number; answers: AnalyticsAnswer[]; findings: AnalyticsFinding[] }>();

  audits.forEach((audit) => {
    const bucket = grouped.get(audit.standard) ?? { audits: 0, answers: [], findings: [] };
    bucket.audits += 1;
    bucket.answers.push(...answers.filter((answer) => answer.audit_id === audit.id));
    bucket.findings.push(...findings.filter((finding) => finding.audit_id === audit.id));
    grouped.set(audit.standard, bucket);
  });

  return Array.from(grouped.entries())
    .map(([standard, bucket]) => ({
      standard: formatStandard(standard),
      audits: bucket.audits,
      conformity: getConformityRate(bucket.answers),
      findings: bucket.findings.length,
    }))
    .sort((left, right) => right.audits - left.audits);
}

export function buildClauseHotspots(answers: AnalyticsAnswer[], limit = 6) {
  const counts = new Map<string, number>();

  answers.filter((answer) => isNonConforming(answer.status)).forEach((answer) => {
    const label = answer.clause || "Unspecified";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
