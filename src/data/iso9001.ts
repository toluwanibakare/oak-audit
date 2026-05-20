export type ClauseItem = {
  clause: string;
  title: string;
  question: string;
  evidence: string;
  effective: string;
};

export type ClauseGroup = {
  number: string;
  title: string;
  intent: string;
  items: ClauseItem[];
};

export const ISO_GROUPS: ClauseGroup[] = [
  {
    number: "4",
    title: "Context of the Organization",
    intent: "Establish what the organization is, who it serves, and the boundaries of the QMS.",
    items: [
      {
        clause: "4.1",
        title: "Understanding the organization and its context",
        question:
          "How has the organization determined external and internal issues relevant to its purpose and strategic direction that affect the QMS?",
        evidence:
          "SWOT/PESTLE analysis · documented context review · strategic planning records · management-review minutes referencing context.",
        effective:
          "Issues are reviewed at planned intervals; changes trigger updates to risks, objectives, and processes; leadership can articulate current context.",
      },
      {
        clause: "4.2",
        title: "Needs and expectations of interested parties",
        question:
          "How are relevant interested parties and their requirements identified, monitored, and reviewed?",
        evidence:
          "Stakeholder register · list of legal/regulatory/customer/other requirements · review records.",
        effective:
          "Register is current; requirements feed into QMS planning, risk assessment, and customer communication.",
      },
      {
        clause: "4.3",
        title: "Determining the scope of the QMS",
        question: "Is the scope of the QMS documented, justified, and made available?",
        evidence:
          "Documented scope statement · justification for any exclusions of clause 8 requirements · published on website/manual.",
        effective:
          "Scope reflects products/services, sites, and applicable requirements; staff understand boundaries.",
      },
      {
        clause: "4.4",
        title: "QMS and its processes",
        question:
          "Have QMS processes — their sequence, interaction, inputs, outputs, criteria, and KPIs — been determined?",
        evidence:
          "Process map / turtle diagrams · process owners assigned · KPIs and measurement methods documented.",
        effective:
          "KPIs are tracked; process owners actively manage performance; nonconformities trigger improvement.",
      },
    ],
  },
  {
    number: "5",
    title: "Leadership",
    intent: "Top management owns the QMS, sets policy, and assigns authority.",
    items: [
      {
        clause: "5.1",
        title: "Leadership and commitment",
        question:
          "How does top management demonstrate leadership and commitment to the QMS and customer focus?",
        evidence:
          "Quality policy signed by top management · management review minutes · resource allocation evidence · communications to staff.",
        effective:
          "Leaders are visibly engaged; customer requirements and risks/opportunities are actively addressed at the executive level.",
      },
      {
        clause: "5.2",
        title: "Quality policy",
        question: "Is the quality policy appropriate, communicated, understood, and available?",
        evidence:
          "Documented quality policy · communication records (intranet, posters, training) · availability to interested parties.",
        effective:
          "Staff can describe how the policy applies to their work; objectives flow from the policy.",
      },
      {
        clause: "5.3",
        title: "Organizational roles, responsibilities and authorities",
        question: "Are responsibilities and authorities for QMS roles assigned, communicated, and understood?",
        evidence: "Org chart · role descriptions · RACI · appointment letters for process owners.",
        effective: "Staff know their QMS responsibilities; reporting lines for QMS performance are clear.",
      },
    ],
  },
  {
    number: "6",
    title: "Planning",
    intent: "Plan how the QMS achieves its intended results — risks, objectives, change.",
    items: [
      {
        clause: "6.1",
        title: "Actions to address risks and opportunities",
        question: "How are risks and opportunities determined and addressed within the QMS?",
        evidence: "Risk register · risk assessment methodology · action plans · effectiveness reviews.",
        effective: "Risks are reviewed regularly; mitigation actions are implemented and verified for effectiveness.",
      },
      {
        clause: "6.2",
        title: "Quality objectives and planning to achieve them",
        question:
          "Are measurable quality objectives established at relevant functions and levels with action plans?",
        evidence:
          "Documented objectives with targets, owners, resources, timelines, and measurement methods.",
        effective: "Objectives are tracked, reported, and updated; deviations trigger corrective action.",
      },
      {
        clause: "6.3",
        title: "Planning of changes",
        question: "How are changes to the QMS planned and controlled?",
        evidence: "Change management procedure · change records with impact assessment, resources, responsibilities.",
        effective: "Changes are implemented without disrupting conformity; integrity of the QMS is preserved.",
      },
    ],
  },
  {
    number: "7",
    title: "Support",
    intent: "Resources, competence, awareness, communication, and documented information.",
    items: [
      {
        clause: "7.1",
        title: "Resources",
        question:
          "How are people, infrastructure, environment, monitoring/measuring resources, and organizational knowledge determined and provided?",
        evidence: "Resource plans · calibration records · facility maintenance logs · knowledge management procedures.",
        effective: "Resources are sufficient and maintained; calibration is current; knowledge is captured and shared.",
      },
      {
        clause: "7.2",
        title: "Competence",
        question:
          "How is competence of personnel doing work affecting QMS performance determined, achieved, and evaluated?",
        evidence: "Competency matrix · training plans · training records · evaluation of training effectiveness.",
        effective: "Gaps are identified and closed; effectiveness of actions is verified.",
      },
      {
        clause: "7.3",
        title: "Awareness",
        question:
          "Are persons doing work under the organization's control aware of policy, objectives, their contribution, and implications of nonconformity?",
        evidence: "Induction records · awareness campaigns · interview confirmation.",
        effective: "Random staff interviews demonstrate awareness in their own words.",
      },
      {
        clause: "7.4",
        title: "Communication",
        question: "Are internal and external communications relevant to the QMS determined and effective?",
        evidence: "Communication matrix (what/when/who/how) · meeting minutes · customer communication channels.",
        effective: "Recipients confirm communications are timely, clear, and acted upon.",
      },
      {
        clause: "7.5",
        title: "Documented information",
        question: "Is documented information created, controlled, distributed, protected, and retained appropriately?",
        evidence: "Document control procedure · master list · retention schedule · access controls · version history.",
        effective: "Only current versions in use at point of need; obsolete documents controlled; records protected.",
      },
    ],
  },
  {
    number: "8",
    title: "Operation",
    intent: "Plan and control the processes that deliver products and services.",
    items: [
      {
        clause: "8.1",
        title: "Operational planning and control",
        question:
          "Are processes needed to meet product/service requirements planned, implemented, and controlled?",
        evidence:
          "Production/service planning records · acceptance criteria · control plans · outsourced process controls.",
        effective: "Outputs consistently meet requirements; deviations are detected and addressed.",
      },
      {
        clause: "8.2",
        title: "Requirements for products and services",
        question: "How are customer requirements determined, reviewed, and changes managed?",
        evidence:
          "Customer enquiry/order review records · contract review · change records · customer communication logs.",
        effective: "Capability is confirmed before commitment; changes are agreed and communicated.",
      },
      {
        clause: "8.3",
        title: "Design and development",
        question: "If applicable, is design & development planned, controlled, and verified/validated?",
        evidence: "D&D plan · inputs/outputs · reviews, verification, validation records · change control.",
        effective: "Outputs meet inputs; validation confirms fit-for-purpose; changes are assessed.",
      },
      {
        clause: "8.4",
        title: "Control of externally provided processes, products & services",
        question: "How are external providers evaluated, selected, monitored, and re-evaluated?",
        evidence: "Approved supplier list · evaluation criteria · performance data · incoming inspection records.",
        effective: "Supplier performance is tracked; nonconforming suppliers are escalated; risks are controlled.",
      },
      {
        clause: "8.5",
        title: "Production and service provision",
        question:
          "Are production/service activities controlled — including identification, traceability, customer property, preservation, and post-delivery?",
        evidence: "Work instructions · identification/traceability records · customer property logs · preservation procedures.",
        effective:
          "Traceability can be demonstrated end-to-end; customer property is protected; post-delivery obligations are met.",
      },
      {
        clause: "8.6",
        title: "Release of products and services",
        question: "Are planned arrangements completed before release of products/services?",
        evidence: "Inspection/test records · release authorities · concession records.",
        effective: "No release without authorization; records show acceptance criteria met.",
      },
      {
        clause: "8.7",
        title: "Control of nonconforming outputs",
        question: "How are nonconforming outputs identified, segregated, and dispositioned?",
        evidence: "NCR procedure · NCR log · concession/scrap/rework records · customer notification when applicable.",
        effective: "Recurrence is prevented; customer impact is contained; trends drive improvement.",
      },
    ],
  },
  {
    number: "9",
    title: "Performance Evaluation",
    intent: "Monitor, measure, audit, and review the QMS to know whether it works.",
    items: [
      {
        clause: "9.1",
        title: "Monitoring, measurement, analysis & evaluation",
        question: "What is monitored/measured (including customer satisfaction) and how is data analyzed?",
        evidence: "Monitoring plan · KPI dashboards · customer satisfaction survey results · data analysis reports.",
        effective: "Decisions are data-driven; trends are visible; actions follow from analysis.",
      },
      {
        clause: "9.2",
        title: "Internal audit",
        question:
          "Is an internal audit programme planned and executed based on importance and prior results?",
        evidence: "Audit programme · auditor competence records · audit reports · NCR follow-up.",
        effective: "Audits cover all processes over the cycle; findings drive corrections; auditors are independent.",
      },
      {
        clause: "9.3",
        title: "Management review",
        question: "Are management reviews conducted at planned intervals covering all required inputs?",
        evidence:
          "Minutes covering: prior actions, changes, performance, customer feedback, audit results, supplier performance, resources, risks/opportunities, improvement.",
        effective: "Outputs include decisions on improvement, change, and resource needs; actions are assigned and tracked.",
      },
    ],
  },
  {
    number: "10",
    title: "Improvement",
    intent: "Close the loop — fix nonconformities and continually improve.",
    items: [
      {
        clause: "10.1",
        title: "Improvement — General",
        question: "How does the organization determine and select opportunities for improvement?",
        evidence: "Improvement register · suggestion scheme · benchmarking results · innovation projects.",
        effective: "Improvements are prioritized and resourced; benefits are measured.",
      },
      {
        clause: "10.2",
        title: "Nonconformity and corrective action",
        question:
          "How are nonconformities reacted to, root causes determined, and corrective actions taken and verified?",
        evidence:
          "CAPA procedure · root cause analysis records (5-why, fishbone) · effectiveness verification · updates to risks and processes.",
        effective: "Recurrence is prevented; learnings are shared; QMS is updated as a result.",
      },
      {
        clause: "10.3",
        title: "Continual improvement",
        question:
          "How is the suitability, adequacy, and effectiveness of the QMS continually improved?",
        evidence:
          "Trend analyses from audits, NCs, customer data, management review · improvement projects with measured outcomes.",
        effective: "Demonstrated improvement in KPIs over time; lessons learned are institutionalized.",
      },
    ],
  },
];

export const ALL_ITEMS: ClauseItem[] = ISO_GROUPS.flatMap((g) => g.items);

export type Status = "pending" | "conformant" | "minor" | "major" | "ofi" | "na";

export const STATUS_META: Record<
  Status,
  { label: string; tone: string; dot: string; bar: string }
> = {
  pending: { label: "Not assessed", tone: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40", bar: "bg-muted-foreground/30" },
  conformant: { label: "Conformant", tone: "bg-success/10 text-success border border-success/30", dot: "bg-success", bar: "bg-success" },
  ofi: { label: "OFI", tone: "bg-info/10 text-info border border-info/30", dot: "bg-info", bar: "bg-info" },
  minor: { label: "Minor NC", tone: "bg-warning/15 text-[hsl(35_85%_28%)] border border-warning/40", dot: "bg-warning", bar: "bg-warning" },
  major: { label: "Major NC", tone: "bg-destructive/10 text-destructive border border-destructive/30", dot: "bg-destructive", bar: "bg-destructive" },
  na: { label: "Not applicable", tone: "bg-secondary text-muted-foreground border border-border", dot: "bg-muted-foreground/40", bar: "bg-muted-foreground/30" },
};