import { ALL_ITEMS, ISO_GROUPS, STATUS_META, type Status } from "@/data/iso9001";

type ExportArgs = {
  meta: { organization: string; site: string; leadAuditor: string; date: string };
  statuses: Record<string, Status>;
  notes: Record<string, string>;
  findings: Record<string, string>;
};

export function exportReport({ meta, statuses, notes, findings }: ExportArgs) {
  const counts: Record<Status, number> = {
    pending: 0, conformant: 0, ofi: 0, minor: 0, major: 0, na: 0,
  };
  for (const it of ALL_ITEMS) counts[statuses[it.clause] ?? "pending"]++;

  const total = ALL_ITEMS.length;
  const denom = total - counts.pending - counts.na;
  const conformity = denom > 0 ? Math.round((counts.conformant / denom) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);

  const findingItems = ALL_ITEMS.filter((it) => {
    const s = statuses[it.clause];
    return s === "minor" || s === "major" || s === "ofi";
  });

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Audit Report — ${escape(meta.organization || "Organization")}</title>
<style>
  @page { margin: 22mm; }
  * { box-sizing: border-box; }
  body { font-family: 'IBM Plex Sans', Helvetica, Arial, sans-serif; color: #1a2436; max-width: 880px; margin: 0 auto; padding: 32px; line-height: 1.55; background: #faf6ee; }
  h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; color: #16243a; letter-spacing: -0.01em; margin: 0 0 12px; }
  h1 { font-size: 36px; font-weight: 600; }
  h2 { font-size: 22px; font-weight: 500; margin-top: 32px; padding-bottom: 6px; border-bottom: 1px solid #16243a; }
  h3 { font-size: 16px; font-weight: 600; margin-top: 18px; }
  .eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #5a6577; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0 8px; font-size: 13px; }
  th, td { border: 1px solid #c8cdd6; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #16243a; color: #faf6ee; font-weight: 500; }
  .meta td:first-child { width: 32%; background: #ece7da; font-weight: 600; }
  .badge { display: inline-block; padding: 2px 8px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; border-radius: 2px; }
  .b-conformant { background: #d8ecdb; color: #1f5230; }
  .b-ofi { background: #d8e3f0; color: #1f3f70; }
  .b-minor { background: #f6e3b3; color: #6b4a06; }
  .b-major { background: #f3cfcf; color: #7a1a1a; }
  .b-na { background: #e6e2d6; color: #5a6577; }
  .b-pending { background: #ece9df; color: #5a6577; }
  .finding { border: 1px solid #c8cdd6; margin: 14px 0; }
  .finding header { background: #16243a; color: #faf6ee; padding: 8px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
  .finding table { margin: 0; border: 0; }
  .finding td { border: 0; border-top: 1px solid #e3dfd2; }
  .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0 0; }
  .summary-grid .cell { border: 1px solid #c8cdd6; padding: 10px; }
  .summary-grid .num { font-family: 'Fraunces', Georgia, serif; font-size: 28px; font-weight: 500; }
  .accent { color: #c4671a; }
  .conformity { font-family: 'Fraunces', Georgia, serif; font-size: 48px; font-weight: 500; line-height: 1; }
  footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #c8cdd6; font-size: 11px; color: #5a6577; }
  @media print { body { background: white; padding: 0; } }
</style>
</head>
<body>
  <div class="eyebrow">Internal Audit Report · ISO 9001:2015</div>
  <h1>Quality Management System Audit<span class="accent">.</span></h1>

  <table class="meta">
    <tr><td>Organization</td><td>${escape(meta.organization || "—")}</td></tr>
    <tr><td>Site / scope</td><td>${escape(meta.site || "—")}</td></tr>
    <tr><td>Lead auditor</td><td>${escape(meta.leadAuditor || "—")}</td></tr>
    <tr><td>Audit date</td><td>${escape(meta.date || today)}</td></tr>
    <tr><td>Standard</td><td>ISO 9001:2015</td></tr>
    <tr><td>Report generated</td><td>${today}</td></tr>
  </table>

  <h2>1. Executive Summary</h2>
  <p>The audit covered ${total} ISO 9001:2015 clauses. Overall conformity rate is
    <strong>${conformity}%</strong>
    (excluding ${counts.na} clauses marked Not Applicable and ${counts.pending} not assessed).
    ${counts.major > 0 ? `<strong>${counts.major} Major nonconformity(ies)</strong> require prompt corrective action.` : "No Major nonconformities were raised."}
    ${counts.minor} Minor NC, ${counts.ofi} OFI.</p>

  <div class="summary-grid">
    ${(["conformant","ofi","minor","major","na"] as Status[]).map(s => `
      <div class="cell">
        <div class="eyebrow">${STATUS_META[s].label}</div>
        <div class="num">${counts[s]}</div>
      </div>`).join("")}
  </div>
  <p style="margin-top:16px;"><span class="eyebrow">Conformity rate</span><br/>
    <span class="conformity">${conformity}%</span></p>

  <h2>2. Clause Coverage</h2>
  <table>
    <thead><tr><th style="width:80px;">Clause</th><th>Title</th><th style="width:130px;">Status</th></tr></thead>
    <tbody>
      ${ISO_GROUPS.flatMap(g => g.items.map(it => {
        const s = statuses[it.clause] ?? "pending";
        return `<tr>
          <td><strong>${it.clause}</strong></td>
          <td>${escape(it.title)}</td>
          <td><span class="badge b-${s}">${STATUS_META[s].label}</span></td>
        </tr>`;
      })).join("")}
    </tbody>
  </table>

  <h2>3. Detailed Findings</h2>
  ${findingItems.length === 0 ? "<p>No nonconformities or opportunities for improvement were raised.</p>" : findingItems.map((it, i) => {
    const s = statuses[it.clause];
    return `<div class="finding">
      <header>Finding F-${String(i+1).padStart(3,"0")} · ${STATUS_META[s].label} · Clause ${it.clause}</header>
      <table>
        <tr><td style="width:30%;background:#f3eee2;font-weight:600;">Title</td><td>${escape(it.title)}</td></tr>
        <tr><td style="background:#f3eee2;font-weight:600;">Audit question</td><td>${escape(it.question)}</td></tr>
        <tr><td style="background:#f3eee2;font-weight:600;">Expected evidence</td><td>${escape(it.evidence)}</td></tr>
        <tr><td style="background:#f3eee2;font-weight:600;">Evidence reviewed / notes</td><td>${escape(notes[it.clause] || "—")}</td></tr>
        <tr><td style="background:#f3eee2;font-weight:600;">Finding statement</td><td>${escape(findings[it.clause] || "—")}</td></tr>
      </table>
    </div>`;
  }).join("")}

  <h2>4. Approval</h2>
  <table class="meta">
    <tr><td>Prepared by (Lead Auditor)</td><td>${escape(meta.leadAuditor || "—")} — ${today}</td></tr>
    <tr><td>Reviewed by (QMS Manager)</td><td>_________________________ Date: __________</td></tr>
    <tr><td>Acknowledged by (Auditee)</td><td>_________________________ Date: __________</td></tr>
  </table>

  <footer>Confidential — Internal Use Only · Generated by Conformia · ISO 9001:2015 audit workspace</footer>

  <script>window.onload = () => setTimeout(() => window.print(), 400);</script>
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

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}