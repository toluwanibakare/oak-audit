import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, ArrowRight, Search, Download, CheckCircle2, XCircle,
  MinusCircle, AlertTriangle, ClipboardCheck, FileText, Factory,
  Leaf, HeartPulse, Lock, Truck, Building2, Beaker, Landmark, Users, Layers,
} from "lucide-react";

export const Route = createFileRoute("/checklists")({
  head: () => ({
    meta: [
      { title: "Audit Checklists Library — Auditly" },
      { name: "description", content: "Ready-to-execute audit checklists for ISO 9001, 14001, 45001, 27001, 22000, 13485, IATF 16949, IMS, NDPR, Nigeria Workplace Safety, GMP, HACCP, supplier and internal audits." },
      { property: "og:title", content: "Audit Checklists Library — Auditly" },
      { property: "og:description", content: "Execute audits against ISO standards, IMS, regulatory frameworks, internal policies and suppliers — all in one library." },
    ],
  }),
  component: ChecklistsPage,
});

type Response = "conform" | "minor" | "major" | "na" | null;
type Item = { id: string; clause: string; question: string; guidance?: string };
type Checklist = {
  id: string;
  code: string;
  name: string;
  category: "ISO" | "IMS" | "Regulatory" | "Internal" | "Supplier" | "Industry";
  authority: string;
  version: string;
  description: string;
  items: Item[];
};

const CHECKLISTS: Checklist[] = [
  {
    id: "iso-9001",
    code: "ISO 9001:2015",
    name: "Quality Management System",
    category: "ISO",
    authority: "ISO",
    version: "2015",
    description: "Full QMS internal audit checklist covering clauses 4–10.",
    items: [
      { id: "9001-4.1", clause: "4.1", question: "Has the organisation determined external and internal issues relevant to its purpose and strategic direction?", guidance: "Look for a SWOT / PESTLE analysis reviewed at management review." },
      { id: "9001-4.2", clause: "4.2", question: "Have interested parties and their requirements been identified and monitored?" },
      { id: "9001-4.3", clause: "4.3", question: "Is the scope of the QMS documented, including justification for any exclusions?" },
      { id: "9001-4.4", clause: "4.4", question: "Are QMS processes, sequence, interaction, KPIs and owners defined?" },
      { id: "9001-5.1", clause: "5.1", question: "Does top management demonstrate leadership and commitment to the QMS?" },
      { id: "9001-5.2", clause: "5.2", question: "Is the Quality Policy documented, communicated and appropriate to the purpose?" },
      { id: "9001-5.3", clause: "5.3", question: "Are roles, responsibilities and authorities assigned and communicated?" },
      { id: "9001-6.1", clause: "6.1", question: "Are risks and opportunities identified, evaluated and addressed?" },
      { id: "9001-6.2", clause: "6.2", question: "Are quality objectives SMART, resourced and tracked?" },
      { id: "9001-7.1", clause: "7.1", question: "Are resources (people, infrastructure, environment, monitoring) adequate and controlled?" },
      { id: "9001-7.2", clause: "7.2", question: "Is competence of personnel determined, ensured and evidenced?" },
      { id: "9001-7.5", clause: "7.5", question: "Is documented information controlled (creation, approval, versioning, retention)?" },
      { id: "9001-8.1", clause: "8.1", question: "Is operational planning and control implemented, including outsourced processes?" },
      { id: "9001-8.4", clause: "8.4", question: "Are externally provided processes, products and services controlled and supplier performance monitored?" },
      { id: "9001-8.5", clause: "8.5", question: "Are production and service provision controlled (traceability, property of customers, preservation)?" },
      { id: "9001-8.7", clause: "8.7", question: "Are nonconforming outputs identified and controlled to prevent unintended use?" },
      { id: "9001-9.1", clause: "9.1", question: "Are monitoring, measurement, analysis and evaluation activities defined and performed?" },
      { id: "9001-9.2", clause: "9.2", question: "Are internal audits planned, executed and results reported to management?" },
      { id: "9001-9.3", clause: "9.3", question: "Are management reviews conducted with all required inputs and outputs?" },
      { id: "9001-10.2", clause: "10.2", question: "Are nonconformities addressed with root cause analysis and corrective action?" },
      { id: "9001-10.3", clause: "10.3", question: "Is continual improvement evidenced across the QMS?" },
    ],
  },
  {
    id: "iso-14001",
    code: "ISO 14001:2015",
    name: "Environmental Management System",
    category: "ISO",
    authority: "ISO",
    version: "2015",
    description: "Environmental aspects, legal compliance and lifecycle perspective.",
    items: [
      { id: "14001-4.1", clause: "4.1", question: "Are environmental external/internal issues (including climate change) identified?" },
      { id: "14001-6.1.2", clause: "6.1.2", question: "Are environmental aspects and impacts determined using a lifecycle perspective?" },
      { id: "14001-6.1.3", clause: "6.1.3", question: "Is a register of applicable compliance obligations maintained and reviewed?" },
      { id: "14001-6.2", clause: "6.2", question: "Are environmental objectives set, measurable, monitored and communicated?" },
      { id: "14001-7.4", clause: "7.4", question: "Is internal and external environmental communication managed?" },
      { id: "14001-8.1", clause: "8.1", question: "Are operational controls in place for significant aspects and outsourced processes?" },
      { id: "14001-8.2", clause: "8.2", question: "Is emergency preparedness and response established, tested and reviewed?" },
      { id: "14001-9.1.2", clause: "9.1.2", question: "Is compliance with legal and other requirements periodically evaluated?" },
      { id: "14001-9.2", clause: "9.2", question: "Are internal environmental audits conducted per programme?" },
      { id: "14001-10.2", clause: "10.2", question: "Are incidents, nonconformities and corrective actions managed?" },
    ],
  },
  {
    id: "iso-45001",
    code: "ISO 45001:2018",
    name: "Occupational Health & Safety",
    category: "ISO",
    authority: "ISO",
    version: "2018",
    description: "Worker participation, hazard identification and OH&S risk control.",
    items: [
      { id: "45001-5.4", clause: "5.4", question: "Is worker consultation and participation established at all levels?" },
      { id: "45001-6.1.2.1", clause: "6.1.2.1", question: "Is hazard identification ongoing, proactive and covers routine/non-routine activities?" },
      { id: "45001-6.1.2.2", clause: "6.1.2.2", question: "Are OH&S risks and opportunities assessed with documented methodology?" },
      { id: "45001-6.1.3", clause: "6.1.3", question: "Are legal and other OH&S requirements determined and access maintained?" },
      { id: "45001-7.2", clause: "7.2", question: "Is competence for tasks affecting OH&S evidenced (training, certification)?" },
      { id: "45001-8.1.2", clause: "8.1.2", question: "Is the hierarchy of controls applied (elimination → substitution → engineering → admin → PPE)?" },
      { id: "45001-8.1.3", clause: "8.1.3", question: "Is management of change (MoC) applied to new processes/equipment?" },
      { id: "45001-8.1.4", clause: "8.1.4", question: "Are procurement and contractor OH&S requirements controlled?" },
      { id: "45001-8.2", clause: "8.2", question: "Are emergency scenarios identified and response plans tested with workers?" },
      { id: "45001-9.1.1", clause: "9.1.1", question: "Are leading and lagging OH&S indicators monitored?" },
      { id: "45001-10.2", clause: "10.2", question: "Are incidents investigated, root causes identified and corrective actions verified?" },
    ],
  },
  {
    id: "iso-27001",
    code: "ISO/IEC 27001:2022",
    name: "Information Security Management",
    category: "ISO",
    authority: "ISO/IEC",
    version: "2022",
    description: "ISMS clauses and Annex A control themes (organisational, people, physical, technological).",
    items: [
      { id: "27001-5.2", clause: "5.2", question: "Is an information security policy approved, communicated and reviewed?" },
      { id: "27001-6.1.2", clause: "6.1.2", question: "Is an information security risk assessment methodology defined and applied?" },
      { id: "27001-6.1.3", clause: "6.1.3", question: "Is a Statement of Applicability (SoA) maintained with justifications?" },
      { id: "27001-A.5.15", clause: "A.5.15", question: "Is access control policy implemented and reviewed for all systems?" },
      { id: "27001-A.5.23", clause: "A.5.23", question: "Are information security requirements defined for cloud services?" },
      { id: "27001-A.6.3", clause: "A.6.3", question: "Is security awareness training delivered and completion tracked?" },
      { id: "27001-A.7.4", clause: "A.7.4", question: "Are physical security perimeters, access and monitoring in place?" },
      { id: "27001-A.8.7", clause: "A.8.7", question: "Is malware protection deployed and effectiveness monitored?" },
      { id: "27001-A.8.13", clause: "A.8.13", question: "Are information backups performed, tested and protected?" },
      { id: "27001-A.8.24", clause: "A.8.24", question: "Is cryptography used and key management controlled?" },
      { id: "27001-A.5.24", clause: "A.5.24", question: "Is an incident management process defined, tested and improved?" },
      { id: "27001-A.5.30", clause: "A.5.30", question: "Is ICT readiness for business continuity planned and tested?" },
    ],
  },
  {
    id: "iso-22000",
    code: "ISO 22000:2018",
    name: "Food Safety Management",
    category: "ISO",
    authority: "ISO",
    version: "2018",
    description: "HACCP-integrated food safety management.",
    items: [
      { id: "22000-7.1.6", clause: "7.1.6", question: "Are prerequisite programmes (PRPs) established and verified?" },
      { id: "22000-8.5", clause: "8.5", question: "Is the HACCP plan documented with CCPs, critical limits and monitoring?" },
      { id: "22000-8.9", clause: "8.9", question: "Are corrections and corrective actions defined for CCP deviations?" },
      { id: "22000-8.9.5", clause: "8.9.5", question: "Are withdrawal / recall procedures tested at defined intervals?" },
      { id: "22000-7.2", clause: "7.2", question: "Is food safety team competence evidenced?" },
    ],
  },
  {
    id: "iso-13485",
    code: "ISO 13485:2016",
    name: "Medical Devices QMS",
    category: "ISO",
    authority: "ISO",
    version: "2016",
    description: "Design controls, risk management and regulatory linkage for medical devices.",
    items: [
      { id: "13485-4.1.6", clause: "4.1.6", question: "Is software used in the QMS validated for its intended use?" },
      { id: "13485-7.3", clause: "7.3", question: "Are design and development controls (inputs, outputs, review, verification, validation) applied?" },
      { id: "13485-7.5.9", clause: "7.5.9", question: "Is traceability of medical devices maintained per regulatory requirements?" },
      { id: "13485-8.2.1", clause: "8.2.1", question: "Is a feedback / post-market surveillance system in place?" },
      { id: "13485-8.3", clause: "8.3", question: "Are nonconforming products controlled, including rework and concessions?" },
    ],
  },
  {
    id: "iatf-16949",
    code: "IATF 16949:2016",
    name: "Automotive QMS",
    category: "ISO",
    authority: "IATF",
    version: "2016",
    description: "Automotive sector supplemental requirements.",
    items: [
      { id: "iatf-8.3.2.1", clause: "8.3.2.1", question: "Is APQP applied to new products with cross-functional teams?" },
      { id: "iatf-8.3.5.2", clause: "8.3.5.2", question: "Are Control Plans, PFMEAs and process flows aligned and current?" },
      { id: "iatf-8.5.1.1", clause: "8.5.1.1", question: "Are Total Productive Maintenance (TPM) activities implemented?" },
      { id: "iatf-8.5.1.3", clause: "8.5.1.3", question: "Is production scheduling driven by customer orders and JIT principles?" },
      { id: "iatf-9.1.1.1", clause: "9.1.1.1", question: "Is statistical process control (SPC) applied to identified characteristics?" },
    ],
  },

  // IMS
  {
    id: "ims-integrated",
    code: "IMS QHSE",
    name: "Integrated Management System (9001 + 14001 + 45001)",
    category: "IMS",
    authority: "Internal",
    version: "1.0",
    description: "Combined audit for quality, environment and safety with shared clauses.",
    items: [
      { id: "ims-context", clause: "4", question: "Is a single context analysis covering Q, E and S maintained?" },
      { id: "ims-policy", clause: "5.2", question: "Is an integrated QHSE policy approved and communicated?" },
      { id: "ims-risk", clause: "6.1", question: "Are Q/E/S risks and opportunities managed in one register?" },
      { id: "ims-objectives", clause: "6.2", question: "Are integrated QHSE objectives cascaded and monitored?" },
      { id: "ims-legal", clause: "6.1.3", question: "Is a consolidated legal & other requirements register kept current?" },
      { id: "ims-audit", clause: "9.2", question: "Is the internal audit programme integrated across Q/E/S?" },
      { id: "ims-mgmt-review", clause: "9.3", question: "Are management reviews integrated with all standard inputs?" },
      { id: "ims-capa", clause: "10.2", question: "Is a single nonconformity & CAPA workflow used across systems?" },
    ],
  },

  // Regulatory
  {
    id: "ndpr",
    code: "NDPR / NDPA",
    name: "Nigeria Data Protection Regulation",
    category: "Regulatory",
    authority: "NDPC (Nigeria Data Protection Commission)",
    version: "NDPR 2019 & NDPA 2023",
    description: "Lawful processing, data subject rights, accountability and breach handling under the NDPR 2019 and Nigeria Data Protection Act 2023.",
    items: [
      { id: "ndpr-lawful", clause: "NDPR 2.2 / NDPA s.25", question: "Is a lawful basis (consent, contract, legal obligation, vital/legitimate interest, public interest) identified and recorded for each processing activity?" },
      { id: "ndpr-consent", clause: "NDPR 2.3 / NDPA s.26", question: "Where consent is relied upon, is it freely given, specific, informed, unambiguous and demonstrably withdrawable?" },
      { id: "ndpr-notice", clause: "NDPR 2.5 / NDPA s.27", question: "Are privacy notices provided to data subjects covering identity of controller, purpose, categories, retention, rights and DPO contact?" },
      { id: "ndpr-rights", clause: "NDPR 3.1 / NDPA s.34-41", question: "Are data subject rights (access, rectification, erasure, objection, portability, restriction) operational with defined SLAs?" },
      { id: "ndpr-dpo", clause: "NDPA s.32", question: "Is a Data Protection Officer (DPO) appointed for data controllers/processors of major importance and duly registered with the NDPC?" },
      { id: "ndpr-registration", clause: "NDPA s.44", question: "Is the organisation registered with the NDPC as a Data Controller/Processor of Major Importance where applicable?" },
      { id: "ndpr-audit", clause: "NDPR 4.1(5)", question: "Is the annual Data Protection Compliance Audit Return filed via a licensed DPCO with the NDPC?" },
      { id: "ndpr-ropa", clause: "NDPA s.29", question: "Is a Record of Processing Activities (RoPA) maintained and current for all controllers and processors?" },
      { id: "ndpr-security", clause: "NDPR 2.6 / NDPA s.39", question: "Are appropriate technical and organisational security measures (encryption, access control, backups, testing) implemented?" },
      { id: "ndpr-breach", clause: "NDPA s.40", question: "Are personal data breaches detected, logged and reported to NDPC within 72 hours, with data subject notification when high-risk?" },
      { id: "ndpr-dpia", clause: "NDPA s.28", question: "Are Data Protection Impact Assessments performed for high-risk processing (profiling, large-scale sensitive data, monitoring)?" },
      { id: "ndpr-processor", clause: "NDPA s.29(3)", question: "Are written Data Processing Agreements in place with all processors and sub-processors?" },
      { id: "ndpr-transfer", clause: "NDPA s.41-43", question: "Are cross-border transfers of personal data supported by adequacy, SCCs, binding rules or valid derogations?" },
      { id: "ndpr-training", clause: "NDPR 4.2(3)", question: "Is data protection awareness training delivered to all personnel handling personal data with attendance records?" },
      { id: "ndpr-retention", clause: "NDPR 2.1(1)(c)", question: "Is a retention & disposal schedule defined per data category and enforced with evidence of secure destruction?" },
    ],
  },
  {
    id: "gmp",
    code: "EU GMP / 21 CFR 210-211",
    name: "Good Manufacturing Practice (Pharma)",
    category: "Regulatory",
    authority: "EMA / FDA / NAFDAC",
    version: "Current",
    description: "Pharmaceutical manufacturing quality controls across PQS, premises, production, QC, data integrity and CAPA.",
    items: [
      { id: "gmp-qs", clause: "Ch.1", question: "Is a Pharmaceutical Quality System (PQS) documented, resourced and demonstrably effective?" },
      { id: "gmp-qrm", clause: "ICH Q9", question: "Is Quality Risk Management applied to product lifecycle decisions with documented rationale?" },
      { id: "gmp-personnel", clause: "Ch.2", question: "Are personnel qualified, medically cleared, gowning validated and hygiene enforced?" },
      { id: "gmp-training", clause: "Ch.2", question: "Is a GMP training programme delivered with competency assessment and refresher cycles?" },
      { id: "gmp-premises", clause: "Ch.3", question: "Are premises and equipment qualified (DQ/IQ/OQ/PQ) with cleaning validation and preventive maintenance?" },
      { id: "gmp-utilities", clause: "Ch.3", question: "Are critical utilities (HVAC, WFI/PW, compressed gases) qualified and monitored with alarms/trends?" },
      { id: "gmp-docs", clause: "Ch.4", question: "Are batch records, SOPs, specifications and master documents controlled, versioned and archived per retention rules?" },
      { id: "gmp-production", clause: "Ch.5", question: "Is contamination, cross-contamination and mix-up prevention effective (line clearance, segregation, status labels)?" },
      { id: "gmp-materials", clause: "Ch.5", question: "Are starting materials, intermediates and finished goods identified, quarantined, sampled and released per approved specs?" },
      { id: "gmp-supplier", clause: "Ch.7", question: "Are API and excipient suppliers qualified, audited and covered by quality agreements?" },
      { id: "gmp-qc", clause: "Ch.6", question: "Are QC methods validated, OOS/OOT investigated, reference standards controlled and stability programmes executed?" },
      { id: "gmp-microbiology", clause: "Ch.6", question: "Are environmental monitoring, water testing and microbiological limits trended and actioned?" },
      { id: "gmp-deviations", clause: "Ch.1", question: "Are deviations, CAPAs, change controls and complaints managed with root-cause analysis and effectiveness checks?" },
      { id: "gmp-recall", clause: "Ch.8", question: "Are recall, mock-recall and returned/rejected product procedures documented and tested?" },
      { id: "gmp-self-inspection", clause: "Ch.9", question: "Are self-inspections planned, executed by trained auditors and closed with CAPA?" },
      { id: "gmp-data-integrity", clause: "ALCOA+", question: "Is data integrity (attributable, legible, contemporaneous, original, accurate, complete, consistent, enduring, available) demonstrated across paper and electronic records?" },
      { id: "gmp-computerised", clause: "Annex 11 / Part 11", question: "Are computerised systems validated, with audit trails reviewed, access controlled and backups verified?" },
    ],
  },
  {
    id: "haccp",
    code: "HACCP / Codex CXC 1-1969",
    name: "Hazard Analysis & Critical Control Points",
    category: "Regulatory",
    authority: "Codex Alimentarius / NAFDAC",
    version: "Rev. 2020",
    description: "12 preliminary steps and 7 principles of HACCP with prerequisite programmes.",
    items: [
      { id: "haccp-team", clause: "Step 1", question: "Is a multidisciplinary HACCP team assembled with defined scope and competence records?" },
      { id: "haccp-product", clause: "Step 2-3", question: "Are product descriptions, intended use and vulnerable consumers documented?" },
      { id: "haccp-flow", clause: "Step 4-5", question: "Is the process flow diagram drawn and verified on-site by the HACCP team?" },
      { id: "haccp-1", clause: "P1", question: "Is a hazard analysis (biological, chemical, physical, allergen, radiological) conducted for each process step with control measures identified?" },
      { id: "haccp-2", clause: "P2", question: "Are Critical Control Points determined using a decision tree or equivalent justified method?" },
      { id: "haccp-3", clause: "P3", question: "Are critical limits validated for each CCP with scientific/regulatory basis?" },
      { id: "haccp-4", clause: "P4", question: "Is CCP monitoring performed at defined frequency, recorded and reviewed by authorised staff?" },
      { id: "haccp-5", clause: "P5", question: "Are corrective actions defined for CCP deviations including product disposition?" },
      { id: "haccp-6", clause: "P6", question: "Are verification activities (calibration, sampling, internal audit, review of records) performed?" },
      { id: "haccp-7", clause: "P7", question: "Are HACCP records maintained, controlled and retrievable for the required retention period?" },
      { id: "haccp-prp", clause: "PRP", question: "Are prerequisite programmes (GMP, sanitation, pest control, waste, water, personal hygiene) effective and verified?" },
      { id: "haccp-allergen", clause: "PRP", question: "Is allergen management (segregation, cleaning validation, labelling) documented and audited?" },
      { id: "haccp-traceability", clause: "PRP", question: "Is one-step-forward / one-step-back traceability tested via mock recall within target time?" },
      { id: "haccp-review", clause: "Step 12", question: "Is the HACCP plan reviewed at planned intervals and when products, processes or hazards change?" },
    ],
  },
  {
    id: "nigeria-ohs",
    code: "Nigeria FOSHA / Labour Act",
    name: "Nigeria Workplace Safety Regulation",
    category: "Regulatory",
    authority: "Federal Ministry of Labour & Employment / NSITF",
    version: "Factories Act Cap F1 LFN 2004 · Labour Act Cap L1 · ELCA 2010",
    description: "Occupational safety, factory registration, employee compensation and workplace welfare under Nigerian federal law.",
    items: [
      { id: "ng-reg", clause: "Factories Act s.1-2", question: "Is the factory/workplace registered with the Federal Ministry of Labour & Employment and the registration certificate current?" },
      { id: "ng-nsitf", clause: "ELCA 2010 s.33", question: "Is the employer registered with NSITF and are the 1% payroll Employee Compensation Scheme contributions remitted monthly?" },
      { id: "ng-policy", clause: "Guidelines on OSH", question: "Is a written Occupational Safety & Health policy signed by the CEO, displayed and communicated to workers?" },
      { id: "ng-committee", clause: "Guidelines on OSH", question: "Is a joint Safety & Health Committee constituted with worker representation, meeting minutes and action tracking?" },
      { id: "ng-riskassess", clause: "Factories Act s.47-52", question: "Are workplace hazard identification and risk assessments documented, reviewed and communicated to affected workers?" },
      { id: "ng-cleanliness", clause: "Factories Act s.7", question: "Are premises kept clean, free of effluvia, with floors, walls and ceilings maintained per statutory intervals?" },
      { id: "ng-overcrowding", clause: "Factories Act s.8", question: "Is overcrowding avoided with at least the statutory cubic-metre space per worker?" },
      { id: "ng-ventilation", clause: "Factories Act s.10-11", question: "Are ventilation, temperature and lighting adequate and monitored in workrooms?" },
      { id: "ng-sanitary", clause: "Factories Act s.13", question: "Are sufficient, separate and sanitary conveniences provided for male and female workers?" },
      { id: "ng-water", clause: "Factories Act s.14", question: "Is wholesome drinking water provided and clearly marked at accessible points?" },
      { id: "ng-machinery", clause: "Factories Act s.17-27", question: "Are prime movers, transmission machinery and dangerous parts securely fenced/guarded and inspected?" },
      { id: "ng-loto", clause: "Factories Act s.24", question: "Are safe isolation, lockout/tagout and permit-to-work procedures documented and enforced for machinery work?" },
      { id: "ng-lifting", clause: "Factories Act s.33-35", question: "Are cranes, hoists, lifts, chains and lifting tackle examined by a competent person at statutory intervals with certificates on file?" },
      { id: "ng-pressure", clause: "Factories Act s.36-37", question: "Are steam boilers, receivers and air receivers inspected and certified by a competent person on the statutory schedule?" },
      { id: "ng-fire", clause: "Factories Act s.40-42", question: "Are means of escape, fire alarms, extinguishers and fire drills provided and tested, with certification from the State Fire Service?" },
      { id: "ng-ppe", clause: "Factories Act s.55; Labour Act s.66", question: "Is appropriate PPE provided free of charge, with training, inspection, and replacement records?" },
      { id: "ng-firstaid", clause: "Factories Act s.62", question: "Are first-aid boxes provided, trained first-aiders appointed and injury treatment logged?" },
      { id: "ng-notify", clause: "Factories Act s.51-54", question: "Are accidents, dangerous occurrences and industrial diseases notified to the Inspector within statutory timelines?" },
      { id: "ng-women-young", clause: "Labour Act s.55-59", question: "Are restrictions on employment of women (night work) and young persons (age, hazardous work, hours) complied with?" },
      { id: "ng-hours", clause: "Labour Act s.13", question: "Are working hours, overtime, rest periods and public holidays managed within statutory limits?" },
      { id: "ng-chemicals", clause: "Factories Act s.46-49", question: "Are hazardous substances handled with controls, SDS available, exposure monitored and health surveillance conducted?" },
      { id: "ng-training", clause: "ELCA 2010 s.9", question: "Are workers trained on hazards, safe systems of work and emergency response with attendance and competence records?" },
      { id: "ng-covid-welfare", clause: "Guidelines on OSH", question: "Are welfare facilities (canteens, changing rooms, rest rooms, PPE storage) provided and maintained?" },
      { id: "ng-inspection", clause: "Factories Act s.65-70", question: "Is a register of Inspector visits, notices and improvement/prohibition actions maintained and closed out?" },
    ],
  },


  // Supplier
  {
    id: "supplier-qualification",
    code: "Supplier",
    name: "Supplier Qualification Audit",
    category: "Supplier",
    authority: "Internal",
    version: "1.0",
    description: "Initial supplier approval covering QMS, capacity and compliance.",
    items: [
      { id: "sup-qms", clause: "Q1", question: "Does the supplier hold current ISO 9001 (or equivalent) certification?" },
      { id: "sup-scope", clause: "Q2", question: "Does the certification scope cover the products/services supplied?" },
      { id: "sup-fin", clause: "F1", question: "Is financial stability evidenced (credit report, statements)?" },
      { id: "sup-capacity", clause: "O1", question: "Is production/service capacity adequate and demonstrable?" },
      { id: "sup-quality-plan", clause: "Q3", question: "Are inspection and quality plans defined for the product?" },
      { id: "sup-traceability", clause: "T1", question: "Is lot / serial traceability maintained end-to-end?" },
      { id: "sup-subtier", clause: "S1", question: "Are sub-tier suppliers managed and disclosed?" },
      { id: "sup-ethics", clause: "E1", question: "Is a signed Supplier Code of Conduct (ethics, modern slavery, anti-bribery) in place?" },
      { id: "sup-esg", clause: "ESG", question: "Are environmental and social performance metrics reported?" },
      { id: "sup-info-sec", clause: "IS", question: "Are information security controls appropriate to the data shared?" },
      { id: "sup-bcp", clause: "BCP", question: "Is a Business Continuity Plan documented and tested?" },
    ],
  },
  {
    id: "supplier-performance",
    code: "Supplier",
    name: "Supplier Performance & Surveillance Audit",
    category: "Supplier",
    authority: "Internal",
    version: "1.0",
    description: "Periodic monitoring of approved suppliers.",
    items: [
      { id: "sp-otd", clause: "P1", question: "Is on-time delivery ≥ target for the review period?" },
      { id: "sp-ppm", clause: "P2", question: "Is defect rate (PPM / NCR count) within threshold?" },
      { id: "sp-capa", clause: "P3", question: "Are prior CAPAs closed on time and effective?" },
      { id: "sp-comms", clause: "P4", question: "Is responsiveness to RFQs, changes and issues acceptable?" },
      { id: "sp-change", clause: "P5", question: "Are process/material changes notified in advance (PCN)?" },
      { id: "sp-audit-prior", clause: "P6", question: "Have prior audit findings been remediated?" },
    ],
  },

  // Internal
  {
    id: "internal-coc",
    code: "Internal",
    name: "Code of Conduct & Ethics Compliance",
    category: "Internal",
    authority: "Company",
    version: "1.0",
    description: "Employee ethics, gifts, conflicts of interest, whistleblower.",
    items: [
      { id: "coc-ack", clause: "1", question: "Have all employees acknowledged the Code of Conduct in the last 12 months?" },
      { id: "coc-training", clause: "2", question: "Is ethics training completion tracked and ≥ 95%?" },
      { id: "coc-coi", clause: "3", question: "Are conflicts of interest disclosed, reviewed and mitigated?" },
      { id: "coc-gifts", clause: "4", question: "Is the gifts & hospitality register maintained and reviewed?" },
      { id: "coc-whistle", clause: "5", question: "Is a confidential whistleblower channel available and cases triaged?" },
      { id: "coc-sanctions", clause: "6", question: "Are third parties screened against sanctions and PEP lists?" },
    ],
  },
  {
    id: "internal-it",
    code: "Internal",
    name: "IT General Controls Self-Audit",
    category: "Internal",
    authority: "Company",
    version: "1.0",
    description: "Baseline IT controls independent of external framework.",
    items: [
      { id: "it-access", clause: "AC", question: "Are joiner/mover/leaver access changes actioned within SLA?" },
      { id: "it-mfa", clause: "AC", question: "Is MFA enforced on all remote and admin access?" },
      { id: "it-patch", clause: "OP", question: "Are critical patches applied within policy timelines?" },
      { id: "it-backup", clause: "OP", question: "Are backups scheduled and restore tests documented?" },
      { id: "it-endpoint", clause: "EP", question: "Is endpoint protection deployed with centralised logging?" },
      { id: "it-incident", clause: "IR", question: "Are incidents logged, categorised and post-mortemed?" },
    ],
  },
  {
    id: "internal-hr",
    code: "Internal",
    name: "HR Process Audit",
    category: "Internal",
    authority: "Company",
    version: "1.0",
    description: "Recruitment, onboarding, records and separation.",
    items: [
      { id: "hr-1", clause: "Rec", question: "Are recruitment approvals, JD versions and interview scorecards retained?" },
      { id: "hr-2", clause: "Onb", question: "Are onboarding checklists (contract, ID, training) completed pre-start?" },
      { id: "hr-3", clause: "Rec", question: "Are personnel files complete, restricted-access and retention-compliant?" },
      { id: "hr-4", clause: "Perf", question: "Are performance reviews completed on schedule with objectives set?" },
      { id: "hr-5", clause: "Sep", question: "Are exit interviews, asset return and access removal executed?" },
    ],
  },

  // Industry
  {
    id: "pci-dss",
    code: "PCI DSS v4.0",
    name: "Payment Card Data Security",
    category: "Industry",
    authority: "PCI SSC",
    version: "4.0",
    description: "Cardholder data environment controls.",
    items: [
      { id: "pci-1", clause: "Req 1", question: "Are firewall and network segmentation controls documented and tested?" },
      { id: "pci-3", clause: "Req 3", question: "Is stored cardholder data minimised, encrypted or truncated?" },
      { id: "pci-8", clause: "Req 8", question: "Are strong authentication and MFA enforced for CDE access?" },
      { id: "pci-10", clause: "Req 10", question: "Are audit logs generated, protected and reviewed daily?" },
      { id: "pci-11", clause: "Req 11", question: "Are vulnerability scans and penetration tests performed per schedule?" },
      { id: "pci-12", clause: "Req 12", question: "Is an information security policy maintained and TPRM in place?" },
    ],
  },
  {
    id: "api-q1",
    code: "API Q1 / Q2",
    name: "Oil & Gas Quality (API)",
    category: "Industry",
    authority: "API",
    version: "Current",
    description: "Oil & gas manufacturing / service quality supplement.",
    items: [
      { id: "api-1", clause: "5.1", question: "Is a risk assessment applied to product realisation processes?" },
      { id: "api-2", clause: "5.6", question: "Are contingency plans for supply, personnel and facility disruption in place?" },
      { id: "api-3", clause: "5.7", question: "Are management of change (MoC) processes controlling product/process changes?" },
      { id: "api-4", clause: "5.8", question: "Is preventive maintenance planned for equipment affecting product quality?" },
      { id: "api-5", clause: "6.1", question: "Are supplier evaluation and criticality rankings maintained?" },
    ],
  },
];

const CATEGORY_META: Record<Checklist["category"], { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  ISO: { icon: ShieldCheck, color: "bg-[var(--teal)]/10 text-[var(--teal)] ring-[var(--teal)]/30" },
  IMS: { icon: Layers, color: "bg-indigo-500/10 text-indigo-600 ring-indigo-500/30" },
  Regulatory: { icon: Landmark, color: "bg-amber-500/10 text-amber-600 ring-amber-500/30" },
  Internal: { icon: Building2, color: "bg-slate-500/10 text-slate-600 ring-slate-500/30" },
  Supplier: { icon: Truck, color: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30" },
  Industry: { icon: Factory, color: "bg-rose-500/10 text-rose-600 ring-rose-500/30" },
};

// dummy import to keep Layers icon


const CATEGORIES: (Checklist["category"] | "All")[] = ["All", "ISO", "IMS", "Regulatory", "Internal", "Supplier", "Industry"];

function ChecklistsPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return CHECKLISTS.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.authority.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  const active = CHECKLISTS.find((c) => c.id === openId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <section className="border-b border-white/10 bg-[var(--navy-deep)] text-white">
        <div className="container-page py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="chip-on-dark"><ClipboardCheck className="h-3 w-3" /> Audit Execution Library</span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              Ready-to-execute audit checklists across every framework you operate under.
            </h1>
            <p className="mt-5 text-lg text-white/75">
              ISO management systems, integrated IMS, regulatory frameworks, internal standards and supplier audits —
              scored inline with findings and severity, ready to hand off to CAPA.
            </p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ISO 27001, NDPR, supplier, HACCP…"
                className="w-full rounded-md border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    cat === c
                      ? "bg-[var(--teal)] text-white"
                      : "border border-white/15 text-white/75 hover:bg-white/5"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14" aria-busy={loading}>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {loading ? "Loading checklists…" : `${filtered.length} checklist${filtered.length === 1 ? "" : "s"}`}
          </h2>
          <p className="text-sm text-muted-foreground">Click any checklist to execute inline.</p>
        </div>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading checklists">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 rounded-full bg-muted" />
                  <div className="h-3 w-12 rounded bg-muted" />
                </div>
                <div className="mt-4 h-3 w-24 rounded bg-muted" />
                <div className="mt-2 h-5 w-3/4 rounded bg-muted" />
                <div className="mt-3 h-3 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
                <div className="mt-5 flex justify-between">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
            <span className="sr-only">Loading checklists…</span>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const meta = CATEGORY_META[c.category];
                const Icon = meta.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => setOpenId(c.id)}
                    aria-label={`Execute ${c.code} ${c.name} checklist`}
                    className="group text-left rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--teal)]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${meta.color}`}>
                        <Icon className="h-3 w-3" /> {c.category}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">{c.items.length} items</span>
                    </div>
                    <div className="mt-4 font-mono text-xs text-muted-foreground">{c.code}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{c.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{c.authority} · v{c.version}</span>
                      <span className="inline-flex items-center gap-1 text-[var(--teal)] font-semibold group-hover:gap-1.5 transition-all">
                        Execute <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-foreground">No checklists match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing the search or switching category to <span className="font-medium">All</span>.
                </p>
                <button
                  onClick={() => { setQuery(""); setCat("All"); }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-[var(--teal)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2"
                >
                  Reset filters
                </button>
              </div>
            )}
          </>
        )}
      </section>


      <IndustryStrip />

      {active && <ExecutionDrawer checklist={active} onClose={() => setOpenId(null)} />}
      <PageFooter />
    </div>
  );
}

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
          <Link to="/checklists" className="text-white">Checklists</Link>
          <Link to="/process-audits" className="hover:text-white">Process Audits</Link>
        </nav>
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-md bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
          Request demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function IndustryStrip() {
  const rows = [
    { icon: Factory, name: "Oil, Gas & Energy", list: "API Q1, ISO 45001, Nigeria FOSHA, ISO 14001" },
    { icon: HeartPulse, name: "Healthcare & Medical Devices", list: "ISO 13485, NDPR, GxP, ISO 27001" },
    { icon: Beaker, name: "Pharma & Life Sciences", list: "EU GMP, 21 CFR 210-211, Data Integrity" },
    { icon: Leaf, name: "Food & Beverage", list: "ISO 22000, HACCP, BRCGS" },
    { icon: Truck, name: "Logistics & Supply Chain", list: "Supplier Qualification, ISO 28000" },
    { icon: Lock, name: "Banking & Financial Services", list: "PCI DSS, ISO 27001, NDPR" },
    { icon: Users, name: "Manufacturing & Automotive", list: "IATF 16949, ISO 9001, Supplier PPAP" },
    { icon: Building2, name: "Enterprise / Multi-Site IMS", list: "IMS QHSE, Internal Policies" },
  ];
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="container-page py-14">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-foreground">Framework coverage by industry</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Checklists are aligned to the standards each regulated industry executes against.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.name} className="rounded-xl border border-border bg-card p-5">
              <r.icon className="h-5 w-5 text-[var(--teal)]" />
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">{r.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{r.list}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExecutionDrawer({ checklist, onClose }: { checklist: Checklist; onClose: () => void }) {
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    let conform = 0, minor = 0, major = 0, na = 0, pending = 0;
    for (const it of checklist.items) {
      const r = responses[it.id];
      if (r === "conform") conform++;
      else if (r === "minor") minor++;
      else if (r === "major") major++;
      else if (r === "na") na++;
      else pending++;
    }
    const answered = conform + minor + major;
    const score = answered > 0 ? Math.round((conform / answered) * 100) : 0;
    return { conform, minor, major, na, pending, score, total: checklist.items.length };
  }, [responses, checklist.items]);

  const exportJson = () => {
    const payload = {
      checklist: { id: checklist.id, code: checklist.code, name: checklist.name, version: checklist.version },
      executed_at: new Date().toISOString(),
      score: stats.score,
      summary: { conform: stats.conform, minor: stats.minor, major: stats.major, na: stats.na, pending: stats.pending },
      items: checklist.items.map((i) => ({
        clause: i.clause,
        question: i.question,
        response: responses[i.id] ?? null,
        finding_notes: notes[i.id] ?? "",
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${checklist.id}-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-3xl flex-col bg-background shadow-2xl">
        <div className="border-b border-border bg-[var(--navy-deep)] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-white/60">{checklist.code} · {checklist.authority} · v{checklist.version}</div>
              <h2 className="mt-1 font-display text-xl font-bold">{checklist.name}</h2>
              <p className="mt-1 text-sm text-white/70">{checklist.description}</p>
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

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ol className="space-y-4">
            {checklist.items.map((it, idx) => {
              const r = responses[it.id];
              return (
                <li key={it.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono rounded bg-muted px-1.5 py-0.5">{it.clause}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{it.question}</p>
                      {it.guidance && (
                        <p className="mt-1 text-xs text-muted-foreground italic">Guidance: {it.guidance}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <RespBtn active={r === "conform"} onClick={() => setResponses((p) => ({ ...p, [it.id]: "conform" }))} icon={CheckCircle2} label="Conform" tone="green" />
                        <RespBtn active={r === "minor"} onClick={() => setResponses((p) => ({ ...p, [it.id]: "minor" }))} icon={AlertTriangle} label="Minor NC" tone="amber" />
                        <RespBtn active={r === "major"} onClick={() => setResponses((p) => ({ ...p, [it.id]: "major" }))} icon={XCircle} label="Major NC" tone="red" />
                        <RespBtn active={r === "na"} onClick={() => setResponses((p) => ({ ...p, [it.id]: "na" }))} icon={MinusCircle} label="N/A" tone="slate" />
                      </div>
                      {(r === "minor" || r === "major") && (
                        <textarea
                          value={notes[it.id] ?? ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [it.id]: e.target.value }))}
                          placeholder="Describe the finding, evidence and immediate containment…"
                          className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
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

function PageFooter() {
  return (
    <footer className="border-t border-border bg-[var(--navy-deep)] py-10 text-white/70">
      <div className="container-page flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--teal)]" />
          Auditly Checklists Library · Templates are indicative and should be reviewed by your compliance team.
        </div>
        <Link to="/" className="text-white/80 hover:text-white">← Back to platform</Link>
      </div>
    </footer>
  );
}
