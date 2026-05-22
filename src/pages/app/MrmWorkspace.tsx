import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileText,
  History,
  Info,
  MapPin,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

interface Attendee {
  id: string;
  name: string;
  designation: string;
  function: string;
  present: string;
  signature: string;
}

interface Apology {
  id: string;
  name: string;
  designation: string;
  reason: string;
}

interface ActionItem {
  id: string;
  action: string;
  owner: string;
  dueDate: string;
  status: string;
  remarks: string;
}

interface ContextChange {
  id: string;
  change: string;
  standards: string;
  implication: string;
  action: string;
}

interface InterestedParty {
  id: string;
  party: string;
  needs: string;
  change: string;
  status: string;
  action: string;
}

interface MrmObjective {
  id: string;
  objective: string;
  standard: string;
  target: string;
  status: string;
  action: string;
}

interface MrmKpi {
  id: string;
  name: string;
  target: string;
  actual: string;
  status: string;
  comments: string;
}

interface EnvAspect {
  id: string;
  aspect: string;
  activity: string;
  impact: string;
  control: string;
  performance: string;
}

interface IncidentLog {
  id: string;
  date: string;
  type: string;
  severity: string;
  rootCause: string;
  correctiveAction: string;
  status: string;
}

interface WorkerConsultation {
  id: string;
  issue: string;
  raisedBy: string;
  date: string;
  response: string;
  status: string;
}

interface NcLog {
  openStart: number;
  raised: number;
  closed: number;
  openEnd: number;
  overdue: number;
  comments: string;
}

interface MonitoringActivity {
  id: string;
  activity: string;
  standard: string;
  frequency: string;
  result: string;
  action: string;
}

interface AuditResult {
  id: string;
  type: string;
  date: string;
  scope: string;
  findings: string;
  status: string;
}

interface ExternalProvider {
  id: string;
  provider: string;
  category: string;
  scope: string;
  score: string;
  issues: string;
  action: string;
}

interface ResourceCategory {
  id: string;
  category: string;
  status: string;
  gap: string;
  recommendation: string;
  owner: string;
}

interface RiskOpportunityItem {
  id: string;
  ref: string;
  risk: string;
  standard: string;
  likelihood: string;
  severity: string;
  control: string;
  effectiveness: string;
  action: string;
}

interface ComplianceObligation {
  id: string;
  requirement: string;
  standard: string;
  date: string;
  status: string;
  action: string;
}

interface EmergencyDrill {
  id: string;
  scenario: string;
  date: string;
  type: string;
  outcome: string;
  action: string;
}

interface OpportunityImprovement {
  id: string;
  opportunity: string;
  standard: string;
  benefit: string;
  owner: string;
  dueDate: string;
}

interface DecisionOutput {
  id: string;
  decision: string;
  category: string;
  rationale: string;
}

interface ActionPlanItem {
  id: string;
  action: string;
  standard: string;
  owner: string;
  resources: string;
  dueDate: string;
  priority: string;
  status: string;
}

interface MrmData {
  orgName: string;
  refNo: string;
  dateTime: string;
  location: string;
  chair: string;
  recorder: string;
  periodFrom: string;
  periodTo: string;
  docStatus: string;
  distribution: string;
  quorumConfirmed: boolean;
  
  attendees: Attendee[];
  apologies: Apology[];
  
  prevMrmDate: string;
  prevMrmActions: ActionItem[];
  prevMrmStatus: string;

  imsChanges: ContextChange[];
  interestedParties: InterestedParty[];
  
  customerSat: { target: string; actual: string; trend: string };
  complaints: { target: string; actual: string; trend: string };
  complaintsClosed: { target: string; actual: string; trend: string };
  deliveryRate: { target: string; actual: string; trend: string };
  qmsCompliments: string;
  qmsComplaintsThemes: string;
  otherFeedback: string;

  objectives: MrmObjective[];
  qmsKpis: MrmKpi[];
  emsKpis: MrmKpi[];
  emsAspects: EnvAspect[];
  
  ohsKpis: MrmKpi[];
  ohsIncidents: IncidentLog[];
  workerConsultation: WorkerConsultation[];
  
  ncTracker: {
    internalAudit: NcLog;
    externalAudit: NcLog;
    complaints: NcLog;
    incidents: NcLog;
  };
  
  monitoringResults: MonitoringActivity[];
  auditResults: AuditResult[];
  supplierPerformance: ExternalProvider[];
  resourceAdequacy: ResourceCategory[];
  risksOpportunities: RiskOpportunityItem[];
  complianceObligations: ComplianceObligation[];
  externalCommunications: { regulatory: string; community: string; customer: string };
  emergencyDrills: EmergencyDrill[];
  opportunitiesImprovement: OpportunityImprovement[];
  
  needChangesPolicy: string;
  needChangesObjectives: string;
  needChangesStructure: string;
  needChangesObligations: string;
  
  resHuman: string;
  resTech: string;
  resBudget: string;
  
  integrationOpportunities: string;
  strategicImplications: string;
  
  conclConformity: string;
  conclComments: string;
  
  decisionsOutputs: DecisionOutput[];
  actionPlan: ActionPlanItem[];
  
  aob: string;
  nextMrmDate: string;
  nextMrmVenue: string;
  
  approvalChairName: string;
  approvalChairDate: string;
  approvalRepName: string;
  approvalRepDate: string;
  approvalApprovedByName: string;
  approvalApprovedByDate: string;
}

const getDefaultMrmData = (orgName: string): MrmData => ({
  orgName: orgName || "OAK Global International",
  refNo: "MRM-MOM-2026-01",
  dateTime: "2026-05-18 10:00 AM",
  location: "Main HQ Executive Boardroom / Microsoft Teams",
  chair: "Adeleke Benson (Managing Director)",
  recorder: "Sarah Jenkins (QHSE Coordinator)",
  periodFrom: "2025-05-01",
  periodTo: "2026-04-30",
  docStatus: "Approved",
  distribution: "Top Management, QHSE Department, Site Directors, Departmental Heads",
  quorumConfirmed: true,
  
  attendees: [
    { id: "1", name: "Adeleke Benson", designation: "Managing Director", function: "Top Management", present: "Y", signature: "[Signed]" },
    { id: "2", name: "Sarah Jenkins", designation: "QHSE Coordinator", function: "QMS/EMS/OHS Coordination", present: "Y", signature: "[Signed]" },
    { id: "3", name: "Dr. Chioma Nwachukwu", designation: "Operations Director", function: "Production / Service Execution", present: "Y", signature: "[Signed]" },
    { id: "4", name: "Farooq Al-Hassan", designation: "Facilities Manager", function: "HSE Committee & Site Care", present: "Y", signature: "[Signed]" },
    { id: "5", name: "Olawale Peters", designation: "Logistics Manager", function: "Supply Chain & Transport", present: "Y", signature: "[Signed]" },
  ],
  apologies: [
    { id: "1", name: "Engr. Ken Adams", designation: "Technical Director", reason: "Attending critical site offshore commissioning" }
  ],
  
  prevMrmDate: "2025-05-20",
  prevMrmActions: [
    { id: "1", action: "Perform noise-level monitoring in Warehouse Zone 3", owner: "Farooq Al-Hassan", dueDate: "2025-10-15", status: "Closed", remarks: "Monitoring done; readings at 74dBA (well below standard action level)." },
    { id: "2", action: "Revise Chemical spill management procedures & provide spill kits", owner: "Sarah Jenkins", dueDate: "2025-08-30", status: "Closed", remarks: "Standard procedure updated, 4 new industrial spill response kits installed at site." },
    { id: "3", action: "Complete ISO 9001 Awareness briefings for new contractors", owner: "Sarah Jenkins", dueDate: "2025-12-10", status: "Closed", remarks: "Completed on 2025-11-20. contractor log signed." }
  ],
  prevMrmStatus: "approved",

  imsChanges: [
    { id: "1", change: "Expansion of Logistics depot in Port Harcourt", standards: "IMS (QMS/EMS/OHS)", implication: "New loading bays increase vehicle flow, noise risk, and energy use.", action: "Extend site aspects registry and safety hazard log; deploy PPE zone markers." },
    { id: "2", change: "Updated Environmental Regulations on Waste tracking", standards: "ISO 14001", implication: "Requires digitalization of hazardous waste manifest tracking.", action: "Migrate manifest submission to the national environmental portal." }
  ],
  interestedParties: [
    { id: "1", party: "NESREA (Regulator)", needs: "Zero chemical spills, complete waste logs", change: "Increased audits", status: "Compliant", action: "Monthly audit on waste storage containment zones." },
    { id: "2", party: "Local Host Community", needs: "Noise abatement, employment of locals", change: "None", status: "Satisfactory", action: "Maintain community relations panel and noise barrier walls." }
  ],
  
  customerSat: { target: "90%", actual: "92.4%", trend: "Upward" },
  complaints: { target: "under 15", actual: "8", trend: "Downward" },
  complaintsClosed: { target: "100%", actual: "100%", trend: "Stable" },
  deliveryRate: { target: "95%", actual: "96.8%", trend: "Upward" },
  qmsCompliments: "High praise from Chevron on on-time delivery of technical logistics. Quality of service response praised.",
  qmsComplaintsThemes: "Minor delay in invoice generation for regional accounts. Addressed with Finance automation.",
  otherFeedback: "Federal inspectors checked Lagos facility; zero nonconformities raised. Positive feedback on clean warehouse zones.",

  objectives: [
    { id: "1", objective: "Achieve zero Class-1 lost time accidents", standard: "ISO 45001", target: "0 incidents", status: "Met", action: "Conduct strict daily toolbox talks and monthly audits." },
    { id: "2", objective: "Reduce electricity intensity by 5%", standard: "ISO 14001", target: "5% reduction vs base yr", status: "Ongoing", action: "Replace high-bay warehouse bulbs with low-energy LEDs." },
    { id: "3", objective: "Improve supplier audit response rate", standard: "ISO 9001", target: "98% response within 5 days", status: "Met", action: "Automated standard supplier portal reminders." }
  ],
  
  qmsKpis: [
    { id: "1", name: "Service Defect Rate", target: "< 1.0%", actual: "0.45%", status: "Met", comments: "Highly consistent service execution across all teams." },
    { id: "2", name: "Quality Audit Schedule Adherence", target: "100%", actual: "100%", status: "Met", comments: "All QMS internal process audits completed successfully." }
  ],
  emsKpis: [
    { id: "1", name: "Energy Consumption", target: "< 4500 kWh/mo", actual: "4210 kWh", status: "Met", comments: "Strong performance attributed to solar power contribution." },
    { id: "2", name: "Hazardous waste generated", target: "< 2.0 Tons", actual: "1.45 Tons", status: "Met", comments: "Successful oil recycling campaign decreased standard waste." }
  ],
  emsAspects: [
    { id: "1", aspect: "Chemical storage areas", activity: "Handling and storage", impact: "Ground contamination", control: "Secondary bunding + regular inspections", performance: "100% compliant; zero leakage" },
    { id: "2", aspect: "Diesel generator operation", activity: "Emergency power generation", impact: "Air emissions, fuel combustion", control: "Preventive maintenance on schedule", performance: "Inspected monthly; stack emissions transparent" }
  ],
  
  ohsKpis: [
    { id: "1", name: "Lost Time Injury Frequency (LTIFR)", target: "0.00", actual: "0.00", status: "Met", comments: "Approaching 730 days without LTI milestone." },
    { id: "2", name: "Near-Miss Reports Submitted", target: "> 25 / yr", actual: "34 reports", status: "Met", comments: "Higher reporting indicates high safety culture engagement." }
  ],
  ohsIncidents: [
    { id: "1", date: "2026-01-14", type: "Near-Miss", severity: "Low", rootCause: "Oil slick on workshop floor from forklift hose leak", correctiveAction: "Replaced forklift hydraulic hose, cleaned site, standard clean floor check implemented", status: "Closed" }
  ],
  workerConsultation: [
    { id: "1", issue: "Request for higher-visibility PPE in loading zone", raisedBy: "Warehouse HSE Rep", date: "2026-02-10", response: "Approved and ordered class-3 vests for all yard crew", status: "Completed" }
  ],
  
  ncTracker: {
    internalAudit: { openStart: 0, raised: 4, closed: 4, openEnd: 0, overdue: 0, comments: "All internal audit nonconformities addressed on schedule." },
    externalAudit: { openStart: 1, raised: 0, closed: 1, openEnd: 0, overdue: 0, comments: "ISO surveillance finding successfully closed out." },
    complaints: { openStart: 0, raised: 8, closed: 8, openEnd: 0, overdue: 0, comments: "100% closure of standard client concerns." },
    incidents: { openStart: 0, raised: 1, closed: 1, openEnd: 0, overdue: 0, comments: "RCA done, containment closed." }
  },
  
  monitoringResults: [
    { id: "1", activity: "Warehouse boundary noise monitoring", standard: "ISO 14001 / OHSAS", frequency: "Bi-Annually", result: "Average 68 dBA at boundary line", action: "Continue monitoring" },
    { id: "2", activity: "Drinking water microbiological check", standard: "ISO 45001", frequency: "Quarterly", result: "Coliform counts nil", action: "None required" }
  ],
  auditResults: [
    { id: "1", type: "IMS Internal Audit", date: "2025-11-12", scope: "Procurement, Storage, Operations & Safety", findings: "0 Major, 3 Minor NCs, 2 OFIs", status: "All Corrective Actions Approved & Verified Closed" }
  ],
  supplierPerformance: [
    { id: "1", provider: "Prime Energy Services", category: "Contractor", scope: "Substation Maintenance", score: "92 / 100", issues: "Occasional delays in HSE document submissions", action: "Assigned specific onboarding manager to follow up" }
  ],
  
  resourceAdequacy: [
    { id: "1", category: "People / Competence", status: "Adequate", gap: "Succession plan gaps in operations", recommendation: "Cross-train senior supervisors as backup superintendents", owner: "Adeleke Benson" },
    { id: "2", category: "Infrastructure & Equipment", status: "Adequate", gap: "Backup gen near wear limit", recommendation: "Schedule overhaul / replacement budget in Q3", owner: "Farooq Al-Hassan" },
    { id: "3", category: "IT / Information Systems", status: "Critical Gap", gap: "Audit logs kept on manual spreadsheets", recommendation: "Utilize Conformia GRC software suite fully", owner: "Sarah Jenkins" }
  ],
  risksOpportunities: [
    { id: "1", ref: "R-02", risk: "Grid power failure leading to cold storage downtime", standard: "ISO 9001", likelihood: "Medium", severity: "High", control: "Automatic dual diesel generators", effectiveness: "Highly Effective", action: "Bi-weekly generator load testing" }
  ],
  complianceObligations: [
    { id: "1", requirement: "State Fire Service safety certification", standard: "ISO 45001 / Local Law", date: "2026-03-05", status: "Compliant", action: "Certificate renewed; valid till March 2027" }
  ],
  externalCommunications: {
    regulatory: "Received waste statistics compliance inquiry from Ministry of Environment. Replied with complete manifest logs.",
    community: "Received formal thank-you letter from community leaders regarding solar street lamp installation.",
    customer: "Service rating questionnaires returned. No negative safety observations reported."
  },
  
  emergencyDrills: [
    { id: "1", scenario: "Main Depot Fire Evacuation Drill", date: "2025-10-22", type: "OH&S Safety Drill", outcome: "100% evacuation within 2 min 40 seconds; fire marshals handled roll calls", action: "Relocate alarm switch to improve accessibility" }
  ],
  opportunitiesImprovement: [
    { id: "1", opportunity: "Digitize contractor induction process via standard QR portal", standard: "IMS", benefit: "Reduces HSE induction lag by 15 mins per team", owner: "Sarah Jenkins", dueDate: "2026-07-30" }
  ],
  
  needChangesPolicy: "No changes needed for QMS, EMS, or OHS policies. They remain fully aligned with organizational vision.",
  needChangesObjectives: "Revise next year energy target to account for solar installation capacity increase.",
  needChangesStructure: "Appoint Deputy HSE Officer to assist with Port Harcourt yard growth.",
  needChangesObligations: "Establish structured environmental carbon audit registers.",
  
  resHuman: "Request approval for 1 additional Safety Specialist.",
  resTech: "Approve budget for GRC digital license renewal.",
  resBudget: "Allocate $12,500 for high-efficiency solar grid replacement.",
  
  integrationOpportunities: "Incorporate contractor OHS onboarding directly into standard Enterprise Resource Planning (ERP) database.",
  strategicImplications: "Transitioning to low-carbon logistics creates a premium GRC brand differentiation in high-end energy sectors.",
  
  conclConformity: "yes",
  conclComments: "The Integrated Management System is highly suitable, fully adequate, and operating with maximum effectiveness. Conformance to QMS/EMS/OH&S standards remains solid.",
  
  decisionsOutputs: [
    { id: "1", decision: "IMS Certification Maintenance", category: "Change to IMS", Rationale: "Unconditional approval to retain full ISO 9001, 14001, and 45001 credentials." }
  ],
  actionPlan: [
    { id: "1", action: "Install LED lighting in Lagos Logistics Yard", standard: "ISO 14001", owner: "Farooq Al-Hassan", resources: "$3,400 budget approved", dueDate: "2026-08-15", priority: "Medium", status: "Open" },
    { id: "2", action: "Deploy QR-based Contractor HSE induction module", standard: "ISO 45001", owner: "Sarah Jenkins", resources: "HSE Coordinator hours", dueDate: "2026-07-30", priority: "High", status: "Open" }
  ],
  
  aob: "QHSE Manager congratulated the entire executive panel on securing zero major nonconformities for two full audit cycles.",
  nextMrmDate: "2027-05-17",
  nextMrmVenue: "Port Harcourt Operations Complex",
  
  approvalChairName: "Adeleke Benson",
  approvalChairDate: "2026-05-18",
  approvalRepName: "Sarah Jenkins",
  approvalRepDate: "2026-05-18",
  approvalApprovedByName: "Adeleke Benson",
  approvalApprovedByDate: "2026-05-18",
});

export default function MrmWorkspace() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<"context" | "strategic" | "kpis" | "incidents" | "resources" | "decisions">("context");
  const [mrmData, setMrmData] = useState<MrmData | null>(null);

  // Load from localStorage or set default
  useEffect(() => {
    if (!currentOrg) return;
    const cacheKey = `oak_grc_mrm_${currentOrg.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setMrmData(JSON.parse(cached));
      } catch {
        setMrmData(getDefaultMrmData(currentOrg.name));
      }
    } else {
      setMrmData(getDefaultMrmData(currentOrg.name));
    }
  }, [currentOrg]);

  const handleSave = (silent = false) => {
    if (!currentOrg || !mrmData) return;
    const cacheKey = `oak_grc_mrm_${currentOrg.id}`;
    localStorage.setItem(cacheKey, JSON.stringify(mrmData));
    if (!silent) {
      toast({
        title: "Management Review Saved",
        description: "Meeting minutes saved locally for this workspace.",
      });
    }
  };

  const handleReset = () => {
    if (!currentOrg) return;
    if (window.confirm("Are you sure you want to reset all MRM minutes to the premium compliance template? Current edits will be lost.")) {
      const fresh = getDefaultMrmData(currentOrg.name);
      setMrmData(fresh);
      const cacheKey = `oak_grc_mrm_${currentOrg.id}`;
      localStorage.setItem(cacheKey, JSON.stringify(fresh));
      toast({
        title: "Reset Completed",
        description: "Standard executive checklist template re-seeded.",
      });
    }
  };

  const handlePrint = () => {
    handleSave(true);
    window.print();
  };

  if (!mrmData) {
    return (
      <AppShell>
        <div className="grid h-[400px] place-items-center">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading Management Review Workspace...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Row operations
  const addRow = <K extends keyof MrmData>(key: K, emptyObj: any) => {
    setMrmData((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: [...prev[key], { ...emptyObj, id: Date.now().toString() }],
      };
    });
  };

  const deleteRow = <K extends keyof MrmData>(key: K, id: string) => {
    setMrmData((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: prev[key].filter((item: any) => item.id !== id),
      };
    });
  };

  const updateArrayField = <K extends keyof MrmData>(key: K, id: string, field: string, val: any) => {
    setMrmData((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: prev[key].map((item: any) => (item.id === id ? { ...item, [field]: val } : item)),
      };
    });
  };

  return (
    <AppShell>
      {/* SCREEN VIEW INTERFACE */}
      <div className="space-y-6 print:hidden">
        {/* Header workspace dashboard */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Integrated GRC Command Workspace</span>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">IMS Management Review Meeting (MRM) minutes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and record corporate suitability, safety performance, environmental objectives, and compliance obligations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground transition duration-200 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset template
            </button>
            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-secondary text-foreground transition duration-200 flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5 text-primary" />
              Save draft
            </button>
            <button
              onClick={handlePrint}
              className="pill-cta bg-primary hover:bg-primary/90 flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Tab switch bar */}
        <div className="flex flex-wrap border-b border-border gap-1 bg-secondary/30 p-1 rounded-2xl">
          {[
            { id: "context", label: "1. Context & Attendance", icon: <Users className="h-4 w-4" /> },
            { id: "strategic", label: "2. Risks & Context", icon: <Info className="h-4 w-4" /> },
            { id: "kpis", label: "3. QMS & EMS KPIs", icon: <TrendingUp className="h-4 w-4" /> },
            { id: "incidents", label: "4. Safety & NC Tracker", icon: <AlertTriangle className="h-4 w-4" /> },
            { id: "resources", label: "5. Resource Adequacy", icon: <FileText className="h-4 w-4" /> },
            { id: "decisions", label: "6. Action Plan & Sign-off", icon: <FileCheck className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                handleSave(true);
                setActiveSection(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                activeSection === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card space-y-8 animate-fade-in">
          
          {/* TAB 1: CONTEXT & ATTENDANCE */}
          {activeSection === "context" && (
            <div className="space-y-8">
              <h2 className="font-display text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Meeting Context & Attendance Log
              </h2>
              
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">MRM Reference No.</label>
                  <input
                    type="text"
                    value={mrmData.refNo}
                    onChange={(e) => setMrmData({ ...mrmData, refNo: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date & Time</label>
                  <input
                    type="text"
                    value={mrmData.dateTime}
                    onChange={(e) => setMrmData({ ...mrmData, dateTime: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location / Platform</label>
                  <input
                    type="text"
                    value={mrmData.location}
                    onChange={(e) => setMrmData({ ...mrmData, location: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meeting Chair</label>
                  <input
                    type="text"
                    value={mrmData.chair}
                    onChange={(e) => setMrmData({ ...mrmData, chair: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Minutes Recorded By</label>
                  <input
                    type="text"
                    value={mrmData.recorder}
                    onChange={(e) => setMrmData({ ...mrmData, recorder: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Review Period Covered</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={mrmData.periodFrom}
                      onChange={(e) => setMrmData({ ...mrmData, periodFrom: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <input
                      type="date"
                      value={mrmData.periodTo}
                      onChange={(e) => setMrmData({ ...mrmData, periodTo: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Distribution list</label>
                  <input
                    type="text"
                    value={mrmData.distribution}
                    onChange={(e) => setMrmData({ ...mrmData, distribution: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Document Status</label>
                  <select
                    value={mrmData.docStatus}
                    onChange={(e) => setMrmData({ ...mrmData, docStatus: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 h-full pt-6">
                  <input
                    type="checkbox"
                    id="quorumCheck"
                    checked={mrmData.quorumConfirmed}
                    onChange={(e) => setMrmData({ ...mrmData, quorumConfirmed: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="quorumCheck" className="text-sm font-medium text-foreground cursor-pointer select-none">Quorum Confirmed</label>
                </div>
              </div>

              {/* 1.1 Attendees Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">1.1 Attendees List</h3>
                  <button
                    onClick={() => addRow("attendees", { name: "", designation: "", function: "", present: "Y", signature: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Attendee
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-40">Name</th>
                        <th className="p-3 w-40">Designation / Role</th>
                        <th className="p-3">Function</th>
                        <th className="p-3 w-28">Present (Y/N)</th>
                        <th className="p-3 w-32">Signature Status</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.attendees.map((att) => (
                        <tr key={att.id} className="border-b border-border last:border-0 align-middle">
                          <td className="p-2">
                            <input
                              type="text"
                              value={att.name}
                              onChange={(e) => updateArrayField("attendees", att.id, "name", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={att.designation}
                              onChange={(e) => updateArrayField("attendees", att.id, "designation", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={att.function}
                              onChange={(e) => updateArrayField("attendees", att.id, "function", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={att.present}
                              onChange={(e) => updateArrayField("attendees", att.id, "present", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Y">Y (Yes)</option>
                              <option value="N">N (No)</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={att.signature}
                              onChange={(e) => updateArrayField("attendees", att.id, "signature", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("attendees", att.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 1.2 Apologies list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">1.2 Apologies</h3>
                  <button
                    onClick={() => addRow("apologies", { name: "", designation: "", reason: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Apology
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-48">Name</th>
                        <th className="p-3 w-48">Designation</th>
                        <th className="p-3">Reason for Apology</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.apologies.map((ap) => (
                        <tr key={ap.id} className="border-b border-border last:border-0 align-middle">
                          <td className="p-2">
                            <input
                              type="text"
                              value={ap.name}
                              onChange={(e) => updateArrayField("apologies", ap.id, "name", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={ap.designation}
                              onChange={(e) => updateArrayField("apologies", ap.id, "designation", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={ap.reason}
                              onChange={(e) => updateArrayField("apologies", ap.id, "reason", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("apologies", ap.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Confirmation of previous MOM */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-4 w-4 text-primary" /> 2. Confirmation of Previous MRM Minutes
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date of previous MRM held</label>
                    <input
                      type="date"
                      value={mrmData.prevMrmDate}
                      onChange={(e) => setMrmData({ ...mrmData, prevMrmDate: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Previous MOM Approval Status</label>
                    <select
                      value={mrmData.prevMrmStatus}
                      onChange={(e) => setMrmData({ ...mrmData, prevMrmStatus: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="approved">Approved as a true record</option>
                      <option value="approved_amendments">Approved with amendments</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status of actions arising from previous review</span>
                    <button
                      onClick={() => addRow("prevMrmActions", { action: "", owner: "", dueDate: "", status: "Open", remarks: "" })}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Previous Action Row
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full border-collapse text-xs text-left">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                          <th className="p-3">Action Item</th>
                          <th className="p-3 w-40">Owner</th>
                          <th className="p-3 w-32">Due Date</th>
                          <th className="p-3 w-32">Status</th>
                          <th className="p-3 max-w-xs">Evidence / Remarks</th>
                          <th className="p-3 w-12 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mrmData.prevMrmActions.map((act) => (
                          <tr key={act.id} className="border-b border-border last:border-0 align-top">
                            <td className="p-2">
                              <textarea
                                value={act.action}
                                onChange={(e) => updateArrayField("prevMrmActions", act.id, "action", e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none text-xs min-h-[50px]"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={act.owner}
                                onChange={(e) => updateArrayField("prevMrmActions", act.id, "owner", e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="date"
                                value={act.dueDate}
                                onChange={(e) => updateArrayField("prevMrmActions", act.id, "dueDate", e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={act.status}
                                onChange={(e) => updateArrayField("prevMrmActions", act.id, "status", e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                              >
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                                <option value="Overdue">Overdue</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <textarea
                                value={act.remarks}
                                onChange={(e) => updateArrayField("prevMrmActions", act.id, "remarks", e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none text-xs min-h-[50px]"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button onClick={() => deleteRow("prevMrmActions", act.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                                <Trash2 className="h-4 w-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRATEGIC CONTEXT & RISKS */}
          {activeSection === "strategic" && (
            <div className="space-y-8">
              <h2 className="font-display text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> Strategic Context, Opportunities & compliance
              </h2>

              {/* 3. Changes in Context */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">3.1 Changes Relevant to the IMS (Internal/External/Legal)</h3>
                  <button
                    onClick={() => addRow("imsChanges", { change: "", standards: "IMS", implication: "", action: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Context Change
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3">Change Context</th>
                        <th className="p-3 w-40">Standard(s) Impacted</th>
                        <th className="p-3">Implication on IMS</th>
                        <th className="p-3">Action Required</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.imsChanges.map((ch) => (
                        <tr key={ch.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <textarea
                              value={ch.change}
                              onChange={(e) => updateArrayField("imsChanges", ch.id, "change", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={ch.standards}
                              onChange={(e) => updateArrayField("imsChanges", ch.id, "standards", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ch.implication}
                              onChange={(e) => updateArrayField("imsChanges", ch.id, "implication", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ch.action}
                              onChange={(e) => updateArrayField("imsChanges", ch.id, "action", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("imsChanges", ch.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3.2 Interested Parties Needs & Expectations */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">3.2 Needs & Expectations of Interested Parties</h3>
                  <button
                    onClick={() => addRow("interestedParties", { party: "", needs: "", change: "None", status: "Compliant", action: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Stakeholder Need
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-48">Interested Party</th>
                        <th className="p-3">Needs & Expectations</th>
                        <th className="p-3 w-40">Change in Period</th>
                        <th className="p-3 w-40">Compliance Status</th>
                        <th className="p-3">Required Action</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.interestedParties.map((ip) => (
                        <tr key={ip.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <input
                              type="text"
                              value={ip.party}
                              onChange={(e) => updateArrayField("interestedParties", ip.id, "party", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ip.needs}
                              onChange={(e) => updateArrayField("interestedParties", ip.id, "needs", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={ip.change}
                              onChange={(e) => updateArrayField("interestedParties", ip.id, "change", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={ip.status}
                              onChange={(e) => updateArrayField("interestedParties", ip.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Compliant">Compliant / Satisfactory</option>
                              <option value="Gap Identified">Gap Identified</option>
                              <option value="Critical Concern">Critical Concern</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ip.action}
                              onChange={(e) => updateArrayField("interestedParties", ip.id, "action", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("interestedParties", ip.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. Risks & Opportunities effectiveness */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">6. Effectiveness of Actions taken to address Risks and Opportunities</h3>
                  <button
                    onClick={() => addRow("risksOpportunities", { ref: "", risk: "", standard: "IMS", likelihood: "Medium", severity: "Medium", control: "", effectiveness: "Effective", action: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Risk Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-16">Ref</th>
                        <th className="p-3">Risk / Opportunity</th>
                        <th className="p-3 w-28">Standard</th>
                        <th className="p-3 w-28">Likelihood</th>
                        <th className="p-3 w-28">Severity</th>
                        <th className="p-3">Current Control</th>
                        <th className="p-3 w-36">Effectiveness</th>
                        <th className="p-3">Further Action</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.risksOpportunities.map((ro) => (
                        <tr key={ro.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <input
                              type="text"
                              value={ro.ref}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "ref", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ro.risk}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "risk", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={ro.standard}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "standard", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={ro.likelihood}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "likelihood", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <select
                              value={ro.severity}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "severity", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ro.control}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "control", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={ro.effectiveness}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "effectiveness", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Highly Effective">Highly Effective</option>
                              <option value="Effective">Effective</option>
                              <option value="Needs Improvement">Needs Improvement</option>
                              <option value="Ineffective">Ineffective</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ro.action}
                              onChange={(e) => updateArrayField("risksOpportunities", ro.id, "action", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("risksOpportunities", ro.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. Fulfillment of Compliance Obligations */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">7. Fulfilment of Compliance Obligations / Legal & Other Requirements</h3>
                  <button
                    onClick={() => addRow("complianceObligations", { requirement: "", standard: "ISO 14001", date: "", status: "Compliant", action: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Requirement Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3">Legal / Other Requirement</th>
                        <th className="p-3 w-40">Standard</th>
                        <th className="p-3 w-32">Date Evaluated</th>
                        <th className="p-3 w-40">Compliance Status</th>
                        <th className="p-3">Required Corrective Action / Gap</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.complianceObligations.map((co) => (
                        <tr key={co.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <textarea
                              value={co.requirement}
                              onChange={(e) => updateArrayField("complianceObligations", co.id, "requirement", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={co.standard}
                              onChange={(e) => updateArrayField("complianceObligations", co.id, "standard", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={co.date}
                              onChange={(e) => updateArrayField("complianceObligations", co.id, "date", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={co.status}
                              onChange={(e) => updateArrayField("complianceObligations", co.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Compliant">Compliant</option>
                              <option value="Pending review">Pending review</option>
                              <option value="Non-Compliant">Non-Compliant</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={co.action}
                              onChange={(e) => updateArrayField("complianceObligations", co.id, "action", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("complianceObligations", co.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7.1 Communications from External Interested Parties */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">7.1 Communications from External Interested Parties (including complaints)</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Regulatory communications</label>
                    <textarea
                      value={mrmData.externalCommunications.regulatory}
                      onChange={(e) => setMrmData({
                        ...mrmData,
                        externalCommunications: { ...mrmData.externalCommunications, regulatory: e.target.value }
                      })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Community / NGO communications</label>
                    <textarea
                      value={mrmData.externalCommunications.community}
                      onChange={(e) => setMrmData({
                        ...mrmData,
                        externalCommunications: { ...mrmData.externalCommunications, community: e.target.value }
                      })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer communications</label>
                    <textarea
                      value={mrmData.externalCommunications.customer}
                      onChange={(e) => setMrmData({
                        ...mrmData,
                        externalCommunications: { ...mrmData.externalCommunications, customer: e.target.value }
                      })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMS PERFORMANCE KPIS */}
          {activeSection === "kpis" && (
            <div className="space-y-8">
              <h2 className="font-display text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> 4. IMS Performance & Effectiveness KPIs
              </h2>

              {/* QMS KPI Customer Sat */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-l-2 border-primary pl-2">4.1 Customer Satisfaction & Feedback Metrics (ISO 9001)</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    ["Customer satisfaction score", "customerSat"],
                    ["Complaints received", "complaints"],
                    ["Complaints closed on time", "complaintsClosed"],
                    ["On-time delivery %", "deliveryRate"],
                  ].map(([label, stateKey]) => (
                    <div key={stateKey} className="rounded-xl border border-border bg-secondary/10 p-4 space-y-3">
                      <div className="text-xs font-semibold text-muted-foreground truncate">{label}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Target</span>
                          <input
                            type="text"
                            value={(mrmData as any)[stateKey].target}
                            onChange={(e) => setMrmData({
                              ...mrmData,
                              [stateKey]: { ...(mrmData as any)[stateKey], target: e.target.value }
                            })}
                            className="w-full rounded-lg border border-border bg-background px-2 py-0.5 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Actual</span>
                          <input
                            type="text"
                            value={(mrmData as any)[stateKey].actual}
                            onChange={(e) => setMrmData({
                              ...mrmData,
                              [stateKey]: { ...(mrmData as any)[stateKey], actual: e.target.value }
                            })}
                            className="w-full rounded-lg border border-border bg-background px-2 py-0.5 text-xs focus:outline-none font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">Trend / Analysis</span>
                        <input
                          type="text"
                          value={(mrmData as any)[stateKey].trend}
                          onChange={(e) => setMrmData({
                            ...mrmData,
                            [stateKey]: { ...(mrmData as any)[stateKey], trend: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-2 py-0.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key compliments received</label>
                    <textarea
                      value={mrmData.qmsCompliments}
                      onChange={(e) => setMrmData({ ...mrmData, qmsCompliments: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none min-h-[70px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key complaints themes</label>
                    <textarea
                      value={mrmData.qmsComplaintsThemes}
                      onChange={(e) => setMrmData({ ...mrmData, qmsComplaintsThemes: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none min-h-[70px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Feedback from other parties</label>
                    <textarea
                      value={mrmData.otherFeedback}
                      onChange={(e) => setMrmData({ ...mrmData, otherFeedback: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none min-h-[70px]"
                    />
                  </div>
                </div>
              </div>

              {/* 4.2 Objectives checklist */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.2 Extent to which Quality, Environmental and OH&S Objectives have been met</h3>
                  <button
                    onClick={() => addRow("objectives", { objective: "", standard: "IMS", target: "", status: "Met", action: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Objective Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3">Objective Statement</th>
                        <th className="p-3 w-40">Standard</th>
                        <th className="p-3">Target Metrics</th>
                        <th className="p-3 w-36">Status</th>
                        <th className="p-3">Action to Close Gap</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.objectives.map((obj) => (
                        <tr key={obj.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <textarea
                              value={obj.objective}
                              onChange={(e) => updateArrayField("objectives", obj.id, "objective", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={obj.standard}
                              onChange={(e) => updateArrayField("objectives", obj.id, "standard", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={obj.target}
                              onChange={(e) => updateArrayField("objectives", obj.id, "target", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={obj.status}
                              onChange={(e) => updateArrayField("objectives", obj.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Met">Met</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Not Met">Not Met</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={obj.action}
                              onChange={(e) => updateArrayField("objectives", obj.id, "action", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("objectives", obj.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.3 QMS Process performance */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.3 Process Performance and Conformity of Products & Services (QMS KPIs)</h3>
                  <button
                    onClick={() => addRow("qmsKpis", { name: "", target: "", actual: "", status: "Met", comments: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add QMS KPI Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-72">QMS KPI (ISO 9001)</th>
                        <th className="p-3 w-32">Target</th>
                        <th className="p-3 w-32">Actual</th>
                        <th className="p-3 w-36">Status</th>
                        <th className="p-3">Comments / Remarks</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.qmsKpis.map((kpi) => (
                        <tr key={kpi.id} className="border-b border-border last:border-0 align-middle">
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.name}
                              onChange={(e) => updateArrayField("qmsKpis", kpi.id, "name", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.target}
                              onChange={(e) => updateArrayField("qmsKpis", kpi.id, "target", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.actual}
                              onChange={(e) => updateArrayField("qmsKpis", kpi.id, "actual", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={kpi.status}
                              onChange={(e) => updateArrayField("qmsKpis", kpi.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Met">Met</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Not Met">Not Met</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.comments}
                              onChange={(e) => updateArrayField("qmsKpis", kpi.id, "comments", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("qmsKpis", kpi.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.4 Environmental performance EMS KPIs */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.4 Environmental Performance (ISO 14001 EMS KPIs)</h3>
                  <button
                    onClick={() => addRow("emsKpis", { name: "", target: "", actual: "", status: "Met", comments: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add EMS KPI Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-72">EMS KPI (ISO 14001)</th>
                        <th className="p-3 w-32">Target</th>
                        <th className="p-3 w-32">Actual</th>
                        <th className="p-3 w-36">Status</th>
                        <th className="p-3">Comments / Remarks</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.emsKpis.map((kpi) => (
                        <tr key={kpi.id} className="border-b border-border last:border-0 align-middle">
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.name}
                              onChange={(e) => updateArrayField("emsKpis", kpi.id, "name", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.target}
                              onChange={(e) => updateArrayField("emsKpis", kpi.id, "target", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.actual}
                              onChange={(e) => updateArrayField("emsKpis", kpi.id, "actual", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={kpi.status}
                              onChange={(e) => updateArrayField("emsKpis", kpi.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Met">Met</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Not Met">Not Met</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.comments}
                              onChange={(e) => updateArrayField("emsKpis", kpi.id, "comments", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("emsKpis", kpi.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.4.2 Environmental Aspects & Controls */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.4.2 Significant Environmental Aspects & Impacts</h3>
                  <button
                    onClick={() => addRow("emsAspects", { aspect: "", activity: "", impact: "", control: "", performance: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Aspects Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-48">Environmental Aspect</th>
                        <th className="p-3">Activity / Source</th>
                        <th className="p-3">Associated Impact</th>
                        <th className="p-3">Existing Control</th>
                        <th className="p-3 w-48">Performance Summary</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.emsAspects.map((asp) => (
                        <tr key={asp.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <input
                              type="text"
                              value={asp.aspect}
                              onChange={(e) => updateArrayField("emsAspects", asp.id, "aspect", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={asp.activity}
                              onChange={(e) => updateArrayField("emsAspects", asp.id, "activity", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={asp.impact}
                              onChange={(e) => updateArrayField("emsAspects", asp.id, "impact", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={asp.control}
                              onChange={(e) => updateArrayField("emsAspects", asp.id, "control", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={asp.performance}
                              onChange={(e) => updateArrayField("emsAspects", asp.id, "performance", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("emsAspects", asp.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY & NC TRACKER */}
          {activeSection === "incidents" && (
            <div className="space-y-8">
              <h2 className="font-display text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" /> Occupational Health & Safety (OHS) & Nonconformity Log
              </h2>

              {/* 4.5.1 OHS Performance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.5.1 OH&S Performance KPIs (ISO 45001)</h3>
                  <button
                    onClick={() => addRow("ohsKpis", { name: "", target: "", actual: "", status: "Met", comments: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add OH&S KPI Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-72">OH&S KPI (ISO 45001)</th>
                        <th className="p-3 w-32">Target</th>
                        <th className="p-3 w-32">Actual</th>
                        <th className="p-3 w-36">Status</th>
                        <th className="p-3">Comments / Remarks</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.ohsKpis.map((kpi) => (
                        <tr key={kpi.id} className="border-b border-border last:border-0 align-middle">
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.name}
                              onChange={(e) => updateArrayField("ohsKpis", kpi.id, "name", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.target}
                              onChange={(e) => updateArrayField("ohsKpis", kpi.id, "target", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.actual}
                              onChange={(e) => updateArrayField("ohsKpis", kpi.id, "actual", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={kpi.status}
                              onChange={(e) => updateArrayField("ohsKpis", kpi.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Met">Met</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Not Met">Not Met</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={kpi.comments}
                              onChange={(e) => updateArrayField("ohsKpis", kpi.id, "comments", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("ohsKpis", kpi.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.5.2 Incidents safety log */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.5.2 Incidents, Injuries, Ill-Health, Near-Misses & Hazards Log</h3>
                  <button
                    onClick={() => addRow("ohsIncidents", { date: "", type: "Near-Miss", severity: "Low", rootCause: "", correctiveAction: "", status: "Closed" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Incident log row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-32">Date</th>
                        <th className="p-3 w-40">Incident Type</th>
                        <th className="p-3 w-28">Severity</th>
                        <th className="p-3">Root Cause</th>
                        <th className="p-3">Immediate Corrective Action (CAPA)</th>
                        <th className="p-3 w-32">Status</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.ohsIncidents.map((inc) => (
                        <tr key={inc.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <input
                              type="date"
                              value={inc.date}
                              onChange={(e) => updateArrayField("ohsIncidents", inc.id, "date", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={inc.type}
                              onChange={(e) => updateArrayField("ohsIncidents", inc.id, "type", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Injury">Injury</option>
                              <option value="Ill-Health">Ill-Health</option>
                              <option value="Near-Miss">Near-Miss</option>
                              <option value="Hazard reported">Hazard reported</option>
                              <option value="Spill/Release">Spill/Release</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <select
                              value={inc.severity}
                              onChange={(e) => updateArrayField("ohsIncidents", inc.id, "severity", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={inc.rootCause}
                              onChange={(e) => updateArrayField("ohsIncidents", inc.id, "rootCause", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={inc.correctiveAction}
                              onChange={(e) => updateArrayField("ohsIncidents", inc.id, "correctiveAction", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={inc.status}
                              onChange={(e) => updateArrayField("ohsIncidents", inc.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Open">Open</option>
                              <option value="Closed">Closed</option>
                              <option value="Investigation">Under Investigation</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("ohsIncidents", inc.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.5.3 Worker Consultation & Participation */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.5.3 Worker Consultation & Participation</h3>
                  <button
                    onClick={() => addRow("workerConsultation", { issue: "", raisedBy: "", date: "", response: "", status: "Completed" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Consultation Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3">Issue Raised</th>
                        <th className="p-3 w-48">Raised By / Forum</th>
                        <th className="p-3 w-32">Date</th>
                        <th className="p-3">Response / Action Taken</th>
                        <th className="p-3 w-36">Status</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.workerConsultation.map((wc) => (
                        <tr key={wc.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <textarea
                              value={wc.issue}
                              onChange={(e) => updateArrayField("workerConsultation", wc.id, "issue", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={wc.raisedBy}
                              onChange={(e) => updateArrayField("workerConsultation", wc.id, "raisedBy", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={wc.date}
                              onChange={(e) => updateArrayField("workerConsultation", wc.id, "date", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={wc.response}
                              onChange={(e) => updateArrayField("workerConsultation", wc.id, "response", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={wc.status}
                              onChange={(e) => updateArrayField("workerConsultation", wc.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Completed">Completed</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Pending Action">Pending Action</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("workerConsultation", wc.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.6 Consolidated NC and Corrective Action Matrix */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">4.6 Nonconformities and Corrective Actions Matrix</h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3">Source of nonconformity</th>
                        <th className="p-3 w-32 text-center">Open at Start</th>
                        <th className="p-3 w-32 text-center">Raised in Period</th>
                        <th className="p-3 w-32 text-center">Closed in Period</th>
                        <th className="p-3 w-32 text-center">Open at End</th>
                        <th className="p-3 w-32 text-center">Overdue</th>
                        <th className="p-3">Analysis / Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Internal Audit", "internalAudit"],
                        ["External / Certification Audit", "externalAudit"],
                        ["Customer Complaints", "complaints"],
                        ["Incidents / Accidents / Near-Miss", "incidents"],
                      ].map(([label, key]) => {
                        const row: NcLog = (mrmData.ncTracker as any)[key];
                        const updateTrackerField = (f: keyof NcLog, val: any) => {
                          setMrmData({
                            ...mrmData,
                            ncTracker: {
                              ...mrmData.ncTracker,
                              [key]: {
                                ...(mrmData.ncTracker as any)[key],
                                [f]: val
                              }
                            }
                          });
                        };
                        
                        return (
                          <tr key={key} className="border-b border-border last:border-0 align-middle">
                            <td className="p-3 font-semibold text-foreground">{label}</td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.openStart}
                                onChange={(e) => updateTrackerField("openStart", parseInt(e.target.value) || 0)}
                                className="w-16 rounded border border-border bg-background px-1 py-0.5 text-center focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.raised}
                                onChange={(e) => updateTrackerField("raised", parseInt(e.target.value) || 0)}
                                className="w-16 rounded border border-border bg-background px-1 py-0.5 text-center focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.closed}
                                onChange={(e) => updateTrackerField("closed", parseInt(e.target.value) || 0)}
                                className="w-16 rounded border border-border bg-background px-1 py-0.5 text-center focus:outline-none font-bold"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.openEnd}
                                onChange={(e) => updateTrackerField("openEnd", parseInt(e.target.value) || 0)}
                                className="w-16 rounded border border-border bg-background px-1 py-0.5 text-center focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.overdue}
                                onChange={(e) => updateTrackerField("overdue", parseInt(e.target.value) || 0)}
                                className="w-16 rounded border border-border bg-background px-1 py-0.5 text-center focus:outline-none text-red-500 font-medium"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.comments}
                                onChange={(e) => updateTrackerField("comments", e.target.value)}
                                className="w-full rounded border border-border bg-background px-2 py-0.5 text-xs focus:outline-none"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESOURCE ADEQUACY */}
          {activeSection === "resources" && (
            <div className="space-y-8">
              <h2 className="font-display text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Resource Adequacy & Audits
              </h2>

              {/* 5. Resource Adequacy */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">5. Resource Adequacy Checklists & Recommendations</h3>
                  <button
                    onClick={() => addRow("resourceAdequacy", { category: "", status: "Adequate", gap: "", recommendation: "", owner: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Resource Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-48">Resource Category</th>
                        <th className="p-3 w-32">Current Status</th>
                        <th className="p-3">Gap Identified</th>
                        <th className="p-3">Adequacy Recommendation</th>
                        <th className="p-3 w-40">Owner</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.resourceAdequacy.map((res) => (
                        <tr key={res.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2 font-semibold text-foreground">
                            <input
                              type="text"
                              value={res.category}
                              onChange={(e) => updateArrayField("resourceAdequacy", res.id, "category", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={res.status}
                              onChange={(e) => updateArrayField("resourceAdequacy", res.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Adequate">Adequate</option>
                              <option value="Minor Gap">Minor Gap</option>
                              <option value="Critical Gap">Critical Gap</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={res.gap}
                              onChange={(e) => updateArrayField("resourceAdequacy", res.id, "gap", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={res.recommendation}
                              onChange={(e) => updateArrayField("resourceAdequacy", res.id, "recommendation", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={res.owner}
                              onChange={(e) => updateArrayField("resourceAdequacy", res.id, "owner", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("resourceAdequacy", res.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8. Emergency preparedness safety drills */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">8. Emergency Preparedness, Drills & Response Performance</h3>
                  <button
                    onClick={() => addRow("emergencyDrills", { scenario: "", date: "", type: "EMS / OH&S", outcome: "", action: "" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Drill Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3 w-48">Scenario / Drill</th>
                        <th className="p-3 w-32">Date Conducted</th>
                        <th className="p-3 w-40">Type (EMS / OHS)</th>
                        <th className="p-3">Outcome Summary</th>
                        <th className="p-3">Improvement Action</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.emergencyDrills.map((dr) => (
                        <tr key={dr.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2 font-medium text-foreground">
                            <input
                              type="text"
                              value={dr.scenario}
                              onChange={(e) => updateArrayField("emergencyDrills", dr.id, "scenario", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={dr.date}
                              onChange={(e) => updateArrayField("emergencyDrills", dr.id, "date", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={dr.type}
                              onChange={(e) => updateArrayField("emergencyDrills", dr.id, "type", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={dr.outcome}
                              onChange={(e) => updateArrayField("emergencyDrills", dr.id, "outcome", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={dr.action}
                              onChange={(e) => updateArrayField("emergencyDrills", dr.id, "action", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("emergencyDrills", dr.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ACTION PLAN & APPROVAL */}
          {activeSection === "decisions" && (
            <div className="space-y-8">
              <h2 className="font-display text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" /> Executive Conclusions & Action Plan
              </h2>

              {/* Suitability check */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">14. Conclusion: Suitability, Adequacy & Effectiveness of the IMS</h3>
                <div className="p-4 rounded-xl border border-border bg-secondary/10 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Statement of Conformity</span>
                    <select
                      value={mrmData.conclConformity}
                      onChange={(e) => setMrmData({ ...mrmData, conclConformity: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="yes">The IMS conforms to ISO 9001, 14001, and 45001 requirements (Yes)</option>
                      <option value="reservations">Conforms with reservations / minor gap reviews (With reservations)</option>
                      <option value="no">Does not conform (No)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Executive Comments</span>
                    <input
                      type="text"
                      value={mrmData.conclComments}
                      onChange={(e) => setMrmData({ ...mrmData, conclComments: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 16. Action Plan */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">16. Approved Action Plan</h3>
                  <button
                    onClick={() => addRow("actionPlan", { action: "", standard: "IMS", owner: "", resources: "", dueDate: "", priority: "High", status: "Open" })}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Action Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
                        <th className="p-3">Approved Action Item</th>
                        <th className="p-3 w-32">Standard</th>
                        <th className="p-3 w-40">Owner</th>
                        <th className="p-3">Resources Needed</th>
                        <th className="p-3 w-32">Due Date</th>
                        <th className="p-3 w-28">Priority</th>
                        <th className="p-3 w-28">Status</th>
                        <th className="p-3 w-12 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.actionPlan.map((ap) => (
                        <tr key={ap.id} className="border-b border-border last:border-0 align-top">
                          <td className="p-2">
                            <textarea
                              value={ap.action}
                              onChange={(e) => updateArrayField("actionPlan", ap.id, "action", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px] font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={ap.standard}
                              onChange={(e) => updateArrayField("actionPlan", ap.id, "standard", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={ap.owner}
                              onChange={(e) => updateArrayField("actionPlan", ap.id, "owner", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={ap.resources}
                              onChange={(e) => updateArrayField("actionPlan", ap.id, "resources", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none min-h-[50px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={ap.dueDate}
                              onChange={(e) => updateArrayField("actionPlan", ap.id, "dueDate", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={ap.priority}
                              onChange={(e) => updateArrayField("actionPlan", ap.id, "priority", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none font-semibold"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <select
                              value={ap.status}
                              onChange={(e) => updateArrayField("actionPlan", ap.id, "status", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2 py-1 focus:outline-none"
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => deleteRow("actionPlan", ap.id)} className="text-destructive hover:text-destructive/80 transition duration-200">
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 19. Formal Approval Sign-off */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success" /> 19. Executive Approval Sign-off
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Meeting Chair / Top Management</span>
                    <input
                      type="text"
                      placeholder="Name"
                      value={mrmData.approvalChairName}
                      onChange={(e) => setMrmData({ ...mrmData, approvalChairName: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <input
                      type="date"
                      value={mrmData.approvalChairDate}
                      onChange={(e) => setMrmData({ ...mrmData, approvalChairDate: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Management Representative</span>
                    <input
                      type="text"
                      placeholder="Name"
                      value={mrmData.approvalRepName}
                      onChange={(e) => setMrmData({ ...mrmData, approvalRepName: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <input
                      type="date"
                      value={mrmData.approvalRepDate}
                      onChange={(e) => setMrmData({ ...mrmData, approvalRepDate: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Approved & Authorized By</span>
                    <input
                      type="text"
                      placeholder="Name"
                      value={mrmData.approvalApprovedByName}
                      onChange={(e) => setMrmData({ ...mrmData, approvalApprovedByName: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <input
                      type="date"
                      value={mrmData.approvalApprovedByDate}
                      onChange={(e) => setMrmData({ ...mrmData, approvalApprovedByDate: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PRINT-ONLY COMPILATION VIEW (sequential formal document) */}
      <div className="hidden print:block space-y-8 bg-white text-black p-8 max-w-[800px] mx-auto text-xs">
        
        {/* Document Header Cover */}
        <div className="border-b-2 border-black pb-4 text-center">
          <span className="text-[9px] uppercase tracking-wider font-bold">OAK Global International</span>
          <h1 className="text-2xl font-bold uppercase mt-1">Management Review Meeting (MRM) minutes</h1>
          <p className="text-[10px] text-gray-600 mt-1">Integrated Management System (IMS) · ISO 9001:2015 · ISO 14001:2015 · ISO 45001:2018</p>
        </div>

        {/* Meeting context */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-b border-gray-300 pb-4">
          <div><strong>Organization:</strong> {mrmData.orgName}</div>
          <div><strong>MRM Reference No:</strong> {mrmData.refNo}</div>
          <div><strong>Date & Time:</strong> {mrmData.dateTime}</div>
          <div><strong>Location / Platform:</strong> {mrmData.location}</div>
          <div><strong>Meeting Chair:</strong> {mrmData.chair}</div>
          <div><strong>Minutes Recorded By:</strong> {mrmData.recorder}</div>
          <div><strong>Review Period Covered:</strong> {mrmData.periodFrom} to {mrmData.periodTo}</div>
          <div><strong>Document Status:</strong> {mrmData.docStatus}</div>
          <div><strong>Quorum Confirmed:</strong> {mrmData.quorumConfirmed ? "Yes" : "No"}</div>
          <div className="col-span-2"><strong>Distribution List:</strong> {mrmData.distribution}</div>
        </div>

        {/* Section 1: Attendance */}
        <div className="space-y-3">
          <h3 className="font-bold border-b border-black pb-1 uppercase text-sm">1. Attendance</h3>
          <div>
            <h4 className="font-semibold underline mb-1">1.1 Attendees</h4>
            <table className="w-full border-collapse border border-gray-400 text-left">
              <thead>
                <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                  <th className="p-2 border-r border-gray-400">#</th>
                  <th className="p-2 border-r border-gray-400">Name</th>
                  <th className="p-2 border-r border-gray-400">Designation / Role</th>
                  <th className="p-2 border-r border-gray-400">Function</th>
                  <th className="p-2 border-r border-gray-400">Present (Y/N)</th>
                  <th className="p-2">Signature</th>
                </tr>
              </thead>
              <tbody>
                {mrmData.attendees.map((att, index) => (
                  <tr key={att.id} className="border-b border-gray-400">
                    <td className="p-2 border-r border-gray-400">{index + 1}</td>
                    <td className="p-2 border-r border-gray-400">{att.name}</td>
                    <td className="p-2 border-r border-gray-400">{att.designation}</td>
                    <td className="p-2 border-r border-gray-400">{att.function}</td>
                    <td className="p-2 border-r border-gray-400 text-center">{att.present}</td>
                    <td className="p-2 font-mono">{att.signature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold underline mb-1">1.2 Apologies</h4>
            <table className="w-full border-collapse border border-gray-400 text-left">
              <thead>
                <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                  <th className="p-2 border-r border-gray-400">#</th>
                  <th className="p-2 border-r border-gray-400">Name</th>
                  <th className="p-2 border-r border-gray-400">Designation</th>
                  <th className="p-2">Reason for Apology</th>
                </tr>
              </thead>
              <tbody>
                {mrmData.apologies.length > 0 ? (
                  mrmData.apologies.map((ap, index) => (
                    <tr key={ap.id} className="border-b border-gray-400">
                      <td className="p-2 border-r border-gray-400">{index + 1}</td>
                      <td className="p-2 border-r border-gray-400">{ap.name}</td>
                      <td className="p-2 border-r border-gray-400">{ap.designation}</td>
                      <td className="p-2">{ap.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-400">
                    <td className="p-2 text-center" colSpan={4}>No apologies recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Previous MRM confirmation */}
        <div className="space-y-3 page-break">
          <h3 className="font-bold border-b border-black pb-1 uppercase text-sm">2. Confirmation of Previous MRM Minutes</h3>
          <p>
            Minutes of previous management review held on <strong>{mrmData.prevMrmDate}</strong> were reviewed. Previous minutes approved: <strong>{mrmData.prevMrmStatus === "approved" ? "Approved as a true record" : "Approved with amendments"}</strong>.
          </p>
          <h4 className="font-semibold underline">Status of actions arising from previous review:</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Action from Previous MRM</th>
                <th className="p-2 border-r border-gray-400">Owner</th>
                <th className="p-2 border-r border-gray-400">Due Date</th>
                <th className="p-2 border-r border-gray-400">Status</th>
                <th className="p-2">Evidence / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.prevMrmActions.map((act) => (
                <tr key={act.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{act.action}</td>
                  <td className="p-2 border-r border-gray-400">{act.owner}</td>
                  <td className="p-2 border-r border-gray-400">{act.dueDate}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-bold">{act.status}</td>
                  <td className="p-2">{act.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Context Changes */}
        <div className="space-y-3 page-break">
          <h3 className="font-bold border-b border-black pb-1 uppercase text-sm">3. Changes in External & Internal Issues (Context)</h3>
          <h4 className="font-semibold underline">3.1 Changes Relevant to the IMS</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Change context</th>
                <th className="p-2 border-r border-gray-400">Standard(s) Impacted</th>
                <th className="p-2 border-r border-gray-400">Implication on IMS</th>
                <th className="p-2">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.imsChanges.map((ch) => (
                <tr key={ch.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{ch.change}</td>
                  <td className="p-2 border-r border-gray-400">{ch.standards}</td>
                  <td className="p-2 border-r border-gray-400">{ch.implication}</td>
                  <td className="p-2">{ch.action}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="font-semibold underline mt-3">3.2 Needs & Expectations of Interested Parties</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Interested Party</th>
                <th className="p-2 border-r border-gray-400">Needs & Expectations</th>
                <th className="p-2 border-r border-gray-400">Change in Period</th>
                <th className="p-2 border-r border-gray-400">Compliance Status</th>
                <th className="p-2">Required Action</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.interestedParties.map((ip) => (
                <tr key={ip.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{ip.party}</td>
                  <td className="p-2 border-r border-gray-400">{ip.needs}</td>
                  <td className="p-2 border-r border-gray-400">{ip.change}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-semibold">{ip.status}</td>
                  <td className="p-2">{ip.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Performance & Effectiveness KPIs */}
        <div className="space-y-3 page-break">
          <h3 className="font-bold border-b border-black pb-1 uppercase text-sm">4. Information on Performance & Effectiveness of the IMS</h3>
          
          <h4 className="font-semibold underline">4.1 Customer Satisfaction & Feedback Metrics (ISO 9001)</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Indicator</th>
                <th className="p-2 border-r border-gray-400">Target</th>
                <th className="p-2 border-r border-gray-400">Actual (Period)</th>
                <th className="p-2">Trend / Analysis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-400">
                <td className="p-2 border-r border-gray-400">Customer satisfaction score</td>
                <td className="p-2 border-r border-gray-400 text-center">{mrmData.customerSat.target}</td>
                <td className="p-2 border-r border-gray-400 text-center font-bold">{mrmData.customerSat.actual}</td>
                <td className="p-2">{mrmData.customerSat.trend}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-2 border-r border-gray-400">Complaints received</td>
                <td className="p-2 border-r border-gray-400 text-center">{mrmData.complaints.target}</td>
                <td className="p-2 border-r border-gray-400 text-center font-bold">{mrmData.complaints.actual}</td>
                <td className="p-2">{mrmData.complaints.trend}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-2 border-r border-gray-400">Complaints closed on time</td>
                <td className="p-2 border-r border-gray-400 text-center">{mrmData.complaintsClosed.target}</td>
                <td className="p-2 border-r border-gray-400 text-center font-bold">{mrmData.complaintsClosed.actual}</td>
                <td className="p-2">{mrmData.complaintsClosed.trend}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-2 border-r border-gray-400">On-time delivery %</td>
                <td className="p-2 border-r border-gray-400 text-center">{mrmData.deliveryRate.target}</td>
                <td className="p-2 border-r border-gray-400 text-center font-bold">{mrmData.deliveryRate.actual}</td>
                <td className="p-2">{mrmData.deliveryRate.trend}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-1"><strong>Key Compliments:</strong> {mrmData.qmsCompliments}</p>
          <p><strong>Key Complaints themes:</strong> {mrmData.qmsComplaintsThemes}</p>
          <p><strong>Other feedback:</strong> {mrmData.otherFeedback}</p>

          <h4 className="font-semibold underline mt-3">4.2 Extent to which QMS, EMS and OH&S Objectives have been met</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Objective Statement</th>
                <th className="p-2 border-r border-gray-400">Standard</th>
                <th className="p-2 border-r border-gray-400">Target</th>
                <th className="p-2 border-r border-gray-400">Status</th>
                <th className="p-2">Action to Close Gap</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.objectives.map((obj) => (
                <tr key={obj.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{obj.objective}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{obj.standard}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{obj.target}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-semibold">{obj.status}</td>
                  <td className="p-2">{obj.action}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="font-semibold underline mt-3">4.3 QMS Process Performance & KPI summary</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">QMS KPI (ISO 9001)</th>
                <th className="p-2 border-r border-gray-400">Target</th>
                <th className="p-2 border-r border-gray-400">Actual</th>
                <th className="p-2 border-r border-gray-400">Status</th>
                <th className="p-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.qmsKpis.map((kpi) => (
                <tr key={kpi.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{kpi.name}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{kpi.target}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{kpi.actual}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-bold">{kpi.status}</td>
                  <td className="p-2">{kpi.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="font-semibold underline mt-3">4.4 Environmental performance (EMS KPIs)</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">EMS KPI (ISO 14001)</th>
                <th className="p-2 border-r border-gray-400">Target</th>
                <th className="p-2 border-r border-gray-400">Actual</th>
                <th className="p-2 border-r border-gray-400">Status</th>
                <th className="p-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.emsKpis.map((kpi) => (
                <tr key={kpi.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{kpi.name}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{kpi.target}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{kpi.actual}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-bold">{kpi.status}</td>
                  <td className="p-2">{kpi.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4.5: Safety Performance & NCs */}
        <div className="space-y-3 page-break">
          <h3 className="font-bold border-b border-black pb-1 uppercase text-sm">5. Safety Performance (ISO 45001) & Nonconformity Log</h3>
          
          <h4 className="font-semibold underline">5.1 OH&S Performance KPIs</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">OH&S KPI (ISO 45001)</th>
                <th className="p-2 border-r border-gray-400">Target</th>
                <th className="p-2 border-r border-gray-400">Actual</th>
                <th className="p-2 border-r border-gray-400">Status</th>
                <th className="p-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.ohsKpis.map((kpi) => (
                <tr key={kpi.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{kpi.name}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{kpi.target}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{kpi.actual}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-bold">{kpi.status}</td>
                  <td className="p-2">{kpi.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="font-semibold underline mt-3">5.2 Incidents, Injuries & Hazard Reports Safety Log</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Date</th>
                <th className="p-2 border-r border-gray-400">Incident Type</th>
                <th className="p-2 border-r border-gray-400">Severity</th>
                <th className="p-2 border-r border-gray-400">Root Cause</th>
                <th className="p-2 border-r border-gray-400">Corrective Action</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.ohsIncidents.length > 0 ? (
                mrmData.ohsIncidents.map((inc) => (
                  <tr key={inc.id} className="border-b border-gray-400">
                    <td className="p-2 border-r border-gray-400">{inc.date}</td>
                    <td className="p-2 border-r border-gray-400">{inc.type}</td>
                    <td className="p-2 border-r border-gray-400 text-center">{inc.severity}</td>
                    <td className="p-2 border-r border-gray-400">{inc.rootCause}</td>
                    <td className="p-2 border-r border-gray-400">{inc.correctiveAction}</td>
                    <td className="p-2 text-center font-semibold">{inc.status}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-400">
                  <td className="p-2 text-center" colSpan={6}>Zero accidents or safety incidents recorded.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h4 className="font-semibold underline mt-3">5.3 Worker Consultation & Participation</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Issue Raised</th>
                <th className="p-2 border-r border-gray-400">Raised By / Forum</th>
                <th className="p-2 border-r border-gray-400">Date</th>
                <th className="p-2 border-r border-gray-400">Response / Action</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.workerConsultation.map((wc) => (
                <tr key={wc.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{wc.issue}</td>
                  <td className="p-2 border-r border-gray-400">{wc.raisedBy}</td>
                  <td className="p-2 border-r border-gray-400">{wc.date}</td>
                  <td className="p-2 border-r border-gray-400">{wc.response}</td>
                  <td className="p-2 text-center font-semibold">{wc.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="font-semibold underline mt-3">5.4 Consolidated NC Tracker Matrix</h4>
          <table className="w-full border-collapse border border-gray-400 text-center">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold text-left">
                <th className="p-2 border-r border-gray-400">Source</th>
                <th className="p-2 border-r border-gray-400 text-center">Open Start</th>
                <th className="p-2 border-r border-gray-400 text-center">Raised</th>
                <th className="p-2 border-r border-gray-400 text-center">Closed</th>
                <th className="p-2 border-r border-gray-400 text-center">Open End</th>
                <th className="p-2 border-r border-gray-400 text-center">Overdue</th>
                <th className="p-2 text-left">Comments</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Internal Audit", "internalAudit"],
                ["External / Certification Audit", "externalAudit"],
                ["Customer Complaints", "complaints"],
                ["Incidents / Accidents / Near-Miss", "incidents"],
              ].map(([label, key]) => {
                const row = (mrmData.ncTracker as any)[key];
                return (
                  <tr key={key} className="border-b border-gray-400 align-middle text-xs">
                    <td className="p-2 text-left font-semibold border-r border-gray-400">{label}</td>
                    <td className="p-2 border-r border-gray-400">{row.openStart}</td>
                    <td className="p-2 border-r border-gray-400">{row.raised}</td>
                    <td className="p-2 border-r border-gray-400 font-bold">{row.closed}</td>
                    <td className="p-2 border-r border-gray-400">{row.openEnd}</td>
                    <td className="p-2 border-r border-gray-400 font-bold text-red-600">{row.overdue}</td>
                    <td className="p-2 text-left">{row.comments}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 6: Resource Adequacy */}
        <div className="space-y-3 page-break">
          <h3 className="font-bold border-b border-black pb-1 uppercase text-sm">6. Resource Adequacy & Safety Drills</h3>
          
          <h4 className="font-semibold underline">6.1 Resource Adequacy Assessment</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Category</th>
                <th className="p-2 border-r border-gray-400">Current Status</th>
                <th className="p-2 border-r border-gray-400">Gaps Identified</th>
                <th className="p-2 border-r border-gray-400">Recommendation</th>
                <th className="p-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.resourceAdequacy.map((res) => (
                <tr key={res.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400 font-semibold">{res.category}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-bold">{res.status}</td>
                  <td className="p-2 border-r border-gray-400">{res.gap}</td>
                  <td className="p-2 border-r border-gray-400">{res.recommendation}</td>
                  <td className="p-2">{res.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="font-semibold underline mt-3">6.2 Emergency Preparedness & response drills</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Scenario / Drill</th>
                <th className="p-2 border-r border-gray-400">Date Conducted</th>
                <th className="p-2 border-r border-gray-400">Type (EMS/OHS)</th>
                <th className="p-2 border-r border-gray-400">Outcome Summary</th>
                <th className="p-2">Improvement Action Required</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.emergencyDrills.map((dr) => (
                <tr key={dr.id} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400 font-medium">{dr.scenario}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{dr.date}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{dr.type}</td>
                  <td className="p-2 border-r border-gray-400">{dr.outcome}</td>
                  <td className="p-2">{dr.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 7: Action Plan & Authorization */}
        <div className="space-y-3 page-break">
          <h3 className="font-bold border-b border-black pb-1 uppercase text-sm">7. Approved Strategic Decisions & Action Plan</h3>
          
          <h4 className="font-semibold underline">7.1 Executive Conclusion on IMS</h4>
          <p>
            The Top Management panel confirms that the Integrated Management System (IMS) continues to be **suitable, adequate, and operating with maximum effectiveness**. Statement of conformity: **{mrmData.conclConformity === "yes" ? "CONFORMS UNCONDITIONALLY" : mrmData.conclConformity === "reservations" ? "CONFORMS WITH RESERVATIONS" : "NON-CONFORMANT"}**. Comments: <em>{mrmData.conclComments}</em>
          </p>

          <h4 className="font-semibold underline mt-3">7.2 Approved Corrective & Improvement Action Plan</h4>
          <table className="w-full border-collapse border border-gray-400 text-left">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100 font-bold">
                <th className="p-2 border-r border-gray-400">Approved Action Item</th>
                <th className="p-2 border-r border-gray-400">Standard</th>
                <th className="p-2 border-r border-gray-400">Owner</th>
                <th className="p-2 border-r border-gray-400">Resources Needed</th>
                <th className="p-2 border-r border-gray-400">Due Date</th>
                <th className="p-2 border-r border-gray-400">Priority</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mrmData.actionPlan.map((ap) => (
                <tr key={ap.id} className="border-b border-gray-400 text-xs">
                  <td className="p-2 border-r border-gray-400 font-semibold">{ap.action}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{ap.standard}</td>
                  <td className="p-2 border-r border-gray-400">{ap.owner}</td>
                  <td className="p-2 border-r border-gray-400">{ap.resources}</td>
                  <td className="p-2 border-r border-gray-400 text-center">{ap.dueDate}</td>
                  <td className="p-2 border-r border-gray-400 text-center font-bold">{ap.priority}</td>
                  <td className="p-2 text-center font-semibold">{ap.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <strong>Any Other Business (AOB):</strong> {mrmData.aob}
          </div>
          <div>
            <strong>Proposed Date of Next Management Review Meeting:</strong> {mrmData.nextMrmDate} @ {mrmData.nextMrmVenue}
          </div>

          <h4 className="font-semibold underline mt-4">19. Sign-off Autographs & Approval</h4>
          <div className="grid grid-cols-3 gap-4 border border-gray-400 p-3 bg-gray-50 mt-2">
            <div>
              <strong>Meeting Chair:</strong>
              <div className="mt-3 font-mono border-b border-gray-400 pb-1">{mrmData.approvalChairName}</div>
              <div className="text-[10px] text-gray-500">Date: {mrmData.approvalChairDate}</div>
            </div>
            <div>
              <strong>Management Rep:</strong>
              <div className="mt-3 font-mono border-b border-gray-400 pb-1">{mrmData.approvalRepName}</div>
              <div className="text-[10px] text-gray-500">Date: {mrmData.approvalRepDate}</div>
            </div>
            <div>
              <strong>Authorized By:</strong>
              <div className="mt-3 font-mono border-b border-gray-400 pb-1">{mrmData.approvalApprovedByName}</div>
              <div className="text-[10px] text-gray-500">Date: {mrmData.approvalApprovedByDate}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { background: white; color: black; font-family: 'Inter', sans-serif; }
          header, aside, footer, nav, button, .print\\:hidden, .AppShell-sidebar { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .lg\\:pl-64 { padding-left: 0 !important; }
          .hidden.print\\:block { display: block !important; }
          .page-break { page-break-before: always; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
          th, td { border: 1px solid #000 !important; padding: 6px !important; font-size: 10px !important; }
        }
      `}</style>
    </AppShell>
  );
}
