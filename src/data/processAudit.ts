// Process-specific ISO 9001:2015 audit question bank.
// Each process has, for each ISO clause, a generic question (clause intent)
// plus specific questions tailored to how that process implements the clause.

export type ProcessKey =
  | "top_management"
  | "qaqc"
  | "qms"
  | "hr"
  | "operations"
  | "engineering"
  | "construction"
  | "sales"
  | "marketing"
  | "procurement"
  | "finance"
  | "store"
  | "ict"
  | "warehouse"
  | "project_management"
  | "admin"
  | "production"
  | "business_development";

export type ProcessMeta = {
  key: ProcessKey;
  name: string;
  scope: string;
};

export const PROCESSES: ProcessMeta[] = [
  { key: "top_management", name: "Top Management", scope: "Strategic direction, leadership, policy, resources, management review." },
  { key: "qaqc", name: "QA / QC", scope: "Inspection, testing, calibration, release of product/service, NCR control." },
  { key: "qms", name: "QMS / Quality Management", scope: "Document control, internal audit, CAPA, management of the QMS itself." },
  { key: "hr", name: "Human Resources", scope: "Recruitment, competence, training, awareness, performance, work environment." },
  { key: "operations", name: "Operations", scope: "Day-to-day operational planning, control of routine service/product delivery." },
  { key: "engineering", name: "Engineering / Design", scope: "Design & development, technical specifications, drawings, change control." },
  { key: "construction", name: "Construction", scope: "Site execution, ITPs, subcontractor control, site QA/QC, handover." },
  { key: "sales", name: "Sales", scope: "Customer requirements, contract review, quotations, order acceptance." },
  { key: "marketing", name: "Marketing", scope: "Market communication, brand, customer feedback channels, lead generation." },
  { key: "procurement", name: "Procurement", scope: "Supplier evaluation, purchasing, externally provided processes/products." },
  { key: "finance", name: "Finance & Accounts", scope: "Financial controls, costing, payments, resource availability for the QMS." },
  { key: "store", name: "Store", scope: "Issue/receipt, stock accuracy, identification, preservation of stored items." },
  { key: "ict", name: "ICT / IT", scope: "Information systems, data integrity, backups, cybersecurity, system uptime." },
  { key: "warehouse", name: "Warehouse", scope: "Receipt, storage, FIFO/FEFO, dispatch, preservation, traceability." },
  { key: "project_management", name: "Project Management", scope: "Project planning, monitoring, change, stakeholder, closeout." },
  { key: "admin", name: "Administration", scope: "Facilities, records, travel, general services, support to operations." },
  { key: "production", name: "Production / Manufacturing", scope: "Production planning, process control, identification, traceability, release." },
  { key: "business_development", name: "Business Development", scope: "Opportunity identification, partnerships, new market entry, growth planning." },
];

export type ClauseQuestionSet = {
  clause: string;
  title: string;
  generic: string[];     // Standard intent of the clause (process-agnostic)
  specific: string[];    // Tailored to this process
  evidence: string[];    // Expected evidence for this process
};

// Clauses we audit at each process. Not every process answers every clause;
// where a clause is not relevant we omit it for that process (auditor can mark N/A).
export const ISO_CLAUSES_FOR_AUDIT: { clause: string; title: string }[] = [
  { clause: "4.1", title: "Context of the organization" },
  { clause: "4.2", title: "Needs & expectations of interested parties" },
  { clause: "4.3", title: "Scope of the QMS" },
  { clause: "4.4", title: "QMS & its processes" },
  { clause: "5.1", title: "Leadership & commitment" },
  { clause: "5.2", title: "Quality policy" },
  { clause: "5.3", title: "Roles, responsibilities & authorities" },
  { clause: "6.1", title: "Risks & opportunities" },
  { clause: "6.2", title: "Quality objectives & planning" },
  { clause: "6.3", title: "Planning of changes" },
  { clause: "7.1", title: "Resources" },
  { clause: "7.2", title: "Competence" },
  { clause: "7.3", title: "Awareness" },
  { clause: "7.4", title: "Communication" },
  { clause: "7.5", title: "Documented information" },
  { clause: "8.1", title: "Operational planning & control" },
  { clause: "8.2", title: "Requirements for products & services" },
  { clause: "8.3", title: "Design & development" },
  { clause: "8.4", title: "Externally provided processes, products & services" },
  { clause: "8.5", title: "Production & service provision" },
  { clause: "8.6", title: "Release of products & services" },
  { clause: "8.7", title: "Control of nonconforming outputs" },
  { clause: "9.1", title: "Monitoring, measurement, analysis & evaluation" },
  { clause: "9.2", title: "Internal audit" },
  { clause: "9.3", title: "Management review" },
  { clause: "10.1", title: "Improvement (general)" },
  { clause: "10.2", title: "Nonconformity & corrective action" },
  { clause: "10.3", title: "Continual improvement" },
];

// Generic (process-agnostic) question templates per clause — reused for every process.
const GENERIC: Record<string, string[]> = {
  "4.1": [
    "Has the process identified the internal and external issues that affect its ability to deliver intended results?",
    "Are these issues reviewed at planned intervals and updated when they change?",
  ],
  "4.2": [
    "Have the relevant interested parties for this process and their requirements been identified?",
    "How are changes in interested-party requirements monitored and fed into the process?",
  ],
  "4.3": [
    "Does the process owner understand which activities fall within the scope of the QMS?",
  ],
  "4.4": [
    "Is the process defined (inputs, outputs, sequence, interactions, owner, KPIs)?",
    "Are KPIs measured and acted upon?",
  ],
  "5.1": [
    "How does the process owner demonstrate leadership and commitment to quality and customer focus?",
  ],
  "5.2": [
    "Do staff in the process know the quality policy and how it applies to their work?",
  ],
  "5.3": [
    "Are responsibilities and authorities within the process assigned, documented, and understood?",
  ],
  "6.1": [
    "Have process-level risks and opportunities been identified, assessed, and addressed?",
    "Is the effectiveness of risk treatments verified?",
  ],
  "6.2": [
    "Are measurable quality objectives established for the process, with action plans?",
    "Are objectives tracked and deviations acted upon?",
  ],
  "6.3": [
    "How are changes affecting the process planned, assessed, and controlled?",
  ],
  "7.1": [
    "Are the people, infrastructure, work environment, and monitoring resources required by the process provided and maintained?",
  ],
  "7.2": [
    "Has required competence for roles in the process been defined, achieved, and evaluated?",
  ],
  "7.3": [
    "Are personnel aware of the policy, relevant objectives, their contribution, and consequences of nonconformity?",
  ],
  "7.4": [
    "Have internal/external communications relevant to the process been determined (what, when, who, how) and are they effective?",
  ],
  "7.5": [
    "Is documented information needed by the process created, controlled, distributed, protected, and retained?",
    "Are only current versions in use at the point of need?",
  ],
  "8.1": [
    "Is the process planned and controlled to meet requirements (criteria, resources, controls, records)?",
  ],
  "8.2": [
    "How are customer/applicable requirements relevant to this process determined, reviewed, and changes managed?",
  ],
  "8.3": [
    "If design & development applies, is it planned, controlled, verified, and validated?",
  ],
  "8.4": [
    "Are externally provided processes/products/services used by this process controlled and providers evaluated?",
  ],
  "8.5": [
    "Are activities carried out under controlled conditions including identification, traceability, preservation, and customer property where applicable?",
  ],
  "8.6": [
    "Are planned arrangements completed, and authorized release performed before delivery of outputs from this process?",
  ],
  "8.7": [
    "How are nonconforming outputs from this process identified, segregated, and dispositioned?",
  ],
  "9.1": [
    "What is monitored/measured in the process, and how is the data analyzed and used?",
  ],
  "9.2": [
    "Has the process been internally audited per programme, and are findings closed effectively?",
  ],
  "9.3": [
    "Are inputs from this process provided to management review, and are outputs implemented?",
  ],
  "10.1": [
    "How does the process identify and act on opportunities for improvement?",
  ],
  "10.2": [
    "How are nonconformities reacted to, root-caused, corrected, and verified for effectiveness?",
  ],
  "10.3": [
    "Is there evidence of continual improvement in process KPIs over time?",
  ],
};

// Process-specific questions and evidence per clause.
// Where a clause is not listed for a process, that clause is treated as N/A by default
// (auditor can still assess it from the generic question if desired).
type ProcessClauseMap = Record<string, { specific: string[]; evidence: string[] }>;

const PROCESS_DETAILS: Record<ProcessKey, ProcessClauseMap> = {
  top_management: {
    "4.1": { specific: ["How does top management capture strategic context (PESTLE, market, regulatory)?", "Is context reviewed at the management review?"], evidence: ["Strategic plan", "PESTLE/SWOT analysis", "MR minutes referencing context"] },
    "4.2": { specific: ["Has top management approved the interested-parties register and tolerance for their requirements?"], evidence: ["Approved stakeholder register", "Board/exec minutes"] },
    "4.3": { specific: ["Has top management approved and signed the QMS scope statement?"], evidence: ["Signed scope statement", "Manual"] },
    "4.4": { specific: ["Has top management approved the process map and assigned process owners?"], evidence: ["Process map", "Owner appointment letters"] },
    "5.1": { specific: ["How does top management take accountability for QMS effectiveness?", "How are customer focus and risk-based thinking promoted from the top?"], evidence: ["MR minutes", "CEO communications", "Resource decisions", "Customer focus campaigns"] },
    "5.2": { specific: ["Has the quality policy been established, signed, communicated, and reviewed by top management?"], evidence: ["Signed quality policy", "Communication evidence"] },
    "5.3": { specific: ["Has top management defined org structure, QMS roles, and authorities?"], evidence: ["Org chart", "RACI", "Appointment letters"] },
    "6.1": { specific: ["How does top management ensure enterprise-level risks are addressed in the QMS?"], evidence: ["Enterprise risk register", "Treatment plans"] },
    "6.2": { specific: ["Has top management approved corporate quality objectives aligned to strategy?"], evidence: ["Corporate objectives", "Cascade to functions"] },
    "6.3": { specific: ["How are major organizational changes planned to preserve QMS integrity?"], evidence: ["Change-management decisions", "MR review of changes"] },
    "7.1": { specific: ["How does top management ensure adequate resources (people, infra, finance) for the QMS?"], evidence: ["Budget approvals", "Resource plans"] },
    "9.3": { specific: ["Are management reviews conducted at planned intervals covering all required inputs and producing decisions on improvement, change, and resources?"], evidence: ["MR schedule", "MR minutes with all inputs/outputs", "Action register"] },
    "10.1": { specific: ["How does top management drive an improvement culture across the organization?"], evidence: ["Improvement programmes", "Strategic improvement projects"] },
    "10.3": { specific: ["What evidence shows continual improvement at the strategic level (KPIs trending up over time)?"], evidence: ["Trend dashboards", "Year-on-year KPI reports"] },
  },

  qaqc: {
    "4.4": { specific: ["Is the QA/QC process defined with inputs, outputs, controls, and KPIs?"], evidence: ["QA/QC procedure", "Process map"] },
    "5.3": { specific: ["Are QA/QC inspector authorities (accept/reject, hold, release) defined?"], evidence: ["Job descriptions", "Authority matrix"] },
    "6.1": { specific: ["What inspection-escape and product-quality risks are identified and treated?"], evidence: ["Quality risk register"] },
    "6.2": { specific: ["Are QC objectives (defect rate, FTQ, escape rate) set and tracked?"], evidence: ["KPI dashboard"] },
    "7.1": { specific: ["Are calibrated monitoring and measuring resources available, identified, and protected?", "Is calibration traceable to national/international standards?"], evidence: ["Calibration register", "Calibration certificates", "Verification records"] },
    "7.2": { specific: ["Are inspectors qualified (e.g., NDT level, IPC, welding inspector) and competence verified?"], evidence: ["Inspector qualifications", "Competency matrix"] },
    "7.5": { specific: ["Are inspection plans, ITPs, checklists, and acceptance criteria controlled and at point of use?"], evidence: ["ITPs", "Inspection forms (current rev)"] },
    "8.1": { specific: ["Are inspection and test plans planned with the process, including hold/witness points?"], evidence: ["ITP", "Quality plan"] },
    "8.4": { specific: ["Is incoming inspection performed per defined criteria and records kept?"], evidence: ["Incoming inspection records", "Material certs"] },
    "8.5": { specific: ["Is in-process inspection performed and recorded?", "Is identification of inspection status (accepted/hold/rejected) maintained?"], evidence: ["In-process records", "Tags/labels"] },
    "8.6": { specific: ["Is final inspection completed and authorized release evidenced before delivery?", "Are concessions/waivers controlled?"], evidence: ["Final inspection reports", "Release notes", "Concession log"] },
    "8.7": { specific: ["Is nonconforming product identified, segregated, dispositioned, and customer notified when required?"], evidence: ["NCR log", "Segregation area photos", "Disposition records"] },
    "9.1": { specific: ["Are QC data (defect Pareto, FTQ, escape rate) analyzed and acted upon?"], evidence: ["QC reports", "Trend charts"] },
    "10.2": { specific: ["Is root-cause analysis performed for recurring defects, with effectiveness verified?"], evidence: ["CAPA records", "RCA forms (5-Why/Fishbone)"] },
  },

  qms: {
    "4.3": { specific: ["Is the QMS scope documented, justified, and current?"], evidence: ["Scope statement"] },
    "4.4": { specific: ["Is the process map maintained, with owners, KPIs, and interactions defined?"], evidence: ["Process map", "KPI list"] },
    "5.2": { specific: ["Is the quality policy controlled, communicated, and periodically reviewed?"], evidence: ["Controlled policy", "Comms log"] },
    "6.1": { specific: ["Is there a QMS-level risk methodology applied consistently across processes?"], evidence: ["Risk methodology", "Consolidated risk register"] },
    "6.2": { specific: ["Are quality objectives consolidated and reported QMS-wide?"], evidence: ["Objectives dashboard"] },
    "7.5": { specific: ["Is documented information controlled (creation, approval, distribution, version, retention, protection, disposal)?", "Is the master document list current and accessible?"], evidence: ["Document control procedure", "Master list", "Retention schedule"] },
    "9.1": { specific: ["Is QMS performance data collated and analyzed for management review?"], evidence: ["MR pack", "KPI dashboard"] },
    "9.2": { specific: ["Is the internal audit programme planned per importance/risk and prior results?", "Are auditors competent and independent of the area audited?", "Are findings closed within agreed timelines?"], evidence: ["Audit programme", "Auditor competence records", "Audit reports", "CAPA closure"] },
    "9.3": { specific: ["Does the QMS team facilitate management reviews with all required inputs/outputs?"], evidence: ["MR agenda", "Minutes", "Action tracker"] },
    "10.1": { specific: ["Is there a system to capture, prioritize, and action improvement opportunities?"], evidence: ["Improvement register"] },
    "10.2": { specific: ["Is the CAPA system effective — issues recur less, effectiveness verified, learnings shared?"], evidence: ["CAPA log", "Effectiveness checks", "Lessons-learned communications"] },
    "10.3": { specific: ["Is QMS suitability, adequacy, and effectiveness continually improved (evidenced over multiple cycles)?"], evidence: ["Year-over-year KPI improvement", "Maturity assessments"] },
  },

  hr: {
    "4.2": { specific: ["Are employee/union/regulator requirements relevant to HR identified and met?"], evidence: ["Stakeholder register", "Labour-law register"] },
    "5.3": { specific: ["Are job descriptions and authorities documented, signed, and current for all QMS roles?"], evidence: ["Approved JDs", "Authority matrix"] },
    "6.1": { specific: ["What HR risks (turnover, key-person, competence gaps) are identified and treated?"], evidence: ["HR risk register"] },
    "6.2": { specific: ["Are HR objectives (training completion, turnover, time-to-fill) set and tracked?"], evidence: ["HR KPI dashboard"] },
    "7.1": { specific: ["Is the work environment (physical, social, psychological) suitable and monitored?"], evidence: ["Workplace assessments", "Engagement survey"] },
    "7.2": { specific: ["Is competence defined per role; gaps identified via TNA; addressed via training/hiring; evaluated for effectiveness?"], evidence: ["Competency matrix", "TNA", "Training plans", "Effectiveness evaluation"] },
    "7.3": { specific: ["Do induction and refresher programmes ensure awareness of policy, objectives, contribution, and consequences of NC?"], evidence: ["Induction records", "Awareness training records"] },
    "7.5": { specific: ["Are personnel records (contracts, training, qualifications) controlled, protected, and retained per legal requirements?"], evidence: ["Personnel files", "Access controls"] },
    "9.1": { specific: ["Are HR KPIs analyzed and reported (training effectiveness, attrition, grievances)?"], evidence: ["HR analytics reports"] },
    "10.2": { specific: ["Are HR-related NCs (e.g., expired certifications) corrected with root-cause action?"], evidence: ["CAPA on competence gaps"] },
  },

  operations: {
    "4.4": { specific: ["Is the operations process map defined with KPIs and interactions to upstream/downstream processes?"], evidence: ["Process map", "SIPOC"] },
    "6.1": { specific: ["Are operational risks (capacity, equipment, supply, safety) identified and controlled?"], evidence: ["Operations risk register"] },
    "6.2": { specific: ["Are operational objectives (OTD, throughput, OEE, quality) set and tracked?"], evidence: ["KPI dashboard"] },
    "7.1": { specific: ["Are infrastructure and utilities maintained per plan?"], evidence: ["PM schedule", "Maintenance records"] },
    "7.5": { specific: ["Are SOPs/work instructions current at point of use?"], evidence: ["SOP master list", "Shop-floor copies"] },
    "8.1": { specific: ["Are operations planned with criteria, resources, controls, and records (production/service plan)?"], evidence: ["Operations plan", "Schedule"] },
    "8.5": { specific: ["Are activities controlled (parameters, identification, traceability, preservation)?", "Is post-delivery activity (warranty, service) controlled?"], evidence: ["Process logs", "Traceability records", "Service records"] },
    "8.6": { specific: ["Is release authorized only after planned arrangements complete?"], evidence: ["Release records"] },
    "8.7": { specific: ["Are operational nonconformities identified, contained, and dispositioned?"], evidence: ["NCR log"] },
    "9.1": { specific: ["Are operational KPIs reviewed and corrective actions triggered on adverse trends?"], evidence: ["KPI reviews", "Tier meetings"] },
    "10.2": { specific: ["Are operational NCs root-caused and corrective actions verified?"], evidence: ["CAPA records"] },
  },

  engineering: {
    "6.1": { specific: ["Are technical/design risks (interface, regulatory, reliability) identified and treated?"], evidence: ["Design risk register", "DFMEA"] },
    "6.3": { specific: ["Are engineering changes (ECN/ECR) controlled with impact assessment, approval, implementation, and verification?"], evidence: ["ECN procedure", "ECN log", "Impact analyses"] },
    "7.2": { specific: ["Are engineers qualified for their discipline (e.g., chartered status, software-tool competence)?"], evidence: ["Engineer competency matrix"] },
    "7.5": { specific: ["Are drawings, specs, calculations, and models version-controlled, with obsolete revisions removed from use?"], evidence: ["PDM/PLM records", "Drawing register", "Revision history"] },
    "8.3": { specific: ["Is design & development planned with stages, reviews, verification, validation, and design transfer?", "Are inputs (functional, regulatory, customer) captured and outputs traceable to inputs?", "Are design changes controlled and the impact on already-delivered product assessed?"], evidence: ["D&D plan", "Inputs/outputs", "Review/V&V records", "Design change records"] },
    "8.4": { specific: ["Are externally provided design services (consultants) controlled and verified?"], evidence: ["Consultant evaluation", "Deliverable verification"] },
    "9.1": { specific: ["Are design KPIs (defects after release, ECN volume, on-time delivery) analyzed?"], evidence: ["Design KPI reports"] },
    "10.2": { specific: ["Are design-related field issues root-caused and feedback to D&D?"], evidence: ["Design CAPA", "Lessons learned database"] },
  },

  construction: {
    "6.1": { specific: ["Are site-specific HSE and quality risks identified and treated?"], evidence: ["Project risk register"] },
    "6.2": { specific: ["Are site construction quality objectives (rework target, handover timelines) defined?"], evidence: ["Project quality objectives"] },
    "7.1": { specific: ["Are site equipment, calibrated tools, and welfare facilities provided and maintained?"], evidence: ["Equipment register", "Calibration records"] },
    "7.2": { specific: ["Are welders, NDT operators, supervisors, and crane operators qualified and certifications current?"], evidence: ["Operator certifications"] },
    "7.5": { specific: ["Are IFC drawings, method statements, and ITPs at point of work and at correct revision?"], evidence: ["Site document register", "Superseded-drawing log"] },
    "8.1": { specific: ["Is construction planned with ITPs, hold/witness points, and acceptance criteria?"], evidence: ["Project quality plan", "ITPs", "Method statements"] },
    "8.4": { specific: ["Are subcontractors approved, monitored on site, and re-evaluated based on performance?"], evidence: ["ASL", "Subcontractor performance reports", "Site surveillance"] },
    "8.5": { specific: ["Are activities controlled (work permits, identification, material traceability, weather/preservation)?", "Is customer-supplied material protected and accounted for?"], evidence: ["Permit-to-work", "Material traceability", "Heat numbers"] },
    "8.6": { specific: ["Are inspection releases (checksheets, NDT, hydrotest) signed before next stage?"], evidence: ["Signed-off ITP records"] },
    "8.7": { specific: ["Are site NCRs raised, dispositioned, and rework/re-inspection recorded?"], evidence: ["Site NCR log"] },
    "9.1": { specific: ["Are construction KPIs (rework rate, NCR ageing, schedule adherence) reported?"], evidence: ["Site quality reports"] },
    "10.2": { specific: ["Are recurring site defects root-caused and corrective actions implemented?"], evidence: ["Site CAPA"] },
  },

  sales: {
    "4.2": { specific: ["Are customer requirements (statutory, contractual, implied) captured and reviewed?"], evidence: ["Customer requirement register"] },
    "6.1": { specific: ["Are sales risks (credit, demand, contract terms) identified and treated?"], evidence: ["Sales risk register"] },
    "6.2": { specific: ["Are sales objectives (revenue, on-time quote, win-rate, customer satisfaction) set and tracked?"], evidence: ["Sales KPIs"] },
    "7.5": { specific: ["Are quotes, contracts, and order acknowledgements controlled and retained?"], evidence: ["CRM records", "Contract files"] },
    "8.2": { specific: ["Is contract review performed before commitment to confirm capability to meet requirements?", "Are amendments to orders captured, agreed, and communicated to all affected functions?"], evidence: ["Contract review form", "Order change records", "Internal handover notes"] },
    "8.7": { specific: ["Are customer complaints captured, classified, and routed for resolution?"], evidence: ["Complaints register"] },
    "9.1": { specific: ["Is customer satisfaction monitored (surveys, NPS, complaints, returns) and acted upon?"], evidence: ["Survey results", "Trend reports"] },
    "10.2": { specific: ["Are complaints root-caused and corrective action effectiveness verified?"], evidence: ["Complaint CAPA"] },
  },

  marketing: {
    "4.1": { specific: ["Is market context (competitors, trends, regulation) monitored and informing strategy?"], evidence: ["Market analyses"] },
    "4.2": { specific: ["Are customer/regulator/advertising-standard requirements identified for marketing communications?"], evidence: ["Compliance checklist for collateral"] },
    "6.2": { specific: ["Are marketing objectives (lead gen, brand, conversion) set and tracked?"], evidence: ["Marketing KPIs"] },
    "7.4": { specific: ["Is external communication accurate, approved, and aligned to product reality?"], evidence: ["Approval workflow", "Style/brand guidelines"] },
    "7.5": { specific: ["Are marketing assets version-controlled and obsolete material withdrawn?"], evidence: ["DAM/asset library", "Withdrawal records"] },
    "8.2": { specific: ["Are claims made in marketing collateral verifiable and aligned to product specification?"], evidence: ["Claims substantiation"] },
    "9.1": { specific: ["Are campaign performance and customer feedback analyzed?"], evidence: ["Campaign reports"] },
    "10.1": { specific: ["How are marketing improvements identified and implemented?"], evidence: ["Improvement log"] },
  },

  procurement: {
    "6.1": { specific: ["Are supply-chain risks (single-source, geo-political, lead time) identified and treated?"], evidence: ["Supply risk register"] },
    "6.2": { specific: ["Are procurement objectives (savings, OTIF supplier, supplier quality) set and tracked?"], evidence: ["Procurement KPIs"] },
    "7.5": { specific: ["Are POs, supplier agreements, and approval records controlled and retained?"], evidence: ["PO files", "Supplier contracts"] },
    "8.4": { specific: ["Are external providers selected, evaluated, monitored, and re-evaluated against defined criteria?", "Is the type and extent of control over external providers determined based on risk and impact?", "Do POs clearly state requirements (specs, acceptance, statutory, qualification of personnel)?"], evidence: ["Approved supplier list", "Evaluation criteria & scores", "Re-evaluation cycle records", "PO templates", "Supplier scorecards"] },
    "8.7": { specific: ["Are nonconforming purchases handled (return, rework, deviation) and supplier scored accordingly?"], evidence: ["Supplier NCR records"] },
    "9.1": { specific: ["Is supplier performance reviewed (quality, OTD, cost) on a defined cycle?"], evidence: ["Supplier scorecards", "Review minutes"] },
    "10.2": { specific: ["Are supplier-driven nonconformities driving corrective action and removal from ASL when warranted?"], evidence: ["CAPA on suppliers", "ASL change log"] },
  },

  finance: {
    "5.1": { specific: ["Does Finance support QMS by ensuring resources are budgeted and approved?"], evidence: ["Budget approval for QMS activities"] },
    "6.1": { specific: ["Are financial risks (FX, liquidity, credit, fraud) identified and controlled?"], evidence: ["Financial risk register", "Internal control matrix"] },
    "7.1": { specific: ["Are financial resources for the QMS (training, calibration, audits, software) available when needed?"], evidence: ["Budget vs actual for QMS items"] },
    "7.2": { specific: ["Is finance staff competence (qualifications, CPD) maintained?"], evidence: ["CPA/ACCA certs", "CPD logs"] },
    "7.5": { specific: ["Are financial records controlled, protected, and retained per legal requirements?"], evidence: ["Records retention schedule", "Access controls"] },
    "8.4": { specific: ["Are payments to suppliers controlled with segregation of duties?"], evidence: ["Payment authorization matrix"] },
    "9.1": { specific: ["Are financial KPIs and cost-of-quality analyzed?"], evidence: ["COQ reports", "Variance analyses"] },
    "10.2": { specific: ["Are audit findings (internal/external) on financial controls corrected?"], evidence: ["Audit CAPA"] },
  },

  store: {
    "7.1": { specific: ["Are storage facilities (racks, bins, environment) suitable for items stored?"], evidence: ["Store layout", "Environmental monitoring"] },
    "7.5": { specific: ["Are GRNs, issue notes, and stock records controlled and retained?"], evidence: ["GRN files", "Issue records"] },
    "8.5": { specific: ["Are items identified, traceable (batch/serial), and preserved (handling, packaging, contamination control)?", "Are FIFO/FEFO and shelf-life rules enforced?", "Are customer-supplied items segregated and identified?"], evidence: ["Bin tags", "Batch records", "Shelf-life log", "Customer property log"] },
    "8.7": { specific: ["Are damaged/expired items segregated and dispositioned?"], evidence: ["Quarantine area", "Disposition records"] },
    "9.1": { specific: ["Is stock accuracy measured (cycle counts) and acted upon?"], evidence: ["Cycle-count results", "Variance investigation"] },
    "10.2": { specific: ["Are recurring stock discrepancies root-caused and corrected?"], evidence: ["Store CAPA"] },
  },

  ict: {
    "4.2": { specific: ["Are user, regulatory (data protection), and security-standard requirements identified?"], evidence: ["Compliance register (e.g., GDPR, ISO 27001 if applicable)"] },
    "6.1": { specific: ["Are ICT risks (cyber, availability, data integrity, vendor lock-in) identified and treated?"], evidence: ["ICT risk register", "BIA"] },
    "6.2": { specific: ["Are ICT objectives (uptime, MTTR, ticket SLA, backup success) set and tracked?"], evidence: ["ICT KPI dashboard"] },
    "6.3": { specific: ["Are changes to ICT systems controlled (CAB, testing, rollback)?"], evidence: ["Change records", "CAB minutes"] },
    "7.1": { specific: ["Is infrastructure (servers, network, endpoints) maintained and monitored?"], evidence: ["Infrastructure inventory", "Monitoring dashboards"] },
    "7.5": { specific: ["Is documented information protected (access control, encryption, backup, disaster recovery, retention)?", "Are backups tested and restorable?"], evidence: ["Backup logs", "Restore-test records", "Access reviews"] },
    "8.1": { specific: ["Are IT services planned and delivered with SLAs and capacity controls?"], evidence: ["SLAs", "Capacity reports"] },
    "8.7": { specific: ["Are incidents/outages handled and root-caused?"], evidence: ["Incident log", "RCA reports"] },
    "9.1": { specific: ["Are ICT KPIs (availability, MTTR, ticket volume) analyzed?"], evidence: ["Service reports"] },
    "10.2": { specific: ["Is incident root-cause analysis driving permanent fixes?"], evidence: ["Problem records"] },
  },

  warehouse: {
    "7.1": { specific: ["Are MHE (forklifts, racking) inspected and maintained?"], evidence: ["MHE inspection logs"] },
    "7.5": { specific: ["Are receiving, put-away, picking, and dispatch records controlled?"], evidence: ["WMS records"] },
    "8.4": { specific: ["Is incoming receipt verified against PO and supplier docs before put-away?"], evidence: ["GRN with inspection result"] },
    "8.5": { specific: ["Are items identified, traceable, preserved, and rotated per FIFO/FEFO?", "Is customer property handled and recorded separately?"], evidence: ["Location/bin labels", "Batch traceability", "Customer property log"] },
    "8.6": { specific: ["Are dispatches checked against pick lists/customer orders before release?"], evidence: ["Dispatch checklist", "PoD"] },
    "8.7": { specific: ["Are damaged/short/over receipts and dispatch errors handled and recorded?"], evidence: ["Discrepancy log"] },
    "9.1": { specific: ["Are warehouse KPIs (inventory accuracy, dispatch OTIF, damage rate) analyzed?"], evidence: ["Warehouse KPI reports"] },
    "10.2": { specific: ["Are recurring discrepancies/damages root-caused?"], evidence: ["Warehouse CAPA"] },
  },

  project_management: {
    "4.2": { specific: ["Are project stakeholders (client, regulator, partners) and their requirements identified and managed?"], evidence: ["Stakeholder register", "RAM"] },
    "5.3": { specific: ["Are project roles, authorities, and reporting lines defined?"], evidence: ["Project org chart", "RACI"] },
    "6.1": { specific: ["Are project risks identified, quantified, and tracked through closure?"], evidence: ["Project risk register"] },
    "6.2": { specific: ["Are project objectives (cost, schedule, quality, safety) defined with KPIs?"], evidence: ["Project KPIs", "Progress reports"] },
    "6.3": { specific: ["Is project change controlled (change request, impact, approval, baseline update)?"], evidence: ["Change-control log"] },
    "7.5": { specific: ["Is project documentation (PEP, schedule, registers, MOMs) controlled and retained?"], evidence: ["Project document register"] },
    "8.1": { specific: ["Is the project planned (PEP, WBS, schedule, quality plan, communications plan)?"], evidence: ["PEP", "Schedule", "QMS plan"] },
    "8.5": { specific: ["Is project execution controlled with progress monitoring and earned-value or equivalent?"], evidence: ["Progress reports", "EVM data"] },
    "8.6": { specific: ["Is handover/closeout performed with acceptance criteria met and documentation transferred?"], evidence: ["Handover certificate", "Closeout report"] },
    "9.1": { specific: ["Are project performance reviews conducted and reported?"], evidence: ["Steering committee minutes"] },
    "10.1": { specific: ["Are lessons learned captured and shared across projects?"], evidence: ["Lessons-learned register"] },
    "10.2": { specific: ["Are project NCs and incidents root-caused and corrective actions verified?"], evidence: ["Project CAPA"] },
  },

  admin: {
    "6.2": { specific: ["Are general administration and facility objectives set and monitored?"], evidence: ["Admin KPIs"] },
    "7.1": { specific: ["Are facilities (offices, utilities, cleanliness, security) suitable and maintained?"], evidence: ["Facility maintenance plan", "Cleaning schedule"] },
    "7.4": { specific: ["Are internal communications (notices, intranet, email distribution lists) effective?"], evidence: ["Communications matrix"] },
    "7.5": { specific: ["Are general records (visitor logs, travel, asset register) controlled?"], evidence: ["Records inventory"] },
    "8.4": { specific: ["Are facility/admin service providers (cleaning, security, catering) evaluated?"], evidence: ["Vendor evaluations"] },
    "9.1": { specific: ["Are admin KPIs (facility downtime, complaint resolution) tracked?"], evidence: ["Admin reports"] },
    "10.2": { specific: ["Are admin issues root-caused and corrective actions taken?"], evidence: ["Admin CAPA"] },
  },

  production: {
    "4.4": { specific: ["Is the production process defined with inputs, outputs, controls, and KPIs (OEE, FTQ, OTD)?"], evidence: ["Process map", "Control plan"] },
    "6.1": { specific: ["Are production risks (equipment failure, quality escape, safety) identified and treated (PFMEA)?"], evidence: ["PFMEA", "Risk register"] },
    "6.2": { specific: ["Are production objectives (yield, scrap, rework, OEE) set and tracked?"], evidence: ["Production KPI dashboard"] },
    "7.1": { specific: ["Are equipment, tooling, and utilities maintained per PM plan?", "Is process validation maintained for special processes?"], evidence: ["PM records", "Validation records (welding, heat treat, etc.)"] },
    "7.2": { specific: ["Are operators qualified for special processes (welding, soldering, NDT) and currency maintained?"], evidence: ["Operator qualifications"] },
    "7.5": { specific: ["Are work instructions, drawings, and control plans at the workstation at correct revision?"], evidence: ["Workstation document audits"] },
    "8.1": { specific: ["Is production planned with capacity, materials, tooling, and quality controls?"], evidence: ["Production plan", "Schedule"] },
    "8.5": { specific: ["Are activities controlled (process parameters monitored, identification, traceability, preservation)?", "Is post-delivery (warranty/field service) feedback captured?"], evidence: ["Process logs", "Traceability records", "Warranty data"] },
    "8.6": { specific: ["Is product released only after planned arrangements (final inspection) complete?"], evidence: ["Release records"] },
    "8.7": { specific: ["Is nonconforming product identified, segregated, and dispositioned (rework/scrap/concession)?"], evidence: ["NCR log", "Quarantine area"] },
    "9.1": { specific: ["Are production KPIs analyzed and corrective actions triggered on adverse trends?"], evidence: ["KPI reviews"] },
    "10.2": { specific: ["Are recurring production issues root-caused (5-Why/Ishikawa) and effectiveness verified?"], evidence: ["CAPA records"] },
    "10.3": { specific: ["Is there evidence of continual improvement (Kaizen, Six-Sigma projects) with measured benefits?"], evidence: ["Improvement project register"] },
  },

  business_development: {
    "4.1": { specific: ["Is market and competitive context analyzed to inform BD strategy?"], evidence: ["Market intelligence reports"] },
    "4.2": { specific: ["Are prospect/partner/regulatory requirements identified for new opportunities?"], evidence: ["Opportunity assessment template"] },
    "6.1": { specific: ["Are BD risks (entry, partner, regulatory, reputational) assessed before commitment?"], evidence: ["Opportunity risk assessment"] },
    "6.2": { specific: ["Are BD objectives (pipeline, conversion, new-market revenue) set and tracked?"], evidence: ["BD KPIs"] },
    "7.5": { specific: ["Are opportunity files, NDAs, MoUs, and partnership agreements controlled?"], evidence: ["BD opportunity register"] },
    "8.2": { specific: ["Is feasibility/capability reviewed before committing to a new opportunity (gate review)?"], evidence: ["Bid/no-bid records", "Gate review minutes"] },
    "8.4": { specific: ["Are partners/agents evaluated for capability, integrity, and compliance?"], evidence: ["Partner due diligence"] },
    "9.1": { specific: ["Are BD pipeline and win/loss analyzed?"], evidence: ["Pipeline reports", "Win/loss reviews"] },
    "10.1": { specific: ["Are improvement opportunities from win/loss fed back to product, sales, and operations?"], evidence: ["Lessons-learned communications"] },
  },
};

export function getQuestionsForProcess(key: ProcessKey): ClauseQuestionSet[] {
  const details = PROCESS_DETAILS[key];
  return ISO_CLAUSES_FOR_AUDIT
    .filter((c) => details[c.clause] !== undefined)
    .map((c) => ({
      clause: c.clause,
      title: c.title,
      generic: GENERIC[c.clause] ?? [],
      specific: details[c.clause].specific,
      evidence: details[c.clause].evidence,
    }));
}

export function getAllProcessQuestions(): Record<ProcessKey, ClauseQuestionSet[]> {
  return PROCESSES.reduce((acc, p) => {
    acc[p.key] = getQuestionsForProcess(p.key);
    return acc;
  }, {} as Record<ProcessKey, ClauseQuestionSet[]>);
}
