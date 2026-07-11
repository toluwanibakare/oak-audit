import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck, ArrowRight, Search, Download, CheckCircle2, XCircle,
  MinusCircle, AlertTriangle, ClipboardCheck, FileText, Layers,
  Crown, Beaker, BookOpen, Users, Cog, Wrench, HardHat, Handshake,
  Megaphone, ShoppingCart, Landmark, Package, Server, Warehouse,
  KanbanSquare, Briefcase, Scale, Truck, Factory, TrendingUp,
  Paperclip, X as XIcon, Upload, Plus, Trash2,
} from "lucide-react";

export const Route = createFileRoute("/process-audits")({
  head: () => ({
    meta: [
      { title: "Process Audit Breakdown — ISO 9001 / 14001 / 45001 / IMS" },
      { name: "description", content: "ISO 9001, 14001, 45001 and IMS clauses broken into generic and process-specific audit questions with expected evidence, finding notes and evidence upload — across 20 organizational functions." },
      { property: "og:title", content: "Process Audit Breakdown — Auditly" },
      { property: "og:description", content: "Audit each department against ISO clauses that apply to it. Questions, expected evidence, findings and file uploads in one place." },
    ],
  }),
  component: ProcessAuditsPage,
});

// ------------------------------------------------------------
// Data model
// ------------------------------------------------------------

type Standard = "ISO 9001" | "ISO 14001" | "ISO 45001" | "IMS";
type Response = "conform" | "minor" | "major" | "na" | null;

type Question = {
  id: string;
  clause: string;
  standard: Standard | "Generic";
  question: string;
  evidence: string; // example of evidence the auditor should request
};

type ProcessDef = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  generic: Question[];
  specific: Record<Standard, Question[]>;
};

const STANDARDS: Standard[] = ["ISO 9001", "ISO 14001", "ISO 45001", "IMS"];

const q = (
  id: string,
  clause: string,
  standard: Standard | "Generic",
  question: string,
  evidence: string,
): Question => ({ id, clause, standard, question, evidence });

const PROCESSES: ProcessDef[] = [
  {
    id: "top-management",
    name: "Top Management",
    icon: Crown,
    summary: "Leadership, strategic direction, policy and management review.",
    generic: [
      q("tm-g1", "—", "Generic", "Does top management understand and communicate the purpose and strategic direction of the organisation?", "Strategic plan, vision/mission statement, town-hall minutes, cascaded objectives."),
      q("tm-g2", "—", "Generic", "Are roles, responsibilities and authorities documented, assigned and communicated?", "Org chart, RACI matrix, job descriptions signed by holder, delegation-of-authority matrix."),
      q("tm-g3", "—", "Generic", "Is a management review conducted at planned intervals with all required inputs and documented outputs?", "MR meeting minutes, agenda, attendance sheet, action tracker, dashboard reports."),
      q("tm-g4", "—", "Generic", "Are resources (financial, human, infrastructure) demonstrably provided to meet MS objectives?", "Approved budget vs actuals, headcount plan, capex approvals, resource-request log."),
      q("tm-g5", "—", "Generic", "Are interested parties identified and their relevant requirements monitored?", "Interested-parties register with owner, need, monitoring method and review date."),
    ],
    specific: {
      "ISO 9001": [
        q("tm-9001-5.1", "5.1", "ISO 9001", "Does top management take accountability for QMS effectiveness and customer focus?", "MR minutes, KPI dashboard reviewed by CEO, customer satisfaction reports signed by leadership."),
        q("tm-9001-5.2", "5.2", "ISO 9001", "Is the Quality Policy appropriate, documented, communicated and available to interested parties?", "Signed policy, notice-board photo, intranet link, awareness training records, website page."),
        q("tm-9001-6.2", "6.2", "ISO 9001", "Are quality objectives established at relevant functions, measurable and monitored?", "Objectives register with baseline, target, owner, frequency, current status."),
        q("tm-9001-9.3", "9.3", "ISO 9001", "Does management review consider all required inputs (audits, complaints, KPIs, R&O, changes)?", "MR pack with all 9.3.2 inputs, decisions on improvement, resources, changes."),
      ],
      "ISO 14001": [
        q("tm-14001-5.1", "5.1", "ISO 14001", "Does top management take accountability for the EMS and integrate environmental requirements into business processes?", "Environmental leadership commitments in strategy doc, MR minutes covering EMS."),
        q("tm-14001-5.2", "5.2", "ISO 14001", "Is the Environmental Policy documented, committed to protection of the environment and to compliance obligations?", "Signed environmental policy referencing prevention of pollution and compliance."),
        q("tm-14001-6.2", "6.2", "ISO 14001", "Are environmental objectives set for significant aspects with action plans?", "Objectives with targets (e.g. tCO2, m³ water) and action plan with owners/dates."),
      ],
      "ISO 45001": [
        q("tm-45001-5.1", "5.1", "ISO 45001", "Does top management take overall responsibility for prevention of work-related injury and ill health?", "OH&S policy signed by CEO, safety walk records, leadership visible-felt safety programme."),
        q("tm-45001-5.4", "5.4", "ISO 45001", "Are worker consultation and participation processes established and effective for non-managerial workers?", "Safety committee ToR, minutes with worker reps, suggestion log, response tracker."),
        q("tm-45001-6.2", "6.2", "ISO 45001", "Are OH&S objectives set with plans, resources and completion dates?", "OH&S objectives register with leading and lagging indicators."),
      ],
      "IMS": [
        q("tm-ims-5.2", "5.2", "IMS", "Is an integrated QHSE policy signed by top management and reviewed for continuing suitability?", "Single QHSE policy dated within review cycle, review evidence."),
        q("tm-ims-9.3", "9.3", "IMS", "Does management review cover quality, environmental and OH&S performance in one integrated meeting?", "Integrated MR minutes with sections for Q, E, S and shared decisions."),
        q("tm-ims-4.1", "4.1", "IMS", "Is a single context analysis (SWOT/PESTLE) covering Q, E and S issues maintained?", "Context analysis document reviewed at defined frequency."),
      ],
    },
  },
  {
    id: "qaqc",
    name: "QA / QC",
    icon: Beaker,
    summary: "Quality assurance planning and quality control inspection & testing.",
    generic: [
      q("qa-g1", "—", "Generic", "Are inspection and test plans (ITPs) approved, current and available at the point of use?", "Latest revision ITPs signed off, sighted at inspection point."),
      q("qa-g2", "—", "Generic", "Are measuring and monitoring devices identified, calibrated and traceable to recognised standards?", "Calibration register, valid calibration certificates, unique ID labels on instruments."),
      q("qa-g3", "—", "Generic", "Are nonconforming outputs identified, segregated, dispositioned and recorded?", "NCR log, red-tag/quarantine area photos, disposition records (rework/scrap/concession)."),
      q("qa-g4", "—", "Generic", "Are inspection personnel qualified against defined criteria (e.g. NDT L-II, IPC-A-610)?", "Qualification certificates, eyesight test records, qualification matrix."),
      q("qa-g5", "—", "Generic", "Are sampling plans statistically justified (e.g. ANSI/ASQ Z1.4) with AQL defined?", "Sampling plan document, AQL basis, sample-size records against lot size."),
    ],
    specific: {
      "ISO 9001": [
        q("qa-9001-8.5.1", "8.5.1", "ISO 9001", "Are controlled conditions for production and service provision applied?", "Work instructions, monitoring records, competence records, validated processes list."),
        q("qa-9001-8.6", "8.6", "ISO 9001", "Is product/service release verified against acceptance criteria with release authority recorded?", "Signed release records, CoC/CoA, traceability from lot to release approver."),
        q("qa-9001-8.7", "8.7", "ISO 9001", "Are nonconforming outputs handled via correction, segregation, return, suspension or concession with records?", "NCR forms, concession approvals, customer notification records where required."),
        q("qa-9001-7.1.5", "7.1.5", "ISO 9001", "Are monitoring & measurement resources fit for purpose and maintained?", "Equipment maintenance log, MSA/GR&R study records for critical instruments."),
      ],
      "ISO 14001": [
        q("qa-14001-9.1.1", "9.1.1", "ISO 14001", "Does QC monitoring include environmental parameters where applicable?", "Effluent test reports, emissions monitoring records, waste characterisation lab reports."),
        q("qa-14001-9.1.2", "9.1.2", "ISO 14001", "Is compliance status of environmental measurement results evaluated?", "Compliance evaluation record, trend charts vs permit limits."),
      ],
      "ISO 45001": [
        q("qa-45001-8.1.2", "8.1.2", "ISO 45001", "Do inspection activities incorporate OH&S hazard identification?", "Pre-task JSA/JHA, safe operating procedure, PPE list for inspection tasks."),
        q("qa-45001-7.1", "7.1", "ISO 45001", "Are hazardous chemicals used by QA/QC controlled (SDS, exposure monitoring)?", "SDS binder, COSHH/HAZCOM assessment, exposure monitoring records."),
      ],
      "IMS": [
        q("qa-ims-9.1", "9.1", "IMS", "Is a single QHSE monitoring & measurement register used across quality, environment and safety?", "Integrated M&M plan spreadsheet with owners and frequency."),
      ],
    },
  },
  {
    id: "qms",
    name: "QMS (Management System Owner)",
    icon: BookOpen,
    summary: "Documented information, internal audit, corrective action and improvement.",
    generic: [
      q("qms-g1", "—", "Generic", "Is the master list of documented information current, with revision control and access rights defined?", "Master document list, DMS access matrix, obsolete-document control record."),
      q("qms-g2", "—", "Generic", "Is the internal audit programme risk-based, executed on schedule and covering all applicable processes/sites?", "3-year audit plan, current-year schedule with completion status."),
      q("qms-g3", "—", "Generic", "Are corrective actions verified for effectiveness before closure?", "CAPA log with effectiveness verification date, evidence and verifier signature."),
      q("qms-g4", "—", "Generic", "Are internal auditors trained and independent of the audited area?", "Auditor qualification records (ISO 19011 training), independence declaration."),
      q("qms-g5", "—", "Generic", "Are audit reports issued within defined SLAs with findings tracked to closure?", "Audit report register with issue date, agreed close date, closure evidence."),
    ],
    specific: {
      "ISO 9001": [
        q("qms-9001-4.4", "4.4", "ISO 9001", "Are QMS processes, sequence, interactions, KPIs and owners defined and maintained?", "Process interaction map, turtle diagrams, KPI register per process."),
        q("qms-9001-9.2", "9.2", "ISO 9001", "Are internal audits planned, conducted by competent auditors and results reported to relevant management?", "Audit plan, checklists, reports, distribution list, MR input."),
        q("qms-9001-10.3", "10.3", "ISO 9001", "Is continual improvement evidenced through outputs of analysis, audits and management review?", "Improvement initiatives register with before/after metrics."),
      ],
      "ISO 14001": [
        q("qms-14001-9.2", "9.2", "ISO 14001", "Do EMS internal audits verify legal compliance and effectiveness of controls over significant aspects?", "EMS audit checklists referencing legal register and significant aspect controls."),
      ],
      "ISO 45001": [
        q("qms-45001-9.2", "9.2", "ISO 45001", "Do OH&S internal audits include worker consultation and cover contractors and visitors where applicable?", "Audit interviews with workers/contractors documented."),
      ],
      "IMS": [
        q("qms-ims-7.5", "7.5", "IMS", "Is documented information integrated (one procedure set) rather than duplicated per standard where appropriate?", "Integrated procedures referencing Q/E/S clauses in a single index."),
        q("qms-ims-10.2", "10.2", "IMS", "Is a single CAPA workflow used for Q, E and S nonconformities with unified root-cause analysis?", "CAPA form template supporting all three domains, unified log."),
      ],
    },
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: Users,
    summary: "Competence, training, awareness and worker consultation.",
    generic: [
      q("hr-g1", "—", "Generic", "Are competence requirements defined for roles impacting the MS and gaps closed with training?", "Competence matrix per role, gap analysis, training plan closing gaps."),
      q("hr-g2", "—", "Generic", "Are training records complete, retained and reviewed for currency (including refreshers)?", "Training register with expiry dates, certificates on file."),
      q("hr-g3", "—", "Generic", "Is a documented onboarding/induction programme delivered to all new joiners and contractors?", "Signed induction checklist per new joiner covering QHSE topics."),
      q("hr-g4", "—", "Generic", "Are training effectiveness evaluations performed (Kirkpatrick L1/L2 minimum)?", "Post-training assessment scores, manager feedback forms."),
      q("hr-g5", "—", "Generic", "Are disciplinary and grievance procedures documented, communicated and applied consistently?", "HR policy, grievance log, case files with fair-hearing evidence."),
    ],
    specific: {
      "ISO 9001": [
        q("hr-9001-7.2", "7.2", "ISO 9001", "Is competence for personnel affecting quality performance evaluated and evidenced?", "Skill assessment records, on-the-job evaluations for quality-critical roles."),
        q("hr-9001-7.3", "7.3", "ISO 9001", "Are personnel aware of quality policy, objectives, their contribution and consequences of nonconformance?", "Awareness quiz results, toolbox talk records referencing policy."),
      ],
      "ISO 14001": [
        q("hr-14001-7.3", "7.3", "ISO 14001", "Is environmental awareness (policy, significant aspects, contribution) delivered to all personnel?", "Environmental awareness training register with attendance."),
      ],
      "ISO 45001": [
        q("hr-45001-7.2", "7.2", "ISO 45001", "Is OH&S competence (including hazard awareness and emergency response) evidenced for all workers?", "OH&S training matrix, fire warden/first-aid certificates, drill attendance."),
        q("hr-45001-5.4", "5.4", "ISO 45001", "Is worker consultation and participation documented for OH&S decisions?", "Safety committee minutes, worker suggestion register."),
      ],
      "IMS": [
        q("hr-ims-7.2", "7.2", "IMS", "Is a single competence matrix maintained covering Q, E and S skill needs per role?", "Consolidated QHSE competence matrix reviewed annually."),
      ],
    },
  },
  {
    id: "operations",
    name: "Operations",
    icon: Cog,
    summary: "Operational planning, control and delivery of products and services.",
    generic: [
      q("ops-g1", "—", "Generic", "Are operational procedures current, accessible at the point of use and understood by operators?", "Sighted work instructions at station, operator interview evidence."),
      q("ops-g2", "—", "Generic", "Is management of change (MoC) applied to permanent and temporary operational changes?", "MoC register, risk assessment per change, approvals, closure verification."),
      q("ops-g3", "—", "Generic", "Are shift handovers documented to preserve continuity of controls?", "Shift log book, handover checklist, escalation records."),
      q("ops-g4", "—", "Generic", "Are process KPIs (yield, OEE, on-time delivery) tracked with corrective action on trends?", "KPI dashboards, trend charts, action tracker."),
    ],
    specific: {
      "ISO 9001": [
        q("ops-9001-8.1", "8.1", "ISO 9001", "Is operational planning and control implemented to meet requirements and defined for outsourced processes?", "Production plan, outsourced-process control matrix."),
        q("ops-9001-8.5", "8.5", "ISO 9001", "Are production/service conditions controlled (documented info, competence, monitoring, infrastructure)?", "Work instructions, operator qualification, in-process monitoring records."),
      ],
      "ISO 14001": [
        q("ops-14001-8.1", "8.1", "ISO 14001", "Are operational controls established for significant environmental aspects, including lifecycle perspective?", "Aspect-impact register with operational controls, lifecycle assessment summary."),
        q("ops-14001-8.2", "8.2", "ISO 14001", "Is emergency preparedness and response established, tested and periodically reviewed?", "Emergency response plan, drill records, post-drill review report."),
      ],
      "ISO 45001": [
        q("ops-45001-8.1.2", "8.1.2", "ISO 45001", "Is the hierarchy of controls applied to eliminate hazards and reduce OH&S risk?", "Risk assessment showing hierarchy application (elim/sub/engineering/admin/PPE)."),
        q("ops-45001-8.2", "8.2", "ISO 45001", "Are emergency scenarios (fire, spill, medical, evacuation) drilled with workers on defined frequency?", "Drill schedule, attendance sheets, evaluation and improvement actions."),
      ],
      "IMS": [
        q("ops-ims-8.1", "8.1", "IMS", "Are operational controls designed to address quality, environment and OH&S in a single work instruction where possible?", "Integrated SOPs referencing QHSE requirements."),
      ],
    },
  },
  {
    id: "engineering",
    name: "Engineering / Design",
    icon: Wrench,
    summary: "Design & development inputs, verification, validation and change control.",
    generic: [
      q("eng-g1", "—", "Generic", "Are design inputs (functional, statutory, safety, environmental) documented and reviewed for adequacy?", "Design input document, review minutes, sign-off by disciplines."),
      q("eng-g2", "—", "Generic", "Are verification and validation activities planned and results retained?", "V&V plan, test reports, prototype validation records."),
      q("eng-g3", "—", "Generic", "Are FMEAs (design and process) maintained and reviewed on change?", "Latest DFMEA/PFMEA with RPN, action list, revision history."),
      q("eng-g4", "—", "Generic", "Are drawing and BOM changes controlled via ECR/ECN workflow?", "ECR/ECN log, impact assessment, distribution to affected functions."),
    ],
    specific: {
      "ISO 9001": [
        q("eng-9001-8.3.2", "8.3.2", "ISO 9001", "Is design & development planning (stages, reviews, responsibilities, resources) documented?", "D&D plan with gate reviews and RACI."),
        q("eng-9001-8.3.6", "8.3.6", "ISO 9001", "Are design changes reviewed, controlled and impact-assessed prior to implementation?", "Change register with impact analysis, approvals before release."),
      ],
      "ISO 14001": [
        q("eng-14001-8.1", "8.1", "ISO 14001", "Is a lifecycle perspective applied in design (materials, energy, end-of-life, transport)?", "LCA summary or eco-design checklist per project."),
      ],
      "ISO 45001": [
        q("eng-45001-8.1.3", "8.1.3", "ISO 45001", "Are OH&S risks assessed for new or changed designs before commissioning (safety-in-design)?", "Safety-in-design HAZOP/HAZID reports."),
      ],
      "IMS": [
        q("eng-ims-8.3", "8.3", "IMS", "Does the design review checklist explicitly capture quality, environmental and OH&S considerations?", "Integrated design review checklist template with Q/E/S sections."),
      ],
    },
  },
  {
    id: "construction",
    name: "Construction",
    icon: HardHat,
    summary: "Site mobilisation, permit-to-work, subcontractor control and handover.",
    generic: [
      q("con-g1", "—", "Generic", "Are construction method statements approved and communicated before work start?", "Approved method statement, toolbox talk records, worker signatures."),
      q("con-g2", "—", "Generic", "Is subcontractor onboarding (pre-qualification, induction, insurances) evidenced before mobilisation?", "PQQ, insurance certificates, induction records, PPE issue."),
      q("con-g3", "—", "Generic", "Are daily site diaries maintained with progress, weather, incidents and visitors?", "Signed site diaries for the period, sample entries."),
      q("con-g4", "—", "Generic", "Is a project-specific quality/HSE plan approved by client before mobilisation?", "Client-endorsed PQP/HSEP with revision history."),
    ],
    specific: {
      "ISO 9001": [
        q("con-9001-8.5.4", "8.5.4", "ISO 9001", "Is preservation of construction outputs controlled against damage/deterioration?", "Material storage inspection records, protective covering photos."),
        q("con-9001-8.6", "8.6", "ISO 9001", "Are inspection & test plans executed with hold/witness points signed before proceeding?", "Signed ITP records, RFI logs, third-party witness sign-offs."),
      ],
      "ISO 14001": [
        q("con-14001-8.1", "8.1", "ISO 14001", "Are site environmental controls (dust, noise, spill, waste segregation) implemented and inspected?", "Environmental inspection reports, waste manifests, dust/noise readings."),
      ],
      "ISO 45001": [
        q("con-45001-8.1.2", "8.1.2", "ISO 45001", "Is a Permit-to-Work system enforced for hot work, working at height, confined space and energy isolation?", "PTW register, sample permits with atmospheric tests, isolation certificates."),
        q("con-45001-8.1.4", "8.1.4", "ISO 45001", "Are contractor OH&S performance and incidents monitored throughout the project?", "Contractor KPI dashboard, incident log by contractor."),
      ],
      "IMS": [
        q("con-ims-8.1", "8.1", "IMS", "Is a single site HSEQ plan approved for the project and briefed at daily toolbox talks?", "Integrated HSEQ plan, TBT register referencing plan."),
      ],
    },
  },
  {
    id: "sales",
    name: "Sales",
    icon: Handshake,
    summary: "Customer requirements, contract review and order acceptance.",
    generic: [
      q("sal-g1", "—", "Generic", "Are customer enquiries and orders formally reviewed against capability before acceptance?", "Enquiry review checklist, capability confirmation from operations."),
      q("sal-g2", "—", "Generic", "Are contract amendments controlled and communicated to affected functions?", "Amendment log, distribution records to operations/finance/legal."),
      q("sal-g3", "—", "Generic", "Is customer complaint handling tracked to closure with RCA?", "Complaint log with root cause, corrective action, customer confirmation."),
    ],
    specific: {
      "ISO 9001": [
        q("sal-9001-8.2.2", "8.2.2", "ISO 9001", "Are customer, statutory and regulatory requirements determined prior to commitment?", "Requirement capture form, regulatory checklist per market."),
        q("sal-9001-8.2.3", "8.2.3", "ISO 9001", "Is contract review conducted, differences resolved and ability confirmed before acceptance?", "Signed contract review record."),
        q("sal-9001-9.1.2", "9.1.2", "ISO 9001", "Is customer satisfaction monitored using defined methods and results acted upon?", "Survey results, NPS trend, action plan on detractor feedback."),
      ],
      "ISO 14001": [
        q("sal-14001-8.1", "8.1", "ISO 14001", "Are customer-imposed environmental requirements (packaging, take-back, restricted substances) captured in orders?", "Order form fields for RoHS/REACH, take-back clause acknowledgment."),
      ],
      "ISO 45001": [
        q("sal-45001-8.1.4", "8.1.4", "ISO 45001", "Are OH&S obligations arising from the contract (site access rules, PPE) communicated internally?", "Internal briefing note per project on client HSE rules."),
      ],
      "IMS": [
        q("sal-ims-8.2", "8.2", "IMS", "Does the contract review checklist prompt for Q, E and S requirements imposed by the customer?", "Integrated contract review template."),
      ],
    },
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Megaphone,
    summary: "External communication, brand claims and market intelligence.",
    generic: [
      q("mkt-g1", "—", "Generic", "Are external communications approved to ensure accuracy of claims (technical, environmental, safety)?", "Content approval workflow, sign-off records per campaign."),
      q("mkt-g2", "—", "Generic", "Are voice-of-customer inputs channelled into product/service improvement?", "VoC report distributed to product/ops with actions."),
      q("mkt-g3", "—", "Generic", "Is brand and trademark use controlled (logo, colours, certification marks)?", "Brand guidelines, approvals for third-party use."),
    ],
    specific: {
      "ISO 9001": [
        q("mkt-9001-8.2.1", "8.2.1", "ISO 9001", "Are customer communications on product info, enquiries, feedback and complaints managed?", "CRM records, response SLAs, escalation procedure."),
      ],
      "ISO 14001": [
        q("mkt-14001-7.4", "7.4", "ISO 14001", "Are environmental claims substantiated and free of greenwashing?", "Evidence file per claim (LCA data, certifications, third-party verification)."),
      ],
      "ISO 45001": [
        q("mkt-45001-7.4", "7.4", "ISO 45001", "Are safety claims for products/services technically justified with evidence?", "Test reports supporting safety claims."),
      ],
      "IMS": [
        q("mkt-ims-7.4", "7.4", "IMS", "Is an approval workflow enforced for external communication referring to Q, E or S certifications?", "Approval matrix requiring QHSE sign-off before use of certificate logos."),
      ],
    },
  },
  {
    id: "procurement",
    name: "Procurement",
    icon: ShoppingCart,
    summary: "Supplier selection, evaluation, purchase control and verification.",
    generic: [
      q("prc-g1", "—", "Generic", "Is an approved vendor list maintained with re-evaluation criteria and frequency?", "AVL with status, last evaluation date, scorecard."),
      q("prc-g2", "—", "Generic", "Do purchase orders clearly specify requirements including release/verification and delivery terms?", "Sample POs with spec, quality clauses, INCOTERMS."),
      q("prc-g3", "—", "Generic", "Is supplier performance (OTIF, PPM, complaints) tracked and communicated?", "Supplier scorecards, quarterly business review minutes."),
      q("prc-g4", "—", "Generic", "Are conflict-of-interest and anti-bribery declarations obtained from procurement staff and key suppliers?", "Signed CoI declarations, ABC clauses in contracts."),
    ],
    specific: {
      "ISO 9001": [
        q("prc-9001-8.4.1", "8.4.1", "ISO 9001", "Are external providers evaluated, selected and monitored on defined criteria?", "Evaluation records with scoring rubric."),
        q("prc-9001-8.4.3", "8.4.3", "ISO 9001", "Is information for external providers adequate (product/process, competence, control, verification)?", "PO with technical annex, quality flow-down clauses."),
      ],
      "ISO 14001": [
        q("prc-14001-8.1", "8.1", "ISO 14001", "Are environmental requirements (RoHS, REACH, packaging, transport) flowed down to suppliers?", "Environmental annex to PO, supplier declarations on file."),
      ],
      "ISO 45001": [
        q("prc-45001-8.1.4.2", "8.1.4.2", "ISO 45001", "Are OH&S criteria used in selection and evaluation of contractors and their sub-tiers?", "Contractor pre-qualification with OH&S KPIs (LTIFR, TRIR)."),
      ],
      "IMS": [
        q("prc-ims-8.4", "8.4", "IMS", "Do supplier assessments cover quality, environmental and OH&S performance in a single scorecard?", "Integrated QHSE supplier scorecard."),
      ],
    },
  },
  {
    id: "finance",
    name: "Finance & Accounts",
    icon: Landmark,
    summary: "Budgeting, cost of quality, and financial resources for the MS.",
    generic: [
      q("fin-g1", "—", "Generic", "Are financial resources allocated in the annual budget for MS activities?", "Approved budget line items: training, audits, calibration, PPE."),
      q("fin-g2", "—", "Generic", "Are segregation of duties and approval limits enforced in financial transactions?", "DoA matrix, ERP role mapping, exception report."),
      q("fin-g3", "—", "Generic", "Are external and internal financial audits closed with action tracking?", "Audit reports and management letters with action status."),
    ],
    specific: {
      "ISO 9001": [
        q("fin-9001-7.1.1", "7.1.1", "ISO 9001", "Are resources determined and provided for establishment, maintenance and improvement of the QMS?", "Budget allocation to QMS improvement projects."),
        q("fin-9001-9.1.3", "9.1.3", "ISO 9001", "Is cost-of-poor-quality (rework, scrap, warranty, complaints) analysed and reported?", "COPQ report with trend and pareto analysis."),
      ],
      "ISO 14001": [
        q("fin-14001-7.1", "7.1", "ISO 14001", "Are resources for environmental controls, monitoring equipment and permits allocated?", "Approved capex/opex for EMS equipment and permit fees."),
      ],
      "ISO 45001": [
        q("fin-45001-7.1", "7.1", "ISO 45001", "Are OH&S resources (PPE, safety devices, medical surveillance, incident response) budgeted?", "OH&S budget with actual spend vs plan."),
      ],
      "IMS": [
        q("fin-ims-7.1", "7.1", "IMS", "Is a consolidated QHSE budget line tracked against actuals in monthly finance review?", "Monthly QHSE budget vs actual report."),
      ],
    },
  },
  {
    id: "store",
    name: "Store",
    icon: Package,
    summary: "Receipt inspection, identification, storage and issue of materials.",
    generic: [
      q("str-g1", "—", "Generic", "Are received items inspected against PO and NCRs raised for non-conforming deliveries?", "GRN with inspection stamp, NCR log."),
      q("str-g2", "—", "Generic", "Are materials identified, traceable and stored under conditions preserving fitness for use?", "Bin cards, lot/batch labels, temperature/humidity logs."),
      q("str-g3", "—", "Generic", "Are stock movements (receipt, issue, return, transfer) recorded in real time?", "ERP transactions vs physical stock samples."),
    ],
    specific: {
      "ISO 9001": [
        q("str-9001-8.5.2", "8.5.2", "ISO 9001", "Is identification and traceability of materials maintained through receipt, storage and issue?", "Traceability trace from lot to issued job."),
        q("str-9001-8.5.4", "8.5.4", "ISO 9001", "Is preservation (handling, packaging, storage, transmission) controlled to protect conformity?", "Storage inspection report, damaged-stock isolation."),
      ],
      "ISO 14001": [
        q("str-14001-8.1", "8.1", "ISO 14001", "Are chemicals stored with SDS, secondary containment, segregation and labelling per regulations?", "Chemical store inspection, SDS binder, bund inspection record."),
      ],
      "ISO 45001": [
        q("str-45001-8.1", "8.1", "ISO 45001", "Are manual handling, racking loads and forklift operations controlled and inspected?", "Racking inspection report (SEMA/equivalent), forklift log."),
      ],
      "IMS": [
        q("str-ims-8.5", "8.5", "IMS", "Does the store inspection checklist cover product preservation, environmental spill risk and manual-handling hazards?", "Integrated store inspection checklist."),
      ],
    },
  },
  {
    id: "ict",
    name: "ICT / Information Technology",
    icon: Server,
    summary: "Infrastructure, information security, backup and business continuity.",
    generic: [
      q("ict-g1", "—", "Generic", "Are user access rights provisioned on role basis and reviewed at defined frequency?", "Access matrix, quarterly access review report."),
      q("ict-g2", "—", "Generic", "Are backups performed, restoration tested, and retention periods defined?", "Backup job logs, restore test report, retention policy."),
      q("ict-g3", "—", "Generic", "Is an incident management process in place with logged tickets and SLAs?", "Ticketing system extract, SLA compliance report."),
      q("ict-g4", "—", "Generic", "Is patch and vulnerability management performed on schedule?", "Patch compliance report, vulnerability scan summary."),
    ],
    specific: {
      "ISO 9001": [
        q("ict-9001-7.1.3", "7.1.3", "ISO 9001", "Is infrastructure supporting the QMS maintained to ensure availability?", "SLA reports, uptime dashboard, maintenance records."),
        q("ict-9001-7.5.3", "7.5.3", "ISO 9001", "Is documented information stored electronically with version control, protection and retention?", "DMS version history, access log, retention rules configuration."),
      ],
      "ISO 14001": [
        q("ict-14001-7.1", "7.1", "ISO 14001", "Are e-waste, data-centre energy and cooling addressed within environmental aspects?", "E-waste disposal certificates, PUE metric report."),
      ],
      "ISO 45001": [
        q("ict-45001-7.1", "7.1", "ISO 45001", "Are ergonomic assessments performed for workstations and hybrid/remote workers?", "Ergonomic assessment forms, home-office self-assessment."),
      ],
      "IMS": [
        q("ict-ims-7.5", "7.5", "IMS", "Is the QHSE document management system available, backed up and access-controlled?", "DMS backup log, RBAC configuration."),
      ],
    },
  },
  {
    id: "warehouse",
    name: "Warehouse",
    icon: Warehouse,
    summary: "Bulk storage, inventory accuracy, dispatch and loading operations.",
    generic: [
      q("wh-g1", "—", "Generic", "Are cycle counts and stock reconciliations performed on schedule with variances investigated?", "Cycle count schedule and results, variance investigation notes."),
      q("wh-g2", "—", "Generic", "Are FIFO/FEFO rules applied for perishable or shelf-life-controlled items?", "Bin arrangement, expiry tracking report."),
      q("wh-g3", "—", "Generic", "Are 5S standards implemented and audited?", "5S audit scorecard with photos."),
    ],
    specific: {
      "ISO 9001": [
        q("wh-9001-8.5.4", "8.5.4", "ISO 9001", "Are outbound goods preserved and packaged to withstand transport to the customer?", "Packing specification, transit-damage rate report."),
      ],
      "ISO 14001": [
        q("wh-14001-8.1", "8.1", "ISO 14001", "Are waste streams segregated with disposal records?", "Waste manifest, licensed disposer certificates."),
        q("wh-14001-8.2", "8.2", "ISO 14001", "Are spill kits available, inspected and personnel trained in their use?", "Spill kit inspection log, training records."),
      ],
      "ISO 45001": [
        q("wh-45001-8.1a", "8.1", "ISO 45001", "Are MHE operator licences current and pre-use checks recorded?", "MHE licence register, daily pre-use checklists."),
        q("wh-45001-8.1b", "8.1", "ISO 45001", "Are pedestrian/vehicle segregation, racking inspections and loading-dock safety enforced?", "Site walk photos, racking inspection report, dock-lock use."),
      ],
      "IMS": [
        q("wh-ims-8.1", "8.1", "IMS", "Does warehouse inspection combine 5S, environmental and safety observations in one round?", "Combined warehouse inspection checklist."),
      ],
    },
  },
  {
    id: "project-management",
    name: "Project Management",
    icon: KanbanSquare,
    summary: "Project planning, risk management, stakeholder and change control.",
    generic: [
      q("pm-g1", "—", "Generic", "Is a project management plan approved at project start?", "Approved PMP covering scope/schedule/cost/quality/HSE/risk."),
      q("pm-g2", "—", "Generic", "Is a project risk register maintained and reviewed at defined intervals?", "Risk register with owner, mitigation, review dates."),
      q("pm-g3", "—", "Generic", "Are lessons learned captured at gate reviews and closure?", "Lessons-learned log fed into org knowledge base."),
    ],
    specific: {
      "ISO 9001": [
        q("pm-9001-6.1", "6.1", "ISO 9001", "Are risks and opportunities at project level identified and integrated into the plan?", "Risk register linked to project schedule."),
        q("pm-9001-8.1", "8.1", "ISO 9001", "Are project deliverables verified against acceptance criteria at each milestone?", "Milestone acceptance records signed by client."),
      ],
      "ISO 14001": [
        q("pm-14001-6.1.2", "6.1.2", "ISO 14001", "Are project-specific environmental aspects assessed and controls integrated into the schedule?", "Project aspect register, controls scheduled."),
      ],
      "ISO 45001": [
        q("pm-45001-6.1.2", "6.1.2", "ISO 45001", "Are project OH&S hazards assessed and controls resourced?", "Project HIRA, resource plan for controls."),
      ],
      "IMS": [
        q("pm-ims-6.1", "6.1", "IMS", "Does the integrated project HSEQ plan reference Q, E and S deliverables and KPIs?", "Integrated project HSEQ plan."),
      ],
    },
  },
  {
    id: "admin",
    name: "Administration",
    icon: Briefcase,
    summary: "Facilities, document handling, travel and general administration.",
    generic: [
      q("adm-g1", "—", "Generic", "Are visitor and contractor access, induction and PPE issuance controlled at reception?", "Visitor log, induction slips, PPE issue log."),
      q("adm-g2", "—", "Generic", "Are office facilities maintained (lighting, HVAC, sanitation, ergonomics)?", "Facility inspection reports, PPM records."),
      q("adm-g3", "—", "Generic", "Are records archived and destroyed per the retention schedule?", "Retention schedule, destruction certificates."),
    ],
    specific: {
      "ISO 9001": [
        q("adm-9001-7.1.4", "7.1.4", "ISO 9001", "Is the working environment (physical, social, psychological) suitable for consistent conformity?", "Office environment survey, action tracker."),
      ],
      "ISO 14001": [
        q("adm-14001-8.1", "8.1", "ISO 14001", "Are utilities consumption (energy, water, paper) monitored and reduction initiatives evidenced?", "Utility bills trend, reduction initiative log."),
      ],
      "ISO 45001": [
        q("adm-45001-8.2", "8.2", "ISO 45001", "Are fire wardens, first-aiders and emergency signage current and visible?", "Warden/first-aider list, signage inspection report."),
      ],
      "IMS": [
        q("adm-ims-7.4", "7.4", "IMS", "Are notice boards displaying QHSE policy, objectives and emergency information kept current?", "Photos of notice board with dated content."),
      ],
    },
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    icon: Scale,
    summary: "Legal register, contracts, statutory obligations and reporting.",
    generic: [
      q("leg-g1", "—", "Generic", "Is a legal & other requirements register maintained with owner, applicability and review date?", "Legal register with owner column and last-review date."),
      q("leg-g2", "—", "Generic", "Are contract templates reviewed for indemnity, liability and compliance clauses?", "Template library with legal review sign-off."),
      q("leg-g3", "—", "Generic", "Are litigation and regulatory matters tracked with status reporting to top management?", "Litigation tracker, monthly report to leadership."),
    ],
    specific: {
      "ISO 9001": [
        q("leg-9001-4.2", "4.2", "ISO 9001", "Are statutory/regulatory product requirements identified, monitored and communicated?", "Regulatory watch list per product/market."),
      ],
      "ISO 14001": [
        q("leg-14001-6.1.3", "6.1.3", "ISO 14001", "Are environmental permits, consents and reporting deadlines tracked with evidence of compliance?", "Permit register, submission acknowledgments."),
        q("leg-14001-9.1.2", "9.1.2", "ISO 14001", "Is periodic evaluation of compliance with environmental obligations performed and documented?", "Compliance evaluation report signed off."),
      ],
      "ISO 45001": [
        q("leg-45001-6.1.3", "6.1.3", "ISO 45001", "Are OH&S legal obligations tracked?", "OH&S legal register, RIDDOR/OSHA submissions."),
      ],
      "IMS": [
        q("leg-ims-6.1.3", "6.1.3", "IMS", "Is a single QHSE legal register maintained with cross-referenced obligations by function?", "Integrated QHSE legal register."),
      ],
    },
  },
  {
    id: "logistics",
    name: "Logistics",
    icon: Truck,
    summary: "Transport planning, driver management and delivery performance.",
    generic: [
      q("log-g1", "—", "Generic", "Are transport partners evaluated on OTIF, damage rates and compliance record?", "Carrier scorecards, damage-claim log."),
      q("log-g2", "—", "Generic", "Are shipping documents complete and released before dispatch?", "Sample dispatch pack: packing list, MSDS, CoA, BoL."),
      q("log-g3", "—", "Generic", "Are dangerous goods shipments prepared per applicable regulations (ADR/IMDG/IATA)?", "DGD forms, trained shipper certificate."),
    ],
    specific: {
      "ISO 9001": [
        q("log-9001-8.5.4", "8.5.4", "ISO 9001", "Is preservation during transport controlled (temperature, shock, humidity) where applicable?", "Data-logger reports, cold-chain records."),
      ],
      "ISO 14001": [
        q("log-14001-8.1", "8.1", "ISO 14001", "Is transport CO₂ / fuel consumption monitored and optimised?", "Fleet fuel report, route optimisation savings."),
        q("log-14001-8.2", "8.2", "ISO 14001", "Are transport spill scenarios covered by emergency response arrangements?", "Driver spill kit, ERP for transport incidents."),
      ],
      "ISO 45001": [
        q("log-45001-8.1", "8.1", "ISO 45001", "Are driving-for-work risks assessed (hours of work, vehicle fitness, driver competence)?", "Driving risk assessment, tachograph records, licence checks."),
      ],
      "IMS": [
        q("log-ims-8.4", "8.4", "IMS", "Are 3PL contracts flowed with QHSE requirements and performance reviewed jointly?", "3PL contract QHSE annex, QBR minutes."),
      ],
    },
  },
  {
    id: "production",
    name: "Production / Manufacturing",
    icon: Factory,
    summary: "Line control, changeover, maintenance and product release.",
    generic: [
      q("prd-g1", "—", "Generic", "Are line-clearance and changeover checks recorded to prevent mix-ups?", "Line-clearance forms signed by supervisor per changeover."),
      q("prd-g2", "—", "Generic", "Is planned/preventive maintenance executed on schedule with breakdown metrics tracked?", "PM schedule vs completion, MTBF/MTTR report."),
      q("prd-g3", "—", "Generic", "Are process parameters within validated ranges with alarms actioned?", "SPC charts, alarm log with response actions."),
    ],
    specific: {
      "ISO 9001": [
        q("prd-9001-8.5.1", "8.5.1", "ISO 9001", "Are production controls applied to each work centre?", "Work-centre control plan, operator qualification records."),
        q("prd-9001-8.5.6", "8.5.6", "ISO 9001", "Are changes in production reviewed and controlled to ensure continued conformity?", "MoC records for production changes."),
      ],
      "ISO 14001": [
        q("prd-14001-8.1", "8.1", "ISO 14001", "Are emissions, effluent, noise and waste from production monitored against permit limits?", "Monitoring reports vs permit thresholds."),
      ],
      "ISO 45001": [
        q("prd-45001-8.1.2", "8.1.2", "ISO 45001", "Are machine guards, LOTO, ventilation and noise controls verified during production audits?", "LOTO log, guard inspection, noise/LEV survey."),
      ],
      "IMS": [
        q("prd-ims-8.5", "8.5", "IMS", "Do line-side audits (LPA / gemba) cover quality, environment and safety observations?", "Layered process audit records with Q/E/S findings."),
      ],
    },
  },
  {
    id: "business-development",
    name: "Business Development",
    icon: TrendingUp,
    summary: "Market entry, strategic partnerships and new opportunity qualification.",
    generic: [
      q("bd-g1", "—", "Generic", "Are new markets/opportunities qualified against capability, risk and regulatory exposure?", "Opportunity qualification form, go/no-go decision record."),
      q("bd-g2", "—", "Generic", "Are partnership due-diligence checks performed and recorded?", "DD reports (financial, sanctions, compliance)."),
      q("bd-g3", "—", "Generic", "Are strategic risks reported into the enterprise risk register?", "ERM register showing BD-sourced risks."),
    ],
    specific: {
      "ISO 9001": [
        q("bd-9001-4.1", "4.1", "ISO 9001", "Do BD inputs feed analysis of external issues and interested-party requirements?", "Context analysis referencing BD market intelligence."),
        q("bd-9001-6.1", "6.1", "ISO 9001", "Are opportunities logged with risk assessment before strategic commitment?", "Opportunity register with risk score."),
      ],
      "ISO 14001": [
        q("bd-14001-6.1.1", "6.1.1", "ISO 14001", "Are environmental risks and opportunities considered in new-business decisions?", "Environmental due-diligence report per opportunity."),
      ],
      "ISO 45001": [
        q("bd-45001-6.1.1", "6.1.1", "ISO 45001", "Are OH&S risks of entering new sectors/geographies assessed?", "OH&S country/sector risk assessment."),
      ],
      "IMS": [
        q("bd-ims-4.1", "4.1", "IMS", "Do BD reports to top management include QHSE implications of proposed strategic moves?", "BD board pack with QHSE implications section."),
      ],
    },
  },
];

// ------------------------------------------------------------
// Extended generic question bank — appended to every process to give
// auditors deeper, process-specific coverage beyond the base set above.
// ------------------------------------------------------------

const EXTRA_GENERIC: Record<string, Question[]> = {
  "top-management": [
    q("tm-x1", "—", "Generic", "Is a documented succession & delegation plan in place for critical leadership roles?", "Succession matrix, delegation-of-authority signed, deputy nomination memos."),
    q("tm-x2", "—", "Generic", "Are strategic risks and opportunities reviewed at board level with treatment plans tracked?", "Board risk register, meeting minutes, action tracker with owners and due dates."),
    q("tm-x3", "—", "Generic", "Is compliance obligation performance (regulatory, contractual, voluntary) reported to top management?", "Compliance dashboard, legal register review sign-off, non-compliance log."),
    q("tm-x4", "—", "Generic", "Are ethics, anti-bribery and whistleblowing arrangements endorsed and monitored by top management?", "Signed code of conduct, whistleblower reports log, ethics committee minutes."),
    q("tm-x5", "—", "Generic", "Is organisational change (mergers, restructuring, new sites) planned with MS impact assessment?", "Change control record, transition plan, updated org chart and processes."),
  ],
  "qaqc": [
    q("qa-x1", "—", "Generic", "Is a Quality Plan produced for each project/product family covering inspection points and acceptance criteria?", "Approved Quality Plan / ITP with hold, witness and review points."),
    q("qa-x2", "—", "Generic", "Are inspection, measuring and test equipment identified, calibrated and traceable to national standards?", "Calibration register, certificates, unique IDs, out-of-service tags."),
    q("qa-x3", "—", "Generic", "Are nonconforming outputs identified, segregated, dispositioned and trended?", "NCR log, red-tag/quarantine area photos, MRB minutes, trend charts."),
    q("qa-x4", "—", "Generic", "Are inspectors qualified with documented competence (training, on-the-job, certifications)?", "Inspector qualification matrix, NDT/welding certificates, refresher records."),
    q("qa-x5", "—", "Generic", "Are supplier incoming inspections risk-based and results fed back to procurement/vendor rating?", "Incoming inspection records, supplier scorecards, rejection notes."),
    q("qa-x6", "—", "Generic", "Are first-article / first-piece approvals executed and retained for new or changed products?", "FAI reports, PPAP/APQP records, signed samples."),
  ],
  "qms": [
    q("qms-x1", "—", "Generic", "Is a documented information control procedure covering creation, review, approval, distribution and obsolescence in force?", "Document control procedure, master list, version history, obsolete-copy log."),
    q("qms-x2", "—", "Generic", "Is the internal audit programme risk-based, covering all processes and sites over the cycle?", "3-year audit plan, coverage matrix, auditor independence records."),
    q("qms-x3", "—", "Generic", "Are audit findings tracked to closure with root-cause and effectiveness verification?", "CAPA register, 5-Why/fishbone analysis, effectiveness review notes."),
    q("qms-x4", "—", "Generic", "Is a process map / interaction diagram maintained showing inputs, outputs, owners and KPIs?", "Process architecture map, turtle diagrams, KPI dashboards."),
    q("qms-x5", "—", "Generic", "Are records retained per a documented schedule and protected from loss/alteration?", "Records retention schedule, off-site/archive log, backup verification."),
  ],
  "hr": [
    q("hr-x1", "—", "Generic", "Are recruitment, onboarding and background-check processes documented and evidenced?", "Recruitment SOP, offer letters, reference/background check reports, induction checklist."),
    q("hr-x2", "—", "Generic", "Are training needs identified per role, delivered and effectiveness evaluated?", "Training needs analysis, training matrix, evaluation forms, competence assessment."),
    q("hr-x3", "—", "Generic", "Are performance appraisals conducted at planned intervals with development plans?", "Appraisal forms, moderation minutes, IDPs, promotion/reward records."),
    q("hr-x4", "—", "Generic", "Are disciplinary, grievance and whistleblowing procedures documented and applied consistently?", "Disciplinary log, grievance register, whistleblower cases with outcomes."),
    q("hr-x5", "—", "Generic", "Are statutory HR obligations (PAYE, pension, NSITF, NHF, ITF, HMO) remitted and evidenced?", "Remittance receipts, compliance certificates, payroll reconciliations."),
    q("hr-x6", "—", "Generic", "Is personnel data handled per applicable data protection law (NDPR) with access controls?", "HRIS access log, privacy notice for staff, retention schedule for HR records."),
  ],
  "operations": [
    q("op-x1", "—", "Generic", "Are operations planned with defined criteria, controlled conditions and monitored KPIs?", "Operations plan, work instructions, KPI dashboards (OEE, throughput, yield)."),
    q("op-x2", "—", "Generic", "Are shift handovers formalised with documented handover notes and open-issue register?", "Shift log book, handover checklist, escalation register."),
    q("op-x3", "—", "Generic", "Are outsourced processes controlled with defined requirements and verification?", "Outsourcing register, service agreements, verification records."),
    q("op-x4", "—", "Generic", "Are emergency stop, evacuation and business-continuity arrangements tested?", "Drill reports, BCP test records, lessons-learned log."),
    q("op-x5", "—", "Generic", "Is preventive maintenance scheduled and executed with breakdown analysis feeding improvements?", "PM schedule, work-order history, MTBF/MTTR trends."),
  ],
  "engineering": [
    q("eng-x1", "—", "Generic", "Is design & development planned with defined stages, reviews, verification and validation?", "Design plan, stage-gate minutes, V&V reports, sign-offs."),
    q("eng-x2", "—", "Generic", "Are engineering changes controlled with impact assessment on QHSE, cost, delivery?", "ECR/ECN log, impact assessment forms, implementation evidence."),
    q("eng-x3", "—", "Generic", "Is intellectual property (drawings, models, software) protected and access-controlled?", "PLM access matrix, NDA register, IP register."),
    q("eng-x4", "—", "Generic", "Are safety-in-design (inherent safety, HAZOP, LOPA) studies performed and actions closed?", "HAZOP/HAZID reports, action tracker with closeout evidence."),
    q("eng-x5", "—", "Generic", "Are calculations, drawings and specifications independently checked and approved?", "Drawing title blocks with checker/approver signatures, calculation review notes."),
  ],
  "construction": [
    q("con-x1", "—", "Generic", "Is a site-specific HSE plan approved before mobilisation with client acceptance?", "Site HSE plan, client acceptance letter, mobilisation checklist."),
    q("con-x2", "—", "Generic", "Are Permit-to-Work systems (hot work, confined space, working at height, excavation) enforced?", "PTW register, sample permits, permit audit reports."),
    q("con-x3", "—", "Generic", "Are subcontractors pre-qualified, inducted and their competence verified?", "Subcontractor pre-qual file, induction records, competence certificates."),
    q("con-x4", "—", "Generic", "Are Method Statements and Job Safety Analyses reviewed with the crew before task execution?", "MS/JSA with crew signatures, toolbox talk records."),
    q("con-x5", "—", "Generic", "Are lifting plans, scaffolding inspections and temporary works certified by competent persons?", "Lift plans, Scafftag records, temporary-works design & inspection sheets."),
    q("con-x6", "—", "Generic", "Are handover, punch-list, as-built and O&M documents delivered and accepted at project close?", "Handover certificate, punch-list closeout, as-built drawings, O&M manuals."),
  ],
  "sales": [
    q("sal-x1", "—", "Generic", "Are customer requirements reviewed and confirmed before commitment (contract review)?", "Contract review form, deviation log, approval signatures."),
    q("sal-x2", "—", "Generic", "Are quotations, orders and contracts controlled through a defined workflow with authority limits?", "CRM audit trail, DoA matrix, order acknowledgement records."),
    q("sal-x3", "—", "Generic", "Are customer complaints logged, investigated, resolved within SLA and trended?", "Complaint register, RCA reports, CAPA linkage, trend analysis."),
    q("sal-x4", "—", "Generic", "Is customer satisfaction measured, analysed and reviewed by leadership?", "CSAT/NPS reports, MR pack extract, action log."),
    q("sal-x5", "—", "Generic", "Are sales personnel trained on product safety, ethical selling and anti-bribery?", "Training records, code of conduct sign-off, gifts & hospitality log."),
  ],
  "marketing": [
    q("mkt-x1", "—", "Generic", "Are marketing claims verified as truthful, substantiated and compliant with sector regulations (ARCON, NAFDAC, SEC where applicable)?", "Claims substantiation file, legal review sign-off, regulatory approval where required."),
    q("mkt-x2", "—", "Generic", "Is brand & content approval workflow enforced before publication?", "Content approval matrix, DAM version history, audit trail."),
    q("mkt-x3", "—", "Generic", "Are personal data collected via marketing channels processed per NDPR with consent records?", "Consent capture logs, privacy notice, opt-out mechanism, DPIA where required."),
    q("mkt-x4", "—", "Generic", "Are agency and vendor engagements covered by contracts including confidentiality and IP clauses?", "Signed MSAs, NDAs, SoWs, IP transfer clauses."),
    q("mkt-x5", "—", "Generic", "Are marketing spend budgets tracked with ROI/attribution reporting to management?", "Budget vs actual, campaign ROI dashboards, MR extract."),
  ],
  "procurement": [
    q("proc-x1", "—", "Generic", "Are suppliers evaluated, approved and periodically re-evaluated with documented criteria?", "Approved Vendor List, evaluation scorecards, re-evaluation cycle records."),
    q("proc-x2", "—", "Generic", "Are purchase requisitions, orders and contracts approved per delegation of authority?", "PR/PO audit trail, DoA matrix, exception log."),
    q("proc-x3", "—", "Generic", "Are purchasing specifications (technical, HSE, quality, regulatory) communicated to suppliers?", "PO with attached specs, supplier acknowledgement, quality/HSE clauses."),
    q("proc-x4", "—", "Generic", "Is a conflict-of-interest, anti-bribery and gifts policy enforced within procurement?", "COI declarations, gifts register, ethics training records."),
    q("proc-x5", "—", "Generic", "Are counterfeit / suspect item controls implemented for critical materials?", "CFSI procedure, incoming inspection with authenticity checks."),
    q("proc-x6", "—", "Generic", "Are procurement KPIs (savings, on-time, quality, cycle time) tracked and reviewed?", "Procurement dashboard, review minutes."),
  ],
  "finance": [
    q("fin-x1", "—", "Generic", "Is a chart of accounts, accounting policy manual and closing calendar maintained?", "CoA document, policy manual, month-end closing checklist."),
    q("fin-x2", "—", "Generic", "Are bank, cash and inter-company reconciliations performed and reviewed monthly?", "Reconciliation files with preparer/reviewer signatures."),
    q("fin-x3", "—", "Generic", "Is segregation of duties enforced across P2P, O2C and R2R with periodic SoD conflict review?", "SoD matrix, ERP role review, exception approvals."),
    q("fin-x4", "—", "Generic", "Are tax obligations (CIT, VAT, WHT, PAYE, TET) filed and remitted on time with FIRS/State receipts?", "Tax filing register, remittance receipts, TCC copies."),
    q("fin-x5", "—", "Generic", "Are financial statements prepared per applicable framework (IFRS) and independently audited?", "Signed FS, external auditor's report, management letter responses."),
    q("fin-x6", "—", "Generic", "Are budgets prepared, approved and variance-analysed with corrective actions?", "Approved budget, monthly variance reports, action tracker."),
  ],
  "store": [
    q("st-x1", "—", "Generic", "Are materials received, inspected, tagged and stored per specification (FIFO/FEFO, environmental conditions)?", "GRN, inspection sheet, storage layout, temperature/humidity logs."),
    q("st-x2", "—", "Generic", "Are stock counts (cycle and annual) performed with variance investigation and adjustment approval?", "Count sheets, variance report, approval memo."),
    q("st-x3", "—", "Generic", "Are hazardous materials segregated, SDS available and spill kits provided?", "Segregation matrix, SDS binder, spill kit inspection log."),
    q("st-x4", "—", "Generic", "Are issue/return transactions authorised and recorded in real time?", "Signed issue notes, ERP transaction log."),
    q("st-x5", "—", "Generic", "Are slow-moving, obsolete and expired items identified, reported and dispositioned?", "SLOB report, disposal approval, scrap certificate."),
  ],
  "ict": [
    q("ict-x1", "—", "Generic", "Is an information asset inventory maintained with owners and classifications?", "Asset register (hardware, software, data) with owner and classification."),
    q("ict-x2", "—", "Generic", "Are access controls enforced with joiner/mover/leaver workflow and periodic user access reviews?", "JML tickets, quarterly UAR evidence, privileged access log."),
    q("ict-x3", "—", "Generic", "Are backups scheduled, monitored and restoration tested at defined intervals?", "Backup logs, restore test report, RPO/RTO evidence."),
    q("ict-x4", "—", "Generic", "Are vulnerabilities scanned, patched and penetration-tested per policy?", "Vulnerability scan reports, patch compliance dashboard, pen-test report."),
    q("ict-x5", "—", "Generic", "Is an incident response plan documented, exercised and post-incident reviews performed?", "IR plan, tabletop exercise report, incident register with PIR."),
    q("ict-x6", "—", "Generic", "Are personal data processing systems assessed for NDPR compliance (encryption, logging, retention)?", "System DPIAs, encryption inventory, log retention configuration."),
  ],
  "warehouse": [
    q("wh-x1", "—", "Generic", "Are warehouse layouts optimised with clearly marked racking, aisles and emergency exits?", "Warehouse layout drawing, aisle markings, evacuation plan."),
    q("wh-x2", "—", "Generic", "Are forklift and MHE operators licensed, medically fit and equipment inspected daily?", "Operator licences, pre-use checklists, medical fitness records."),
    q("wh-x3", "—", "Generic", "Are inbound/outbound documents (GRN, GDN, waybill) controlled and reconciled?", "GRN/GDN registers, reconciliation reports."),
    q("wh-x4", "—", "Generic", "Are storage conditions (temperature, humidity, pest control) monitored and recorded?", "Environmental monitoring logs, pest control service reports."),
    q("wh-x5", "—", "Generic", "Are damaged, returned and quarantined stock segregated and dispositioned?", "Quarantine area photos, disposition records."),
  ],
  "project-management": [
    q("pm-x1", "—", "Generic", "Is a Project Management Plan produced covering scope, schedule, cost, quality, HSE, risk and comms?", "PMP document with stakeholder sign-off."),
    q("pm-x2", "—", "Generic", "Are project risks identified, assessed and treatment tracked to closure?", "Risk register with owners, ratings, treatment status."),
    q("pm-x3", "—", "Generic", "Are stage-gate reviews conducted with go/no-go decisions documented?", "Gate review minutes, checklist scoring, sponsor sign-off."),
    q("pm-x4", "—", "Generic", "Is earned-value / progress reporting produced and reviewed against baseline?", "EV/S-curve reports, monthly project reviews."),
    q("pm-x5", "—", "Generic", "Are change requests controlled with impact assessment and formal approval?", "Change log, CR forms with approvals, revised baseline."),
    q("pm-x6", "—", "Generic", "Are lessons learned captured, shared and used to improve future projects?", "Lessons-learned register, cross-project briefing minutes."),
  ],
  "admin": [
    q("adm-x1", "—", "Generic", "Are facility permits, tenancy, insurance and statutory certificates current and displayed?", "Permit binder, insurance certificates, tenancy agreements."),
    q("adm-x2", "—", "Generic", "Are visitor, contractor and vehicle access controls documented and enforced?", "Visitor log, contractor induction records, gate pass system."),
    q("adm-x3", "—", "Generic", "Is a records/archive management procedure with retention schedule enforced?", "Archive index, retention schedule, destruction certificates."),
    q("adm-x4", "—", "Generic", "Are office equipment, utilities and cleaning services managed with performance SLAs?", "Service contracts, SLA reports, complaint log."),
    q("adm-x5", "—", "Generic", "Are travel, protocol and expense processes controlled with approval workflows and audit trails?", "Travel policy, expense reports with approvals, per-diem records."),
  ],
  "legal": [
    q("leg-x1", "—", "Generic", "Is a contracts register maintained with expiry, renewal and obligation tracking?", "Contract register with dates, obligations tracker."),
    q("leg-x2", "—", "Generic", "Is a legal & regulatory compliance obligations register maintained and reviewed for changes?", "Compliance register with source, owner, evaluation date, status."),
    q("leg-x3", "—", "Generic", "Are litigation, disputes and regulatory investigations tracked with reserves reported to finance?", "Litigation log, external counsel updates, provision schedule."),
    q("leg-x4", "—", "Generic", "Is a corporate governance calendar (AGM, board meetings, statutory filings) maintained?", "Governance calendar, CAC filings, board minutes."),
    q("leg-x5", "—", "Generic", "Are anti-bribery, sanctions and data-protection (NDPR) programmes owned and evidenced by legal/compliance?", "ABC policy, sanctions screening logs, NDPR compliance file."),
  ],
  "logistics": [
    q("log-x1", "—", "Generic", "Are transporters/carriers pre-qualified for safety, insurance and regulatory compliance?", "Carrier pre-qual file, insurance certificates, vehicle inspection records."),
    q("log-x2", "—", "Generic", "Are dangerous goods classified, packed, marked and documented per ADR/IMDG/IATA/NUPRC as applicable?", "DG declaration, packing certificate, driver training certificates."),
    q("log-x3", "—", "Generic", "Are journey management, driver hours and vehicle telematics monitored?", "JMP forms, driver-hour logs, telematics dashboards."),
    q("log-x4", "—", "Generic", "Are delivery KPIs (on-time, in-full, damage rate) tracked and reviewed?", "OTIF reports, damage claim register."),
    q("log-x5", "—", "Generic", "Are import/export customs declarations, duties and permits managed with clean documentation?", "Bills of lading, SGD, Form M, NAFDAC/SON permits."),
  ],
  "production": [
    q("prod-x1", "—", "Generic", "Are production plans balanced against capacity, materials and skills with schedule adherence tracked?", "Master production schedule, capacity plan, adherence KPI."),
    q("prod-x2", "—", "Generic", "Are process parameters (SPC) monitored with reaction plans for out-of-control conditions?", "SPC charts, reaction plan, operator training on SPC."),
    q("prod-x3", "—", "Generic", "Are changeovers, setups and first-off inspections controlled?", "SMED procedure, first-off inspection records."),
    q("prod-x4", "—", "Generic", "Are traceability records (batch, lot, serial) maintained end-to-end?", "Traceability records tested via mock recall within SLA."),
    q("prod-x5", "—", "Generic", "Are yield, scrap and rework tracked with root-cause analysis feeding CAPA?", "Yield reports, scrap logs, CAPA linkage."),
    q("prod-x6", "—", "Generic", "Are lockout/tagout, machine guarding and PPE strictly enforced on the shop floor?", "LOTO register, guarding inspection, PPE compliance audit."),
  ],
  "business-development": [
    q("bd-x1", "—", "Generic", "Are new markets, products and partners assessed for QHSE, regulatory and reputational risk?", "Opportunity risk assessment, go/no-go memos."),
    q("bd-x2", "—", "Generic", "Are due diligence checks (KYC, sanctions, integrity) performed on prospective partners?", "KYC files, sanctions screening reports, integrity DD reports."),
    q("bd-x3", "—", "Generic", "Are pipeline and win/loss data reviewed with actions to improve capture rate?", "Pipeline report, win/loss analysis, action tracker."),
    q("bd-x4", "—", "Generic", "Are proposal reviews (technical, commercial, legal, QHSE) evidenced before submission?", "Bid/no-bid decision, proposal review checklist with signatures."),
    q("bd-x5", "—", "Generic", "Are strategic partnerships and JV agreements approved by top management with defined governance?", "Signed JV/partnership agreements, steering committee TOR."),
  ],
};

// Merge extras into each process at module load.
for (const p of PROCESSES) {
  const extras = EXTRA_GENERIC[p.id];
  if (extras && extras.length) p.generic.push(...extras);
}


const CATEGORY_META: Record<Standard, { color: string; label: string }> = {
  "ISO 9001": { color: "bg-sky-500/10 text-sky-700 ring-sky-500/20", label: "Quality" },
  "ISO 14001": { color: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20", label: "Environment" },
  "ISO 45001": { color: "bg-amber-500/10 text-amber-700 ring-amber-500/20", label: "OH&S" },
  "IMS": { color: "bg-violet-500/10 text-violet-700 ring-violet-500/20", label: "Integrated" },
};

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

function ProcessAuditsPage() {
  const [query, setQuery] = useState("");
  const [standard, setStandard] = useState<Standard>("ISO 9001");
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);


  const filtered = useMemo(() => {
    if (!query) return PROCESSES;
    const s = query.toLowerCase();
    return PROCESSES.filter((p) =>
      p.name.toLowerCase().includes(s) || p.summary.toLowerCase().includes(s),
    );
  }, [query]);

  const active = PROCESSES.find((p) => p.id === openId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />

      <section className="border-b border-white/10 bg-[var(--navy-deep)] text-white">
        <div className="container-page py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="chip-on-dark"><Layers className="h-3 w-3" /> Clause-to-Process Breakdown</span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              Audit each department against the ISO clauses that actually apply to it.
            </h1>
            <p className="mt-5 text-lg text-white/75">
              ISO 9001, 14001, 45001 and IMS broken down into generic and process-specific audit questions —
              each with expected evidence, finding notes and attachment upload — across 20 organizational functions.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search process (HR, Procurement, Production…)"
                className="w-full rounded-md border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STANDARDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStandard(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    standard === s
                      ? "bg-[var(--teal)] text-white"
                      : "border border-white/15 text-white/75 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14" aria-busy={loading}>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {loading
              ? "Loading processes…"
              : `${filtered.length} organizational process${filtered.length === 1 ? "" : "es"}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {standard} · {CATEGORY_META[standard].label} — click any process to execute inline.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading processes">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="h-5 w-16 rounded-full bg-muted" />
                </div>
                <div className="mt-4 h-5 w-2/3 rounded bg-muted" />
                <div className="mt-2 h-3 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
                <div className="mt-5 flex justify-between">
                  <div className="h-3 w-32 rounded bg-muted" />
                  <div className="h-3 w-12 rounded bg-muted" />
                </div>
              </div>
            ))}
            <span className="sr-only">Loading processes…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Layers className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-foreground">No processes match your search</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different keyword such as “HR”, “Procurement” or “Production”.
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-[var(--teal)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const specificCount = p.specific[standard].length;
              const total = p.generic.length + specificCount;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setOpenId(p.id)}
                  aria-label={`Audit ${p.name} against ${standard} — ${total} questions`}
                  className="group text-left rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--teal)]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--teal)]/10 text-[var(--teal)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${CATEGORY_META[standard].color}`}>
                      {standard}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.summary}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {p.generic.length} generic · {specificCount} specific · {total} total
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--teal)] font-semibold group-hover:gap-1.5 transition-all">
                      Audit <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>


      {active && (
        <ProcessDrawer
          process={active}
          standard={standard}
          onClose={() => setOpenId(null)}
        />
      )}
      <PageFooter />
    </div>
  );
}

// ------------------------------------------------------------
// Shared UI
// ------------------------------------------------------------

function PageHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--navy-deep)]/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--gradient-accent)] text-white shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Auditly</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/checklists" className="hover:text-white">Checklists</Link>
          <Link to="/process-audits" className="text-white">Process Audits</Link>
        </nav>
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-md bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
          Request demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-border bg-[var(--navy-deep)] py-10 text-white/70">
      <div className="container-page flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--teal)]" />
          Process-based audit questions · Aligned to ISO 9001, 14001, 45001 & integrated IMS.
        </div>
        <Link to="/checklists" className="text-white/80 hover:text-white">← Back to checklist library</Link>
      </div>
    </footer>
  );
}

// ------------------------------------------------------------
// Execution drawer (generic + specific questions)
// ------------------------------------------------------------

type Attachment = { name: string; size: number; type: string };

function ProcessDrawer({
  process, standard, onClose,
}: {
  process: ProcessDef;
  standard: Standard;
  onClose: () => void;
}) {
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const allQuestions = useMemo(
    () => [...process.generic, ...process.specific[standard], ...customQuestions],
    [process, standard, customQuestions],
  );

  const stats = useMemo(() => {
    let conform = 0, minor = 0, major = 0, na = 0, pending = 0;
    for (const it of allQuestions) {
      const r = responses[it.id];
      if (r === "conform") conform++;
      else if (r === "minor") minor++;
      else if (r === "major") major++;
      else if (r === "na") na++;
      else pending++;
    }
    const answered = conform + minor + major;
    const score = answered > 0 ? Math.round((conform / answered) * 100) : 0;
    return { conform, minor, major, na, pending, score, total: allQuestions.length };
  }, [responses, allQuestions]);

  const exportJson = () => {
    const payload = {
      process: { id: process.id, name: process.name },
      standard,
      executed_at: new Date().toISOString(),
      score: stats.score,
      summary: { conform: stats.conform, minor: stats.minor, major: stats.major, na: stats.na, pending: stats.pending },
      items: allQuestions.map((i) => ({
        clause: i.clause,
        standard: i.standard,
        question: i.question,
        expected_evidence: i.evidence,
        response: responses[i.id] ?? null,
        finding_notes: notes[i.id] ?? "",
        attachments: attachments[i.id] ?? [],
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${process.id}-${standard.replace(/\s+/g, "-").toLowerCase()}-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderQuestion = (it: Question, idx: number) => (
    <QuestionRow
      key={it.id}
      question={it}
      idx={idx}
      response={responses[it.id]}
      note={notes[it.id] ?? ""}
      files={attachments[it.id] ?? []}
      onRespond={(r) => setResponses((p) => ({ ...p, [it.id]: r }))}
      onNote={(v) => setNotes((p) => ({ ...p, [it.id]: v }))}
      onAddFiles={(files) =>
        setAttachments((p) => ({
          ...p,
          [it.id]: [
            ...(p[it.id] ?? []),
            ...files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          ],
        }))
      }
      onRemoveFile={(fileIdx) =>
        setAttachments((p) => ({
          ...p,
          [it.id]: (p[it.id] ?? []).filter((_, i) => i !== fileIdx),
        }))
      }
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-3xl flex-col bg-background shadow-2xl">
        <div className="border-b border-border bg-[var(--navy-deep)] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-white/60">{process.name} · {standard}</div>
              <h2 className="mt-1 font-display text-xl font-bold">Process Audit — {process.name}</h2>
              <p className="mt-1 text-sm text-white/70">{process.summary}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="rounded-md border border-white/15 px-2 py-1 text-sm text-white/80 hover:bg-white/10">Close</button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Score" value={`${stats.score}%`} tone="teal" />
            <Stat label="Conforming" value={stats.conform} tone="green" />
            <Stat label="Minor NC" value={stats.minor} tone="amber" />
            <Stat label="Major NC" value={stats.major} tone="red" />
            <Stat label="Pending" value={stats.pending} tone="slate" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              <ClipboardCheck className="h-4 w-4" /> Generic questions ({process.generic.length})
            </h3>
            <ol className="space-y-4">
              {process.generic.map((it, i) => renderQuestion(it, i))}
            </ol>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              <Layers className="h-4 w-4" /> {standard} specific ({process.specific[standard].length})
            </h3>
            <ol className="space-y-4">
              {process.specific[standard].map((it, i) => renderQuestion(it, process.generic.length + i))}
            </ol>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <Plus className="h-4 w-4" /> Auditor-added questions ({customQuestions.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--teal)] hover:bg-[var(--teal)]/20"
              >
                <Plus className="h-3.5 w-3.5" /> {showAddForm ? "Cancel" : "Add question"}
              </button>
            </div>

            {showAddForm && (
              <AddQuestionForm
                standard={standard}
                onCancel={() => setShowAddForm(false)}
                onAdd={(nq) => {
                  setCustomQuestions((p) => [...p, nq]);
                  setShowAddForm(false);
                }}
              />
            )}

            {customQuestions.length > 0 && (
              <ol className="mt-4 space-y-4">
                {customQuestions.map((it, i) => (
                  <div key={it.id} className="relative">
                    {renderQuestion(it, process.generic.length + process.specific[standard].length + i)}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomQuestions((p) => p.filter((q0) => q0.id !== it.id));
                        setResponses((p) => { const c = { ...p }; delete c[it.id]; return c; });
                        setNotes((p) => { const c = { ...p }; delete c[it.id]; return c; });
                        setAttachments((p) => { const c = { ...p }; delete c[it.id]; return c; });
                      }}
                      aria-label="Remove custom question"
                      className="absolute right-3 top-3 rounded-md border border-border bg-background p-1 text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </ol>
            )}

            {customQuestions.length === 0 && !showAddForm && (
              <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                No custom questions yet. Use “Add question” to extend this checklist with site-specific, contractual or risk-based items.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-muted/40 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {stats.total - stats.pending}/{stats.total} answered · {stats.major} major, {stats.minor} minor
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted">
                Save draft
              </button>
              <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-md bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                <Download className="h-4 w-4" /> Export & send to CAPA
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function QuestionRow({
  question, idx, response, note, files,
  onRespond, onNote, onAddFiles, onRemoveFile,
}: {
  question: Question;
  idx: number;
  response: Response;
  note: string;
  files: Attachment[];
  onRespond: (r: Response) => void;
  onNote: (v: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (idx: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-foreground">
          {idx + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className={`rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide ${
              question.standard === "Generic" ? "bg-slate-500/10 text-slate-600" : "bg-[var(--teal)]/10 text-[var(--teal)]"
            }`}>
              {question.standard}
            </span>
            {question.clause !== "—" && (
              <span className="font-mono rounded bg-muted px-1.5 py-0.5">Clause {question.clause}</span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">{question.question}</p>

          <div className="mt-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Evidence expected: </span>
            {question.evidence}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <RespBtn active={response === "conform"} onClick={() => onRespond("conform")} icon={CheckCircle2} label="Conform" tone="green" />
            <RespBtn active={response === "minor"} onClick={() => onRespond("minor")} icon={AlertTriangle} label="Minor NC" tone="amber" />
            <RespBtn active={response === "major"} onClick={() => onRespond("major")} icon={XCircle} label="Major NC" tone="red" />
            <RespBtn active={response === "na"} onClick={() => onRespond("na")} icon={MinusCircle} label="N/A" tone="slate" />
          </div>

          <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Auditor findings & notes
          </label>
          <textarea
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Record what was seen, the sample reviewed, gaps observed and immediate containment…"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            rows={2}
          />

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Evidence attachments ({files.length})
              </span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Upload className="h-3.5 w-3.5" /> Upload evidence
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  if (list.length) onAddFiles(list);
                  e.target.value = "";
                }}
              />
            </div>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md bg-muted/60 px-2.5 py-1.5 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5 text-foreground">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-muted-foreground">· {formatSize(f.size)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveFile(i)}
                      aria-label={`Remove ${f.name}`}
                      className="ml-2 rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: "teal" | "green" | "amber" | "red" | "slate" }) {
  const map: Record<string, string> = {
    teal: "text-[var(--teal)]",
    green: "text-emerald-400",
    amber: "text-amber-300",
    red: "text-rose-400",
    slate: "text-white/80",
  };
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className={`font-display text-xl font-bold ${map[tone]}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-white/55">{label}</div>
    </div>
  );
}

function RespBtn({
  active, onClick, icon: Icon, label, tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "green" | "amber" | "red" | "slate";
}) {
  const active_map: Record<string, string> = {
    green: "bg-emerald-500 text-white border-emerald-500",
    amber: "bg-amber-500 text-white border-amber-500",
    red: "bg-rose-500 text-white border-rose-500",
    slate: "bg-slate-600 text-white border-slate-600",
  };
  const idle_map: Record<string, string> = {
    green: "text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10",
    amber: "text-amber-600 border-amber-500/30 hover:bg-amber-500/10",
    red: "text-rose-600 border-rose-500/30 hover:bg-rose-500/10",
    slate: "text-slate-600 border-slate-500/30 hover:bg-slate-500/10",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
        active ? active_map[tone] : `bg-background ${idle_map[tone]}`
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function AddQuestionForm({
  standard, onAdd, onCancel,
}: {
  standard: Standard;
  onAdd: (q: Question) => void;
  onCancel: () => void;
}) {
  const [scope, setScope] = useState<Standard | "Generic">("Generic");
  const [clause, setClause] = useState("");
  const [text, setText] = useState("");
  const [evidence, setEvidence] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAdd({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clause: clause.trim() || "—",
      standard: scope,
      question: text.trim(),
      evidence: evidence.trim() || "Auditor to specify evidence required.",
    });
    setClause(""); setText(""); setEvidence("");
  };

  return (
    <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as Standard | "Generic")}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
          >
            <option value="Generic">Generic</option>
            {STANDARDS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Clause (optional)</label>
          <input
            value={clause}
            onChange={(e) => setClause(e.target.value)}
            placeholder={`e.g. ${standard === "IMS" ? "8.1" : "7.2"}`}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Audit question *</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="e.g. Are contractor competency certificates verified before mobilisation?"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Evidence expected</label>
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          rows={2}
          placeholder="e.g. Contractor pre-mobilisation checklist with signed certificates on file."
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--teal)] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add to checklist
        </button>
      </div>
    </div>
  );
}
