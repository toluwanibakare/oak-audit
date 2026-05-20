// Gap Assessment data for Port Operations, Cargo Handling and Logistics Support Services.
// Covers ISO 9001:2015 (QMS), ISO 14001:2015 (EMS) and ISO 45001:2018 (OH&S).

export type GapStandard = "9001" | "14001" | "45001";

export type GapArea =
  | "context"
  | "leadership"
  | "planning"
  | "support"
  | "operation"
  | "performance"
  | "improvement";

export type GapItem = {
  id: string;
  standard: GapStandard;
  clause: string;
  area: GapArea;
  requirement: string;
  portContext: string;
  expectedEvidence: string;
};

export const AREA_META: Record<GapArea, { number: string; title: string }> = {
  context:     { number: "4",  title: "Context of the Organization" },
  leadership:  { number: "5",  title: "Leadership" },
  planning:    { number: "6",  title: "Planning" },
  support:     { number: "7",  title: "Support" },
  operation:   { number: "8",  title: "Operation" },
  performance: { number: "9",  title: "Performance Evaluation" },
  improvement: { number: "10", title: "Improvement" },
};

export const STANDARD_META: Record<GapStandard, { code: string; name: string }> = {
  "9001":  { code: "ISO 9001:2015",  name: "Quality (QMS)" },
  "14001": { code: "ISO 14001:2015", name: "Environment (EMS)" },
  "45001": { code: "ISO 45001:2018", name: "OH&S" },
};

export const MATURITY_LEVELS = [
  { value: 0, label: "0 — None",        desc: "No process, no evidence. Full gap." },
  { value: 1, label: "1 — Initial",     desc: "Ad-hoc, undocumented, person-dependent." },
  { value: 2, label: "2 — Developing",  desc: "Documented but inconsistently applied." },
  { value: 3, label: "3 — Implemented", desc: "Documented, applied, evidence available." },
  { value: 4, label: "4 — Optimized",   desc: "Implemented, monitored, continually improved." },
] as const;

export type MaturityValue = 0 | 1 | 2 | 3 | 4;

export function classifyGap(v: MaturityValue | null): "none" | "major" | "minor" | "ok" | "best" {
  if (v === null || v === undefined) return "none";
  if (v <= 1) return "major";
  if (v === 2) return "minor";
  if (v === 3) return "ok";
  return "best";
}

export const GAP_ITEMS: GapItem[] = [
  // ===== ISO 9001 =====
  { id: "9001-4.1", standard: "9001", clause: "4.1", area: "context",
    requirement: "Determine external/internal issues affecting the QMS.",
    portContext: "Port concession terms, IMO/IMDG, ISPS, customs regimes, vessel mix, terminal capacity, weather/tidal exposure, labour relations.",
    expectedEvidence: "Documented context analysis (SWOT/PESTLE) referencing port authority, shipping lines, customs, IMO/SOLAS, ISPS." },
  { id: "9001-4.2", standard: "9001", clause: "4.2", area: "context",
    requirement: "Identify interested parties and their requirements.",
    portContext: "Port authority, customs, shipping lines, BCOs/consignees, freight forwarders, hauliers, regulators (IMO, IMDG, ISPS), unions, communities.",
    expectedEvidence: "Stakeholder register with requirements (KPIs, SLAs, statutory) and review records." },
  { id: "9001-4.3", standard: "9001", clause: "4.3", area: "context",
    requirement: "Define the QMS scope.",
    portContext: "Scope must name terminals/berths, cargo types (containers, bulk, breakbulk, ro-ro, project), warehousing, inland transport, value-added services.",
    expectedEvidence: "Documented scope statement covering all sites and service lines, with justified exclusions." },
  { id: "9001-4.4", standard: "9001", clause: "4.4", area: "context",
    requirement: "QMS processes, sequence, interaction, KPIs.",
    portContext: "Vessel planning → stevedoring → yard ops → gate → warehouse → delivery; KPI per process (BMPH, dwell, truck turn time).",
    expectedEvidence: "Process map, turtle diagrams, KPI dashboards by terminal/service." },
  { id: "9001-5.1", standard: "9001", clause: "5.1", area: "leadership",
    requirement: "Top management commitment and customer focus.",
    portContext: "CEO/COO accountability for service levels to shipping lines and BCOs; customer focus via SLA performance.",
    expectedEvidence: "Signed quality policy, MR minutes, SLA reviews with shipping lines." },
  { id: "9001-5.2", standard: "9001", clause: "5.2", area: "leadership",
    requirement: "Quality policy established and communicated.",
    portContext: "Policy mentions safe, secure, on-time cargo handling; visible at gate, control tower, warehouses.",
    expectedEvidence: "Policy posters at terminals; induction records; intranet." },
  { id: "9001-5.3", standard: "9001", clause: "5.3", area: "leadership",
    requirement: "Roles, responsibilities and authorities assigned.",
    portContext: "Terminal manager, vessel planner, stevedore supervisor, yard planner, gate ops, customs liaison, HSE, security all defined.",
    expectedEvidence: "Org chart, RACI for vessel call cycle, appointment letters." },
  { id: "9001-6.1", standard: "9001", clause: "6.1", area: "planning",
    requirement: "Address risks and opportunities.",
    portContext: "Vessel delays, equipment breakdown (STS/RTG), congestion, weather, customs holds, cargo damage, fraud at gate.",
    expectedEvidence: "Risk register with mitigation, contingency berthing plans." },
  { id: "9001-6.2", standard: "9001", clause: "6.2", area: "planning",
    requirement: "Quality objectives with targets and plans.",
    portContext: "Targets for BMPH, gross/net crane productivity, truck turn time <30 min, dwell time, claim ratio <0.1%.",
    expectedEvidence: "Objective sheets with owner, target, measurement frequency." },
  { id: "9001-6.3", standard: "9001", clause: "6.3", area: "planning",
    requirement: "Manage planned changes to the QMS.",
    portContext: "New berth, new TOS release, new cargo type, automation rollout, organisational change.",
    expectedEvidence: "Change request log with impact assessment and rollback plan." },
  { id: "9001-7.1.5", standard: "9001", clause: "7.1.5", area: "support",
    requirement: "Monitoring and measuring resources fit for purpose.",
    portContext: "Weighbridges, draft survey gear, calibrated load cells, gauging tapes, OCR/ANPR at gate.",
    expectedEvidence: "Calibration certificates, verification logs, tagged equipment." },
  { id: "9001-7.2", standard: "9001", clause: "7.2", area: "support",
    requirement: "Competence of personnel.",
    portContext: "Crane operators, lashers, signalmen, tally clerks, IMDG-qualified staff, customs brokers.",
    expectedEvidence: "Competency matrix, licences (crane, forklift, IMDG), refresher training records." },
  { id: "9001-7.3", standard: "9001", clause: "7.3", area: "support",
    requirement: "Awareness of policy and contribution.",
    portContext: "Toolbox talks at shift handover; awareness of customer SLAs and damage cost.",
    expectedEvidence: "Shift briefing sheets, interview confirmation." },
  { id: "9001-7.4", standard: "9001", clause: "7.4", area: "support",
    requirement: "Internal and external communication.",
    portContext: "EDI/COPRAR/BAPLIE messages, VHF radio discipline, customer notifications, customs declarations.",
    expectedEvidence: "Comms matrix, EDI logs, radio protocol, customer bulletins." },
  { id: "9001-7.5", standard: "9001", clause: "7.5", area: "support",
    requirement: "Documented information controlled.",
    portContext: "TOS SOPs, vessel stowage plans, ITPs, B/L copies, gate passes, EIRs retained per customs/port law.",
    expectedEvidence: "Document master list, retention schedule aligned to customs/port authority." },
  { id: "9001-8.1", standard: "9001", clause: "8.1", area: "operation",
    requirement: "Operational planning and control.",
    portContext: "Vessel berthing plan, crane split, yard plan, gang allocation, equipment availability matched to demand.",
    expectedEvidence: "Pre-arrival meeting minutes, berth window plan, daily ops plan." },
  { id: "9001-8.2", standard: "9001", clause: "8.2", area: "operation",
    requirement: "Customer requirements determined and reviewed.",
    portContext: "Service contracts with shipping lines (THC, productivity guarantees), special cargo handling instructions.",
    expectedEvidence: "Signed service agreements, special-cargo handling notes (reefer, OOG, IMDG, livestock)." },
  { id: "9001-8.4", standard: "9001", clause: "8.4", area: "operation",
    requirement: "Control of external providers.",
    portContext: "Stevedoring labour pools, hauliers, lashing contractors, ship chandlers, equipment maintenance vendors.",
    expectedEvidence: "Approved vendor list, performance scorecards, audit reports." },
  { id: "9001-8.5", standard: "9001", clause: "8.5", area: "operation",
    requirement: "Production/service provision controlled with traceability.",
    portContext: "Container/cargo traceability via TOS; EIR at gate; tally sheets; reefer plug-in logs.",
    expectedEvidence: "TOS audit trail, EIR samples, reefer monitoring logs." },
  { id: "9001-8.5.3", standard: "9001", clause: "8.5.3", area: "operation",
    requirement: "Customer property protected.",
    portContext: "Cargo and containers belong to lines/BCOs; preservation against damage, theft, contamination, mis-delivery.",
    expectedEvidence: "Damage reports, CCTV retention, claims log, mis-delivery KPI." },
  { id: "9001-8.7", standard: "9001", clause: "8.7", area: "operation",
    requirement: "Control of nonconforming outputs.",
    portContext: "Damaged cargo, mis-stowed containers, wrong-gate releases, short-shipment.",
    expectedEvidence: "NCR log, hold area for damaged cargo, customer notification records." },
  { id: "9001-9.1.2", standard: "9001", clause: "9.1.2", area: "performance",
    requirement: "Customer satisfaction monitored.",
    portContext: "Shipping line surveys, BCO feedback, complaints per 1,000 moves, claim trend.",
    expectedEvidence: "Survey results, complaints register, trend analysis." },
  { id: "9001-9.2", standard: "9001", clause: "9.2", area: "performance",
    requirement: "Internal audit programme.",
    portContext: "Audits cover vessel ops, yard, gate, warehouse, customs liaison, maintenance.",
    expectedEvidence: "Annual audit plan, reports, NCR closure tracking." },
  { id: "9001-9.3", standard: "9001", clause: "9.3", area: "performance",
    requirement: "Management review.",
    portContext: "Quarterly review by terminal exec; inputs include KPI, claims, audits, customer feedback.",
    expectedEvidence: "MR minutes covering all required inputs/outputs." },
  { id: "9001-10.2", standard: "9001", clause: "10.2", area: "improvement",
    requirement: "Nonconformity and corrective action.",
    portContext: "RCA on damage events, mis-delivery, productivity shortfalls; effectiveness verification.",
    expectedEvidence: "CAPA register with RCA (5-why, fishbone), verification records." },
  { id: "9001-10.3", standard: "9001", clause: "10.3", area: "improvement",
    requirement: "Continual improvement.",
    portContext: "Productivity programmes (BMPH uplift), digitalisation (gate OCR), Kaizen events.",
    expectedEvidence: "Improvement projects with measured outcomes." },

  // ===== ISO 14001 =====
  { id: "14001-4.1", standard: "14001", clause: "4.1", area: "context",
    requirement: "Internal/external issues including environmental conditions.",
    portContext: "Coastal/estuarine sensitivity, air-quality regulation, MARPOL, ballast water, port reception facilities.",
    expectedEvidence: "Environmental context analysis referencing MARPOL, host EPA, port master plan." },
  { id: "14001-4.2", standard: "14001", clause: "4.2", area: "context",
    requirement: "Compliance obligations from interested parties.",
    portContext: "EPA permits, port environmental licence, IMO MARPOL Annexes I–VI, host community expectations.",
    expectedEvidence: "Legal register with renewal dates and ownership." },
  { id: "14001-6.1.2", standard: "14001", clause: "6.1.2", area: "planning",
    requirement: "Environmental aspects and impacts identified and evaluated.",
    portContext: "Bunker/fuel spills, dust from bulk cargo, NOx/SOx from RTGs and yard tractors, noise, ballast/bilge discharge, hazardous cargo, dredging spoil.",
    expectedEvidence: "Aspect/impact register with significance scoring per terminal and activity." },
  { id: "14001-6.1.3", standard: "14001", clause: "6.1.3", area: "planning",
    requirement: "Compliance obligations determined.",
    portContext: "MARPOL, Basel, IMDG, SOLAS Ch VII, host EIA conditions, effluent and air permits.",
    expectedEvidence: "Compliance register mapped to operations and verified." },
  { id: "14001-6.2", standard: "14001", clause: "6.2", area: "planning",
    requirement: "Environmental objectives and plans.",
    portContext: "Targets: scope-1 CO2/TEU, energy/TEU, spill events = 0, dust opacity, % shore-power use, recycling rate.",
    expectedEvidence: "Objective register with KPI, baseline, target, programme." },
  { id: "14001-7.1", standard: "14001", clause: "7.1", area: "support",
    requirement: "Resources for the EMS.",
    portContext: "Spill kits at berths, oil booms, dust suppression, electrified RTGs, monitoring equipment.",
    expectedEvidence: "Asset list, inspection records, budget allocation." },
  { id: "14001-7.2", standard: "14001", clause: "7.2", area: "support",
    requirement: "Competence for environmental tasks.",
    portContext: "IMDG segregation, spill response (Tier 1), waste sorting, reefer refrigerant handling.",
    expectedEvidence: "Training records, drills, certificates." },
  { id: "14001-7.4", standard: "14001", clause: "7.4", area: "support",
    requirement: "Internal/external environmental communication.",
    portContext: "Community grievance line, port authority reporting, public sustainability disclosures.",
    expectedEvidence: "Communication matrix, grievance log, sustainability report." },
  { id: "14001-8.1", standard: "14001", clause: "8.1", area: "operation",
    requirement: "Operational controls for significant aspects.",
    portContext: "Bunkering SOP, dust suppression for bulk, IMDG segregation, waste segregation, stormwater management, idling rules.",
    expectedEvidence: "SOPs, inspection logs, photos, equipment logs." },
  { id: "14001-8.2", standard: "14001", clause: "8.2", area: "operation",
    requirement: "Emergency preparedness and response.",
    portContext: "Oil-spill (Tier 1/2), dangerous-goods fire, chemical release, dust/explosion in grain silos.",
    expectedEvidence: "ERP, drill records, MoUs with Tier-2 responders, equipment readiness." },
  { id: "14001-9.1.1", standard: "14001", clause: "9.1.1", area: "performance",
    requirement: "Monitor, measure, analyse environmental performance.",
    portContext: "Air, noise, water-quality monitoring; energy and fuel KPIs; waste tonnages.",
    expectedEvidence: "Monitoring plan, lab certificates, KPI dashboard." },
  { id: "14001-9.1.2", standard: "14001", clause: "9.1.2", area: "performance",
    requirement: "Evaluation of compliance.",
    portContext: "Periodic review against permits and MARPOL obligations.",
    expectedEvidence: "Compliance evaluation reports, action items closed." },
  { id: "14001-9.2", standard: "14001", clause: "9.2", area: "performance",
    requirement: "Internal EMS audit.",
    portContext: "Audits include yard fuelling, waste yard, IMDG store, bunker stations.",
    expectedEvidence: "Audit programme, reports, NCRs." },
  { id: "14001-10.2", standard: "14001", clause: "10.2", area: "improvement",
    requirement: "Nonconformity and corrective action.",
    portContext: "RCA on spills, exceedances, complaint events.",
    expectedEvidence: "Incident reports, RCA, CAPA, verification." },

  // ===== ISO 45001 =====
  { id: "45001-4.1", standard: "45001", clause: "4.1", area: "context",
    requirement: "Internal/external OH&S issues.",
    portContext: "High-risk environment: heavy lifting, suspended loads, working at height on ships, confined holds, night ops, heat, weather.",
    expectedEvidence: "Documented OH&S context referencing port-specific hazards." },
  { id: "45001-5.4", standard: "45001", clause: "5.4", area: "leadership",
    requirement: "Worker consultation and participation.",
    portContext: "Stevedore unions, joint H&S committee covering shifts and contractors.",
    expectedEvidence: "Committee minutes, suggestion scheme, participation in HIRA." },
  { id: "45001-6.1.2", standard: "45001", clause: "6.1.2", area: "planning",
    requirement: "Hazard identification and assessment of OH&S risks.",
    portContext: "Suspended loads/dropped objects, vehicle-pedestrian interface, ship-shore gangways, IMDG exposure, fatigue, hot work, mooring snap-back zones.",
    expectedEvidence: "HIRA per activity (vessel, yard, gate, warehouse) updated after change/incident." },
  { id: "45001-6.1.3", standard: "45001", clause: "6.1.3", area: "planning",
    requirement: "Determination of legal and other requirements.",
    portContext: "ILO C152 (occupational safety in dock work), SOLAS, ISPS, host-country OSH law.",
    expectedEvidence: "Legal register specific to dock work and dangerous goods." },
  { id: "45001-6.1.4", standard: "45001", clause: "6.1.4", area: "planning",
    requirement: "Planning to take action — hierarchy of controls.",
    portContext: "Eliminate manual lashing where possible, engineer barriers, segregate vehicle/pedestrian routes; PPE last.",
    expectedEvidence: "Control plans showing hierarchy, not PPE-only." },
  { id: "45001-6.2", standard: "45001", clause: "6.2", area: "planning",
    requirement: "OH&S objectives.",
    portContext: "TRIR, LTIFR, near-miss reporting rate, % HIRAs reviewed, % training compliance.",
    expectedEvidence: "Objective sheet with owner, baseline, target." },
  { id: "45001-7.2", standard: "45001", clause: "7.2", area: "support",
    requirement: "Competence including emergency response.",
    portContext: "Banksman, lashers, IMDG handlers, first-aiders, fire-team, rescue at height/confined space.",
    expectedEvidence: "Competency matrix with refresh frequency, certificates." },
  { id: "45001-7.3", standard: "45001", clause: "7.3", area: "support",
    requirement: "Awareness including stop-work authority.",
    portContext: "Every worker (incl. contractors) understands right and duty to stop unsafe work.",
    expectedEvidence: "Toolbox records, stop-work cards, posters." },
  { id: "45001-7.4", standard: "45001", clause: "7.4", area: "support",
    requirement: "Communication including with contractors and visitors.",
    portContext: "Contractor inductions, visitor PPE issue, multi-language signage.",
    expectedEvidence: "Induction logs, visitor register, signage audits." },
  { id: "45001-8.1.1", standard: "45001", clause: "8.1.1", area: "operation",
    requirement: "Operational planning and control.",
    portContext: "Permit-to-work for hot work, working at height, confined entry, lifting plans for heavy/critical lifts, LOTO for STS/RTG maintenance.",
    expectedEvidence: "Permits, lift plans, LOTO records." },
  { id: "45001-8.1.2", standard: "45001", clause: "8.1.2", area: "operation",
    requirement: "Eliminating hazards and reducing OH&S risks.",
    portContext: "Spreader twist-lock automation, automated mooring, electrified RTGs to reduce diesel exposure.",
    expectedEvidence: "Project files, before/after risk score." },
  { id: "45001-8.1.3", standard: "45001", clause: "8.1.3", area: "operation",
    requirement: "Management of change.",
    portContext: "New equipment (auto-stacking cranes), new cargo type, shift pattern change, new SOP.",
    expectedEvidence: "MoC register with HIRA update and training." },
  { id: "45001-8.1.4", standard: "45001", clause: "8.1.4", area: "operation",
    requirement: "Procurement incl. contractors and outsourced functions.",
    portContext: "Pre-qualification of stevedoring labour pool, hauliers, lashing crews; OH&S clauses in contracts.",
    expectedEvidence: "Contractor HSE pre-qual files, audits." },
  { id: "45001-8.2", standard: "45001", clause: "8.2", area: "operation",
    requirement: "Emergency preparedness and response.",
    portContext: "Man-overboard, dropped container, IMDG fire, mass-casualty, security incident; coordinated with port authority.",
    expectedEvidence: "ERP, drills (incl. joint with port/marine), after-action reviews." },
  { id: "45001-9.1.1", standard: "45001", clause: "9.1.1", area: "performance",
    requirement: "Monitoring, measurement, analysis.",
    portContext: "Leading (inspections, BBS observations) and lagging (TRIR, LTIFR, severity rate).",
    expectedEvidence: "Monthly HSE dashboard, trend charts." },
  { id: "45001-9.1.2", standard: "45001", clause: "9.1.2", area: "performance",
    requirement: "Evaluation of compliance.",
    portContext: "Periodic legal compliance audit incl. dock-work regulations.",
    expectedEvidence: "Compliance audit reports, action closure." },
  { id: "45001-9.2", standard: "45001", clause: "9.2", area: "performance",
    requirement: "Internal audit.",
    portContext: "Audits of vessel ops, yard, RTG/STS maintenance, contractor work, IMDG.",
    expectedEvidence: "Audit programme, reports, NCRs." },
  { id: "45001-10.2", standard: "45001", clause: "10.2", area: "improvement",
    requirement: "Incident, nonconformity and corrective action.",
    portContext: "All incidents (incl. near-miss) investigated; HIRA, controls and training updated.",
    expectedEvidence: "Incident DB with RCA, CAPA, verification, lessons-learned bulletins." },
  { id: "45001-10.3", standard: "45001", clause: "10.3", area: "improvement",
    requirement: "Continual improvement.",
    portContext: "Year-on-year reduction in TRIR, automation of high-risk tasks, behavioural-based safety programme.",
    expectedEvidence: "Improvement projects with measured OH&S outcomes." },
];

export function gapItemsByStandard(s: GapStandard | "all"): GapItem[] {
  return s === "all" ? GAP_ITEMS : GAP_ITEMS.filter((i) => i.standard === s);
}

export const GAP_STORAGE_KEY = "conformia-gap-port-v1";

export type GapEntry = {
  current: MaturityValue | null;
  target: MaturityValue | null;
  owner: string;
  due: string;
  action: string;
  evidence: string;
};

export const EMPTY_ENTRY: GapEntry = {
  current: null, target: 3, owner: "", due: "", action: "", evidence: "",
};
