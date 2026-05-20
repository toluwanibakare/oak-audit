// Auto-generated ISO 45001:2018 process audit data.
export type ProcessKey45001 =
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

export type ProcessMeta45001 = { key: ProcessKey45001; name: string; scope: string };
export const PROCESSES_45001: ProcessMeta45001[] = [
  { key: "top_management", name: "Top Management", scope: "Strategic direction, OH&S policy, leadership, worker consultation, management review." },
  { key: "qaqc", name: "QA / QC", scope: "Inspection of OH&S-critical work, calibration of OH&S monitoring devices, NCR control." },
  { key: "qms", name: "QMS / OH&S System", scope: "Document control, internal audit, CAPA, management of the OH&S system." },
  { key: "hr", name: "Human Resources", scope: "Recruitment, OH&S competence, training, awareness, fitness-for-work." },
  { key: "operations", name: "Operations", scope: "Operational control of routine activities and OH&S hazards." },
  { key: "engineering", name: "Engineering / Design", scope: "Design of safe systems of work, equipment, layouts; change control." },
  { key: "construction", name: "Construction", scope: "Site OH&S execution, permits, contractor control, site inspection." },
  { key: "sales", name: "Sales", scope: "Customer OH&S requirements in contracts, post-sale OH&S obligations." },
  { key: "marketing", name: "Marketing", scope: "OH&S messaging, campaign safety, event OH&S." },
  { key: "procurement", name: "Procurement", scope: "Supplier OH&S evaluation, OH&S requirements in POs, contractor selection." },
  { key: "finance", name: "Finance & Accounts", scope: "Resourcing OH&S programs, insurance, claims, cost-of-injury." },
  { key: "store", name: "Store", scope: "Safe storage, segregation of hazardous materials, MSDS, PPE issue." },
  { key: "ict", name: "ICT / IT", scope: "DSE/ergonomics, electrical safety, incident reporting systems." },
  { key: "warehouse", name: "Warehouse", scope: "MHE safety, racking, manual handling, traffic management." },
  { key: "project_management", name: "Project Management", scope: "OH&S planning, contractor coordination, project HSE plan." },
  { key: "admin", name: "Administration", scope: "Office OH&S, fire safety, first aid, emergency drills." },
  { key: "production", name: "Production / Manufacturing", scope: "Machine safety, LOTO, PPE, process hazards, ergonomics." },
  { key: "business_development", name: "Business Development", scope: "OH&S due diligence on new ventures, partners, markets." },
];

export const ISO_CLAUSES_45001: { clause: string; title: string }[] = [
  { clause: "4.1", title: "Context of the organization" },
  { clause: "4.2", title: "Needs & expectations of workers and other interested parties" },
  { clause: "4.3", title: "Scope of the OH&S management system" },
  { clause: "4.4", title: "OH&S management system" },
  { clause: "5.1", title: "Leadership & commitment" },
  { clause: "5.2", title: "OH&S policy" },
  { clause: "5.3", title: "Roles, responsibilities & authorities" },
  { clause: "5.4", title: "Consultation & participation of workers" },
  { clause: "6.1", title: "Actions to address risks & opportunities (incl. hazard ID, OH&S risks, legal)" },
  { clause: "6.2", title: "OH&S objectives & planning" },
  { clause: "7.1", title: "Resources" },
  { clause: "7.2", title: "Competence" },
  { clause: "7.3", title: "Awareness" },
  { clause: "7.4", title: "Communication" },
  { clause: "7.5", title: "Documented information" },
  { clause: "8.1", title: "Operational planning & control (incl. hierarchy of controls, MoC, procurement, contractors, outsourcing)" },
  { clause: "8.2", title: "Emergency preparedness & response" },
  { clause: "9.1", title: "Monitoring, measurement, analysis & performance evaluation (incl. compliance evaluation)" },
  { clause: "9.2", title: "Internal audit" },
  { clause: "9.3", title: "Management review" },
  { clause: "10.1", title: "Improvement (general)" },
  { clause: "10.2", title: "Incident, nonconformity & corrective action" },
  { clause: "10.3", title: "Continual improvement" },
];

const GENERIC_45001: Record<string, string[]> = {
  "4.1": [
    "Have internal/external issues affecting OH&S performance been identified for this process?",
    "Are these issues reviewed and updated when conditions change?",
  ],
  "4.2": [
    "Have workers and other interested parties (regulators, contractors, neighbours) and their OH&S needs been identified?",
    "Are changing legal/stakeholder needs monitored?",
  ],
  "4.3": [
    "Does the process owner understand which activities, workers, and workplaces fall within the OH&S MS scope?",
  ],
  "4.4": [
    "Is the process defined with OH&S inputs, outputs, controls, and KPIs?",
    "Are interactions with other OH&S processes managed?",
  ],
  "5.1": [
    "How does the process owner demonstrate leadership and accountability for OH&S, prevention of injury and ill health, and a culture supporting the OH&S MS?",
  ],
  "5.2": [
    "Do workers in the process know the OH&S policy commitments (safe & healthy conditions, eliminate hazards, consultation, continual improvement, legal compliance)?",
  ],
  "5.3": [
    "Are OH&S responsibilities and authorities within the process assigned, documented, and understood by workers?",
  ],
  "5.4": [
    "How are non-managerial workers consulted and enabled to participate in OH&S decisions affecting them (hazard ID, risk assessment, controls, investigation)?",
  ],
  "6.1": [
    "Has hazard identification been conducted (routine/non-routine, human factors, emergencies, changes)?",
    "Are OH&S risks and OH&S opportunities assessed and treated using the hierarchy of controls?",
    "Are applicable legal and other requirements identified, accessible, and incorporated?",
  ],
  "6.2": [
    "Are measurable OH&S objectives set with action plans (what, resources, who, when, evaluation)?",
    "Are objectives tracked and deviations actioned?",
  ],
  "7.1": [
    "Are people, infrastructure, and OH&S monitoring resources required by the process provided and maintained?",
  ],
  "7.2": [
    "Has OH&S competence (incl. for hazard ID and risk assessment) been defined, achieved, and evaluated?",
  ],
  "7.3": [
    "Are workers aware of the policy, OH&S risks they face, controls, incidents, and their right to remove themselves from imminent danger?",
  ],
  "7.4": [
    "Are internal/external OH&S communications determined (what, when, who, how) and effective?",
  ],
  "7.5": [
    "Is OH&S documented information created, controlled, distributed, protected, and retained?",
  ],
  "8.1": [
    "Are activities planned and controlled using the hierarchy of controls?",
    "Is management of change applied to planned changes that affect OH&S?",
    "Are procurement, contractors, and outsourced functions controlled for OH&S?",
  ],
  "8.2": [
    "Are emergency scenarios identified, response procedures established, drills conducted, and lessons applied?",
  ],
  "9.1": [
    "What OH&S performance is monitored/measured, how is data analyzed, and is compliance with legal/other requirements periodically evaluated?",
  ],
  "9.2": [
    "Has the process been internally audited per programme; are findings closed effectively?",
  ],
  "9.3": [
    "Are inputs from this process provided to OH&S management review and outputs implemented?",
  ],
  "10.1": [
    "How does the process identify and act on OH&S improvement opportunities?",
  ],
  "10.2": [
    "Are incidents and nonconformities reported, investigated for root cause, corrected, with effectiveness verified and lessons shared?",
  ],
  "10.3": [
    "Is there evidence of continual OH&S performance improvement over time?",
  ],
};

type ClauseDetail = { specific: string[]; evidence: string[] };
type ProcessClauseMap = Record<string, ClauseDetail>;
const PROCESS_DETAILS_45001: Record<ProcessKey45001, ProcessClauseMap> = {
  top_management: {
    "4.1": { specific: ["How does top management capture OH&S strategic context (regulatory landscape, industry incidents, worker demographics)?"], evidence: ["Strategic plan", "OH&S context analysis", "MR minutes"] },
    "4.2": { specific: ["Has top management approved the worker/interested-parties register and legal-needs analysis?"], evidence: ["Approved stakeholder & legal register"] },
    "4.3": { specific: ["Has top management approved the OH&S MS scope (sites, activities, workers including contractors)?"], evidence: ["Signed scope statement"] },
    "5.1": { specific: ["How does top management take overall responsibility for prevention of work-related injury & ill health, and for a safe & healthy workplace?", "How are sufficient resources, worker consultation, and a positive OH&S culture promoted?"], evidence: ["MR minutes", "Resource decisions", "Safety leadership tours", "Culture survey"] },
    "5.2": { specific: ["Has the OH&S policy been established, signed, communicated, and reviewed by top management with all required commitments?"], evidence: ["Signed OH&S policy", "Communication evidence"] },
    "5.3": { specific: ["Has top management defined OH&S roles, responsibilities, accountabilities, and authorities at all levels?"], evidence: ["Org chart", "RACI", "Appointment letters"] },
    "5.4": { specific: ["How does top management ensure consultation and participation of workers (and worker representatives) at all applicable levels and functions?"], evidence: ["Safety committee charter", "Minutes", "Worker rep elections"] },
    "6.1": { specific: ["How does top management ensure enterprise-level OH&S risks (catastrophic hazards, legal exposure) are addressed?"], evidence: ["Enterprise OH&S risk register"] },
    "6.2": { specific: ["Has top management approved OH&S objectives aligned with the policy?"], evidence: ["Approved OH&S objectives"] },
    "9.3": { specific: ["Are OH&S management reviews conducted at planned intervals covering all 9.3 inputs (incidents, NC, audit results, consultation, legal, risks/opportunities) and producing decisions?"], evidence: ["MR schedule", "MR minutes", "Action register"] },
    "10.1": { specific: ["How does top management drive OH&S improvement culture across the organization?"], evidence: ["Improvement programmes"] },
  },
  qaqc: {
    "6.1": { specific: ["Are OH&S risks for inspection/test activities (chemicals, NDT radiation, lifting test loads) assessed?"], evidence: ["Task risk assessment"] },
    "7.1": { specific: ["Are calibrated OH&S monitoring devices (gas detectors, sound meters, lux meters) maintained and traceable?"], evidence: ["Calibration records for OH&S instruments"] },
    "7.2": { specific: ["Are inspectors qualified for OH&S-critical inspections (NDT, lifting gear, pressure equipment)?"], evidence: ["Inspector qualifications"] },
    "7.5": { specific: ["Are inspection records identifying OH&S-critical defects (lifting eyes, PPE, scaffolding) controlled?"], evidence: ["Inspection records"] },
    "8.1": { specific: ["Are inspections of OH&S-critical equipment (cranes, hoists, harnesses, pressure vessels) planned per legal/standard frequency?"], evidence: ["Inspection schedule, statutory inspection certificates"] },
    "9.1": { specific: ["Are OH&S-related defect data (PPE failures, equipment defects) analyzed?"], evidence: ["Defect Pareto"] },
    "10.2": { specific: ["Are OH&S-related NCs from inspections root-caused and corrective actions verified?"], evidence: ["CAPA on OH&S inspections"] },
  },
  qms: {
    "4.3": { specific: ["Is the OH&S MS scope documented, justified (incl. workers, locations, activities, contractors), and current?"], evidence: ["Scope statement"] },
    "4.4": { specific: ["Is the OH&S MS process map maintained with owners, KPIs, interactions?"], evidence: ["Process map"] },
    "5.2": { specific: ["Is the OH&S policy controlled, communicated to all workers (incl. contractors), and periodically reviewed?"], evidence: ["Controlled policy", "Comms log"] },
    "5.4": { specific: ["Is the worker consultation/participation mechanism documented and effective (committees, reps, ballots)?"], evidence: ["Consultation procedure", "Committee minutes"] },
    "6.1": { specific: ["Is hazard identification methodology documented and applied consistently across processes?", "Is the legal & other requirements register maintained?"], evidence: ["HIRA procedure", "HIRA registers", "Legal register with review evidence"] },
    "6.2": { specific: ["Are OH&S objectives consolidated and reported MS-wide?"], evidence: ["Objectives dashboard"] },
    "7.5": { specific: ["Is documented information for the OH&S MS controlled (creation, approval, distribution, version, retention)?"], evidence: ["Document control procedure", "Master list"] },
    "8.2": { specific: ["Is the emergency preparedness programme defined, with scenarios, plans, drill schedule, and post-drill review?"], evidence: ["Emergency plans", "Drill records"] },
    "9.1": { specific: ["Is OH&S performance data collated and analyzed; is compliance evaluation conducted at defined frequency with results recorded?"], evidence: ["KPI dashboard", "Compliance evaluation report"] },
    "9.2": { specific: ["Is the OH&S internal audit programme planned per importance/risk and prior results, with competent independent auditors?"], evidence: ["Audit programme", "Auditor competence", "Audit reports"] },
    "9.3": { specific: ["Does the OH&S team facilitate management reviews with all required inputs/outputs?"], evidence: ["MR minutes"] },
    "10.1": { specific: ["Is there a system to capture, prioritize, and action OH&S improvement opportunities?"], evidence: ["Improvement register"] },
    "10.2": { specific: ["Is the incident & CAPA system effective \u2014 incidents reported, investigated, root-caused, and recurrence prevented?"], evidence: ["Incident database", "Investigation reports", "Effectiveness checks"] },
    "10.3": { specific: ["Is the OH&S MS continually improved (evidenced over multiple cycles)?"], evidence: ["YoY KPI improvement"] },
  },
  hr: {
    "4.2": { specific: ["Are worker, union, and labour-regulator OH&S requirements identified?"], evidence: ["Stakeholder/legal register"] },
    "5.4": { specific: ["Does HR support worker consultation (election of reps, communications, grievance handling)?"], evidence: ["Election records", "Grievance log"] },
    "6.1": { specific: ["Are people-related OH&S risks (fatigue, fitness-for-work, violence, harassment) identified and treated?"], evidence: ["Psychosocial risk assessment", "Fatigue policy"] },
    "6.2": { specific: ["Are HR OH&S objectives (training completion, near-miss reporting rate, fitness-for-work) tracked?"], evidence: ["HR-OH&S KPIs"] },
    "7.1": { specific: ["Is the work environment (physical, social, psychological) suitable and monitored?"], evidence: ["Workplace assessments", "Engagement survey"] },
    "7.2": { specific: ["Is OH&S competence defined per role; gaps via TNA; addressed via training; effectiveness evaluated?"], evidence: ["Competency matrix", "Training records"] },
    "7.3": { specific: ["Do induction and refresher programmes cover OH&S policy, hazards, controls, incident response, and the right to remove from danger?"], evidence: ["Induction records"] },
    "7.5": { specific: ["Are personnel OH&S records (training, medicals, fitness-for-work) controlled, protected, and retained?"], evidence: ["Personnel files", "Access controls"] },
    "9.1": { specific: ["Are HR OH&S KPIs (training completion, attrition, grievances, absence) analyzed?"], evidence: ["HR analytics"] },
    "10.2": { specific: ["Are HR-related OH&S NCs (expired training, medicals) corrected and recurrence prevented?"], evidence: ["CAPA on competence gaps"] },
  },
  operations: {
    "4.4": { specific: ["Is the operations process defined with OH&S controls and KPIs?"], evidence: ["Process map"] },
    "6.1": { specific: ["Are operational hazards identified and risks assessed using the hierarchy of controls?"], evidence: ["HIRA register", "JSAs"] },
    "6.2": { specific: ["Are operational OH&S objectives (TRIR, LTIFR, near-miss closure) set and tracked?"], evidence: ["KPI dashboard"] },
    "7.1": { specific: ["Is infrastructure maintained per plan; are PPE, guards, ventilation provided?"], evidence: ["PM schedule", "PPE register"] },
    "7.5": { specific: ["Are SOPs/safe work procedures current at point of use?"], evidence: ["SOP master list"] },
    "8.1": { specific: ["Are activities controlled using the hierarchy of controls (elimination, substitution, engineering, admin, PPE)?", "Is management of change applied for any change to operations?"], evidence: ["Operations plan", "MoC records"] },
    "8.2": { specific: ["Are operational emergency scenarios drilled (spills, fire, medical)?"], evidence: ["Drill records"] },
    "9.1": { specific: ["Are OH&S leading and lagging KPIs reviewed; corrective actions triggered on adverse trends?"], evidence: ["KPI reviews"] },
    "10.2": { specific: ["Are operational incidents/NCs root-caused and corrective actions verified?"], evidence: ["CAPA records"] },
  },
  engineering: {
    "6.1": { specific: ["Are design hazards (working at height, confined space, lifting) addressed via Safety in Design / Prevention through Design?"], evidence: ["Design risk register", "SiD review records"] },
    "8.1": { specific: ["Is management of change applied for engineering changes affecting OH&S (interlocks, layouts, materials)?"], evidence: ["MoC records", "ECN with OH&S impact"] },
    "7.2": { specific: ["Are designers competent in OH&S design (incl. legal codes for guarding, machinery directive, ATEX)?"], evidence: ["Designer competence"] },
    "7.5": { specific: ["Are drawings and specs identifying OH&S-critical features (interlocks, ratings) controlled?"], evidence: ["Drawing register"] },
  },
  construction: {
    "6.1": { specific: ["Are site OH&S risks assessed via JSAs / Take 5 / pre-task; controls implemented?"], evidence: ["JSA library", "Pre-task records"] },
    "7.1": { specific: ["Are PPE, fall arrest, scaffolds, lifting gear, and welfare provided and inspected?"], evidence: ["Inspection registers"] },
    "7.2": { specific: ["Are workers (incl. contractors) qualified for high-risk work (heights, confined space, hot work, lifting, electrical)?"], evidence: ["Operator certifications"] },
    "8.1": { specific: ["Is permit-to-work system used for high-risk activities (hot work, confined space, working at height, energy isolation)?", "Are contractors selected, inducted, and supervised for OH&S?"], evidence: ["Permits", "Contractor induction records", "Site supervision logs"] },
    "8.2": { specific: ["Are site emergency arrangements in place (assembly, rescue from heights/confined space, first aid)?"], evidence: ["Emergency plan", "Drill records"] },
    "9.1": { specific: ["Are site OH&S leading indicators (inspections, observations, near-misses) tracked?"], evidence: ["Site OH&S reports"] },
    "10.2": { specific: ["Are site incidents and NCs investigated; lessons shared across projects?"], evidence: ["Incident reports", "Safety alerts"] },
  },
  sales: {
    "4.2": { specific: ["Are customer OH&S contractual requirements (site rules, OH&S compliance evidence) captured?"], evidence: ["Customer requirement register"] },
    "8.1": { specific: ["Are post-sale OH&S obligations (installation safety, training, warnings) committed and resourced?"], evidence: ["Contract clauses"] },
    "8.2": { specific: ["Are emergency contact and recall arrangements communicated to customers where applicable?"], evidence: ["Customer comms", "Recall procedure"] },
    "10.2": { specific: ["Are customer-reported OH&S issues (product safety) routed and investigated?"], evidence: ["Complaints log with OH&S flag"] },
  },
  marketing: {
    "6.1": { specific: ["Are OH&S risks of campaigns, events, demos identified and controlled?"], evidence: ["Event risk assessments"] },
    "7.4": { specific: ["Is OH&S messaging (warnings, safe-use info) accurate, approved, and consistent with product reality?"], evidence: ["Approved collateral"] },
    "8.1": { specific: ["Are external events delivered with OH&S plans (venue safety, crowd, transport)?"], evidence: ["Event safety plan"] },
  },
  procurement: {
    "6.1": { specific: ["Are supply-chain OH&S risks (substandard PPE, unsafe equipment, contractor capability) assessed?"], evidence: ["Procurement risk register"] },
    "8.1": { specific: ["Do POs include OH&S requirements (specifications, certifications, MSDS, inspection certificates)?", "Are contractors evaluated for OH&S capability before award?"], evidence: ["PO templates", "Contractor pre-qualification"] },
    "9.1": { specific: ["Is supplier/contractor OH&S performance reviewed (incidents, audit findings)?"], evidence: ["Supplier scorecards with OH&S"] },
    "10.2": { specific: ["Are OH&S-related supplier issues driving CAPA and ASL action?"], evidence: ["Supplier CAPA"] },
  },
  finance: {
    "5.1": { specific: ["Does Finance support OH&S MS by ensuring resources are budgeted (training, PPE, monitoring, controls)?"], evidence: ["Budget approvals for OH&S items"] },
    "6.1": { specific: ["Are financial OH&S risks (fines, claims, business interruption) identified?"], evidence: ["Financial risk register", "Insurance review"] },
    "7.1": { specific: ["Are financial resources for OH&S available when needed?"], evidence: ["Budget vs actual on OH&S items"] },
    "9.1": { specific: ["Is cost-of-injury / claims data analyzed and reported?"], evidence: ["Claims & cost reports"] },
  },
  store: {
    "6.1": { specific: ["Are storage hazards (chemical incompatibility, falling objects, manual handling) assessed?"], evidence: ["Storage HIRA"] },
    "7.1": { specific: ["Are racking inspections, ventilation, spill kits, eye wash provided?"], evidence: ["Inspection logs"] },
    "7.5": { specific: ["Are MSDS/SDS available, current, and accessible at point of use?"], evidence: ["MSDS register"] },
    "8.1": { specific: ["Are hazardous materials segregated per compatibility; are PPE issued & tracked?"], evidence: ["Segregation map", "PPE issue log"] },
    "8.2": { specific: ["Are spill, fire, and chemical exposure response procedures defined and drilled?"], evidence: ["Spill response plan"] },
    "10.2": { specific: ["Are storage-related incidents/near-misses investigated?"], evidence: ["Incident reports"] },
  },
  ict: {
    "6.1": { specific: ["Are DSE/ergonomic, electrical, and EMF risks assessed for ICT environments?"], evidence: ["DSE assessments"] },
    "7.1": { specific: ["Are workstations ergonomically configured; cables managed; UPS rooms ventilated?"], evidence: ["Workstation assessments"] },
    "8.1": { specific: ["Are incident reporting systems available, accessible, and supported (uptime)?"], evidence: ["System availability reports"] },
    "8.2": { specific: ["Are IT-supported emergency systems (alarms, mass-notification) tested?"], evidence: ["Test logs"] },
  },
  warehouse: {
    "6.1": { specific: ["Are MHE, racking, traffic, and manual-handling risks assessed?"], evidence: ["HIRA"] },
    "7.1": { specific: ["Are forklifts, racking, lifting accessories inspected per schedule?"], evidence: ["Inspection logs"] },
    "7.2": { specific: ["Are forklift/MHE operators licensed and currency maintained?"], evidence: ["Operator licences"] },
    "8.1": { specific: ["Are pedestrian/MHE separation, signage, and speed limits enforced?", "Are heavy/awkward loads handled with mechanical aids?"], evidence: ["Site layout", "Manual handling assessments"] },
    "8.2": { specific: ["Are emergency egress, fire systems, and rescue plans in place and drilled?"], evidence: ["Drill records"] },
    "10.2": { specific: ["Are warehouse incidents/near-misses investigated and recurrence prevented?"], evidence: ["Warehouse CAPA"] },
  },
  project_management: {
    "4.2": { specific: ["Are project stakeholders' OH&S requirements (client, regulator, communities) identified?"], evidence: ["Stakeholder register"] },
    "5.3": { specific: ["Are project OH&S roles (HSE manager, deputies, first aiders, fire marshals) defined?"], evidence: ["Project HSE org chart"] },
    "6.1": { specific: ["Are project OH&S risks identified at planning, tracked, and updated?"], evidence: ["Project HIRA"] },
    "6.2": { specific: ["Are project HSE objectives (zero LTI, near-miss rate, audit closeout) defined?"], evidence: ["Project HSE plan KPIs"] },
    "8.1": { specific: ["Is the Project HSE Plan implemented with permits, inductions, contractor management, and surveillance?", "Is MoC applied to project changes affecting OH&S?"], evidence: ["Project HSE plan", "MoC log"] },
    "8.2": { specific: ["Are project-specific emergency arrangements established and drilled?"], evidence: ["Emergency plan", "Drill records"] },
    "10.2": { specific: ["Are project incidents investigated and lessons disseminated across projects?"], evidence: ["Lessons learned"] },
  },
  admin: {
    "6.1": { specific: ["Are office OH&S risks (fire, slips/trips, ergonomics, security) assessed?"], evidence: ["Office HIRA"] },
    "7.1": { specific: ["Are fire detection/suppression, first aid, lighting, ventilation maintained?"], evidence: ["Maintenance & inspection records"] },
    "8.2": { specific: ["Are fire and evacuation drills conducted at defined frequency; first aiders/fire marshals trained?"], evidence: ["Drill records", "First aider list"] },
    "10.2": { specific: ["Are office incidents and near-misses reported and investigated?"], evidence: ["Incident log"] },
  },
  production: {
    "6.1": { specific: ["Are production hazards assessed (machine, chemical, noise, ergonomics, PSM where applicable) using hierarchy of controls?"], evidence: ["PFMEA-OH&S", "HIRA"] },
    "6.2": { specific: ["Are production OH&S objectives (TRIR, LOTO compliance, audit findings) tracked?"], evidence: ["Production OH&S KPIs"] },
    "7.1": { specific: ["Are guards, interlocks, ventilation, and PPE provided and maintained?"], evidence: ["Maintenance records", "PPE register"] },
    "7.2": { specific: ["Are operators trained on machine safety, LOTO, chemical handling, emergency response?"], evidence: ["Training records"] },
    "8.1": { specific: ["Is LOTO/energy isolation applied for maintenance and intervention?", "Is permit-to-work used for high-risk tasks?", "Is MoC applied to process/equipment/material changes?"], evidence: ["LOTO procedure & records", "Permits", "MoC records"] },
    "8.2": { specific: ["Are process emergency scenarios (release, fire, runaway) identified and drilled?"], evidence: ["Emergency response plan", "Drill records"] },
    "9.1": { specific: ["Are production OH&S leading indicators (observations, audits, near-miss) and lagging (incidents) analyzed?"], evidence: ["KPI reviews"] },
    "10.2": { specific: ["Are production incidents investigated to root cause; effectiveness verified; recurrence prevented?"], evidence: ["Incident reports", "CAPA"] },
    "10.3": { specific: ["Is there evidence of continual OH&S performance improvement (Kaizen on safety)?"], evidence: ["Improvement projects"] },
  },
  business_development: {
    "4.1": { specific: ["Is OH&S regulatory landscape of new markets analyzed?"], evidence: ["Market entry assessment"] },
    "6.1": { specific: ["Are OH&S risks of new ventures, partners, or geographies assessed before commitment?"], evidence: ["Opportunity OH&S risk assessment"] },
    "8.1": { specific: ["Is OH&S due diligence performed on partners/agents/JV targets?"], evidence: ["Due diligence reports"] },
  },
};

export type ClauseQuestionSet45001 = { clause: string; title: string; generic: string[]; specific: string[]; evidence: string[] };
export function getQuestionsForProcess45001(key: ProcessKey45001): ClauseQuestionSet45001[] {
  const details = PROCESS_DETAILS_45001[key];
  return ISO_CLAUSES_45001.filter(c => details[c.clause] !== undefined).map(c => ({
    clause: c.clause, title: c.title,
    generic: GENERIC_45001[c.clause] ?? [],
    specific: details[c.clause].specific,
    evidence: details[c.clause].evidence,
  }));
}