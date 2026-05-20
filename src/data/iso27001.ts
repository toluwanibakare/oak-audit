// ISO/IEC 27001:2022 — clause-by-clause audit question bank.
// Note: Annex A controls are referenced separately in clause 6.1.3 / SoA. This file
// covers the management-system clauses 4–10 (the audited backbone of the ISMS).

import type { ClauseGroup, ClauseItem, Status } from "./iso9001";
export type { ClauseGroup, ClauseItem, Status } from "./iso9001";
export { STATUS_META } from "./iso9001";

export const ISO27001_GROUPS: ClauseGroup[] = [
  {
    number: "4",
    title: "Context of the Organization",
    intent: "Define the ISMS boundaries and the internal/external issues and parties that shape information-security needs.",
    items: [
      {
        clause: "4.1",
        title: "Understanding the organization and its context",
        question:
          "How has the organization determined external and internal issues relevant to its purpose and that affect the ISMS's ability to achieve its intended outcome(s)?",
        evidence:
          "Documented context analysis (PESTLE/SWOT) · threat & regulatory landscape review · strategic plan referencing information security · ISMS context record reviewed at planned intervals.",
        effective:
          "Issues are reviewed regularly; changes (new threats, regulations, business models) trigger updates to risk assessment, SoA, and objectives.",
      },
      {
        clause: "4.2",
        title: "Needs and expectations of interested parties",
        question:
          "How are interested parties relevant to the ISMS, and their information-security requirements (including legal, regulatory and contractual), identified and reviewed?",
        evidence:
          "Stakeholder register (customers, regulators, employees, suppliers, authorities) · register of legal/regulatory/contractual requirements · review records.",
        effective:
          "Requirements feed into risk treatment, SoA, supplier contracts and policies; obsolete entries are removed.",
      },
      {
        clause: "4.3",
        title: "Determining the scope of the ISMS",
        question:
          "Is the ISMS scope documented — covering boundaries, applicability, interfaces and dependencies with other organizations?",
        evidence:
          "Documented scope statement · description of locations, business units, services, technology and information assets included/excluded · justification for exclusions.",
        effective:
          "Scope reflects current operations; staff understand what is in/out of scope; the certificate (if any) matches the scope statement.",
      },
      {
        clause: "4.4",
        title: "Information security management system",
        question:
          "Has the organization established, implemented, maintained and continually improved an ISMS, including the processes needed and their interactions?",
        evidence:
          "ISMS process map · documented ISMS procedures · process owners assigned · KPIs for ISMS processes.",
        effective:
          "ISMS processes operate as designed; performance is measured; gaps trigger corrective action.",
      },
    ],
  },
  {
    number: "5",
    title: "Leadership",
    intent: "Top management owns the ISMS, sets the policy, and assigns responsibility.",
    items: [
      {
        clause: "5.1",
        title: "Leadership and commitment",
        question:
          "How does top management demonstrate leadership and commitment with respect to the ISMS — ensuring policy and objectives are compatible with strategic direction and that resources are available?",
        evidence:
          "Approved information-security policy · management-review minutes · budget allocations for security · CISO/ISMS-manager appointment · communications from leadership.",
        effective:
          "Leaders are visibly engaged; security trade-offs are decided at the right level; resources match the risk profile.",
      },
      {
        clause: "5.2",
        title: "Information security policy",
        question:
          "Is an information security policy established that is appropriate to the purpose of the organization, includes objectives or a framework for setting them, and a commitment to satisfy applicable requirements and continual improvement?",
        evidence:
          "Documented & approved infosec policy · evidence of communication (intranet, induction) · availability to interested parties as appropriate.",
        effective:
          "Staff can describe what the policy means for their role; supporting topic-specific policies (access, cryptography, etc.) align with it.",
      },
      {
        clause: "5.3",
        title: "Organizational roles, responsibilities and authorities",
        question:
          "Are responsibilities and authorities for ISMS-relevant roles assigned and communicated — including reporting on ISMS performance to top management?",
        evidence:
          "Org chart · RACI for ISMS · job descriptions for CISO, asset owners, risk owners, control owners · appointment letters.",
        effective:
          "Roles are filled, understood and exercised; there is a clear escalation path for security incidents and risks.",
      },
    ],
  },
  {
    number: "6",
    title: "Planning",
    intent: "Plan how the ISMS will achieve its outcomes — risks, opportunities, objectives, change.",
    items: [
      {
        clause: "6.1.1",
        title: "Actions to address risks and opportunities — General",
        question:
          "Have risks and opportunities that need to be addressed to give assurance the ISMS can achieve its intended outcomes been determined and planned for?",
        evidence:
          "ISMS-level risk & opportunity register (distinct from the operational infosec risk assessment) · planned actions · integration into ISMS processes.",
        effective:
          "Actions are integrated into ISMS processes; effectiveness is evaluated.",
      },
      {
        clause: "6.1.2",
        title: "Information security risk assessment",
        question:
          "Is there a defined and applied information-security risk-assessment process that establishes/maintains risk criteria, identifies risks, owners, and analyses/evaluates them consistently?",
        evidence:
          "Documented risk-assessment methodology · acceptance criteria · risk register with owners, likelihood, impact, level · evidence of repeated comparable results.",
        effective:
          "Methodology is applied consistently; risks are owned; results drive treatment decisions.",
      },
      {
        clause: "6.1.3",
        title: "Information security risk treatment & Statement of Applicability",
        question:
          "Is a risk-treatment process applied to select treatment options and necessary controls, with comparison to Annex A and a documented Statement of Applicability (SoA)?",
        evidence:
          "Risk-treatment plan with owners and timelines · SoA listing all Annex A controls with applicability, justification and implementation status · risk-owner approval of residual risk and the plan.",
        effective:
          "All Annex A controls are evaluated; exclusions are justified; residual risks are formally accepted; the plan is being executed.",
      },
      {
        clause: "6.2",
        title: "Information security objectives and planning to achieve them",
        question:
          "Are measurable information-security objectives established at relevant functions/levels, consistent with policy, and planned (what, resources, who, when, how evaluated)?",
        evidence:
          "Documented objectives with metrics, baselines and targets · action plans · evidence of monitoring and reporting.",
        effective:
          "Objectives are tracked and reported; missed targets trigger corrective action; objectives evolve with the risk profile.",
      },
      {
        clause: "6.3",
        title: "Planning of changes",
        question:
          "When the organization determines the need for changes to the ISMS, are they carried out in a planned manner?",
        evidence:
          "ISMS change records · impact assessments · approvals · communication of changes to affected parties.",
        effective:
          "Changes do not undermine controls; integrity of the ISMS is preserved through change.",
      },
    ],
  },
  {
    number: "7",
    title: "Support",
    intent: "Resources, competence, awareness, communication, and documented information for the ISMS.",
    items: [
      {
        clause: "7.1",
        title: "Resources",
        question:
          "Are the resources needed for establishing, implementing, maintaining and continually improving the ISMS determined and provided?",
        evidence:
          "Approved ISMS budget · headcount and tooling for security operations · evidence resources match the treatment plan.",
        effective:
          "No critical control is unfunded or unstaffed; resourcing tracks the threat environment.",
      },
      {
        clause: "7.2",
        title: "Competence",
        question:
          "How is competence of persons doing work under the organization's control that affects ISMS performance determined, achieved and evaluated?",
        evidence:
          "Competency matrix for security roles · training plans · certifications (e.g. CISSP, ISO 27001 LA) · evaluation of training effectiveness.",
        effective:
          "Gaps are closed before they become incidents; competence is reassessed when roles change.",
      },
      {
        clause: "7.3",
        title: "Awareness",
        question:
          "Are persons doing work under the organization's control aware of the policy, their contribution to ISMS effectiveness, and the implications of not conforming?",
        evidence:
          "Security-awareness programme · phishing-simulation results · induction records · interview confirmation.",
        effective:
          "Random staff interviews demonstrate awareness in their own words; phishing failure rates trend downward.",
      },
      {
        clause: "7.4",
        title: "Communication",
        question:
          "Have internal and external communications relevant to the ISMS been determined — what, when, with whom, how, and by whom?",
        evidence:
          "Communication matrix · incident-communication procedure · regulator/customer notification templates · meeting cadence.",
        effective:
          "Recipients confirm communications are timely and clear; mandatory breach notifications happen within required timelines.",
      },
      {
        clause: "7.5",
        title: "Documented information",
        question:
          "Is documented information required by ISO/IEC 27001 and determined necessary by the organization created, controlled, distributed, protected, retained and disposed of appropriately?",
        evidence:
          "Document control procedure · master list · access controls reflecting classification · version history · retention & disposal records.",
        effective:
          "Only current versions in use; sensitive documents are protected per classification; obsolete/withdrawn documents are removed from use.",
      },
    ],
  },
  {
    number: "8",
    title: "Operation",
    intent: "Plan, implement and control the operational processes that deliver information security.",
    items: [
      {
        clause: "8.1",
        title: "Operational planning and control",
        question:
          "Are the processes needed to meet ISMS requirements and to implement the actions from clause 6 planned, implemented and controlled — including outsourced processes and planned changes?",
        evidence:
          "Operational procedures (access management, change management, vulnerability management, backup, incident response, etc.) · evidence of execution · control over outsourced processes.",
        effective:
          "Processes operate as designed; deviations are detected and addressed; outsourced processes are demonstrably controlled.",
      },
      {
        clause: "8.2",
        title: "Information security risk assessment (operational)",
        question:
          "Are information-security risk assessments performed at planned intervals, and when significant changes are proposed or occur?",
        evidence:
          "Schedule of periodic risk assessments · re-assessments triggered by major changes (new system, M&A, incident) · documented results retained.",
        effective:
          "The risk picture is current; the SoA and treatment plan are kept aligned with reality.",
      },
      {
        clause: "8.3",
        title: "Information security risk treatment (operational)",
        question:
          "Is the risk-treatment plan implemented, and the results retained as documented information?",
        evidence:
          "Status reports against the risk-treatment plan · evidence of control implementation · residual-risk acceptance records.",
        effective:
          "Treatment actions are completed on time; overdue items are escalated; control implementation is verified.",
      },
    ],
  },
  {
    number: "9",
    title: "Performance Evaluation",
    intent: "Monitor, measure, audit and review the ISMS to know whether it is performing.",
    items: [
      {
        clause: "9.1",
        title: "Monitoring, measurement, analysis and evaluation",
        question:
          "What is monitored and measured (including the effectiveness of the ISMS and controls), and how/when are results analysed and evaluated?",
        evidence:
          "Defined metrics (control coverage, patch SLAs, incident MTTR, phishing failure rate, access-review completion, etc.) · monitoring dashboards · documented analysis.",
        effective:
          "Metrics drive decisions; downward trends trigger action; evaluation methods produce comparable, reproducible results.",
      },
      {
        clause: "9.2",
        title: "Internal audit",
        question:
          "Is an internal audit programme planned, established, implemented and maintained — including frequency, methods, responsibilities, and reporting to relevant management?",
        evidence:
          "Multi-year audit plan covering all clauses and Annex A controls · auditor competence/independence records · audit reports · NCR follow-up.",
        effective:
          "All ISMS scope is audited over the cycle; findings are addressed; auditors are independent of audited area.",
      },
      {
        clause: "9.3",
        title: "Management review",
        question:
          "Are ISMS management reviews conducted at planned intervals covering all required inputs (status of actions, changes, performance, audit results, risks, opportunities for improvement)?",
        evidence:
          "Management-review minutes covering all required inputs · documented decisions and action items · attendance by top management.",
        effective:
          "Outputs include decisions on improvement and resource needs; actions are assigned, dated and tracked to closure.",
      },
    ],
  },
  {
    number: "10",
    title: "Improvement",
    intent: "Close the loop — fix nonconformities and continually improve the ISMS.",
    items: [
      {
        clause: "10.1",
        title: "Continual improvement",
        question:
          "How does the organization continually improve the suitability, adequacy and effectiveness of the ISMS?",
        evidence:
          "Improvement register · trend analyses (audits, incidents, metrics) · improvement projects with measured outcomes.",
        effective:
          "ISMS metrics improve over time; lessons learned from incidents are institutionalized.",
      },
      {
        clause: "10.2",
        title: "Nonconformity and corrective action",
        question:
          "When a nonconformity (including from incidents) occurs, is it reacted to, evaluated for cause, corrected, and is the effectiveness of corrective action reviewed?",
        evidence:
          "NC/CAPA procedure · root-cause analyses (5-Why, Ishikawa) · effectiveness verification · updates to risks, SoA and processes as needed.",
        effective:
          "Recurrence is prevented; learnings are shared across the organization; the ISMS is updated as a result.",
      },
    ],
  },
];

export const ISO27001_ALL_ITEMS: ClauseItem[] = ISO27001_GROUPS.flatMap((g) => g.items);

// Annex A control families (ISO/IEC 27001:2022 reorganization — 93 controls in 4 themes).
export const ANNEX_A_THEMES: { code: string; name: string; count: number; examples: string }[] = [
  { code: "A.5",  name: "Organizational controls",   count: 37, examples: "policies, roles, threat intel, supplier security, incident management, classification" },
  { code: "A.6",  name: "People controls",           count: 8,  examples: "screening, terms of employment, awareness, disciplinary, remote working" },
  { code: "A.7",  name: "Physical controls",         count: 14, examples: "physical perimeter, entry, secure areas, equipment, cabling, secure disposal" },
  { code: "A.8",  name: "Technological controls",    count: 34, examples: "access control, cryptography, secure development, logging, network security, malware, backup" },
];

export type { } from "./iso9001";