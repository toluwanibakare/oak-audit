import { ALL_ITEMS, ISO_GROUPS, STATUS_META, type Status } from "@/data/iso9001";

type ExportArgs = {
  meta: {
    organization: string;
    site: string;
    leadAuditor: string;
    date: string;
    auditTeam?: string;
    reportRef?: string;
    objectives?: string;
    scope?: string;
    methodology?: string;
    conclusions?: string;
    strengths?: string;
  };
  statuses: Record<string, Status>;
  notes: Record<string, string>;
  findings: Record<string, string>;
  findingsMeta?: Record<string, {
    owner?: string;
    containment?: string;
    rootCauseDue?: string;
    correctiveActionDue?: string;
    effectivenessVerification?: string;
  }>;
};

export function exportReport({ meta, statuses, notes, findings, findingsMeta = {} }: ExportArgs) {
  const counts: Record<Status, number> = { pending: 0, conformant: 0, ofi: 0, minor: 0, major: 0, na: 0 };
  for (const it of ALL_ITEMS) counts[statuses[it.clause] ?? "pending"]++;

  const total = ALL_ITEMS.length;
  const denom = total - counts.pending - counts.na;
  const conformity = denom > 0 ? Math.round((counts.conformant / denom) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);

  const findingItems = ALL_ITEMS.filter((it) => {
    const s = statuses[it.clause];
    return s === "minor" || s === "major" || s === "ofi";
  });

  const parsedStrengths = (meta.strengths || "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.startsWith("•") || line.startsWith("-") || line.startsWith("*") ? line.slice(1).trim() : line);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ISO 9001 Audit Report — ${esc(meta.organization || "Organization")}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
    
    @page { 
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
      font-size: 30px; 
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
    
    .meta td:first-child { 
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
    .b-conformant { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .b-ofi { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
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
    
    .strengths-list {
      margin: 12px 0;
      padding-left: 20px;
    }
    .strengths-list li {
      margin-bottom: 8px;
      position: relative;
      list-style: none;
      padding-left: 8px;
      font-size: 13.5px;
      color: #334155;
    }
    .strengths-list li::before {
      content: "✓";
      color: #13c653;
      font-weight: 900;
      position: absolute;
      left: -16px;
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
  <div class="eyebrow">Internal Audit Report · ISO 9001:2015</div>
  <h1>Quality Management System Audit<span style="color:#13c653">.</span></h1>
  <div class="subtitle">Comprehensive Management System Compliance and ISO Risk Review</div>

  <table class="meta">
    <tr><td>Organization</td><td>${esc(meta.organization || "—")}</td></tr>
    <tr><td>Site / scope</td><td>${esc(meta.site || "—")}</td></tr>
    <tr><td>Lead auditor</td><td>${esc(meta.leadAuditor || "—")}</td></tr>
    <tr><td>Audit Team</td><td>${esc(meta.auditTeam || "—")}</td></tr>
    <tr><td>Report Reference</td><td>${esc(meta.reportRef || "—")}</td></tr>
    <tr><td>Audit date</td><td>${esc(meta.date || today)}</td></tr>
    <tr><td>Standard</td><td>ISO 9001:2015 Quality Management System</td></tr>
    <tr><td>Report generated</td><td>${today}</td></tr>
  </table>

  <h2>1. Executive Summary</h2>
  <p style="font-size:13.5px; color:#334155;">
    The audit evaluated <strong>${total}</strong> management system clauses under the ISO 9001:2015 standard. 
    The assessed compliance state is summarized in the table below. Major nonconformities require immediate containment and root-cause analysis, whereas minor nonconformities must be resolved within the standard QMS timelines.
  </p>

  <table class="stats-table">
    <thead>
      <tr>
        <th style="width: 25%;">Compliance Classification</th>
        <th>Definition & Criteria</th>
        <th style="width: 15%; text-align: center;">Count</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Major Nonconformity</strong></td>
        <td>A systemic failure or lack of implementation of a standard requirement, indicating a significant risk to the integrity of the QMS.</td>
        <td style="text-align: center; font-weight: 700; color: #be123c;">${counts.major}</td>
      </tr>
      <tr>
        <td><strong>Minor Nonconformity</strong></td>
        <td>An isolated lapse or minor compliance gap that does not compromise the overall systemic operation of the QMS.</td>
        <td style="text-align: center; font-weight: 700; color: #c2410c;">${counts.minor}</td>
      </tr>
      <tr>
        <td><strong>Opportunity for Improvement</strong></td>
        <td>A process area that conforms to the requirement but could be optimized to improve effectiveness or efficiency.</td>
        <td style="text-align: center; font-weight: 700; color: #1d4ed8;">${counts.ofi}</td>
      </tr>
      <tr>
        <td><strong>Conformant</strong></td>
        <td>Full conformity achieved. Adequate operational evidence supports compliance with the clause requirements.</td>
        <td style="text-align: center; font-weight: 700; color: #15803d;">${counts.conformant}</td>
      </tr>
      <tr>
        <td><strong>Not Applicable</strong></td>
        <td>The clause requirements are justified as not applicable under the declared scope of this audit.</td>
        <td style="text-align: center; font-weight: 700; color: #475569;">${counts.na}</td>
      </tr>
      <tr>
        <td><strong>Pending / Not Assessed</strong></td>
        <td>Clauses that were omitted from the current audit cycle.</td>
        <td style="text-align: center; font-weight: 700; color: #64748b;">${counts.pending}</td>
      </tr>
    </tbody>
  </table>

  <div class="conformity-box">
    <div class="conformity-title">Overall QMS Conformity Rate</div>
    <div class="conformity-value">${conformity}%</div>
  </div>

  <h2>2. Objectives, Scope and Methodology</h2>
  
  <h3>Audit Objectives</h3>
  <div class="narrative-block">
    <p>${esc(meta.objectives || "Not specified.")}</p>
  </div>
  
  <h3>Audit Scope</h3>
  <div class="narrative-block">
    <p>${esc(meta.scope || "Not specified.")}</p>
  </div>
  
  <h3>Audit Methodology</h3>
  <div class="narrative-block">
    <p>${esc(meta.methodology || "Not specified.")}</p>
  </div>

  <h2>3. QMS System & Clause Compliance Summary</h2>
  <table>
    <thead>
      <tr>
        <th style="width:80px;">Clause</th>
        <th>Title</th>
        <th style="width:160px; text-align: center;">Assessed Status</th>
      </tr>
    </thead>
    <tbody>
      ${ISO_GROUPS.flatMap(g => g.items.map(it => {
        const s = statuses[it.clause] ?? "pending";
        return `
        <tr>
          <td><strong>${it.clause}</strong></td>
          <td>${esc(it.title)}</td>
          <td style="text-align: center;"><span class="badge b-${s}">${STATUS_META[s].label}</span></td>
        </tr>`;
      })).join("")}
    </tbody>
  </table>

  <h2>4. Detailed Findings</h2>
  ${findingItems.length === 0 ? `
  <div class="no-findings">No nonconformities or opportunities for improvement were raised during this audit.</div>
  ` : findingItems.map((it, i) => {
    const s = statuses[it.clause];
    const itemMeta = findingsMeta[it.clause] || {};
    const hasISO = s === "minor" || s === "major" || s === "ofi";
    
    return `
    <div class="finding-card">
      <div class="finding-header">
        <span>Finding F-${String(i+1).padStart(3,"0")} · Clause ${it.clause}</span>
        <span class="badge b-${s}">${STATUS_META[s].label}</span>
      </div>
      <table class="finding-table">
        <tr>
          <td class="lbl">Requirement / Title</td>
          <td><strong>${esc(it.title)}</strong></td>
        </tr>
        <tr>
          <td class="lbl">Audit Question</td>
          <td>${esc(it.question)}</td>
        </tr>
        <tr>
          <td class="lbl">Evidence Reviewed / Notes</td>
          <td>${esc(notes[it.clause] || "—")}</td>
        </tr>
        <tr>
          <td class="lbl">Finding Statement</td>
          <td>${esc(findings[it.clause] || "—")}</td>
        </tr>
      </table>
      
      ${hasISO ? `
      <div class="grc-section">
        <div class="grc-title">ISO Correction & Action Plan</div>
        <table class="grc-table">
          <tr>
            <td class="lbl" style="width: 25%;">Action Owner</td>
            <td><strong>${esc(itemMeta.owner || "QMS Manager (to assign)")}</strong></td>
          </tr>
          <tr>
            <td class="lbl">Immediate Containment</td>
            <td>${esc(itemMeta.containment || "—")}</td>
          </tr>
          <tr>
            <td class="lbl">Root-Cause Analysis Due</td>
            <td>${esc(itemMeta.rootCauseDue || "—")}</td>
          </tr>
          <tr>
            <td class="lbl">Corrective Action Due</td>
            <td>${esc(itemMeta.correctiveActionDue || "—")}</td>
          </tr>
          <tr>
            <td class="lbl">Effectiveness Verification</td>
            <td>${esc(itemMeta.effectivenessVerification || "—")}</td>
          </tr>
        </table>
      </div>
      ` : ""}
    </div>`;
  }).join("")}

  <h2>5. Audit Conclusions & Strengths</h2>
  
  <h3>Audit Conclusions</h3>
  <div class="narrative-block">
    <p>${esc(meta.conclusions || "Not specified.")}</p>
  </div>
  
  <h3>Particular Strengths</h3>
  ${parsedStrengths.length === 0 ? `
  <div class="narrative-block"><p>No specific strengths highlighted.</p></div>
  ` : `
  <ul class="strengths-list">
    ${parsedStrengths.map(st => `<li>${esc(st)}</li>`).join("")}
  </ul>
  `}

  <h2>6. Approval</h2>
  <table class="meta" style="margin-top: 20px;">
    <tr>
      <td style="width: 33%;"><strong>Prepared by (Lead Auditor)</strong></td>
      <td style="width: 33%;"><strong>Reviewed by (QMS Manager)</strong></td>
      <td style="width: 33%;"><strong>Acknowledged by (Auditee)</strong></td>
    </tr>
    <tr style="height: 60px;">
      <td>
        <br/><br/>
        ___________________________<br/>
        ${esc(meta.leadAuditor || "Lead Auditor")}<br/>
        Date: ${esc(meta.date || today)}
      </td>
      <td>
        <br/><br/>
        ___________________________<br/>
        Name: <br/>
        Date: 
      </td>
      <td>
        <br/><br/>
        ___________________________<br/>
        Name: <br/>
        Date: 
      </td>
    </tr>
  </table>

  <footer>
    <span class="confidential-stamp">CONFIDENTIAL</span> · Generated by OAK Global International · ISO 9001:2015 Audit Report
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

  const w = window.open("", "_blank");
  if (!w) { 
    alert("Pop-up blocked. Please allow pop-ups to export the report."); 
    return; 
  }
  w.document.open(); 
  w.document.write(html); 
  w.document.close();
}

function esc(s: string) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}