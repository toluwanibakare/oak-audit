// Auto-generated ISO 14001:2015 process audit data.
export type ProcessKey14001 =
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

export type ProcessMeta14001 = { key: ProcessKey14001; name: string; scope: string };
export const PROCESSES_14001: ProcessMeta14001[] = [
  { key: "top_management", name: "Top Management", scope: "Strategic direction, environmental policy, leadership, resources, management review." },
  { key: "qaqc", name: "QA / QC", scope: "Inspection, calibration of environmental monitoring devices, NC control." },
  { key: "qms", name: "QMS / EMS", scope: "Document control, internal audit, CAPA, management of the EMS." },
  { key: "hr", name: "Human Resources", scope: "Recruitment, environmental competence, training, awareness." },
  { key: "operations", name: "Operations", scope: "Operational control of activities with environmental aspects." },
  { key: "engineering", name: "Engineering / Design", scope: "Design for environment, life-cycle perspective, change control." },
  { key: "construction", name: "Construction", scope: "Site environmental management, waste, emissions, spills." },
  { key: "sales", name: "Sales", scope: "Customer environmental requirements, take-back, end-of-life." },
  { key: "marketing", name: "Marketing", scope: "Environmental claims, green marketing compliance." },
  { key: "procurement", name: "Procurement", scope: "Supplier environmental evaluation, eco-criteria, life-cycle requirements." },
  { key: "finance", name: "Finance & Accounts", scope: "Resourcing EMS, environmental costs, fines, provisions." },
  { key: "store", name: "Store", scope: "Storage of hazardous materials, spill containment, waste segregation." },
  { key: "ict", name: "ICT / IT", scope: "Energy use of IT, e-waste management, paperless initiatives." },
  { key: "warehouse", name: "Warehouse", scope: "Waste, packaging, energy, spill prevention." },
  { key: "project_management", name: "Project Management", scope: "Project EMS plan, environmental impact assessment, permits." },
  { key: "admin", name: "Administration", scope: "Office energy, paper, waste, water, travel emissions." },
  { key: "production", name: "Production / Manufacturing", scope: "Process emissions, effluents, waste, energy, raw material use." },
  { key: "business_development", name: "Business Development", scope: "Environmental due diligence on new ventures and markets." },
];

export const ISO_CLAUSES_14001: { clause: string; title: string }[] = [
  { clause: "4.1", title: "Context of the organization (incl. environmental conditions)" },
  { clause: "4.2", title: "Needs & expectations of interested parties" },
  { clause: "4.3", title: "Scope of the EMS" },
  { clause: "4.4", title: "Environmental management system" },
  { clause: "5.1", title: "Leadership & commitment" },
  { clause: "5.2", title: "Environmental policy" },
  { clause: "5.3", title: "Roles, responsibilities & authorities" },
  { clause: "6.1", title: "Actions to address risks & opportunities (env aspects, compliance obligations, risks)" },
  { clause: "6.1.2", title: "Environmental aspects" },
  { clause: "6.1.3", title: "Compliance obligations" },
  { clause: "6.1.4", title: "Planning action" },
  { clause: "6.2", title: "Environmental objectives & planning" },
  { clause: "7.1", title: "Resources" },
  { clause: "7.2", title: "Competence" },
  { clause: "7.3", title: "Awareness" },
  { clause: "7.4", title: "Communication (internal & external)" },
  { clause: "7.5", title: "Documented information" },
  { clause: "8.1", title: "Operational planning & control (incl. life-cycle perspective, outsourced processes)" },
  { clause: "8.2", title: "Emergency preparedness & response" },
  { clause: "9.1", title: "Monitoring, measurement, analysis & evaluation" },
  { clause: "9.1.2", title: "Evaluation of compliance" },
  { clause: "9.2", title: "Internal audit" },
  { clause: "9.3", title: "Management review" },
  { clause: "10.1", title: "Improvement (general)" },
  { clause: "10.2", title: "Nonconformity & corrective action" },
  { clause: "10.3", title: "Continual improvement" },
];

const GENERIC_14001: Record<string, string[]> = {
  "4.1": [
    "Have internal/external issues including environmental conditions affecting the EMS been identified for this process?",
    "Are these issues reviewed and updated?",
  ],
  "4.2": [
    "Have interested parties (regulators, communities, customers, NGOs) and their environmental requirements been identified, including which become compliance obligations?",
  ],
  "4.3": [
    "Does the process owner understand the EMS scope (boundaries, activities, products, services)?",
  ],
  "4.4": [
    "Is the process defined with environmental inputs/outputs/controls/KPIs and interactions with other EMS processes?",
  ],
  "5.1": [
    "How does the process owner demonstrate leadership and accountability for environmental performance and the EMS?",
  ],
  "5.2": [
    "Do staff in the process know the environmental policy commitments (protect environment incl. pollution prevention, fulfil compliance obligations, continual improvement)?",
  ],
  "5.3": [
    "Are EMS responsibilities and authorities within the process assigned, documented, and understood?",
  ],
  "6.1": [
    "Have process-level risks and opportunities, including those from environmental aspects and compliance obligations, been determined?",
  ],
  "6.1.2": [
    "Have environmental aspects and impacts (incl. life-cycle perspective, abnormal/emergency conditions) been determined and significant aspects identified?",
  ],
  "6.1.3": [
    "Have compliance obligations applicable to the process been identified, accessed, and incorporated?",
  ],
  "6.1.4": [
    "Are planned actions to address significant aspects, compliance obligations, and risks/opportunities defined and integrated?",
  ],
  "6.2": [
    "Are measurable environmental objectives set with action plans, indicators, and update cycles?",
  ],
  "7.1": [
    "Are people, infrastructure, and environmental monitoring resources required by the process provided and maintained?",
  ],
  "7.2": [
    "Has environmental competence (incl. for activities with significant aspects/compliance obligations) been defined, achieved, and evaluated?",
  ],
  "7.3": [
    "Are persons aware of policy, significant aspects/impacts, contribution to EMS, and consequences of nonconformity (incl. compliance obligations)?",
  ],
  "7.4": [
    "Are internal/external environmental communications determined and effective, including externally communicating per compliance obligations?",
  ],
  "7.5": [
    "Is EMS documented information created, controlled, distributed, protected, and retained?",
  ],
  "8.1": [
    "Are activities planned and controlled (criteria, controls, life-cycle perspective for design and outsourcing)?",
    "Are outsourced processes controlled or influenced and the type/extent of control defined?",
  ],
  "8.2": [
    "Are potential environmental emergencies identified, response procedures established, drills conducted, and lessons applied?",
  ],
  "9.1": [
    "What environmental performance is monitored/measured (incl. progress to objectives), analyzed, and evaluated?",
  ],
  "9.1.2": [
    "Is compliance with all compliance obligations evaluated at planned intervals with results recorded and status maintained?",
  ],
  "9.2": [
    "Has the process been internally audited and findings closed effectively?",
  ],
  "9.3": [
    "Are inputs from this process provided to EMS management review and outputs implemented?",
  ],
  "10.1": [
    "How does the process identify and act on environmental improvement opportunities?",
  ],
  "10.2": [
    "Are environmental nonconformities corrected, root-caused, and recurrence prevented with effectiveness verified?",
  ],
  "10.3": [
    "Is there evidence of continual environmental performance improvement?",
  ],
};

type ClauseDetail = { specific: string[]; evidence: string[] };
type ProcessClauseMap = Record<string, ClauseDetail>;
const PROCESS_DETAILS_14001: Record<ProcessKey14001, ProcessClauseMap> = {
  top_management: {
    "4.1": { specific: ["How does top management capture environmental context (climate, water stress, regulatory shifts, community expectations)?"], evidence: ["Strategic plan", "Context analysis", "MR minutes"] },
    "4.2": { specific: ["Has top management approved the interested-parties register, including which expectations become compliance obligations?"], evidence: ["Approved stakeholder register", "Compliance obligations register"] },
    "4.3": { specific: ["Has top management approved the EMS scope (sites, activities, products, services, life-cycle considerations)?"], evidence: ["Signed scope statement"] },
    "5.1": { specific: ["How does top management take accountability for EMS effectiveness, integrate EMS into business processes, and ensure resources?"], evidence: ["MR minutes", "Resource decisions", "Strategy docs"] },
    "5.2": { specific: ["Has the environmental policy been established, signed, communicated, and reviewed by top management with all required commitments?"], evidence: ["Signed environmental policy", "Communication evidence"] },
    "5.3": { specific: ["Has top management defined EMS roles, responsibilities, and authorities?"], evidence: ["Org chart", "Appointment letters"] },
    "6.1": { specific: ["How does top management ensure environmental risks (significant aspects, compliance, climate transition) are addressed?"], evidence: ["Enterprise environmental risk register"] },
    "6.2": { specific: ["Has top management approved environmental objectives aligned with the policy?"], evidence: ["Approved environmental objectives"] },
    "9.3": { specific: ["Are EMS management reviews conducted at planned intervals covering all 9.3 inputs (compliance status, aspects, objectives, NC, audit, comms, opportunities) and producing decisions?"], evidence: ["MR schedule", "MR minutes"] },
    "10.1": { specific: ["How does top management drive an environmental improvement culture?"], evidence: ["Improvement programmes"] },
  },
  qaqc: {
    "6.1.2": { specific: ["Are aspects of QC activities (chemical use, calibration waste, energy of test rigs) considered?"], evidence: ["QC aspects assessment"] },
    "7.1": { specific: ["Are calibrated environmental monitoring devices (gas analysers, opacity meters, flow meters) maintained and traceable?"], evidence: ["Calibration records"] },
    "9.1": { specific: ["Are environmental measurements (emissions, effluents, noise) performed and analyzed?"], evidence: ["Monitoring reports"] },
    "9.1.2": { specific: ["Are inspection/test results used to evidence compliance with environmental permits?"], evidence: ["Permit compliance reports"] },
  },
  qms: {
    "4.3": { specific: ["Is the EMS scope documented, justified, and current including life-cycle considerations?"], evidence: ["Scope statement"] },
    "4.4": { specific: ["Is the EMS process map maintained?"], evidence: ["Process map"] },
    "5.2": { specific: ["Is the environmental policy controlled, communicated to all workers (incl. contractors), and externally available where required?"], evidence: ["Controlled policy", "Comms log"] },
    "6.1.2": { specific: ["Is the environmental aspects/impacts methodology documented and applied; is the significant-aspects register current?"], evidence: ["Aspects procedure", "Aspects register"] },
    "6.1.3": { specific: ["Is the compliance obligations register maintained, with access to legal texts and review cycle?"], evidence: ["Compliance register", "Review evidence"] },
    "6.1.4": { specific: ["Are planned actions to address aspects, compliance, and risks/opportunities documented and tracked?"], evidence: ["Action plan tracker"] },
    "6.2": { specific: ["Are environmental objectives consolidated and reported EMS-wide?"], evidence: ["Objectives dashboard"] },
    "7.5": { specific: ["Is documented information for the EMS controlled?"], evidence: ["Document control procedure"] },
    "8.2": { specific: ["Is the emergency preparedness programme defined with scenarios, plans, drill schedule, post-drill review?"], evidence: ["Emergency plans", "Drill records"] },
    "9.1": { specific: ["Is environmental performance data collated and analyzed for management review?"], evidence: ["KPI dashboard"] },
    "9.1.2": { specific: ["Is compliance evaluation conducted at defined frequency with status maintained?"], evidence: ["Compliance evaluation report"] },
    "9.2": { specific: ["Is the EMS internal audit programme planned per importance/risk and prior results?"], evidence: ["Audit programme", "Audit reports"] },
    "9.3": { specific: ["Does the EMS team facilitate management reviews with all required inputs/outputs?"], evidence: ["MR minutes"] },
    "10.1": { specific: ["Is there a system to capture and action environmental improvement opportunities?"], evidence: ["Improvement register"] },
    "10.2": { specific: ["Is the EMS CAPA system effective?"], evidence: ["CAPA records"] },
    "10.3": { specific: ["Is the EMS continually improved?"], evidence: ["YoY KPI improvement"] },
  },
  hr: {
    "6.1": { specific: ["Are people-related EMS risks (lack of competence, awareness gaps) identified?"], evidence: ["HR risk register (env)"] },
    "7.2": { specific: ["Is environmental competence defined per role (esp. for staff with significant aspects); training delivered; effectiveness evaluated?"], evidence: ["Competency matrix", "Training records"] },
    "7.3": { specific: ["Do induction and refresher cover environmental policy, significant aspects, controls, emergency response, consequences of NC?"], evidence: ["Induction records"] },
    "7.5": { specific: ["Are training records on environmental competence retained?"], evidence: ["Personnel files"] },
    "9.1": { specific: ["Are training completion KPIs analyzed?"], evidence: ["HR analytics"] },
  },
  operations: {
    "4.4": { specific: ["Is the operations process defined with environmental inputs/outputs and KPIs?"], evidence: ["Process map"] },
    "6.1.2": { specific: ["Are environmental aspects of operations (energy, water, emissions, waste, noise) identified and significant ones assessed?"], evidence: ["Aspects register"] },
    "6.1.3": { specific: ["Are operational compliance obligations (permits, limits) identified and integrated into work instructions?"], evidence: ["Permit list"] },
    "6.2": { specific: ["Are operational environmental objectives (energy intensity, water, waste-to-landfill) tracked?"], evidence: ["KPI dashboard"] },
    "7.1": { specific: ["Is infrastructure maintained (incl. pollution control equipment)?"], evidence: ["PM schedule"] },
    "7.5": { specific: ["Are operational environmental SOPs current at point of use?"], evidence: ["SOP master list"] },
    "8.1": { specific: ["Are activities controlled per environmental criteria; is MoC applied?", "Are outsourced processes controlled for environmental performance?"], evidence: ["Operations plan", "MoC records"] },
    "8.2": { specific: ["Are operational environmental emergency scenarios drilled (spills, fire, gas release)?"], evidence: ["Drill records"] },
    "9.1": { specific: ["Are environmental KPIs reviewed; corrective actions triggered on adverse trends?"], evidence: ["KPI reviews"] },
    "9.1.2": { specific: ["Is permit compliance evaluated and reported?"], evidence: ["Permit reports"] },
    "10.2": { specific: ["Are operational environmental incidents/NCs root-caused?"], evidence: ["CAPA records"] },
  },
  engineering: {
    "6.1.2": { specific: ["Are environmental aspects considered in design (life-cycle: materials, energy, end-of-life, hazardous substances)?"], evidence: ["DfE checklist", "LCA results"] },
    "6.1.3": { specific: ["Are design compliance obligations (RoHS, REACH, ecodesign, energy labelling) identified?"], evidence: ["Design compliance matrix"] },
    "8.1": { specific: ["Is life-cycle perspective applied; design changes assessed for environmental impact?"], evidence: ["DfE reviews", "ECN with env impact"] },
    "7.2": { specific: ["Are designers competent in environmental design (LCA, applicable directives)?"], evidence: ["Designer competence"] },
  },
  construction: {
    "6.1.2": { specific: ["Are site environmental aspects (dust, noise, runoff, waste, biodiversity) identified?"], evidence: ["Site aspects register", "EIA/CEMP"] },
    "6.1.3": { specific: ["Are environmental permits (discharge, dewatering, dust, waste) identified and posted on site?"], evidence: ["Permits"] },
    "7.1": { specific: ["Are spill kits, bunds, dust suppression, sediment controls in place and inspected?"], evidence: ["Inspection logs"] },
    "8.1": { specific: ["Is the Construction EMP implemented (waste segregation, hazardous storage, vehicle washdown, refuelling controls)?", "Are subcontractors held to EMP requirements?"], evidence: ["CEMP", "Subcontractor inductions"] },
    "8.2": { specific: ["Are spill response, fire, and pollution incident plans in place and drilled?"], evidence: ["Spill drill records"] },
    "9.1": { specific: ["Are environmental monitoring (dust, noise, water quality) records maintained?"], evidence: ["Monitoring reports"] },
    "10.2": { specific: ["Are environmental incidents and complaints investigated and corrected?"], evidence: ["Incident reports", "Community complaints log"] },
  },
  sales: {
    "4.2": { specific: ["Are customer environmental requirements (eco-labels, take-back, RoHS, packaging) captured?"], evidence: ["Customer requirement register"] },
    "8.1": { specific: ["Are post-sale obligations (take-back, WEEE, refrigerant recovery) committed and resourced?"], evidence: ["Contract clauses"] },
  },
  marketing: {
    "7.4": { specific: ["Are environmental claims accurate, substantiated, and compliant with green-marketing rules?"], evidence: ["Claims substantiation file"] },
    "6.1.3": { specific: ["Are advertising/eco-label compliance obligations identified?"], evidence: ["Compliance check list"] },
  },
  procurement: {
    "6.1.2": { specific: ["Are environmental aspects of purchases (materials, packaging, transport) considered?"], evidence: ["Procurement aspects review"] },
    "8.1": { specific: ["Do POs include environmental requirements (eco-criteria, restricted substances, packaging take-back)?", "Are suppliers/contractors evaluated for environmental performance?"], evidence: ["PO templates", "Supplier env evaluations"] },
    "9.1": { specific: ["Is supplier environmental performance reviewed?"], evidence: ["Supplier scorecards (env)"] },
    "10.2": { specific: ["Are environmental NCs from suppliers driving CAPA?"], evidence: ["Supplier CAPA"] },
  },
  finance: {
    "5.1": { specific: ["Does Finance support EMS by ensuring resources are budgeted (monitoring, controls, training)?"], evidence: ["Budget approvals for EMS items"] },
    "6.1": { specific: ["Are environmental financial risks (fines, remediation, carbon costs, climate transition) identified?"], evidence: ["Financial risk register"] },
    "7.1": { specific: ["Are financial resources for EMS available when needed?"], evidence: ["Budget vs actual"] },
    "9.1": { specific: ["Are environmental costs (waste disposal, energy, water, fines, remediation provisions) analyzed?"], evidence: ["Environmental cost report"] },
  },
  store: {
    "6.1.2": { specific: ["Are aspects of stored materials (spill, leaching, evaporation, fire) identified?"], evidence: ["Store aspects register"] },
    "7.1": { specific: ["Are bunds, spill kits, ventilation, fire systems in place and inspected?"], evidence: ["Inspection logs"] },
    "7.5": { specific: ["Are MSDS/SDS available, current, and accessible?"], evidence: ["MSDS register"] },
    "8.1": { specific: ["Are hazardous materials segregated; are quantities limited per permit/legal limits?", "Is waste segregated at source per regulatory categories?"], evidence: ["Segregation map", "Waste streams"] },
    "8.2": { specific: ["Are spill, fire, and chemical-release response procedures defined and drilled?"], evidence: ["Spill response plan"] },
    "9.1.2": { specific: ["Are quantities tracked against permit thresholds (e.g., COMAH/Seveso)?"], evidence: ["Inventory vs threshold"] },
    "10.2": { specific: ["Are storage spills/releases investigated and corrected?"], evidence: ["Incident reports"] },
  },
  ict: {
    "6.1.2": { specific: ["Are aspects of ICT identified (energy, e-waste, cooling, data centre water)?"], evidence: ["ICT aspects register"] },
    "6.2": { specific: ["Are ICT environmental objectives (PUE, paper reduction, e-waste recycling) set?"], evidence: ["ICT env KPIs"] },
    "8.1": { specific: ["Are e-waste and asset disposal handled via authorized recyclers with chain-of-custody?"], evidence: ["E-waste manifests", "Recycler certificates"] },
    "9.1": { specific: ["Are ICT energy and waste data tracked?"], evidence: ["Energy reports"] },
  },
  warehouse: {
    "6.1.2": { specific: ["Are aspects (energy, packaging waste, fuel, refrigerants) identified?"], evidence: ["Aspects register"] },
    "8.1": { specific: ["Are packaging take-back, pallet reuse, refrigerant management programmes in place?", "Are spill controls for fuel/oil/forklift batteries implemented?"], evidence: ["Programme records", "Spill kit inspections"] },
    "8.2": { specific: ["Are spill, fire, and refrigerant-release plans drilled?"], evidence: ["Drill records"] },
    "10.2": { specific: ["Are environmental incidents investigated?"], evidence: ["Incident log"] },
  },
  project_management: {
    "4.2": { specific: ["Are project stakeholders' environmental requirements (regulators, communities, lenders' E&S standards) identified?"], evidence: ["Stakeholder register"] },
    "6.1.2": { specific: ["Are project environmental aspects identified at planning (EIA/ESIA where required)?"], evidence: ["EIA/ESIA report"] },
    "6.1.3": { specific: ["Are project compliance obligations (permits, lender standards e.g. IFC PS) identified?"], evidence: ["Permit list"] },
    "6.2": { specific: ["Are project environmental objectives defined?"], evidence: ["Project EMS plan KPIs"] },
    "8.1": { specific: ["Is the Project EMS Plan implemented; is MoC applied to changes affecting the environment?"], evidence: ["Project EMS plan", "MoC log"] },
    "8.2": { specific: ["Are project-specific environmental emergency arrangements drilled?"], evidence: ["Drill records"] },
    "10.2": { specific: ["Are project environmental incidents investigated?"], evidence: ["Incident reports"] },
  },
  admin: {
    "6.1.2": { specific: ["Are office aspects identified (energy, paper, water, waste, business travel emissions)?"], evidence: ["Office aspects register"] },
    "6.2": { specific: ["Are office environmental objectives (energy, paper, recycling rate) set?"], evidence: ["Office env KPIs"] },
    "8.1": { specific: ["Are recycling, energy management, and travel-reduction programmes implemented?"], evidence: ["Programme records"] },
    "8.2": { specific: ["Are fire and chemical-spill (cleaning chemicals) plans in place?"], evidence: ["Drill records"] },
    "10.2": { specific: ["Are environmental incidents reported and investigated?"], evidence: ["Incident log"] },
  },
  production: {
    "6.1.2": { specific: ["Are production aspects (emissions to air/water, hazardous waste, noise, energy, raw material use) identified and significance assessed (incl. abnormal/emergency)?"], evidence: ["Aspects register"] },
    "6.1.3": { specific: ["Are production compliance obligations (permits, ELVs, waste manifests) identified?"], evidence: ["Permit register"] },
    "6.2": { specific: ["Are production environmental objectives (energy/unit, water/unit, waste/unit, emissions) tracked?"], evidence: ["Production env KPIs"] },
    "7.1": { specific: ["Is pollution control equipment (scrubbers, ETP, baghouses) maintained and monitored?"], evidence: ["PM and monitoring records"] },
    "8.1": { specific: ["Are operational controls (parameter ranges, abatement on, batch records) defined and applied?", "Is MoC applied to process/material/equipment changes affecting environment?"], evidence: ["Operational controls", "MoC records"] },
    "8.2": { specific: ["Are spill, release, fire, and abatement-failure scenarios drilled?"], evidence: ["Drill records"] },
    "9.1": { specific: ["Are emissions, effluents, energy, and waste data analyzed?"], evidence: ["Monitoring reports"] },
    "9.1.2": { specific: ["Is permit compliance evaluated; are exceedances recorded and reported?"], evidence: ["Permit compliance log"] },
    "10.2": { specific: ["Are production environmental incidents root-caused; effectiveness verified?"], evidence: ["CAPA records"] },
    "10.3": { specific: ["Is there evidence of continual environmental performance improvement?"], evidence: ["Improvement projects"] },
  },
  business_development: {
    "4.1": { specific: ["Is environmental regulatory landscape of new markets analyzed?"], evidence: ["Market entry assessment"] },
    "6.1": { specific: ["Are environmental risks of new ventures, partners, geographies assessed (incl. climate)?"], evidence: ["Opportunity env risk assessment"] },
    "8.1": { specific: ["Is environmental due diligence performed on partners/JV/M&A targets?"], evidence: ["Due diligence reports"] },
  },
};

export type ClauseQuestionSet14001 = { clause: string; title: string; generic: string[]; specific: string[]; evidence: string[] };
export function getQuestionsForProcess14001(key: ProcessKey14001): ClauseQuestionSet14001[] {
  const details = PROCESS_DETAILS_14001[key];
  return ISO_CLAUSES_14001.filter(c => details[c.clause] !== undefined).map(c => ({
    clause: c.clause, title: c.title,
    generic: GENERIC_14001[c.clause] ?? [],
    specific: details[c.clause].specific,
    evidence: details[c.clause].evidence,
  }));
}