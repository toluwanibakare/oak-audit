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
  orgType?: "individual" | "organization";
  auditorName?: string;
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
  conform: "Conformant",
  major: "Major Nonconformity",
  minor: "Minor Nonconformity",
  observation: "Observation / OFI",
  pending: "Pending / Not Assessed",
  na: "Not Applicable",
};

export function exportAuditReport({
  meta,
  answers,
  findings,
  logoUrl,
}: {
  meta: ExportAuditMeta;
  answers: ExportAuditAnswer[];
  findings: ExportAuditFinding[];
  logoUrl?: string;
}) {
  const generatedAt = meta.generatedAt || new Date().toISOString().slice(0, 10);
  const total = answers.length;
  const conform = answers.filter((answer) => answer.status === "conform" || answer.status === "conformant").length;
  const major = answers.filter((answer) => answer.status === "major").length;
  const minor = answers.filter((answer) => answer.status === "minor").length;
  const observation = answers.filter((answer) => answer.status === "observation" || answer.status === "ofi").length;
  const na = answers.filter((answer) => answer.status === "na").length;
  const pending = answers.filter((answer) => answer.status === "pending" || !answer.status).length;
  
  const conformity = total ? Math.round((conform / (total - na - pending || 1)) * 100) : 0;
  
  const responseMix = [
    { label: "Conformant", value: conform, className: "s-conform" },
    { label: "Major NC", value: major, className: "s-major" },
    { label: "Minor NC", value: minor, className: "s-minor" },
    { label: "Observation / OFI", value: observation, className: "s-observation" },
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
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
    
    @page { 
      size: A4; 
      margin: 20mm; 
    }
    
    * { box-sizing: border-box; }
    body { 
      font-family: 'Manrope', 'Helvetica Neue', Arial, sans-serif; 
      color: #0f172a; 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 40px; 
      line-height: 1.6; 
      background: #f8fafc; 
    }
    
    .header-accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #0f42f5 0%, #13c653 100%);
      border-radius: 3px;
      margin-bottom: 24px;
    }
    
    h1, h2, h3, h4 { 
      font-family: 'Outfit', sans-serif; 
      color: #0f172a; 
      font-weight: 700; 
      margin: 0 0 12px; 
    }
    h1 { 
      font-size: 28px; 
      line-height: 1.2; 
      color: #0f42f5; 
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 13px;
      color: #475569;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    h2 { 
      font-size: 18px; 
      margin-top: 36px; 
      padding-bottom: 6px; 
      border-bottom: 2px solid #0f42f5; 
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      page-break-after: avoid;
    }
    
    h3 { 
      font-size: 14px; 
      margin-top: 20px; 
      color: #0f42f5; 
      border-left: 3px solid #13c653;
      padding-left: 8px;
      margin-bottom: 8px;
    }
    
    .eyebrow { 
      font-family: 'Manrope', monospace; 
      font-size: 10px; 
      font-weight: 700;
      letter-spacing: 0.15em; 
      text-transform: uppercase; 
      color: #13c653; 
      margin-bottom: 8px;
    }
    
    .cover-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 16px 0; 
      font-size: 13px; 
      background: #ffffff;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    th, td { 
      border: 1px solid #e2e8f0; 
      padding: 10px 12px; 
      text-align: left; 
      vertical-align: top; 
    }
    
    th { 
      background: #0f42f5; 
      color: #ffffff; 
      font-weight: 600; 
      font-family: 'Outfit', sans-serif;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
    }
    
    .meta-table td:first-child { 
      width: 25%; 
      background: #f1f5f9; 
      font-weight: 700; 
      color: #334155;
    }
    
    .badge { 
      display: inline-block; 
      padding: 3px 8px; 
      font-family: 'Manrope', sans-serif; 
      font-size: 10px; 
      font-weight: 700;
      text-transform: uppercase; 
      border-radius: 4px; 
      letter-spacing: 0.03em;
    }
    .b-conform { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .b-ofi, .b-observation { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .b-minor { background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; }
    .b-major { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
    .b-na { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .b-pending { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
    
    .finding-card { 
      border: 1px solid #cbd5e1; 
      border-radius: 6px;
      margin: 20px 0; 
      background: #ffffff;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
      page-break-inside: avoid;
    }
    
    .finding-header { 
      background: #0f42f5; 
      color: #ffffff; 
      padding: 12px 16px; 
      font-family: 'Outfit', sans-serif; 
      font-size: 13px; 
      font-weight: 600; 
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .finding-table { 
      margin: 0; 
      border: 0; 
      box-shadow: none;
      border-radius: 0;
    }
    
    .finding-table td { 
      border: 0; 
      border-bottom: 1px solid #f1f5f9; 
    }
    
    .finding-table td.lbl { 
      width: 25%; 
      background: #f8fafc; 
      font-weight: 700; 
      color: #475569;
      border-right: 1px solid #f1f5f9;
    }
    
    .grc-section {
      border-top: 2px solid #13c653;
      background: #fafdfb;
      padding: 0;
    }
    .grc-title {
      background: #ecfdf5;
      color: #065f46;
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #d1fae5;
    }
    .grc-table {
      margin: 0;
      border: 0;
      box-shadow: none;
      background: transparent;
    }
    .grc-table td {
      border: 0;
      border-bottom: 1px solid #e6f4ea;
    }
    .grc-table td.lbl {
      background: #f0fdf4;
      font-weight: 700;
      color: #14532d;
      border-right: 1px solid #e6f4ea;
    }
    
    .stats-table {
      width: 100%;
      margin: 16px 0;
    }
    
    .stats-table th {
      background: #0f42f5;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid #e2e8f0;
    }
    
    .stats-table td {
      border: 1px solid #e2e8f0;
      font-weight: 500;
    }
    
    .conformity-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #0f42f5 0%, #13c653 100%);
      color: #ffffff;
      padding: 20px 24px;
      border-radius: 6px;
      margin-top: 16px;
      box-shadow: 0 4px 12px rgba(15, 66, 245, 0.15);
    }
    .conformity-title {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .conformity-value {
      font-family: 'Outfit', sans-serif;
      font-size: 36px;
      font-weight: 800;
      line-height: 1;
    }
    
    .narrative-block {
      background: #ffffff;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin: 12px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .narrative-block p {
      margin: 0;
      white-space: pre-wrap;
      font-size: 13.5px;
      color: #334155;
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    .analytics-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #ffffff;
      padding: 16px;
      page-break-inside: avoid;
    }
    .analytics-title {
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0f42f5;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
    }
    
    .bar-stack {
      display: grid;
      gap: 8px;
    }
    .bar-row {
      display: grid;
      grid-template-columns: 120px 1fr 30px;
      gap: 8px;
      align-items: center;
      font-size: 12px;
    }
    .bar-track {
      height: 10px;
      overflow: hidden;
      border-radius: 999px;
      background: #e2e8f0;
    }
    .bar-fill {
      height: 100%;
      border-radius: 999px;
    }
    .fill-conform { background: #13c653; }
    .fill-major { background: #e11d48; }
    .fill-minor { background: #ea580c; }
    .fill-observation { background: #2563eb; }
    .fill-slate { background: #64748b; }
    
    .hotspot-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12px;
    }
    .hotspot-table td {
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      border: 0;
    }
    
    footer { 
      margin-top: 50px; 
      padding-top: 16px; 
      border-top: 2px solid #e2e8f0; 
      font-size: 10px; 
      color: #64748b; 
      text-align: center;
      font-family: 'Manrope', sans-serif;
      font-weight: 500;
      letter-spacing: 0.05em;
    }
    
    .confidential-stamp {
      color: #be123c;
      font-weight: 700;
      letter-spacing: 0.1em;
    }
    
    .no-findings {
      padding: 24px;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      text-align: center;
      color: #64748b;
      font-style: italic;
    }

    @media print { 
      body { background: white; padding: 0; color: #000000; } 
      .finding-card { page-break-inside: avoid; }
      .analytics-card { page-break-inside: avoid; }
      h2 { page-break-after: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        margin-top: 0;
        padding-top: 10px;
        border-top: 1px solid #e2e8f0;
      }
      body {
        padding-bottom: 60px;
      }
    }
  </style>
</head>
<body>
  <div class="header-accent-bar"></div>
  
  <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
    ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" style="height: 44px; width: auto; object-fit: contain; flex-shrink: 0;" />` : ""}
    <div>
      <div style="font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800; color: #0f172a; tracking-tight: -0.02em; line-height: 1.1;">${escape(meta.organization)}</div>
      <div class="eyebrow" style="margin-bottom: 0; color: #13c653; font-size: 10px; font-weight: 700; margin-top: 2px;">Internal Audit Report</div>
    </div>
  </div>
  
  <div class="cover-box">
    <h1>${escape(meta.auditTitle)}</h1>
    <div class="subtitle">${escape(meta.organization)} · Certified Standard ${escape(meta.standard)} Audit Report</div>
    
    <table class="meta-table" style="margin-top: 20px; box-shadow: none;">
      ${meta.orgType === "individual"
        ? `<tr><td>Full Name</td><td>${escape(meta.auditorName || meta.organization)}</td></tr>`
        : `<tr><td>Client Organization</td><td>${escape(meta.organization)}</td></tr>`
      }
      <tr><td>Audit Title</td><td>${escape(meta.auditTitle)}</td></tr>
      <tr><td>Standard Reference</td><td>${escape(meta.standard)}</td></tr>
      <tr><td>Audit Scope</td><td>${escape(meta.scope || "Entire Management System scope mapped across operational units.")}</td></tr>
      <tr><td>Audit Commenced</td><td>${escape(meta.startedAt ? toDate(meta.startedAt) : "-")}</td></tr>
      <tr><td>Audit Concluded</td><td>${escape(meta.closedAt ? toDate(meta.closedAt) : "-")}</td></tr>
      <tr><td>Document Reference</td><td>REP-${escape(meta.standard.replace(/\s+/g, "-"))}-${new Date(meta.startedAt || Date.now()).getFullYear()}</td></tr>
      <tr><td>Report Generated</td><td>${escape(generatedAt)}</td></tr>
      <tr><td>Audit Status</td><td><span class="badge ${meta.status === 'closed' ? 'b-conform' : 'b-pending'}">${escape(meta.status.replace("_", " "))}</span></td></tr>
    </table>
  </div>

  <h2>1. Executive Summary</h2>
  <p style="font-size:13.5px; color:#334155;">
    This comprehensive audit report details findings and evaluations recorded during the formal review of <strong>${escape(meta.orgType === "individual" ? (meta.auditorName || meta.organization) : meta.organization)}</strong>. 
    A total of <strong>${total}</strong> response items were assessed by the audit team to determine systemic alignment with requirements. 
    Critical gaps, procedural exceptions, and opportunities for improvement are recorded under findings and action plans below.
  </p>

  <table class="stats-table">
    <thead>
      <tr>
        <th style="width: 25%;">Compliance Classification</th>
        <th>Definition & Operational Meaning</th>
        <th style="width: 15%; text-align: center;">Assessed Count</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Major Nonconformity</strong></td>
        <td>Systemic break, absence of mandatory control implementation, or widespread failure across compliance elements.</td>
        <td style="text-align: center; font-weight: 700; color: #be123c;">${major}</td>
      </tr>
      <tr>
        <td><strong>Minor Nonconformity</strong></td>
        <td>Isolated or transactional non-compliance event that does not compromise overall process integrity.</td>
        <td style="text-align: center; font-weight: 700; color: #c2410c;">${minor}</td>
      </tr>
      <tr>
        <td><strong>Observation / OFI</strong></td>
        <td>Process conforming to standard but displaying notable room for operational refinement or proactive enhancement.</td>
        <td style="text-align: center; font-weight: 700; color: #1d4ed8;">${observation}</td>
      </tr>
      <tr>
        <td><strong>Conformant</strong></td>
        <td>Satisfactory evidence gathered showing consistent execution aligned with control parameters.</td>
        <td style="text-align: center; font-weight: 700; color: #15803d;">${conform}</td>
      </tr>
      <tr>
        <td><strong>Not Applicable (N/A)</strong></td>
        <td>Clause parameters verified as outside the operational bounds or context of the audited entity.</td>
        <td style="text-align: center; font-weight: 700; color: #475569;">${na}</td>
      </tr>
      <tr>
        <td><strong>Pending</strong></td>
        <td>Identified controls that are scheduled for assessment or pending subsequent verification.</td>
        <td style="text-align: center; font-weight: 700; color: #64748b;">${pending}</td>
      </tr>
    </tbody>
  </table>

  <div class="conformity-box">
    <div class="conformity-title">Assessed Conformity Rating</div>
    <div class="conformity-value">${conformity}%</div>
  </div>

  <h2>2. Objectives, Scope and Methodology</h2>
  
  <h3>Audit Objectives</h3>
  <div class="narrative-block">
    <p>Verify that management practices and control activities conform fully to the specified guidelines of the standard; evaluate organizational readiness, trace audit logs, and establish the operational maturity of reviewed internal processes.</p>
  </div>
  
  <h3>Scope of Audit</h3>
  <div class="narrative-block">
    <p>${escape(meta.scope || "Operational processes, documentation controls, evidence reviews, and system configurations within the declared operational boundaries.")}</p>
  </div>
  
  <h3>Methodology and Execution</h3>
  <div class="narrative-block">
    <p>Audit execution involved document analysis, structured interviews with operational leads, walk-through audits of live systems, and random statistical sampling. Findings are categorized based on criteria: Major NC — systemic control gap; Minor NC — isolated procedural lapse; Observation — room for enhancement.</p>
  </div>

  <h2>3. Analytics Summary</h2>
  
  <div class="analytics-grid">
    <div class="analytics-card">
      <div class="analytics-title">Response Breakdown</div>
      <div class="bar-stack">
        ${
          responseMix.length === 0
            ? `<p style="margin:0; font-size:12px; color:#66717f;">No response analytics available yet.</p>`
            : responseMix.map((item) => `
              <div class="bar-row">
                <div style="font-weight:600; color:#475569;">${escape(item.label)}</div>
                <div class="bar-track"><div class="bar-fill ${item.className === 's-conform' ? 'fill-conform' : item.className === 's-major' ? 'fill-major' : item.className === 's-minor' ? 'fill-minor' : 'fill-observation'}" style="width:${Math.max((item.value / maxResponse) * 100, item.value ? 8 : 0)}%"></div></div>
                <div style="font-weight:700; text-align:right;">${item.value}</div>
              </div>
            `).join("")
        }
      </div>
    </div>
    
    <div class="analytics-card">
      <div class="analytics-title">Findings by Category</div>
      <div class="bar-stack">
        ${
          findingsByType.length === 0
            ? `<p style="margin:0; font-size:12px; color:#66717f;">No findings recorded.</p>`
            : findingsByType.map((item) => `
              <div class="bar-row">
                <div style="font-weight:600; color:#475569;">${escape(item.label)}</div>
                <div class="bar-track"><div class="bar-fill fill-slate" style="width:${Math.max((item.value / maxFindingType) * 100, item.value ? 8 : 0)}%"></div></div>
                <div style="font-weight:700; text-align:right;">${item.value}</div>
              </div>
            `).join("")
        }
      </div>
    </div>

    <div class="analytics-card">
      <div class="analytics-title">Process Gaps & Hotspots</div>
      ${
        processHotspots.length === 0
          ? `<p style="margin:0; font-size:12px; color:#66717f;">No process hotspots identified.</p>`
          : `
            <table class="hotspot-table">
              ${processHotspots.map((item) => `
                <tr>
                  <td style="padding-right:10px; font-weight:600; color:#475569; width: 35%;">${escape(item.label)}</td>
                  <td style="border: 0; padding: 0;">
                    <div class="bar-track"><div class="bar-fill fill-observation" style="width:${Math.max((item.value / maxProcess) * 100, item.value ? 8 : 0)}%"></div></div>
                  </td>
                  <td style="font-weight:700; width: 12%; text-align: right;">${item.value} gap(s)</td>
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
          ? `<p style="margin:0; font-size:12px; color:#66717f;">No clause hotspots identified.</p>`
          : `
            <table class="hotspot-table">
              ${clauseHotspots.map((item) => `
                <tr>
                  <td style="padding-right:10px; font-weight:600; color:#475569; width: 35%;">Clause ${escape(item.label)}</td>
                  <td style="border: 0; padding: 0;">
                    <div class="bar-track"><div class="bar-fill fill-major" style="width:${Math.max((item.value / maxClause) * 100, item.value ? 8 : 0)}%"></div></div>
                  </td>
                  <td style="font-weight:700; width: 12%; text-align: right;">${item.value} issue(s)</td>
                </tr>
              `).join("")}
            </table>
          `
      }
    </div>
  </div>

  <h2>4. Detailed Findings Register</h2>
  ${
    findings.length === 0
      ? `<div class="no-findings">No nonconformities or opportunities for improvement were raised during this audit.</div>`
      : findings.map((finding, index) => {
          const typeLower = finding.type.toLowerCase();
          const sClass = typeLower.includes("major") ? "major" : typeLower.includes("minor") ? "minor" : "observation";
          return `
          <div class="finding-card">
            <div class="finding-header">
              <span>Finding F-${String(index + 1).padStart(3, "0")} · Clause ${escape(finding.clause || "-")}</span>
              <span class="badge b-${sClass}">${escape(titleCase(finding.type))}</span>
            </div>
            <table class="finding-table">
              <tr>
                <td class="lbl">Requirement / Scope</td>
                <td><strong>Clause ${escape(finding.clause || "-")}</strong></td>
              </tr>
              <tr>
                <td class="lbl">Operational Exception</td>
                <td>${escape(finding.description)}</td>
              </tr>
            </table>
            
            <div class="grc-section">
              <div class="grc-title">Corrective Action Plan (CAR)</div>
              <table class="grc-table">
                <tr>
                  <td class="lbl" style="width: 25%;">Assigned Action Owner</td>
                  <td><strong>${escape(finding.owner || "Management Representative (to assign)")}</strong></td>
                </tr>
                <tr>
                  <td class="lbl">Proposed Action Plan</td>
                  <td>${escape(finding.capa || "—")}</td>
                </tr>
                <tr>
                  <td class="lbl">Remediation Status</td>
                  <td><span class="badge ${finding.status === 'open' ? 'b-minor' : 'b-conform'}">${escape(titleCase(finding.status))}</span></td>
                </tr>
                <tr>
                  <td class="lbl">Target Completion Date</td>
                  <td><strong>${escape(finding.dueDate ? toDate(finding.dueDate) : "Immediate action required")}</strong></td>
                </tr>
                <tr>
                  <td class="lbl">Effectiveness Verification</td>
                  <td>Verification will be completed by the lead auditor prior to the subsequent surveillance cycle.</td>
                </tr>
              </table>
            </div>
          </div>`;
        }).join("")
  }

  <h2>5. Detailed Audit Checklist Responses</h2>
  <table class="report-table">
    <thead>
      <tr>
        <th style="width:18%;">Process Mapped</th>
        <th style="width:10%;">Clause</th>
        <th>Audited Question / Verification Item</th>
        <th style="width:15%; text-align: center;">Status</th>
        <th style="width:25%;">Evidence Reviewed & Auditor Notes</th>
      </tr>
    </thead>
    <tbody>
      ${
        answers.length === 0
          ? `<tr><td colspan="5">No checklist items recorded yet.</td></tr>`
          : answers.map((answer) => {
              const s = answer.status;
              const badgeClass = s === "conform" || s === "conformant" ? "b-conform" : s === "major" ? "b-major" : s === "minor" ? "b-minor" : s === "na" ? "b-na" : "b-pending";
              return `
              <tr>
                <td><strong>${escape(answer.process || "-")}</strong></td>
                <td>${escape(answer.clause || "-")}</td>
                <td>${escape(answer.question || "-")}</td>
                <td style="text-align: center;"><span class="badge ${badgeClass}">${escape(STATUS_LABELS[answer.status] || titleCase(answer.status))}</span></td>
                <td>
                  ${escape(answer.note || "-")}
                  ${answer.evidence?.length ? `
                    <div style="margin-top: 8px; font-size: 11px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                      <strong>Evidence Mapped:</strong><br/>
                      ${answer.evidence.map((item) => `• ${escape(item.name)}`).join("<br/>")}
                    </div>
                  ` : ""}
                </td>
              </tr>
              `;
            }).join("")
      }
    </tbody>
  </table>

  <h2>6. Sign-off</h2>
  <table class="meta-table" style="margin-top: 20px; box-shadow: none;">
    <tr>
      <td style="width: 33%; background: #ffffff;"><strong>Prepared by (Lead Auditor)</strong></td>
      <td style="width: 33%; background: #ffffff;"><strong>Reviewed by (Management Representative)</strong></td>
      <td style="width: 33%; background: #ffffff;"><strong>Approved by (Auditee Representative)</strong></td>
    </tr>
    <tr style="height: 70px;">
      <td>
        <br/><br/>
        ___________________________<br/>
        Lead Auditor Representative<br/>
        Date: ${escape(generatedAt)}
      </td>
      <td>
        <br/><br/>
        ___________________________<br/>
        Quality Assurance Director<br/>
        Date: 
      </td>
      <td>
        <br/><br/>
        ___________________________<br/>
        Executive Sponsor / Auditee<br/>
        Date: 
      </td>
    </tr>
  </table>

  <footer>
    <span class="confidential-stamp">CONFIDENTIAL</span> · Generated by ISO AUDIT MANAGEMENT PORT · Audit & Compliance Division
  </footer>

  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 400);
    };
  </script>
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

function escape(value: string) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
