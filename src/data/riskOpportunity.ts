import type { ProcessFamily } from "./imsKpis";

export type RiskOppType = "Risk" | "Opportunity";

export type RiskOppItem = {
  id: string;
  process: ProcessFamily;
  type: RiskOppType;
  title: string;
  context: string;
  action: string;
  evaluation: string;
  kpiName: string;
  target: number;
};

export const RISK_OPP_LIBRARY: RiskOppItem[] = [
  { id: "L-01", process: "Leadership", type: "Risk", title: "Misalignment of IMS policy with strategic direction", context: "Strategy review", action: "Annual policy & objectives review by top management aligning IMS with business plan", evaluation: "Management review minutes show alignment confirmation", kpiName: "% strategic objectives linked to IMS", target: 100 },
  { id: "L-02", process: "Leadership", type: "Risk", title: "Insufficient leadership commitment visible to staff", context: "Culture survey", action: "Quarterly Gemba/leadership walks with documented engagement records", evaluation: "Walk completion vs plan and engagement score", kpiName: "Leadership walks completed", target: 95 },
  { id: "L-03", process: "Leadership", type: "Risk", title: "Resources not allocated to IMS priorities", context: "Budget audit", action: "Embed IMS resource needs into annual budget approval", evaluation: "Approved budget covers ≥95% of IMS resource requests", kpiName: "% IMS budget approved", target: 95 },
  { id: "L-04", process: "Leadership", type: "Opportunity", title: "Unify QHSE leadership behaviors via Leader Standard Work", context: "", action: "Build LSW cards and weekly cadence", evaluation: "Adoption rate and audit of LSW evidence", kpiName: "LSW adherence rate", target: 90 },
  { id: "L-05", process: "Leadership", type: "Opportunity", title: "Strengthen brand via certification announcements", context: "", action: "Publish annual IMS performance report", evaluation: "Stakeholder reach metrics and feedback", kpiName: "Stakeholder reach (k)", target: 10 },
  { id: "RC-01", process: "Risk & Compliance", type: "Risk", title: "Emerging regulatory changes missed", context: "Horizon scan", action: "Monthly regulatory watch with subscription to government bulletins", evaluation: "Coverage audit vs published regulatory changes", kpiName: "Regs reviewed/published", target: 100 },
  { id: "RC-02", process: "Risk & Compliance", type: "Risk", title: "Risk register stale, not updated after changes", context: "Internal audit", action: "Trigger-based risk reviews on change events + quarterly refresh", evaluation: "Risk register update lead-time", kpiName: "Avg days to update register", target: 10 },
  { id: "RC-03", process: "Risk & Compliance", type: "Risk", title: "Treatment actions overdue", context: "Action tracker", action: "Weekly tracker review and escalation matrix", evaluation: "On-time closure rate of treatment actions", kpiName: "% on-time closure", target: 90 },
  { id: "RC-04", process: "Risk & Compliance", type: "Opportunity", title: "Enterprise risk dashboard", context: "", action: "Build BI dashboard linking risks to KPIs", evaluation: "Dashboard usage by leaders and decisions logged", kpiName: "Active users / month", target: 20 },
  { id: "RC-05", process: "Risk & Compliance", type: "Opportunity", title: "Integrate ESG risks into IMS", context: "", action: "Add ESG risk taxonomy to register", evaluation: "Coverage of ESG categories in register", kpiName: "% ESG categories covered", target: 100 },
  { id: "HC-01", process: "HR & Competence", type: "Risk", title: "Critical skills gap", context: "Skills matrix gap", action: "Targeted training plan and recruitment pipeline", evaluation: "Reduction in skill gap score quarter-over-quarter", kpiName: "Skill gap closure %", target: 80 },
  { id: "HC-02", process: "HR & Competence", type: "Risk", title: "High employee turnover", context: "Exit interviews", action: "Retention plan: career paths, engagement program", evaluation: "Turnover trend ≤ target after 2 quarters", kpiName: "Turnover %", target: 8 },
  { id: "HC-03", process: "HR & Competence", type: "Risk", title: "Inadequate onboarding leading to errors", context: "Defect analysis", action: "Standardized 30/60/90-day onboarding program", evaluation: "Onboarding completion and 90-day defect rate", kpiName: "Onboarding completion %", target: 95 },
  { id: "HC-04", process: "HR & Competence", type: "Opportunity", title: "Cross-skilling to improve flexibility", context: "", action: "Cross-training matrix and rotation plan", evaluation: "% multi-skilled staff and absorption of demand peaks", kpiName: "% multi-skilled", target: 60 },
  { id: "HC-05", process: "HR & Competence", type: "Opportunity", title: "E-learning platform", context: "", action: "Deploy LMS with mandatory IMS modules", evaluation: "Course completion rate and assessment scores", kpiName: "LMS completion %", target: 95 },
  { id: "P-01", process: "Procurement", type: "Risk", title: "Supplier failure disrupts operations", context: "Supplier risk score", action: "Dual sourcing for critical items + supplier audits", evaluation: "Reduction in single-source critical SKUs", kpiName: "% dual-sourced critical", target: 80 },
  { id: "P-02", process: "Procurement", type: "Risk", title: "Non-conforming materials received", context: "Inspection data", action: "Incoming inspection plan + supplier QA agreements", evaluation: "Incoming defect ppm trend", kpiName: "Incoming defect ppm", target: 1000 },
  { id: "P-03", process: "Procurement", type: "Risk", title: "Price volatility erodes margin", context: "Market scan", action: "Long-term contracts, hedging where applicable", evaluation: "Price variance vs budget within tolerance", kpiName: "Price variance %", target: 3 },
  { id: "P-04", process: "Procurement", type: "Opportunity", title: "Strategic supplier partnerships", context: "", action: "Joint improvement projects with top suppliers", evaluation: "Cost-out and lead-time gains tracked quarterly", kpiName: "Cost savings (% spend)", target: 3 },
  { id: "P-05", process: "Procurement", type: "Opportunity", title: "Sustainable sourcing", context: "", action: "Add ESG criteria to supplier scorecards", evaluation: "% spend with rated sustainable suppliers", kpiName: "% sustainable spend", target: 50 },
  { id: "PS-01", process: "Production / Service", type: "Risk", title: "Process variability causing scrap", context: "SPC charts", action: "Implement SPC and control plans on critical processes", evaluation: "Cpk improvement and scrap rate trend", kpiName: "Cpk on critical CTQ", target: 1.33 },
  { id: "PS-02", process: "Production / Service", type: "Risk", title: "Equipment downtime", context: "OEE", action: "Preventive maintenance plan and rapid response", evaluation: "OEE improvement trend", kpiName: "OEE %", target: 85 },
  { id: "PS-03", process: "Production / Service", type: "Risk", title: "Customer complaints from defects", context: "Complaint log", action: "Root-cause analysis and 8D for top defects", evaluation: "Complaint ppm reduction", kpiName: "Complaint ppm", target: 500 },
  { id: "PS-04", process: "Production / Service", type: "Opportunity", title: "Lean line redesign", context: "", action: "Pilot one-piece-flow on bottleneck line", evaluation: "Cycle time reduction and WIP cut", kpiName: "Cycle time reduction %", target: 20 },
  { id: "PS-05", process: "Production / Service", type: "Opportunity", title: "Digital traceability", context: "", action: "Barcode/RFID tracking from raw to finished", evaluation: "Recall lead-time reduction", kpiName: "Trace lead-time (h)", target: 2 },
  { id: "M-01", process: "Maintenance", type: "Risk", title: "Unplanned breakdowns", context: "Failure history", action: "Move from reactive to PM/PdM with CMMS", evaluation: "MTBF and breakdown frequency", kpiName: "MTBF (h)", target: 500 },
  { id: "M-02", process: "Maintenance", type: "Risk", title: "Spare parts stockout", context: "Stock data", action: "Min/max with criticality classification", evaluation: "Stockout incidents", kpiName: "Stockouts/month", target: 2 },
  { id: "M-03", process: "Maintenance", type: "Risk", title: "Maintenance safety incidents", context: "HSE log", action: "LOTO compliance and JSA review", evaluation: "Zero LTI from maintenance", kpiName: "LTI from maintenance", target: 0 },
  { id: "M-04", process: "Maintenance", type: "Opportunity", title: "Predictive maintenance via IoT", context: "", action: "Vibration/thermal sensors on critical assets", evaluation: "Reduction in unplanned downtime", kpiName: "Unplanned downtime % reduction", target: 30 },
  { id: "M-05", process: "Maintenance", type: "Opportunity", title: "Mobile CMMS adoption", context: "", action: "Deploy mobile work orders", evaluation: "Wrench-time and closure speed", kpiName: "Avg WO closure (h)", target: 24 },
  { id: "Q-01", process: "QHSE", type: "Risk", title: "Major incident risk", context: "HIRA", action: "Layered protections, drills, BBSO program", evaluation: "TRIR trend reduction", kpiName: "TRIR", target: 1.0 },
  { id: "Q-02", process: "QHSE", type: "Risk", title: "Environmental spill", context: "Aspect register", action: "Spill kits, secondary containment, drills", evaluation: "Spill incidents and response time", kpiName: "Spill incidents", target: 0 },
  { id: "Q-03", process: "QHSE", type: "Risk", title: "Audit findings repeating", context: "Audit trends", action: "Strong CAPA effectiveness checks", evaluation: "Recurrence rate of NCs", kpiName: "NC recurrence %", target: 5 },
  { id: "Q-04", process: "QHSE", type: "Opportunity", title: "Behavior-based safety program", context: "", action: "Roll out BBS observation cards", evaluation: "Observation rate and at-risk reduction", kpiName: "BBS obs/employee/month", target: 2 },
  { id: "Q-05", process: "QHSE", type: "Opportunity", title: "Integrated QHSE digital platform", context: "", action: "Adopt single EHSQ platform", evaluation: "User adoption and reporting cycle time", kpiName: "Reporting cycle time (days)", target: 3 },
  { id: "E-01", process: "Environment", type: "Risk", title: "Exceedance of emission limits", context: "Stack monitoring", action: "Continuous monitoring + abatement maintenance", evaluation: "Compliance with emission limits", kpiName: "% within limits", target: 100 },
  { id: "E-02", process: "Environment", type: "Risk", title: "Hazardous waste mishandling", context: "Waste audits", action: "Segregation, licensed disposal, training", evaluation: "Audit conformity score", kpiName: "Waste audit score %", target: 95 },
  { id: "E-03", process: "Environment", type: "Risk", title: "Water consumption above target", context: "Meter data", action: "Leak survey + recycling project", evaluation: "Water intensity reduction", kpiName: "Water intensity reduction %", target: 10 },
  { id: "E-04", process: "Environment", type: "Opportunity", title: "Renewable energy adoption", context: "", action: "Install solar PV on facility roof", evaluation: "kWh from renewables vs total", kpiName: "% renewable energy", target: 30 },
  { id: "E-05", process: "Environment", type: "Opportunity", title: "Carbon footprint reporting", context: "", action: "Implement GHG inventory (Scope 1/2)", evaluation: "Annual GHG report published with reductions", kpiName: "GHG reduction YoY %", target: 5 },
  { id: "O-01", process: "OH&S", type: "Risk", title: "Worker injury", context: "Job hazard analysis", action: "Engineering controls + PPE program", evaluation: "LTIFR reduction", kpiName: "LTIFR", target: 0.5 },
  { id: "O-02", process: "OH&S", type: "Risk", title: "Occupational illness", context: "Health surveillance", action: "Exposure monitoring + medicals", evaluation: "No new occupational disease cases", kpiName: "Occ. disease cases", target: 0 },
  { id: "O-03", process: "OH&S", type: "Risk", title: "Contractor incidents", context: "Contractor stats", action: "Pre-qual + supervision", evaluation: "Contractor TRIR within target", kpiName: "Contractor TRIR", target: 1.0 },
  { id: "O-04", process: "OH&S", type: "Opportunity", title: "Wellness program", context: "", action: "Mental health and ergonomics initiatives", evaluation: "Engagement and absenteeism trend", kpiName: "Absenteeism %", target: 2 },
  { id: "O-05", process: "OH&S", type: "Opportunity", title: "Safety leadership training", context: "", action: "Train all supervisors", evaluation: "Coverage and incident reduction", kpiName: "Supervisors trained %", target: 100 },
  { id: "C-01", process: "Customer", type: "Risk", title: "Customer churn from quality issues", context: "NPS/Churn data", action: "Customer success and rapid CAPA", evaluation: "Churn rate reduction", kpiName: "Churn %", target: 5 },
  { id: "C-02", process: "Customer", type: "Risk", title: "Late deliveries", context: "OTIF data", action: "Capacity planning and logistics partnership", evaluation: "OTIF improvement", kpiName: "OTIF %", target: 95 },
  { id: "C-03", process: "Customer", type: "Risk", title: "Negative public reviews", context: "Review monitoring", action: "Voice-of-customer and response SLA", evaluation: "Review response time", kpiName: "Avg response (h)", target: 24 },
  { id: "C-04", process: "Customer", type: "Opportunity", title: "VoC-driven product upgrades", context: "", action: "Quarterly VoC reviews fed to R&D", evaluation: "# upgrades shipped from VoC", kpiName: "VoC-driven releases", target: 4 },
  { id: "C-05", process: "Customer", type: "Opportunity", title: "Customer loyalty program", context: "", action: "Launch tiered loyalty program", evaluation: "Repeat purchase rate uplift", kpiName: "Repeat purchase %", target: 60 },
  { id: "I-01", process: "Improvement", type: "Risk", title: "Improvements not sustained", context: "Audit trend", action: "Sustain audits 30/60/90 days post-implementation", evaluation: "% sustained at 90 days", kpiName: "% sustained @90d", target: 80 },
  { id: "I-02", process: "Improvement", type: "Risk", title: "Low CAPA effectiveness", context: "Recurrence", action: "Effectiveness checks with statistical evidence", evaluation: "CAPA effectiveness verified rate", kpiName: "CAPA effective %", target: 90 },
  { id: "I-03", process: "Improvement", type: "Risk", title: "Idea pipeline drying up", context: "Suggestion stats", action: "Kaizen events + recognition", evaluation: "Ideas implemented per employee", kpiName: "Ideas/employee/yr", target: 4 },
  { id: "I-04", process: "Improvement", type: "Opportunity", title: "Six Sigma DMAIC projects", context: "", action: "Charter Green Belt projects", evaluation: "Financial benefit per project", kpiName: "Avg savings per project ($k)", target: 50 },
  { id: "I-05", process: "Improvement", type: "Opportunity", title: "Continuous improvement culture", context: "", action: "Daily huddles + visual mgmt", evaluation: "Engagement and improvement count", kpiName: "Daily huddle adherence %", target: 95 },
  { id: "VO-01", process: "Vessel Operations", type: "Risk", title: "Berth congestion delays", context: "Berth occupancy", action: "Berth scheduling optimization", evaluation: "Reduced waiting time", kpiName: "Avg waiting (h)", target: 2 },
  { id: "VO-02", process: "Vessel Operations", type: "Risk", title: "Pilotage incidents", context: "Incident log", action: "Pilot training + bridge management", evaluation: "Zero pilotage incidents", kpiName: "Pilotage incidents", target: 0 },
  { id: "VO-03", process: "Vessel Operations", type: "Risk", title: "ISPS non-compliance", context: "Security audit", action: "Drills and access control reinforcement", evaluation: "ISPS audit score", kpiName: "ISPS audit %", target: 100 },
  { id: "VO-04", process: "Vessel Operations", type: "Opportunity", title: "Just-in-time arrivals", context: "", action: "Coordinate with shipping lines", evaluation: "Bunker savings and emissions reduction", kpiName: "JIT arrivals %", target: 60 },
  { id: "VO-05", process: "Vessel Operations", type: "Opportunity", title: "Shore power availability", context: "", action: "Install cold-ironing", evaluation: "% calls using shore power", kpiName: "% shore power calls", target: 30 },
  { id: "CH-01", process: "Cargo Handling", type: "Risk", title: "Cargo damage claims", context: "Claims data", action: "Operator training + equipment maintenance", evaluation: "Damage rate per TEU/ton", kpiName: "Damage claims/1000 moves", target: 1 },
  { id: "CH-02", process: "Cargo Handling", type: "Risk", title: "Lifting incidents", context: "Incident log", action: "Lift plans and certified equipment", evaluation: "Zero lifting incidents", kpiName: "Lifting incidents", target: 0 },
  { id: "CH-03", process: "Cargo Handling", type: "Risk", title: "Productivity below benchmark", context: "Move/hour", action: "Process redesign + bay planning tools", evaluation: "Moves/hour improvement", kpiName: "Crane moves/hr", target: 30 },
  { id: "CH-04", process: "Cargo Handling", type: "Opportunity", title: "Automation of stacking", context: "", action: "RTG semi-automation", evaluation: "Productivity uplift", kpiName: "Productivity uplift %", target: 15 },
  { id: "CH-05", process: "Cargo Handling", type: "Opportunity", title: "Advanced bay planning", context: "", action: "AI bay planning tool", evaluation: "Re-handle reduction", kpiName: "Re-handle %", target: 4 },
  { id: "YL-01", process: "Yard & Logistics", type: "Risk", title: "Yard congestion", context: "Dwell data", action: "Slot booking + appointment system", evaluation: "Truck turn-time reduction", kpiName: "Truck turn-time (min)", target: 30 },
  { id: "YL-02", process: "Yard & Logistics", type: "Risk", title: "Misplaced containers", context: "Inventory variance", action: "RFID/GPS tracking + audits", evaluation: "Locate accuracy", kpiName: "Inventory accuracy %", target: 99 },
  { id: "YL-03", process: "Yard & Logistics", type: "Risk", title: "Gate process delays", context: "Gate logs", action: "OCR + pre-clearance", evaluation: "Gate processing time", kpiName: "Gate time (min)", target: 5 },
  { id: "YL-04", process: "Yard & Logistics", type: "Opportunity", title: "Yard digital twin", context: "", action: "Implement yard simulation", evaluation: "Throughput improvement", kpiName: "Throughput uplift %", target: 10 },
  { id: "YL-05", process: "Yard & Logistics", type: "Opportunity", title: "Off-dock logistics partnerships", context: "", action: "Inland depot integration", evaluation: "% containers cleared via off-dock", kpiName: "% off-dock %", target: 25 },
  { id: "EA-01", process: "Equipment & Assets", type: "Risk", title: "Asset failure due to age", context: "Asset age profile", action: "CapEx renewal plan + condition monitoring", evaluation: "% assets within useful life", kpiName: "% assets in life", target: 90 },
  { id: "EA-02", process: "Equipment & Assets", type: "Risk", title: "Inadequate insurance coverage", context: "Insurance review", action: "Annual coverage review with broker", evaluation: "Coverage gap closure", kpiName: "Coverage gap %", target: 0 },
  { id: "EA-03", process: "Equipment & Assets", type: "Risk", title: "Obsolete spares", context: "Spare audit", action: "Lifecycle plan + obsolescence list", evaluation: "Spares availability", kpiName: "Spares availability %", target: 95 },
  { id: "EA-04", process: "Equipment & Assets", type: "Opportunity", title: "Asset performance management", context: "", action: "Deploy APM software", evaluation: "Reliability uplift", kpiName: "Reliability %", target: 95 },
  { id: "EA-05", process: "Equipment & Assets", type: "Opportunity", title: "Energy-efficient equipment", context: "", action: "Replace old motors with IE4", evaluation: "Energy savings", kpiName: "Energy reduction %", target: 10 },
  { id: "TM-01", process: "Top Management", type: "Risk", title: "Strategic decisions without IMS data", context: "Decision audit", action: "Mandatory IMS data in board packs", evaluation: "Board pack coverage", kpiName: "% packs with IMS data", target: 100 },
  { id: "TM-02", process: "Top Management", type: "Risk", title: "Succession risk for key roles", context: "Talent matrix", action: "Succession planning for top 20 roles", evaluation: "Successor readiness", kpiName: "% roles with ready successor", target: 80 },
  { id: "TM-03", process: "Top Management", type: "Risk", title: "Reputational crisis", context: "Media monitor", action: "Crisis comms plan and drills", evaluation: "Drills completed", kpiName: "Crisis drills/yr", target: 2 },
  { id: "TM-04", process: "Top Management", type: "Opportunity", title: "Board-level ESG committee", context: "", action: "Form ESG committee", evaluation: "Quarterly ESG reporting", kpiName: "ESG report frequency", target: 4 },
  { id: "TM-05", process: "Top Management", type: "Opportunity", title: "M&A growth via certified position", context: "", action: "Use IMS as due-diligence asset", evaluation: "Successful M&A integrations", kpiName: "Integrations on time %", target: 90 },
  { id: "Q-06", process: "QAQC", type: "Risk", title: "Inspection escapes", context: "Customer complaints", action: "First-pass yield monitoring + AQL review", evaluation: "Reduction in escape ppm", kpiName: "Escape ppm", target: 100 },
  { id: "Q-07", process: "QAQC", type: "Risk", title: "Calibration overdue", context: "Calibration log", action: "Automated calibration scheduling", evaluation: "Calibration on-time", kpiName: "On-time calibration %", target: 100 },
  { id: "Q-08", process: "QAQC", type: "Risk", title: "Inspector competence variation", context: "Gauge R&R", action: "Periodic gauge R&R and training", evaluation: "R&R within tolerance", kpiName: "Gauge R&R %", target: 10 },
  { id: "Q-09", process: "QAQC", type: "Opportunity", title: "In-line vision inspection", context: "", action: "Deploy machine vision", evaluation: "Defect detection rate", kpiName: "Detection rate %", target: 99 },
  { id: "Q-10", process: "QAQC", type: "Opportunity", title: "Statistical process control rollout", context: "", action: "SPC for top 10 CTQs", evaluation: "Cpk improvements", kpiName: "Avg Cpk", target: 1.5 },
  { id: "Q-11", process: "QMS", type: "Risk", title: "Document control gaps", context: "Doc audit", action: "DMS with version control + workflows", evaluation: "Document currency", kpiName: "% docs current", target: 98 },
  { id: "Q-12", process: "QMS", type: "Risk", title: "Internal audit cycle slippage", context: "Audit plan", action: "Annual plan with quarterly checks", evaluation: "Audits on plan", kpiName: "% audits on time", target: 100 },
  { id: "Q-13", process: "QMS", type: "Risk", title: "Management review effectiveness low", context: "Review minutes", action: "Standard agenda + action tracking", evaluation: "Action closure from MR", kpiName: "% MR actions closed", target: 90 },
  { id: "Q-14", process: "QMS", type: "Opportunity", title: "Process digitization", context: "", action: "Workflow automation for QMS processes", evaluation: "Cycle time reduction", kpiName: "Process cycle time reduction %", target: 30 },
  { id: "Q-15", process: "QMS", type: "Opportunity", title: "Integrated audit programme (IMS)", context: "", action: "Combine QHSE audits", evaluation: "Audit days saved", kpiName: "Audit days saved/yr", target: 20 },
  { id: "HR-01", process: "Human Resources", type: "Risk", title: "Non-compliance with labor laws", context: "Legal review", action: "Quarterly HR compliance audit", evaluation: "Audit conformity", kpiName: "HR compliance %", target: 100 },
  { id: "HR-02", process: "Human Resources", type: "Risk", title: "Pay equity gaps", context: "Pay audit", action: "Equity analysis + correction plan", evaluation: "Reduction in unjustified gap", kpiName: "Pay gap %", target: 2 },
  { id: "HR-03", process: "Human Resources", type: "Risk", title: "Grievance backlog", context: "Case log", action: "SLA-based grievance handling", evaluation: "Grievances closed within SLA", kpiName: "Grievance SLA %", target: 95 },
  { id: "HR-04", process: "Human Resources", type: "Opportunity", title: "Employer brand on social media", context: "", action: "Employer brand campaign", evaluation: "Application quality and quantity", kpiName: "Quality applicants/req", target: 10 },
  { id: "HR-05", process: "Human Resources", type: "Opportunity", title: "Diversity & inclusion program", context: "", action: "DEI initiatives", evaluation: "Diversity index improvement", kpiName: "Diversity index", target: 60 },
  { id: "O-06", process: "Operations", type: "Risk", title: "Capacity constraints", context: "Demand forecast", action: "Capacity planning + flex contracts", evaluation: "Demand met without overtime", kpiName: "Demand met %", target: 98 },
  { id: "O-07", process: "Operations", type: "Risk", title: "Process bottlenecks", context: "VSM", action: "Theory of constraints application", evaluation: "Throughput uplift", kpiName: "Throughput uplift %", target: 15 },
  { id: "O-08", process: "Operations", type: "Risk", title: "Unsafe operating conditions", context: "Safety audits", action: "Daily safety check + corrective actions", evaluation: "Safety audit score", kpiName: "Safety audit %", target: 95 },
  { id: "O-09", process: "Operations", type: "Opportunity", title: "Operations control tower", context: "", action: "Real-time dashboards", evaluation: "Decision lead-time reduction", kpiName: "Decision lead-time (h)", target: 1 },
  { id: "O-10", process: "Operations", type: "Opportunity", title: "Demand sensing analytics", context: "", action: "ML demand forecasting", evaluation: "Forecast accuracy uplift", kpiName: "Forecast accuracy %", target: 90 },
  { id: "E-06", process: "Engineering", type: "Risk", title: "Design errors causing rework", context: "ECR data", action: "Design reviews + DFMEA", evaluation: "Reduction in design changes", kpiName: "ECR rate %", target: 2 },
  { id: "E-07", process: "Engineering", type: "Risk", title: "IP protection", context: "Legal audit", action: "IP register + NDAs", evaluation: "IP coverage", kpiName: "% inventions filed", target: 100 },
  { id: "E-08", process: "Engineering", type: "Risk", title: "Project schedule slip", context: "Schedule data", action: "Critical path analysis + risk reserve", evaluation: "Schedule adherence", kpiName: "Schedule adherence %", target: 95 },
  { id: "E-09", process: "Engineering", type: "Opportunity", title: "CAD/CAE digital thread", context: "", action: "Integrate PLM end-to-end", evaluation: "Time-to-market reduction", kpiName: "TTM reduction %", target: 20 },
  { id: "E-10", process: "Engineering", type: "Opportunity", title: "Modular design", context: "", action: "Adopt platform/modular approach", evaluation: "Reuse rate", kpiName: "Design reuse %", target: 60 },
  { id: "C-06", process: "Construction", type: "Risk", title: "Site safety incidents", context: "Incident log", action: "HSE plan + toolbox talks daily", evaluation: "TRIR reduction", kpiName: "Site TRIR", target: 1 },
  { id: "C-07", process: "Construction", type: "Risk", title: "Cost overruns", context: "Cost reports", action: "EVM + change control", evaluation: "CPI maintained", kpiName: "CPI", target: 1.0 },
  { id: "C-08", process: "Construction", type: "Risk", title: "Subcontractor non-conformance", context: "QA inspections", action: "Pre-qualification + ITP", evaluation: "NC rate", kpiName: "Sub NCs/month", target: 2 },
  { id: "C-09", process: "Construction", type: "Opportunity", title: "BIM 4D/5D", context: "", action: "Adopt BIM for cost+schedule", evaluation: "Rework reduction", kpiName: "Rework %", target: 2 },
  { id: "C-10", process: "Construction", type: "Opportunity", title: "Modular construction", context: "", action: "Off-site fabrication", evaluation: "Schedule reduction", kpiName: "Schedule reduction %", target: 15 },
  { id: "S-01", process: "Sales", type: "Risk", title: "Pipeline shortage", context: "CRM data", action: "Lead generation + ABM program", evaluation: "Pipeline coverage ratio", kpiName: "Pipeline coverage x", target: 3 },
  { id: "S-02", process: "Sales", type: "Risk", title: "Discount erosion", context: "Margin reports", action: "Approval matrix for discounts", evaluation: "Avg discount within target", kpiName: "Avg discount %", target: 10 },
  { id: "S-03", process: "Sales", type: "Risk", title: "Customer credit risk", context: "AR aging", action: "Credit policy + checks", evaluation: "Bad debt within limit", kpiName: "Bad debt %", target: 1 },
  { id: "S-04", process: "Sales", type: "Opportunity", title: "Cross-sell/upsell program", context: "", action: "Train AEs + playbooks", evaluation: "Cross-sell revenue %", kpiName: "Cross-sell rev %", target: 20 },
  { id: "S-05", process: "Sales", type: "Opportunity", title: "Channel partner expansion", context: "", action: "Recruit partners in new geos", evaluation: "New revenue from channel", kpiName: "Channel revenue %", target: 25 },
  { id: "M-06", process: "Marketing", type: "Risk", title: "Brand reputation damage", context: "Sentiment monitor", action: "Crisis comms + monitoring", evaluation: "Sentiment trend positive", kpiName: "Net sentiment %", target: 60 },
  { id: "M-07", process: "Marketing", type: "Risk", title: "Wasted marketing spend", context: "ROMI analysis", action: "Attribution model + budget gating", evaluation: "ROMI improvement", kpiName: "ROMI", target: 3 },
  { id: "M-08", process: "Marketing", type: "Risk", title: "Data privacy breach", context: "Privacy audit", action: "GDPR/data minimization compliance", evaluation: "Zero breaches", kpiName: "Privacy breaches", target: 0 },
  { id: "M-09", process: "Marketing", type: "Opportunity", title: "Content-led SEO", context: "", action: "Build content engine", evaluation: "Organic traffic uplift", kpiName: "Organic traffic growth %", target: 30 },
  { id: "M-10", process: "Marketing", type: "Opportunity", title: "Marketing automation", context: "", action: "Deploy MA platform", evaluation: "Lead conversion uplift", kpiName: "MQL→SQL %", target: 30 },
  { id: "FA-01", process: "Finance & Accounts", type: "Risk", title: "Fraud / misstatement", context: "Internal control audit", action: "SOD + reconciliations", evaluation: "Audit findings minimized", kpiName: "Audit findings", target: 0 },
  { id: "FA-02", process: "Finance & Accounts", type: "Risk", title: "Liquidity risk", context: "Cashflow forecast", action: "Working capital management", evaluation: "DSO control", kpiName: "DSO (days)", target: 45 },
  { id: "FA-03", process: "Finance & Accounts", type: "Risk", title: "Tax non-compliance", context: "Tax review", action: "Compliance calendar + reviews", evaluation: "On-time filings", kpiName: "On-time filings %", target: 100 },
  { id: "FA-04", process: "Finance & Accounts", type: "Opportunity", title: "Process automation (RPA)", context: "", action: "Automate AP/AR processes", evaluation: "Cost-to-process reduction", kpiName: "Invoice cost ($)", target: 2 },
  { id: "FA-05", process: "Finance & Accounts", type: "Opportunity", title: "Real-time financial dashboard", context: "", action: "Power BI dashboards", evaluation: "Decision lead-time", kpiName: "Days to close", target: 3 },
  { id: "S-06", process: "Store", type: "Risk", title: "Inventory shrinkage", context: "Cycle count", action: "CCTV + access control + cycle counts", evaluation: "Shrink reduction", kpiName: "Shrinkage %", target: 0.5 },
  { id: "S-07", process: "Store", type: "Risk", title: "Stockouts of critical items", context: "Stock data", action: "ABC + min/max + safety stock", evaluation: "Stockout incidents", kpiName: "Stockouts/month", target: 1 },
  { id: "S-08", process: "Store", type: "Risk", title: "Material handling injuries", context: "HSE log", action: "Ergonomic equipment + training", evaluation: "Zero handling injuries", kpiName: "Handling injuries", target: 0 },
  { id: "S-09", process: "Store", type: "Opportunity", title: "Barcode/RFID inventory", context: "", action: "Implement barcode system", evaluation: "Inventory accuracy", kpiName: "Inventory accuracy %", target: 99 },
  { id: "S-10", process: "Store", type: "Opportunity", title: "Vendor-managed inventory", context: "", action: "VMI for high-volume items", evaluation: "Working capital release", kpiName: "VMI coverage %", target: 40 },
  { id: "I-06", process: "ICT", type: "Risk", title: "Cybersecurity breach", context: "Pen test", action: "Zero-trust + EDR + awareness", evaluation: "Number of incidents", kpiName: "Sec incidents", target: 0 },
  { id: "I-07", process: "ICT", type: "Risk", title: "System downtime", context: "Uptime monitor", action: "Redundancy + DR plan", evaluation: "Uptime SLA", kpiName: "Uptime %", target: 99.9 },
  { id: "I-08", process: "ICT", type: "Risk", title: "Data loss", context: "Backup audit", action: "3-2-1 backups + restore tests", evaluation: "Restore test success", kpiName: "Restore success %", target: 100 },
  { id: "I-09", process: "ICT", type: "Opportunity", title: "Cloud migration", context: "", action: "Lift-and-shift to cloud", evaluation: "Infra cost reduction", kpiName: "Infra cost reduction %", target: 20 },
  { id: "I-10", process: "ICT", type: "Opportunity", title: "AI productivity tools", context: "", action: "Deploy AI assistants", evaluation: "Productivity uplift", kpiName: "Productivity uplift %", target: 15 },
  { id: "W-01", process: "Warehouse", type: "Risk", title: "Order picking errors", context: "Order accuracy", action: "Pick-to-light + barcode verification", evaluation: "Order accuracy improvement", kpiName: "Order accuracy %", target: 99.5 },
  { id: "W-02", process: "Warehouse", type: "Risk", title: "Damaged goods", context: "Damage log", action: "Handling SOPs + training", evaluation: "Damage rate reduction", kpiName: "Damage %", target: 0.3 },
  { id: "W-03", process: "Warehouse", type: "Risk", title: "Forklift incidents", context: "Incident log", action: "Operator certification + segregation", evaluation: "Zero forklift incidents", kpiName: "Forklift incidents", target: 0 },
  { id: "W-04", process: "Warehouse", type: "Opportunity", title: "WMS upgrade", context: "", action: "Implement modern WMS", evaluation: "Pick rate uplift", kpiName: "Picks/hr", target: 80 },
  { id: "W-05", process: "Warehouse", type: "Opportunity", title: "Slotting optimization", context: "", action: "Re-slot based on velocity", evaluation: "Travel reduction", kpiName: "Travel reduction %", target: 20 },
  { id: "PM-01", process: "Project Management", type: "Risk", title: "Scope creep", context: "Change log", action: "Strict change control + governance", evaluation: "Change requests within limit", kpiName: "Approved scope changes/mo", target: 2 },
  { id: "PM-02", process: "Project Management", type: "Risk", title: "Resource conflicts", context: "Resource plan", action: "Capacity planning + PMO", evaluation: "Resource utilization balance", kpiName: "Resource util %", target: 85 },
  { id: "PM-03", process: "Project Management", type: "Risk", title: "Stakeholder misalignment", context: "Survey", action: "RACI + steering committee", evaluation: "Stakeholder satisfaction", kpiName: "Stakeholder CSAT", target: 4.5 },
  { id: "PM-04", process: "Project Management", type: "Opportunity", title: "Agile delivery for IT projects", context: "", action: "Adopt Scrum/Kanban", evaluation: "Delivery cadence", kpiName: "Releases/quarter", target: 6 },
  { id: "PM-05", process: "Project Management", type: "Opportunity", title: "PM Center of Excellence", context: "", action: "Build PMO CoE", evaluation: "Project success rate", kpiName: "Project success %", target: 90 },
  { id: "A-01", process: "Admin", type: "Risk", title: "Records mismanagement", context: "Record audit", action: "Records retention schedule + DMS", evaluation: "Retention compliance", kpiName: "Retention compliance %", target: 100 },
  { id: "A-02", process: "Admin", type: "Risk", title: "Facility downtime", context: "Facility log", action: "Preventive facility maintenance", evaluation: "Facility availability", kpiName: "Facility uptime %", target: 99 },
  { id: "A-03", process: "Admin", type: "Risk", title: "Travel cost overruns", context: "Travel reports", action: "Travel policy + booking tool", evaluation: "Travel cost vs budget", kpiName: "Travel cost variance %", target: 5 },
  { id: "A-04", process: "Admin", type: "Opportunity", title: "Workplace experience program", context: "", action: "Modernize workplace amenities", evaluation: "Employee NPS", kpiName: "Workplace NPS", target: 60 },
  { id: "A-05", process: "Admin", type: "Opportunity", title: "Sustainable office ops", context: "", action: "Paperless + energy savings", evaluation: "Paper/energy reduction", kpiName: "Paper reduction %", target: 50 },
  { id: "PM-06", process: "Production / Manufacturing", type: "Risk", title: "Yield loss", context: "Yield data", action: "SPC + Poka-yoke + DOE", evaluation: "Yield improvement", kpiName: "First-pass yield %", target: 95 },
  { id: "PM-07", process: "Production / Manufacturing", type: "Risk", title: "Changeover time excessive", context: "Changeover log", action: "SMED workshops", evaluation: "Changeover time reduction", kpiName: "Changeover (min)", target: 15 },
  { id: "PM-08", process: "Production / Manufacturing", type: "Risk", title: "Process safety event", context: "PSM audit", action: "HAZOP + interlocks", evaluation: "Zero process safety events", kpiName: "PSM events", target: 0 },
  { id: "PM-09", process: "Production / Manufacturing", type: "Opportunity", title: "Industry 4.0 / IIoT", context: "", action: "Connect machines to MES", evaluation: "OEE uplift", kpiName: "OEE %", target: 85 },
  { id: "PM-10", process: "Production / Manufacturing", type: "Opportunity", title: "Energy management ISO 50001", context: "", action: "Implement EnMS", evaluation: "Energy intensity reduction", kpiName: "Energy intensity reduction %", target: 10 },
  { id: "BD-01", process: "Business Development", type: "Risk", title: "Market entry failure", context: "Market study", action: "Stage-gate market entry process", evaluation: "Go/No-go decisions on time", kpiName: "Stage-gate adherence %", target: 100 },
  { id: "BD-02", process: "Business Development", type: "Risk", title: "Partnership disputes", context: "Contract review", action: "Strong MOUs + governance", evaluation: "Disputes minimized", kpiName: "Open disputes", target: 0 },
  { id: "BD-03", process: "Business Development", type: "Risk", title: "Pipeline conversion low", context: "Pipeline data", action: "Qualify with MEDDIC + executive sponsor", evaluation: "Win rate improvement", kpiName: "Win rate %", target: 30 },
  { id: "BD-04", process: "Business Development", type: "Opportunity", title: "New verticals expansion", context: "", action: "Pilot in 1-2 new verticals", evaluation: "Revenue from new verticals", kpiName: "New vertical rev %", target: 15 },
  { id: "BD-05", process: "Business Development", type: "Opportunity", title: "Innovation partnerships", context: "", action: "Partner with startups/universities", evaluation: "# JDA / pilots launched", kpiName: "JDAs/yr", target: 3 },
];

export const RISK_OPP_STORAGE_KEY = "conformia.riskopp.v1";

export type RiskOppStatus = "Open" | "In progress" | "Effective" | "Not effective";

export type RiskOppState = {
  records: Record<string, {
    owner?: string;
    dueDate?: string;
    status?: RiskOppStatus;
    actualKpi?: number | "";
    notes?: string;
    evidenceUrl?: string;
    evidenceLabel?: string;
    directionOverride?: "higher" | "lower";
  }>;
};

export const RISK_OPP_STATUS_META = {
  "Open": { dot: "bg-muted-foreground/40", label: "Open" },
  "In progress": { dot: "bg-amber-500", label: "In progress" },
  "Effective": { dot: "bg-emerald-500", label: "Effective" },
  "Not effective": { dot: "bg-rose-500", label: "Not effective" },
} as const;

// ---------- Effectiveness scoring model ----------
// Each action is scored against its KPI target. The result combines a
// numeric score (0–100) and a level (On / Watch / Off) so leaders can see
// at a glance how effective the action has been at addressing the risk or
// capturing the opportunity.

export type EffectivenessLevel = "On" | "Watch" | "Off" | "Pending";

export type EffectivenessResult = {
  score: number; // 0..100
  level: EffectivenessLevel;
  direction: "higher" | "lower";
  rule: string; // human readable evaluation rule
  thresholds: { on: string; watch: string; off: string };
};

// Heuristic: detect KPIs where a lower actual is better.
export function inferDirection(kpiName: string): "higher" | "lower" {
  const k = kpiName.toLowerCase();
  // Phrases that flip a "lower-is-better" word back to higher-is-better
  if (/(reduction|savings|saving|uplift|growth|increase)/.test(k)) return "higher";
  const lowerHints = [
    "ppm", "incident", "stockout", "churn", "turnover", "variance",
    "gap", "recurrence", "downtime", "claim", "complaint", "absenteeism",
    "dispute", "defect", "cycle time", "changeover", "waiting",
    "response", "closure (h)", "lead-time", "lead time", "intensity",
    "ltifr", "trir", "lti", "psm event", "cases", "(h)", "(min)",
    "(days)", "days to", "avg response", "spill", "open ", "/month",
  ];
  return lowerHints.some((h) => k.includes(h)) ? "lower" : "higher";
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export function effectivenessScore(
  kpiName: string,
  target: number,
  actual: number | "" | undefined,
  directionOverride?: "higher" | "lower",
): EffectivenessResult {
  const direction = directionOverride ?? inferDirection(kpiName);
  const rule =
    direction === "higher"
      ? "Higher actual ≥ target is better"
      : "Lower actual ≤ target is better";
  const thresholds =
    direction === "higher"
      ? { on: `≥ ${target}`, watch: `${(target * 0.8).toFixed(2)} – ${target}`, off: `< ${(target * 0.8).toFixed(2)}` }
      : { on: `≤ ${target}`, watch: `${target} – ${(target * 1.2).toFixed(2)}`, off: `> ${(target * 1.2).toFixed(2)}` };

  if (actual === undefined || actual === "" || Number.isNaN(Number(actual))) {
    return { score: 0, level: "Pending", direction, rule, thresholds };
  }
  const a = Number(actual);

  if (direction === "higher") {
    if (target <= 0) {
      const score = a >= 0 ? 100 : 0;
      return { score, level: a >= 0 ? "On" : "Off", direction, rule, thresholds };
    }
    const score = clamp((a / target) * 100);
    let level: EffectivenessLevel = "Off";
    if (a >= target) level = "On";
    else if (a >= target * 0.8) level = "Watch";
    return { score, level, direction, rule, thresholds };
  }

  // Lower-is-better
  if (target === 0) {
    if (a === 0) return { score: 100, level: "On", direction, rule, thresholds };
    // any positive value when target is 0 → off
    const score = clamp(100 - a * 25);
    return { score, level: "Off", direction, rule, thresholds };
  }
  const ratio = target / Math.max(a, 1e-9);
  const score = clamp(ratio * 100);
  let level: EffectivenessLevel = "Off";
  if (a <= target) level = "On";
  else if (a <= target * 1.2) level = "Watch";
  return { score, level, direction, rule, thresholds };
}

export const EFFECTIVENESS_META: Record<EffectivenessLevel, { label: string; dot: string; chip: string }> = {
  On: { label: "On target", dot: "bg-emerald-500", chip: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" },
  Watch: { label: "Watch", dot: "bg-amber-500", chip: "border-amber-500/40 text-amber-600 dark:text-amber-400" },
  Off: { label: "Off target", dot: "bg-rose-500", chip: "border-rose-500/40 text-rose-600 dark:text-rose-400" },
  Pending: { label: "Pending", dot: "bg-muted-foreground/40", chip: "border-border text-muted-foreground" },
};
