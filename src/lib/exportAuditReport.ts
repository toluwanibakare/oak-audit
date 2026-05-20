import type { EvidenceItem } from "./auditEvidence";

type ExportAuditMeta = {
  organization: string;
  auditTitle: string;
  standard: string;
  scope?: string | null;
  status: string;
  startedAt?: string | null;
  closedAt?: string | null;
  generatedAt?: string;
};

type ExportAuditAnswer = {
  process: string;
  clause?: string | null;
  question?: string | null;
  status: string;
  note?: string | null;
  evidence?: EvidenceItem[];
};

type ExportAuditFinding = {
  type: string;
  clause?: string | null;
  description: string;
  capa?: string | null;
  owner?: string | null;
  status: string;
  dueDate?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  conform: "Conform",
  major: "Major NC",
  minor: "Minor NC",
  observation: "Observation",
  pending: "Pending",
  na: "Not Applicable",
};

export function exportAuditReport({
  meta,
  answers,
  findings,
}: {
  meta: ExportAuditMeta;
  answers: ExportAuditAnswer[];
  findings: ExportAuditFinding[];
}) {
  const generatedAt = meta.generatedAt || new Date().toISOString().slice(0, 10);
  const total = answers.length;
  const conform = answers.filter((answer) => answer.status === "conform").length;
  const major = answers.filter((answer) => answer.status === "major").length;
  const minor = answers.filter((answer) => answer.status === "minor").length;
  const observation = answers.filter((answer) => answer.status === "observation").length;
  const conformity = total ? Math.round((conform / total) * 100) : 0;
  const responseMix = [
    { label: "Conform", value: conform, className: "s-conform" },
    { label: "Major NC", value: major, className: "s-major" },
    { label: "Minor NC", value: minor, className: "s-minor" },
    { label: "Observation", value: observation, className: "s-observation" },
  ].filter((item) => item.value > 0);
  const findingsByType = groupBy(findings, (finding) => titleCase(finding.type));
  const findingsByStatus = groupBy(findings, (finding) => titleCase(finding.status));
  const processHotspots = topCounts(
    answers.filter((answer) => answer.status === "major" || answer.status === "minor" || answer.status === "observation"),
    (answer) => answer.process || "Unmapped process",
  );
  const clauseHotspots = topCounts(
    answers.filter((answer) => answer.status === "major" || answer.status === "minor" || answer.status === "observation"),
    (answer) => answer.clause || "Unspecified",
  );
  const maxResponse = Math.max(...responseMix.map((item) => item.value), 1);
  const maxFindingType = Math.max(...findingsByType.map((item) => item.value), 1);
  const maxFindingStatus = Math.max(...findingsByStatus.map((item) => item.value), 1);
  const maxProcess = Math.max(...processHotspots.map((item) => item.value), 1);
  const maxClause = Math.max(...clauseHotspots.map((item) => item.value), 1);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Audit Report - ${escape(meta.organization)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto;
    max-width: 920px;
    padding: 28px;
    color: #162033;
    background: #f5f1e8;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.5;
  }
  h1, h2, h3 {
    margin: 0;
    color: #0f1b2d;
    font-family: Georgia, "Times New Roman", serif;
  }
  h1 { font-size: 34px; font-weight: 700; }
  h2 {
    margin-top: 30px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ced5df;
    font-size: 20px;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #5f6b7a;
  }
  .cover {
    padding: 26px 28px;
    border: 1px solid #d7dce4;
    background: linear-gradient(135deg, #ffffff 0%, #f4efe6 100%);
  }
  .cover-grid {
    display: grid;
    grid-template-columns: 1.3fr 0.9fr;
    gap: 18px;
    align-items: start;
  }
  .hero-box {
    padding: 16px;
    border: 1px solid #dde3ea;
    background: rgba(255,255,255,0.72);
  }
  .meta-table, .report-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
    font-size: 13px;
  }
  .meta-table td, .report-table th, .report-table td {
    border: 1px solid #d4dae2;
    padding: 9px 10px;
    vertical-align: top;
    text-align: left;
  }
  .meta-table td:first-child {
    width: 32%;
    font-weight: 700;
    background: #ece8df;
  }
  .report-table th {
    background: #132238;
    color: #ffffff;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-top: 16px;
  }
  .summary-card {
    padding: 14px;
    border: 1px solid #d4dae2;
    background: #fffdfa;
  }
  .summary-value {
    margin-top: 8px;
    font-size: 28px;
    font-weight: 700;
    font-family: Georgia, "Times New Roman", serif;
  }
  .summary-highlight {
    margin-top: 16px;
    padding: 18px;
    border-left: 4px solid #c67b33;
    background: #fff8ef;
  }
  .analytics-grid {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 14px;
    margin-top: 16px;
  }
  .analytics-card {
    border: 1px solid #d4dae2;
    background: #fffdfa;
    padding: 16px;
  }
  .analytics-title {
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #556173;
  }
  .bar-stack {
    display: grid;
    gap: 10px;
  }
  .bar-row {
    display: grid;
    grid-template-columns: 128px 1fr 44px;
    gap: 10px;
    align-items: center;
    font-size: 12px;
  }
  .bar-track {
    height: 11px;
    overflow: hidden;
    border-radius: 999px;
    background: #e8ecf1;
  }
  .bar-fill {
    height: 100%;
    border-radius: 999px;
  }
  .fill-conform { background: linear-gradient(90deg, #2f8f57, #49b26e); }
  .fill-major { background: linear-gradient(90deg, #a63e3e, #d75b5b); }
  .fill-minor { background: linear-gradient(90deg, #af7d11, #e0ad32); }
  .fill-observation { background: linear-gradient(90deg, #3c69b0, #5f8ce0); }
  .fill-slate { background: linear-gradient(90deg, #617086, #8b98ab); }
  .hotspot-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 12px;
  }
  .hotspot-table td {
    padding: 8px 0;
    border-bottom: 1px solid #e3e7ed;
    vertical-align: middle;
  }
  .hotspot-table td:last-child {
    width: 48px;
    text-align: right;
    font-weight: 700;
  }
  .badge {
    display: inline-block;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .s-conform { background: #dceee1; color: #1f5a34; }
  .s-major { background: #f7dbdc; color: #842828; }
  .s-minor { background: #f8e7bf; color: #7b5600; }
  .s-observation { background: #dfe8fa; color: #244a8f; }
  .s-pending { background: #eceff3; color: #5b6675; }
  .s-na { background: #ece6dd; color: #665f55; }
  .finding-card {
    margin-top: 14px;
    border: 1px solid #d4dae2;
    background: #fffdfa;
  }
  .finding-head {
    padding: 10px 14px;
    background: #132238;
    color: #ffffff;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
  }
  .finding-body {
    padding: 14px;
  }
  .finding-body p {
    margin: 0 0 10px;
  }
  .small-label {
    display: block;
    margin-bottom: 4px;
    color: #66717f;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
  }
  .footer {
    margin-top: 34px;
    padding-top: 16px;
    border-top: 1px solid #d4dae2;
    color: #66717f;
    font-size: 11px;
  }
  @media print {
    body { background: white; padding: 0; }
  }
</style>
</head>
<body>
  <section class="cover">
    <div class="cover-grid">
      <div>
        <div class="eyebrow">Internal Audit Report</div>
        <h1 style="margin-top:10px;">${escape(meta.auditTitle)}</h1>
        <p style="margin:12px 0 0; font-size:15px; color:#445061;">
          ${escape(meta.organization)}<br/>
          ${escape(meta.standard)} audit report
        </p>
      </div>
      <div class="hero-box">
        <div class="eyebrow">Document Status</div>
        <div style="margin-top:10px; font-size:24px; font-weight:700; font-family:Georgia, 'Times New Roman', serif;">
          ${escape(titleCase(meta.status))}
        </div>
        <p style="margin:12px 0 0; font-size:13px; color:#586273;">
          Generated on ${escape(generatedAt)} for formal review, filing, and PDF download.
        </p>
      </div>
    </div>

    <table class="meta-table">
      <tr><td>Company</td><td>${escape(meta.organization)}</td></tr>
      <tr><td>Audit title</td><td>${escape(meta.auditTitle)}</td></tr>
      <tr><td>Standard</td><td>${escape(meta.standard)}</td></tr>
      <tr><td>Scope</td><td>${escape(meta.scope || "-")}</td></tr>
      <tr><td>Audit started</td><td>${escape(meta.startedAt ? toDate(meta.startedAt) : "-")}</td></tr>
      <tr><td>Audit closed</td><td>${escape(meta.closedAt ? toDate(meta.closedAt) : "-")}</td></tr>
      <tr><td>Report issued</td><td>${escape(generatedAt)}</td></tr>
    </table>
  </section>

  <h2>1. Executive Summary</h2>
  <p>
    This report presents the outcome of the ${escape(meta.standard)} audit conducted for
    <strong> ${escape(meta.organization)}</strong>. The audit covered ${total} recorded response item(s)
    and assessed conformity, nonconformities, and observations across the selected processes and clauses.
  </p>

  <div class="summary-grid">
    <div class="summary-card"><div class="eyebrow">Conformity</div><div class="summary-value">${conformity}%</div></div>
    <div class="summary-card"><div class="eyebrow">Questions</div><div class="summary-value">${total}</div></div>
    <div class="summary-card"><div class="eyebrow">Major NCs</div><div class="summary-value">${major}</div></div>
    <div class="summary-card"><div class="eyebrow">Minor NCs</div><div class="summary-value">${minor}</div></div>
    <div class="summary-card"><div class="eyebrow">Observations</div><div class="summary-value">${observation}</div></div>
  </div>

  <div class="summary-highlight">
    <span class="small-label">Audit conclusion</span>
    ${
      major > 0
        ? `<strong>${major} major nonconformity(ies)</strong> require prompt corrective action and management attention before closure.`
        : `No major nonconformities were recorded.`
    }
    ${minor > 0 ? ` ${minor} minor nonconformity(ies)` : ""}${observation > 0 ? ` and ${observation} observation(s)` : ""} were identified during the audit.
  </div>

  <h2>2. Analytics Summary</h2>
  <div class="analytics-grid">
    <div class="analytics-card">
      <div class="analytics-title">Response Breakdown</div>
      <div class="bar-stack">
        ${
          responseMix.length === 0
            ? `<p style="margin:0; font-size:12px; color:#66717f;">No response analytics available yet.</p>`
            : responseMix.map((item) => `
              <div class="bar-row">
                <div>${escape(item.label)}</div>
                <div class="bar-track"><div class="bar-fill ${item.className.replace("s-", "fill-")}" style="width:${Math.max((item.value / maxResponse) * 100, item.value ? 8 : 0)}%"></div></div>
                <div>${item.value}</div>
              </div>
            `).join("")
        }
      </div>
    </div>
    <div class="analytics-card">
      <div class="analytics-title">Findings by Type</div>
      <div class="bar-stack">
        ${
          findingsByType.length === 0
            ? `<p style="margin:0; font-size:12px; color:#66717f;">No finding analytics available yet.</p>`
            : findingsByType.map((item) => `
              <div class="bar-row">
                <div>${escape(item.label)}</div>
                <div class="bar-track"><div class="bar-fill fill-slate" style="width:${Math.max((item.value / maxFindingType) * 100, item.value ? 8 : 0)}%"></div></div>
                <div>${item.value}</div>
              </div>
            `).join("")
        }
      </div>
    </div>
    <div class="analytics-card">
      <div class="analytics-title">Process Hotspots</div>
      ${
        processHotspots.length === 0
          ? `<p style="margin:0; font-size:12px; color:#66717f;">No process hotspots yet.</p>`
          : `
            <table class="hotspot-table">
              ${processHotspots.map((item) => `
                <tr>
                  <td style="padding-right:10px;">${escape(item.label)}</td>
                  <td>
                    <div class="bar-track"><div class="bar-fill fill-observation" style="width:${Math.max((item.value / maxProcess) * 100, item.value ? 8 : 0)}%"></div></div>
                  </td>
                  <td>${item.value}</td>
                </tr>
              `).join("")}
            </table>
          `
      }
    </div>
    <div class="analytics-card">
      <div class="analytics-title">Clause Hotspots</div>
      ${
        clauseHotspots.length === 0
          ? `<p style="margin:0; font-size:12px; color:#66717f;">No clause hotspots yet.</p>`
          : `
            <table class="hotspot-table">
              ${clauseHotspots.map((item) => `
                <tr>
                  <td style="padding-right:10px;">Clause ${escape(item.label)}</td>
                  <td>
                    <div class="bar-track"><div class="bar-fill fill-major" style="width:${Math.max((item.value / maxClause) * 100, item.value ? 8 : 0)}%"></div></div>
                  </td>
                  <td>${item.value}</td>
                </tr>
              `).join("")}
            </table>
          `
      }
    </div>
  </div>

  <div class="analytics-grid" style="grid-template-columns:1fr;">
    <div class="analytics-card">
      <div class="analytics-title">Findings by Status</div>
      <div class="bar-stack">
        ${
          findingsByStatus.length === 0
            ? `<p style="margin:0; font-size:12px; color:#66717f;">No finding status analytics available yet.</p>`
            : findingsByStatus.map((item) => `
              <div class="bar-row">
                <div>${escape(item.label)}</div>
                <div class="bar-track"><div class="bar-fill fill-slate" style="width:${Math.max((item.value / maxFindingStatus) * 100, item.value ? 8 : 0)}%"></div></div>
                <div>${item.value}</div>
              </div>
            `).join("")
        }
      </div>
    </div>
  </div>

  <h2>3. Findings Register</h2>
  ${
    findings.length === 0
      ? `<p>No findings were recorded for this audit.</p>`
      : findings.map((finding, index) => `
        <div class="finding-card">
          <div class="finding-head">Finding F-${String(index + 1).padStart(3, "0")} · ${escape(titleCase(finding.type))}</div>
          <div class="finding-body">
            <p><span class="small-label">Clause</span>${escape(finding.clause || "-")}</p>
            <p><span class="small-label">Description</span>${escape(finding.description)}</p>
            <p><span class="small-label">Corrective action</span>${escape(finding.capa || "-")}</p>
            <p><span class="small-label">Owner</span>${escape(finding.owner || "-")}</p>
            <p><span class="small-label">Status</span><span class="badge s-${escapeClass(finding.status)}">${escape(titleCase(finding.status))}</span></p>
            <p><span class="small-label">Due date</span>${escape(finding.dueDate ? toDate(finding.dueDate) : "-")}</p>
          </div>
        </div>
      `).join("")
  }

  <h2>4. Detailed Responses</h2>
  <table class="report-table">
    <thead>
      <tr>
        <th style="width:20%;">Process</th>
        <th style="width:12%;">Clause</th>
        <th>Question</th>
        <th style="width:14%;">Status</th>
        <th style="width:20%;">Notes</th>
        <th style="width:18%;">Evidence</th>
      </tr>
    </thead>
    <tbody>
      ${
        answers.length === 0
          ? `<tr><td colspan="6">No responses recorded yet.</td></tr>`
          : answers.map((answer) => `
            <tr>
              <td>${escape(answer.process || "-")}</td>
              <td>${escape(answer.clause || "-")}</td>
              <td>${escape(answer.question || "-")}</td>
              <td><span class="badge s-${escapeClass(answer.status)}">${escape(STATUS_LABELS[answer.status] || titleCase(answer.status))}</span></td>
              <td>${escape(answer.note || "-")}</td>
              <td>${answer.evidence?.length ? answer.evidence.map((item) => `<div>${escape(item.name)}<br/><span style="color:#66717f;font-size:11px;">${escape(item.url)}</span></div>`).join("<hr style='border:none;border-top:1px solid #e3e7ed;margin:6px 0;'/>") : "-"}</td>
            </tr>
          `).join("")
      }
    </tbody>
  </table>

  <div class="footer">
    Confidential internal audit report · Prepared from the OAK Global International audit workspace · Use the browser print dialog to save or download as PDF.
  </div>

  <script>window.onload = () => setTimeout(() => window.print(), 350);</script>
</body>
</html>`;

  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Pop-up blocked. Please allow pop-ups to export the report.");
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

function toDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item) || "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

function topCounts<T>(items: T[], getKey: (item: T) => string, limit = 5) {
  return groupBy(items, getKey).slice(0, limit);
}

function escapeClass(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
}

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
