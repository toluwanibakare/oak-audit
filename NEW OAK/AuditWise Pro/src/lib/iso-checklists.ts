// Comprehensive ISO checklist library used by the Audit Wizard and the
// Conduct Audit screen. Questions are indexed by clause. Some checklists are
// "integrated" (multi-standard) — items carry a `standards` array.

export type ClauseQuestion = {
  id: string;
  clause: string;
  standards: string[]; // e.g. ["ISO 9001"] or ["ISO 9001","ISO 14001","ISO 45001"]
  text: string;
  section: string;
  applicableDepartments?: string[]; // hints for auto-applicability by dept
};

export type ChecklistMeta = {
  id: string;
  name: string;
  standard: string;      // "ISO 9001" | "ISO 14001" | ... | "Integrated (9001/14001/45001)" | "Combined (14001/45001)"
  version: string;
  items: number;         // count (derived)
  integrated?: boolean;
};

const D = {
  ops: "Operations", quality: "Quality", hse: "HSE", it: "IT & Security",
  logi: "Logistics", hr: "HR", fin: "Finance", rd: "R&D", sust: "Sustainability",
};

// ---------- ISO 9001:2015 ----------
const ISO9001: ClauseQuestion[] = [
  { id: "q9001-4.1", clause: "4.1", standards: ["ISO 9001"], text: "Internal and external issues relevant to the QMS are determined and monitored.", section: "Cl. 4 Context", applicableDepartments: [D.quality, D.ops] },
  { id: "q9001-4.2", clause: "4.2", standards: ["ISO 9001"], text: "Interested parties and their relevant requirements are identified.", section: "Cl. 4 Context", applicableDepartments: [D.quality] },
  { id: "q9001-4.3", clause: "4.3", standards: ["ISO 9001"], text: "Scope of the QMS is documented and available.", section: "Cl. 4 Context", applicableDepartments: [D.quality] },
  { id: "q9001-4.4", clause: "4.4", standards: ["ISO 9001"], text: "QMS processes, their sequence and interaction are established.", section: "Cl. 4 Context", applicableDepartments: [D.quality, D.ops] },
  { id: "q9001-5.1", clause: "5.1", standards: ["ISO 9001"], text: "Top management demonstrates leadership and commitment to the QMS.", section: "Cl. 5 Leadership", applicableDepartments: [D.quality] },
  { id: "q9001-5.2", clause: "5.2", standards: ["ISO 9001"], text: "Quality policy is established, communicated and understood.", section: "Cl. 5 Leadership", applicableDepartments: [D.quality, D.hr] },
  { id: "q9001-5.3", clause: "5.3", standards: ["ISO 9001"], text: "Roles, responsibilities and authorities are assigned and communicated.", section: "Cl. 5 Leadership", applicableDepartments: [D.hr, D.quality] },
  { id: "q9001-6.1", clause: "6.1", standards: ["ISO 9001"], text: "Risks and opportunities affecting QMS results are addressed.", section: "Cl. 6 Planning", applicableDepartments: [D.quality, D.ops] },
  { id: "q9001-6.2", clause: "6.2", standards: ["ISO 9001"], text: "Quality objectives are established, measurable and tracked.", section: "Cl. 6 Planning", applicableDepartments: [D.quality] },
  { id: "q9001-6.3", clause: "6.3", standards: ["ISO 9001"], text: "Changes to the QMS are planned and controlled.", section: "Cl. 6 Planning", applicableDepartments: [D.quality] },
  { id: "q9001-7.1", clause: "7.1", standards: ["ISO 9001"], text: "Resources (people, infrastructure, environment) are determined and provided.", section: "Cl. 7 Support", applicableDepartments: [D.ops, D.hr] },
  { id: "q9001-7.1.5", clause: "7.1.5", standards: ["ISO 9001"], text: "Monitoring and measuring resources are suitable and calibrated.", section: "Cl. 7 Support", applicableDepartments: [D.ops, D.quality] },
  { id: "q9001-7.2", clause: "7.2", standards: ["ISO 9001"], text: "Competence of persons doing work is determined and evidenced.", section: "Cl. 7 Support", applicableDepartments: [D.hr, D.ops] },
  { id: "q9001-7.3", clause: "7.3", standards: ["ISO 9001"], text: "Awareness of policy, objectives and contribution is ensured.", section: "Cl. 7 Support", applicableDepartments: [D.hr] },
  { id: "q9001-7.4", clause: "7.4", standards: ["ISO 9001"], text: "Internal and external communication is defined and executed.", section: "Cl. 7 Support", applicableDepartments: [D.quality, D.hr] },
  { id: "q9001-7.5", clause: "7.5", standards: ["ISO 9001"], text: "Documented information is created, controlled and current.", section: "Cl. 7 Support", applicableDepartments: [D.quality] },
  { id: "q9001-8.1", clause: "8.1", standards: ["ISO 9001"], text: "Operational planning and control criteria are implemented.", section: "Cl. 8 Operation", applicableDepartments: [D.ops] },
  { id: "q9001-8.2", clause: "8.2", standards: ["ISO 9001"], text: "Customer requirements are determined, reviewed and communicated.", section: "Cl. 8 Operation", applicableDepartments: [D.quality, D.ops] },
  { id: "q9001-8.3", clause: "8.3", standards: ["ISO 9001"], text: "Design and development is planned, controlled and verified.", section: "Cl. 8 Operation", applicableDepartments: [D.rd] },
  { id: "q9001-8.4", clause: "8.4", standards: ["ISO 9001"], text: "External providers are evaluated and controlled.", section: "Cl. 8 Operation", applicableDepartments: [D.logi, D.ops] },
  { id: "q9001-8.5", clause: "8.5", standards: ["ISO 9001"], text: "Production and service provision is controlled (work instructions, releases).", section: "Cl. 8 Operation", applicableDepartments: [D.ops] },
  { id: "q9001-8.6", clause: "8.6", standards: ["ISO 9001"], text: "Release of products and services follows planned arrangements.", section: "Cl. 8 Operation", applicableDepartments: [D.ops, D.quality] },
  { id: "q9001-8.7", clause: "8.7", standards: ["ISO 9001"], text: "Nonconforming outputs are identified and controlled.", section: "Cl. 8 Operation", applicableDepartments: [D.quality, D.ops] },
  { id: "q9001-9.1", clause: "9.1", standards: ["ISO 9001"], text: "Monitoring, measurement, analysis and evaluation are performed.", section: "Cl. 9 Performance", applicableDepartments: [D.quality] },
  { id: "q9001-9.2", clause: "9.2", standards: ["ISO 9001"], text: "Internal audits are planned and conducted at required intervals.", section: "Cl. 9 Performance", applicableDepartments: [D.quality] },
  { id: "q9001-9.3", clause: "9.3", standards: ["ISO 9001"], text: "Management reviews are conducted and outputs actioned.", section: "Cl. 9 Performance", applicableDepartments: [D.quality] },
  { id: "q9001-10.1", clause: "10.1", standards: ["ISO 9001"], text: "Opportunities for improvement are identified and pursued.", section: "Cl. 10 Improvement", applicableDepartments: [D.quality] },
  { id: "q9001-10.2", clause: "10.2", standards: ["ISO 9001"], text: "Nonconformity and corrective action process is effective.", section: "Cl. 10 Improvement", applicableDepartments: [D.quality, D.ops] },
  { id: "q9001-10.3", clause: "10.3", standards: ["ISO 9001"], text: "Continual improvement is demonstrated.", section: "Cl. 10 Improvement", applicableDepartments: [D.quality] },
];

// ---------- ISO 14001:2015 ----------
const ISO14001: ClauseQuestion[] = [
  { id: "q14001-4.1", clause: "4.1", standards: ["ISO 14001"], text: "External and internal environmental issues (including climate) are determined.", section: "Cl. 4 Context", applicableDepartments: [D.hse, D.sust] },
  { id: "q14001-4.2", clause: "4.2", standards: ["ISO 14001"], text: "Needs and expectations of interested parties, including compliance obligations, are identified.", section: "Cl. 4 Context", applicableDepartments: [D.hse] },
  { id: "q14001-4.3", clause: "4.3", standards: ["ISO 14001"], text: "Scope of the EMS is defined and maintained.", section: "Cl. 4 Context", applicableDepartments: [D.hse] },
  { id: "q14001-5.1", clause: "5.1", standards: ["ISO 14001"], text: "Top management demonstrates leadership for the EMS.", section: "Cl. 5 Leadership", applicableDepartments: [D.hse] },
  { id: "q14001-5.2", clause: "5.2", standards: ["ISO 14001"], text: "Environmental policy is appropriate, communicated and available.", section: "Cl. 5 Leadership", applicableDepartments: [D.hse] },
  { id: "q14001-6.1.1", clause: "6.1.1", standards: ["ISO 14001"], text: "Risks and opportunities relating to environmental aspects are identified.", section: "Cl. 6 Planning", applicableDepartments: [D.hse] },
  { id: "q14001-6.1.2", clause: "6.1.2", standards: ["ISO 14001"], text: "Environmental aspects and impacts are identified and evaluated for significance.", section: "Cl. 6 Planning", applicableDepartments: [D.hse, D.ops] },
  { id: "q14001-6.1.3", clause: "6.1.3", standards: ["ISO 14001"], text: "Compliance obligations are identified, accessible and evaluated.", section: "Cl. 6 Planning", applicableDepartments: [D.hse] },
  { id: "q14001-6.2", clause: "6.2", standards: ["ISO 14001"], text: "Environmental objectives and plans to achieve them are established.", section: "Cl. 6 Planning", applicableDepartments: [D.hse] },
  { id: "q14001-7.1", clause: "7.1", standards: ["ISO 14001"], text: "Resources for the EMS are determined and provided.", section: "Cl. 7 Support", applicableDepartments: [D.hse] },
  { id: "q14001-7.2", clause: "7.2", standards: ["ISO 14001"], text: "Competence for persons whose work affects environmental performance.", section: "Cl. 7 Support", applicableDepartments: [D.hr, D.hse] },
  { id: "q14001-7.4", clause: "7.4", standards: ["ISO 14001"], text: "Internal/external environmental communication is defined and performed.", section: "Cl. 7 Support", applicableDepartments: [D.hse] },
  { id: "q14001-7.5", clause: "7.5", standards: ["ISO 14001"], text: "Documented information for the EMS is controlled.", section: "Cl. 7 Support", applicableDepartments: [D.hse] },
  { id: "q14001-8.1", clause: "8.1", standards: ["ISO 14001"], text: "Operational planning and control ensures environmental requirements are met.", section: "Cl. 8 Operation", applicableDepartments: [D.ops, D.hse] },
  { id: "q14001-8.2", clause: "8.2", standards: ["ISO 14001"], text: "Emergency preparedness and response processes are established and tested.", section: "Cl. 8 Operation", applicableDepartments: [D.hse, D.ops] },
  { id: "q14001-9.1.1", clause: "9.1.1", standards: ["ISO 14001"], text: "Environmental performance is monitored, measured and evaluated.", section: "Cl. 9 Performance", applicableDepartments: [D.hse] },
  { id: "q14001-9.1.2", clause: "9.1.2", standards: ["ISO 14001"], text: "Compliance with obligations is periodically evaluated.", section: "Cl. 9 Performance", applicableDepartments: [D.hse] },
  { id: "q14001-9.2", clause: "9.2", standards: ["ISO 14001"], text: "Internal EMS audits are planned and conducted.", section: "Cl. 9 Performance", applicableDepartments: [D.quality, D.hse] },
  { id: "q14001-9.3", clause: "9.3", standards: ["ISO 14001"], text: "Management reviews for the EMS are held with required inputs.", section: "Cl. 9 Performance", applicableDepartments: [D.hse] },
  { id: "q14001-10.2", clause: "10.2", standards: ["ISO 14001"], text: "Nonconformities are corrected and CAPA effectiveness verified.", section: "Cl. 10 Improvement", applicableDepartments: [D.hse] },
  { id: "q14001-10.3", clause: "10.3", standards: ["ISO 14001"], text: "Continual improvement of EMS performance is demonstrated.", section: "Cl. 10 Improvement", applicableDepartments: [D.hse] },
];

// ---------- ISO 45001:2018 ----------
const ISO45001: ClauseQuestion[] = [
  { id: "q45001-4.1", clause: "4.1", standards: ["ISO 45001"], text: "Internal/external issues relevant to OH&S are determined.", section: "Cl. 4 Context", applicableDepartments: [D.hse] },
  { id: "q45001-4.2", clause: "4.2", standards: ["ISO 45001"], text: "Needs of workers and other interested parties are identified.", section: "Cl. 4 Context", applicableDepartments: [D.hse, D.hr] },
  { id: "q45001-4.3", clause: "4.3", standards: ["ISO 45001"], text: "Scope of the OH&S MS is defined including all activities and workers.", section: "Cl. 4 Context", applicableDepartments: [D.hse] },
  { id: "q45001-5.1", clause: "5.1", standards: ["ISO 45001"], text: "Top management demonstrates leadership for OH&S and worker protection.", section: "Cl. 5 Leadership", applicableDepartments: [D.hse] },
  { id: "q45001-5.2", clause: "5.2", standards: ["ISO 45001"], text: "OH&S policy commits to safe/healthy conditions and hazard elimination.", section: "Cl. 5 Leadership", applicableDepartments: [D.hse] },
  { id: "q45001-5.4", clause: "5.4", standards: ["ISO 45001"], text: "Consultation and participation of workers (non-managerial) is enabled.", section: "Cl. 5 Leadership", applicableDepartments: [D.hse, D.hr] },
  { id: "q45001-6.1.2.1", clause: "6.1.2.1", standards: ["ISO 45001"], text: "Hazard identification is ongoing and proactive.", section: "Cl. 6 Planning", applicableDepartments: [D.hse, D.ops] },
  { id: "q45001-6.1.2.2", clause: "6.1.2.2", standards: ["ISO 45001"], text: "OH&S risks and other risks are assessed.", section: "Cl. 6 Planning", applicableDepartments: [D.hse] },
  { id: "q45001-6.1.3", clause: "6.1.3", standards: ["ISO 45001"], text: "Legal and other requirements are determined and kept current.", section: "Cl. 6 Planning", applicableDepartments: [D.hse] },
  { id: "q45001-6.2", clause: "6.2", standards: ["ISO 45001"], text: "OH&S objectives and plans to achieve them are documented.", section: "Cl. 6 Planning", applicableDepartments: [D.hse] },
  { id: "q45001-7.2", clause: "7.2", standards: ["ISO 45001"], text: "Worker competence for OH&S is ensured with records.", section: "Cl. 7 Support", applicableDepartments: [D.hr, D.hse] },
  { id: "q45001-7.3", clause: "7.3", standards: ["ISO 45001"], text: "Workers are aware of hazards, incidents and their right to remove themselves.", section: "Cl. 7 Support", applicableDepartments: [D.hse] },
  { id: "q45001-7.4", clause: "7.4", standards: ["ISO 45001"], text: "OH&S internal/external communication is defined and performed.", section: "Cl. 7 Support", applicableDepartments: [D.hse] },
  { id: "q45001-8.1.1", clause: "8.1.1", standards: ["ISO 45001"], text: "Operational planning and control including hierarchy of controls is applied.", section: "Cl. 8 Operation", applicableDepartments: [D.ops, D.hse] },
  { id: "q45001-8.1.2", clause: "8.1.2", standards: ["ISO 45001"], text: "Hazards are eliminated and OH&S risks reduced.", section: "Cl. 8 Operation", applicableDepartments: [D.hse, D.ops] },
  { id: "q45001-8.1.3", clause: "8.1.3", standards: ["ISO 45001"], text: "Change management (temporary/permanent) considers OH&S impacts.", section: "Cl. 8 Operation", applicableDepartments: [D.hse, D.ops] },
  { id: "q45001-8.1.4", clause: "8.1.4", standards: ["ISO 45001"], text: "Procurement, contractors and outsourcing controls are in place.", section: "Cl. 8 Operation", applicableDepartments: [D.logi, D.hse] },
  { id: "q45001-8.2", clause: "8.2", standards: ["ISO 45001"], text: "Emergency preparedness and response procedures are established.", section: "Cl. 8 Operation", applicableDepartments: [D.hse, D.ops] },
  { id: "q45001-9.1", clause: "9.1", standards: ["ISO 45001"], text: "OH&S performance is monitored, measured and evaluated.", section: "Cl. 9 Performance", applicableDepartments: [D.hse] },
  { id: "q45001-9.2", clause: "9.2", standards: ["ISO 45001"], text: "Internal OH&S audits are planned and conducted.", section: "Cl. 9 Performance", applicableDepartments: [D.quality, D.hse] },
  { id: "q45001-9.3", clause: "9.3", standards: ["ISO 45001"], text: "Management review addresses OH&S performance and incidents.", section: "Cl. 9 Performance", applicableDepartments: [D.hse] },
  { id: "q45001-10.2", clause: "10.2", standards: ["ISO 45001"], text: "Incidents, nonconformities and corrective actions are managed.", section: "Cl. 10 Improvement", applicableDepartments: [D.hse] },
  { id: "q45001-10.3", clause: "10.3", standards: ["ISO 45001"], text: "Continual improvement of OH&S performance is evidenced.", section: "Cl. 10 Improvement", applicableDepartments: [D.hse] },
];

// ---------- ISO/IEC 27001:2022 (headline clauses) ----------
const ISO27001: ClauseQuestion[] = [
  { id: "q27001-4", clause: "4", standards: ["ISO/IEC 27001"], text: "ISMS scope and context including interested parties are defined.", section: "Context", applicableDepartments: [D.it] },
  { id: "q27001-5", clause: "5", standards: ["ISO/IEC 27001"], text: "Information security policy and roles are established.", section: "Leadership", applicableDepartments: [D.it] },
  { id: "q27001-6.1.2", clause: "6.1.2", standards: ["ISO/IEC 27001"], text: "Information security risk assessment process is defined and executed.", section: "Planning", applicableDepartments: [D.it] },
  { id: "q27001-6.1.3", clause: "6.1.3", standards: ["ISO/IEC 27001"], text: "Risk treatment plan and Statement of Applicability are current.", section: "Planning", applicableDepartments: [D.it] },
  { id: "q27001-7.2", clause: "7.2", standards: ["ISO/IEC 27001"], text: "Competence of personnel for ISMS activities is ensured.", section: "Support", applicableDepartments: [D.it, D.hr] },
  { id: "q27001-8.1", clause: "8.1", standards: ["ISO/IEC 27001"], text: "Operational planning and control of ISMS processes.", section: "Operation", applicableDepartments: [D.it] },
  { id: "q27001-9.2", clause: "9.2", standards: ["ISO/IEC 27001"], text: "Internal ISMS audits are conducted.", section: "Performance", applicableDepartments: [D.it, D.quality] },
  { id: "q27001-A.5.15", clause: "A.5.15", standards: ["ISO/IEC 27001"], text: "Access control policy is defined and enforced.", section: "Annex A", applicableDepartments: [D.it] },
  { id: "q27001-A.5.18", clause: "A.5.18", standards: ["ISO/IEC 27001"], text: "Access rights are reviewed at planned intervals.", section: "Annex A", applicableDepartments: [D.it] },
  { id: "q27001-A.5.24", clause: "A.5.24", standards: ["ISO/IEC 27001"], text: "Information security incident management is planned and prepared.", section: "Annex A", applicableDepartments: [D.it] },
  { id: "q27001-A.8.13", clause: "A.8.13", standards: ["ISO/IEC 27001"], text: "Backup restoration is tested at planned intervals.", section: "Annex A", applicableDepartments: [D.it] },
];

// ---------- ISO 22301:2019 ----------
const ISO22301: ClauseQuestion[] = [
  { id: "q22301-4", clause: "4", standards: ["ISO 22301"], text: "BCMS scope and context including legal/regulatory requirements are defined.", section: "Context", applicableDepartments: [D.ops] },
  { id: "q22301-5", clause: "5", standards: ["ISO 22301"], text: "Top management commitment and BC policy are established.", section: "Leadership", applicableDepartments: [D.ops] },
  { id: "q22301-6.2", clause: "6.2", standards: ["ISO 22301"], text: "Business continuity objectives are defined and monitored.", section: "Planning", applicableDepartments: [D.ops] },
  { id: "q22301-8.2.2", clause: "8.2.2", standards: ["ISO 22301"], text: "Business Impact Analysis is performed and current.", section: "Operation", applicableDepartments: [D.ops] },
  { id: "q22301-8.2.3", clause: "8.2.3", standards: ["ISO 22301"], text: "Risk assessment for disruption is performed.", section: "Operation", applicableDepartments: [D.ops] },
  { id: "q22301-8.4", clause: "8.4", standards: ["ISO 22301"], text: "Business continuity strategies and solutions are documented.", section: "Operation", applicableDepartments: [D.ops] },
  { id: "q22301-8.5", clause: "8.5", standards: ["ISO 22301"], text: "Exercising and testing of continuity plans is scheduled and evidenced.", section: "Operation", applicableDepartments: [D.ops] },
  { id: "q22301-9.2", clause: "9.2", standards: ["ISO 22301"], text: "Internal BCMS audits are planned and conducted.", section: "Performance", applicableDepartments: [D.quality, D.ops] },
  { id: "q22301-10.2", clause: "10.2", standards: ["ISO 22301"], text: "Corrective actions from exercises and disruptions are tracked.", section: "Improvement", applicableDepartments: [D.ops] },
];

// ---------- Integrated checklist ISO 9001 + 14001 + 45001 (HLS mapped) ----------
const IMS_9K_14K_45K: ClauseQuestion[] = [
  { id: "ims-4.1", clause: "4.1", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Internal/external issues affecting quality, environment and OH&S are identified together.", section: "Cl. 4 Context (Integrated)" },
  { id: "ims-4.2", clause: "4.2", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Interested parties and their requirements are consolidated across Q/E/S.", section: "Cl. 4 Context (Integrated)" },
  { id: "ims-4.3", clause: "4.3", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Integrated scope statement covers Q/E/S with justifications for exclusions.", section: "Cl. 4 Context (Integrated)" },
  { id: "ims-5.1", clause: "5.1", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Top management demonstrates integrated leadership across Q/E/S.", section: "Cl. 5 Leadership (Integrated)" },
  { id: "ims-5.2", clause: "5.2", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Combined Q/E/S policy is documented, communicated and understood.", section: "Cl. 5 Leadership (Integrated)" },
  { id: "ims-6.1", clause: "6.1", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Risks/opportunities incl. aspects/impacts and OH&S hazards are addressed in one register.", section: "Cl. 6 Planning (Integrated)" },
  { id: "ims-6.2", clause: "6.2", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Integrated Q/E/S objectives are set, aligned and tracked.", section: "Cl. 6 Planning (Integrated)" },
  { id: "ims-7.2", clause: "7.2", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Competence covers quality, environmental and OH&S roles.", section: "Cl. 7 Support (Integrated)" },
  { id: "ims-7.4", clause: "7.4", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Integrated communication plan covers Q/E/S internal and external channels.", section: "Cl. 7 Support (Integrated)" },
  { id: "ims-7.5", clause: "7.5", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Single documented-information framework serves the IMS.", section: "Cl. 7 Support (Integrated)" },
  { id: "ims-8.1", clause: "8.1", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Integrated operational controls address quality, environmental and OH&S criteria.", section: "Cl. 8 Operation (Integrated)" },
  { id: "ims-8.2", clause: "8.2", standards: ["ISO 14001","ISO 45001"], text: "Emergency preparedness covers environmental releases and OH&S incidents jointly.", section: "Cl. 8 Operation (Integrated)" },
  { id: "ims-9.1", clause: "9.1", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Integrated monitoring, measurement and evaluation across Q/E/S is performed.", section: "Cl. 9 Performance (Integrated)" },
  { id: "ims-9.2", clause: "9.2", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Combined internal audit programme covers all three standards.", section: "Cl. 9 Performance (Integrated)" },
  { id: "ims-9.3", clause: "9.3", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Integrated management review addresses Q/E/S inputs and decisions.", section: "Cl. 9 Performance (Integrated)" },
  { id: "ims-10.2", clause: "10.2", standards: ["ISO 9001","ISO 14001","ISO 45001"], text: "Single NC/CAPA process handles findings across all three standards.", section: "Cl. 10 Improvement (Integrated)" },
];

// ---------- Combined 14001 + 45001 (HSE) ----------
const HSE_COMBINED: ClauseQuestion[] = [
  { id: "hse-4.1", clause: "4.1", standards: ["ISO 14001","ISO 45001"], text: "Environmental and OH&S context issues are identified together.", section: "Context (HSE)" },
  { id: "hse-5.2", clause: "5.2", standards: ["ISO 14001","ISO 45001"], text: "Combined HSE policy covers environment and worker safety.", section: "Leadership (HSE)" },
  { id: "hse-6.1.2", clause: "6.1.2", standards: ["ISO 14001","ISO 45001"], text: "Aspects/impacts register combined with hazard/risk register.", section: "Planning (HSE)" },
  { id: "hse-6.1.3", clause: "6.1.3", standards: ["ISO 14001","ISO 45001"], text: "Compliance obligations (env + OH&S legal) are consolidated.", section: "Planning (HSE)" },
  { id: "hse-7.2", clause: "7.2", standards: ["ISO 14001","ISO 45001"], text: "HSE competence programme is defined and evidenced.", section: "Support (HSE)" },
  { id: "hse-8.1", clause: "8.1", standards: ["ISO 14001","ISO 45001"], text: "HSE operational controls including hierarchy of controls implemented.", section: "Operation (HSE)" },
  { id: "hse-8.2", clause: "8.2", standards: ["ISO 14001","ISO 45001"], text: "Emergency preparedness and response is combined and tested.", section: "Operation (HSE)" },
  { id: "hse-9.1", clause: "9.1", standards: ["ISO 14001","ISO 45001"], text: "HSE performance monitoring and legal compliance evaluation are performed.", section: "Performance (HSE)" },
  { id: "hse-9.2", clause: "9.2", standards: ["ISO 14001","ISO 45001"], text: "Combined HSE internal audit is executed on schedule.", section: "Performance (HSE)" },
  { id: "hse-10.2", clause: "10.2", standards: ["ISO 14001","ISO 45001"], text: "Incidents, NCs and CAPA are managed within one HSE process.", section: "Improvement (HSE)" },
];

type FullChecklist = { id: string; name: string; standard: string; version: string; integrated?: boolean; questions: ClauseQuestion[] };


export const CHECKLIST_LIBRARY: FullChecklist[] = [
  { id: "cl-9001",   name: "ISO 9001 — Full QMS Audit",                          standard: "ISO 9001",                            version: "v3.2", questions: ISO9001 },
  { id: "cl-14001",  name: "ISO 14001 — Site Environmental Audit",               standard: "ISO 14001",                           version: "v1.4", questions: ISO14001 },
  { id: "cl-45001",  name: "ISO 45001 — Occupational Health & Safety Audit",     standard: "ISO 45001",                           version: "v2.0", questions: ISO45001 },
  { id: "cl-27001",  name: "ISO/IEC 27001 — ISMS + Annex A Controls",            standard: "ISO/IEC 27001",                       version: "v4.0", questions: ISO27001 },
  { id: "cl-22301",  name: "ISO 22301 — BCMS Audit",                             standard: "ISO 22301",                           version: "v1.1", questions: ISO22301 },
  { id: "cl-ims",    name: "Integrated Audit — ISO 9001 + 14001 + 45001",        standard: "Integrated (9001/14001/45001)",       version: "v1.0", integrated: true, questions: IMS_9K_14K_45K },
  { id: "cl-hse",    name: "Combined HSE Audit — ISO 14001 + 45001",             standard: "Combined (14001/45001)",              version: "v1.0", integrated: true, questions: HSE_COMBINED },
];

export function getChecklist(id: string): FullChecklist | undefined {
  return CHECKLIST_LIBRARY.find((c) => c.id === id);
}

export function checklistMeta(): ChecklistMeta[] {
  return CHECKLIST_LIBRARY.map((c) => ({
    id: c.id, name: c.name, standard: c.standard, version: c.version, items: c.questions.length, integrated: c.integrated,
  }));
}

/** Which checklists to recommend for a given standard code (e.g. "ISO 9001:2015"). */
export function recommendedFor(standardCode: string): FullChecklist[] {
  const base = CHECKLIST_LIBRARY.filter((c) => standardCode.startsWith(c.standard));
  const integrated = CHECKLIST_LIBRARY.filter((c) =>
    c.integrated && c.questions.some((q) => q.standards.some((s) => standardCode.startsWith(s)))
  );
  const set = new Map<string, FullChecklist>();
  [...base, ...integrated].forEach((c) => set.set(c.id, c));
  return Array.from(set.values());
}

/** Convert a requirement-style statement into an audit question. */
export function asQuestion(q: ClauseQuestion): string {
  const t = q.text.trim().replace(/\.$/, "");
  const lower = t.charAt(0).toLowerCase() + t.slice(1);
  // Heuristic openers
  if (/^(top management|the organization|workers|the ISMS)/i.test(t)) {
    return `Can you demonstrate how ${lower}?`;
  }
  if (/(are|is|has|have|covers|ensures|addresses|includes)/i.test(t.split(" ").slice(0, 6).join(" "))) {
    return `How do you evidence that ${lower}?`;
  }
  return `How is it demonstrated that ${lower}?`;
}

/** Suggested objective-evidence samples an auditor should collect for a clause. */
export function defaultEvidenceFor(q: ClauseQuestion): string[] {
  const c = q.clause;
  const s = q.section.toLowerCase();
  const text = q.text.toLowerCase();
  const ev: string[] = [];
  const push = (x: string) => { if (!ev.includes(x)) ev.push(x); };

  // Clause-family evidence
  if (c.startsWith("4")) { push("Context analysis / SWOT / PESTLE"); push("Interested-parties register"); push("Scope statement (approved & current)"); }
  if (c.startsWith("5")) { push("Signed policy document"); push("Leadership review minutes"); push("Roles & responsibilities matrix (RACI)"); }
  if (c.startsWith("6")) { push("Risk & opportunity register"); push("Objectives with KPIs and owners"); push("Action plan with due dates"); }
  if (c.startsWith("7")) { push("Training records / competence matrix"); push("Communication plan & records"); push("Controlled documented information register"); }
  if (c.startsWith("8")) { push("Approved procedures / SOPs / work instructions"); push("Operational records (batch, shift, service tickets)"); push("Change-control records"); }
  if (c.startsWith("9")) { push("KPI dashboards / monitoring records"); push("Internal audit reports & CARs"); push("Management review minutes with actions"); }
  if (c.startsWith("10")) { push("Nonconformity register"); push("CAPA records with root-cause analysis"); push("Effectiveness verification evidence"); }

  // Topic-specific hints
  if (/calibrat/.test(text)) push("Calibration certificates / traceable standards");
  if (/design/.test(text)) push("Design plan, DFMEA, design reviews & verification records");
  if (/supplier|external provider|procurement|contractor/.test(text)) push("Approved supplier list & performance evaluations");
  if (/customer/.test(text)) push("Contract review records, customer complaints log");
  if (/access|password|iam/.test(text)) push("Access-review reports, IAM export, joiner/mover/leaver tickets");
  if (/backup/.test(text)) push("Backup logs and restoration test reports");
  if (/incident/.test(text)) push("Incident register, RCA reports, notifications to authorities");
  if (/hazard|ppe|risk/.test(text) && q.standards.includes("ISO 45001")) push("Job-hazard analyses, PPE inspection logs, safety walks");
  if (/emergenc/.test(text)) push("Drill records, ERT roster, post-drill review");
  if (/waste|environmental|aspect|impact/.test(text)) push("Aspects & impacts register, waste manifests, monitoring reports");
  if (/business impact|bia|continuity|disruption/.test(text)) push("BIA output, RTO/RPO table, exercise reports");
  if (/competence|training|awareness/.test(s + text)) push("Training matrix, certificates, awareness sign-off");
  if (/communicat/.test(text)) push("Communication matrix, meeting minutes, notice-board photos");
  if (/document/.test(text)) push("Master document list with version history");

  push("Interview notes with process owner");
  push("Direct observation (photos / floor walk notes)");
  return ev.slice(0, 6);
}

