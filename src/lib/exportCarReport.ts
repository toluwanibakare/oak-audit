export type CarMeta = {
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

export type CarFinding = {
  id: string;
  clause: string | null;
  type: string;
  description: string;
  capa: string | null;
  owner: string | null;
  due_date: string | null;
  status: string;
  root_cause: string | null;
  created_at: string;
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

function toDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-NG", { dateStyle: "medium" });
}

function escape(value: string | null | undefined) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateCarReportHtml({
  meta,
  findings,
  processMap,
}: {
  meta: CarMeta;
  findings: CarFinding[];
  processMap: Record<string, string>;
}) {
  const generatedAt = meta.generatedAt || new Date().toISOString().slice(0, 10);
  const auditorLabel = meta.orgType === "individual" ? "Full Name" : "Client Organization";
  const auditorVal = meta.orgType === "individual" ? (meta.auditorName || meta.organization) : meta.organization;

  const findingsHtml = findings.length === 0
    ? `<div class="no-findings">No nonconformities or corrective actions were raised during this audit. All checked items were conforming.</div>`
    : findings.map((finding, index) => {
        const fMeta = parseFindingMeta(finding.root_cause);
        const procName = fMeta?.processId ? (processMap[fMeta.processId] || "-") : "-";
        
        const isMajor = finding.type === "major";
        const isMinor = finding.type === "minor";
        const isObs = finding.type === "observation";

        const correction = fMeta?.correction || "-";
        const rootCauseText = fMeta?.rootCauseText || "-";

        return `
        <div class="car-document">
          <div class="car-header">
            <div>
              <div class="car-eyebrow">Collective Action Report (CAR)</div>
              <h2 class="car-title">Finding No.: CAR-${String(index + 1).padStart(3, "0")}</h2>
            </div>
            <div class="car-date">Date Raised: ${toDate(finding.created_at)}</div>
          </div>
          
          <table class="car-info-table">
            <tr>
              <td class="lbl">Audit Reference</td>
              <td><strong>${escape(meta.auditTitle)}</strong></td>
              <td class="lbl">Auditor / Lead</td>
              <td>${escape(auditorVal)}</td>
            </tr>
            <tr>
              <td class="lbl">Auditee / Department</td>
              <td><strong>${escape(procName)}</strong></td>
              <td class="lbl">Target Closure Date</td>
              <td><strong>${toDate(finding.due_date)}</strong></td>
            </tr>
          </table>

          <div class="car-section">
            <div class="sec-title">1. Statement of Audit Finding</div>
            <div class="sec-content">
              <p>${escape(finding.description)}</p>
            </div>
          </div>

          <div class="car-section">
            <div class="sec-title">2. Applicable ISO Standard Clause</div>
            <div class="sec-content">
              <p>Clause ${escape(finding.clause || fMeta?.qRef || "-")} of Standard ${escape(meta.standard.toUpperCase())}</p>
            </div>
          </div>

          <div class="car-section">
            <div class="sec-title">3. Finding Classification</div>
            <div class="sec-content flex-row">
              <label><input type="checkbox" disabled ${isMajor ? "checked" : ""} /> Major Non-Conformity</label>
              <label><input type="checkbox" disabled ${isMinor ? "checked" : ""} /> Minor Non-Conformity</label>
              <label><input type="checkbox" disabled ${isObs ? "checked" : ""} /> Observation / Opportunity</label>
            </div>
          </div>

          <div class="car-section">
            <div class="sec-title">4. Immediate Corrections (Containment Actions)</div>
            <div class="sec-content">
              <p>${escape(correction)}</p>
            </div>
          </div>

          <div class="car-section">
            <div class="sec-title">5. Root Cause Analysis</div>
            <div class="sec-content">
              <p>${escape(rootCauseText)}</p>
            </div>
          </div>

          <div class="car-section">
            <div class="sec-title">6. Corrective Actions</div>
            <div class="sec-content">
              <p>${escape(finding.capa || "-")}</p>
            </div>
          </div>

          <div class="car-section">
            <div class="sec-title">7. Corrective Action Plan Details</div>
            <table class="car-grid">
              <thead>
                <tr>
                  <th>Corrective Action Item</th>
                  <th style="width: 25%;">Responsible Person</th>
                  <th style="width: 20%;">Target Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${escape(finding.capa || "-")}</td>
                  <td>${escape(finding.owner || "-")}</td>
                  <td>${toDate(finding.due_date)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="car-section">
            <div class="sec-title">8. Evaluation of Effectiveness of Actions</div>
            <table class="car-grid">
              <thead>
                <tr>
                  <th>Effectiveness Evaluation Method</th>
                  <th style="width: 20%;">Date Verified</th>
                  <th style="width: 25%;">Result / Verification Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Verification will be completed by the lead auditor prior to the subsequent surveillance cycle.</td>
                  <td>${finding.status === "closed" ? toDate(finding.created_at) : "-"}</td>
                  <td>Status: <span class="badge ${finding.status === 'closed' ? 'b-conform' : 'b-minor'}">${escape(finding.status.toUpperCase())}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="car-section">
            <div class="sec-title">9. Closure and Sign-Off</div>
            <table class="car-grid">
              <tr>
                <td class="lbl" style="width: 20%;">CAR Status</td>
                <td style="width: 30%;"><strong>${escape(finding.status.replace("_", " ").toUpperCase())}</strong></td>
                <td class="lbl" style="width: 20%;">Closure Date</td>
                <td><strong>${finding.status === "closed" ? toDate(finding.created_at) : "Open / Pending Verification"}</strong></td>
              </tr>
            </table>
            
            <table class="car-grid" style="margin-top: 10px;">
              <tr>
                <td style="width: 50%;">
                  <strong>Prepared by (Auditee Representative):</strong><br/><br/>
                  Name: _______________________________<br/>
                  Signature: ___________________________<br/>
                  Date: _______________________________
                </td>
                <td>
                  <strong>Verified by (Lead Auditor):</strong><br/><br/>
                  Name: _______________________________<br/>
                  Signature: ___________________________<br/>
                  Date: _______________________________
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div class="page-break"></div>
        `;
      }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Corrective Action Report (CAR) - ${escape(meta.auditTitle)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');
    
    @page { 
      size: A4; 
      margin: 15mm; 
    }
    
    * { box-sizing: border-box; }
    body { 
      font-family: 'Manrope', sans-serif; 
      color: #1e293b; 
      background: #f8fafc; 
      padding: 20px;
      line-height: 1.5;
      font-size: 13px;
    }
    
    .car-document {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
    }
    
    .car-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f42f5;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    
    .car-eyebrow {
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
    }
    
    .car-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #0f42f5;
      margin: 4px 0 0;
    }
    
    .car-date {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-top: 6px;
    }

    .car-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .car-info-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
    }
    
    .car-info-table td.lbl {
      background: #f1f5f9;
      font-weight: 700;
      color: #475569;
      width: 20%;
    }

    .car-section {
      margin-bottom: 18px;
    }
    
    .sec-title {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      background: #e0e7ff;
      color: #312e81;
      padding: 6px 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    
    .sec-content {
      padding: 4px 8px;
    }
    
    .sec-content p {
      margin: 0;
      white-space: pre-wrap;
    }
    
    .sec-content.flex-row {
      display: flex;
      gap: 20px;
      font-weight: 600;
    }
    
    .sec-content.flex-row input {
      margin-right: 4px;
      accent-color: #0f42f5;
    }

    .car-grid {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    
    .car-grid th, .car-grid td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    
    .car-grid th {
      background: #f8fafc;
      font-weight: 700;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
    }
    
    .car-grid td.lbl {
      background: #f1f5f9;
      font-weight: 700;
      color: #475569;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 9px;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
    }
    
    .b-conform { background: #dcfce7; color: #15803d; }
    .b-minor { background: #ffedd5; color: #c2410c; }
    .b-major { background: #ffe4e6; color: #be123c; }
    
    .no-findings {
      background: #ffffff;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 50px;
      text-align: center;
      color: #64748b;
      font-style: italic;
      font-size: 15px;
      max-width: 800px;
      margin: 40px auto;
    }
    
    .page-break {
      page-break-after: always;
    }

    @media print {
      body { background: white; padding: 0; }
      .car-document { border: none; box-shadow: none; padding: 0; margin-bottom: 0; page-break-inside: avoid; }
      .page-break { page-break-after: always; }
      .page-break:last-child { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  ${findingsHtml}
  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;
}

export function exportCarReport({
  meta,
  findings,
  processMap,
}: {
  meta: CarMeta;
  findings: CarFinding[];
  processMap: Record<string, string>;
}) {
  const html = generateCarReportHtml({ meta, findings, processMap });
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Pop-up blocked. Please allow pop-ups to print the CAR report.");
    return;
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}
