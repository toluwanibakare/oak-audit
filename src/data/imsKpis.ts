export type ProcessFamily =
  | "Leadership"
  | "Risk & Compliance"
  | "HR & Competence"
  | "Procurement"
  | "Production / Service"
  | "Maintenance"
  | "QHSE"
  | "Environment"
  | "OH&S"
  | "Customer"
  | "Improvement"
  | "Vessel Operations"
  | "Cargo Handling"
  | "Yard & Logistics"
  | "Equipment & Assets"
  | "Top Management"
  | "QAQC"
  | "QMS"
  | "Human Resources"
  | "Operations"
  | "Engineering"
  | "Construction"
  | "Sales"
  | "Marketing"
  | "Finance & Accounts"
  | "Store"
  | "ICT"
  | "Warehouse"
  | "Project Management"
  | "Admin"
  | "Production / Manufacturing"
  | "Business Development";

export type Direction = "higher" | "lower";
export type Frequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually";
export type Standard = "ISO 9001" | "ISO 14001" | "ISO 45001" | "IMS";

export type KpiDef = {
  id: string;
  process: ProcessFamily;
  scope: "Generic" | "Port";
  name: string;
  formula: string;
  unit: string;
  target: number;
  direction: Direction;
  frequency: Frequency;
  standards: Standard[];
};

export const KPI_LIBRARY: KpiDef[] = [
  { id: "L01", process: "Leadership", scope: "Generic", name: "Management review actions closed on time", formula: "Closed on time / Total actions", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "L02", process: "Leadership", scope: "Generic", name: "IMS policy communication coverage", formula: "Staff briefed / Total staff", unit: "%", target: 95, direction: "higher", frequency: "Annually", standards: ["IMS"] },
  { id: "R01", process: "Risk & Compliance", scope: "Generic", name: "Risk treatment actions closed on time", formula: "Closed on time / Due", unit: "%", target: 90, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "R02", process: "Risk & Compliance", scope: "Generic", name: "Legal compliance evaluation conformity", formula: "Compliant obligations / Total", unit: "%", target: 98, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "H01", process: "HR & Competence", scope: "Generic", name: "Training plan completion", formula: "Completed / Planned", unit: "%", target: 95, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "H02", process: "HR & Competence", scope: "Generic", name: "Competence assessment pass rate", formula: "Passed / Assessed", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001", "ISO 45001"] },
  { id: "H03", process: "HR & Competence", scope: "Generic", name: "Employee turnover", formula: "Leavers / Avg headcount", unit: "%", target: 8, direction: "lower", frequency: "Quarterly", standards: ["IMS"] },
  { id: "P01", process: "Procurement", scope: "Generic", name: "On-time supplier delivery", formula: "On-time POs / Total POs", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "P02", process: "Procurement", scope: "Generic", name: "Supplier QHSE evaluation score", formula: "Avg evaluation score", unit: "/100", target: 80, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "P03", process: "Procurement", scope: "Generic", name: "Goods inwards rejection rate", formula: "Rejected lots / Received lots", unit: "%", target: 2, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "PR01", process: "Production / Service", scope: "Generic", name: "First-pass yield", formula: "Good units / Total produced", unit: "%", target: 98, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "PR02", process: "Production / Service", scope: "Generic", name: "Service delivery on-time rate", formula: "On-time deliveries / Total", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "PR03", process: "Production / Service", scope: "Generic", name: "Internal scrap rate", formula: "Scrap units / Produced", unit: "%", target: 1.5, direction: "lower", frequency: "Monthly", standards: ["ISO 9001", "ISO 14001"] },
  { id: "M01", process: "Maintenance", scope: "Generic", name: "Planned maintenance completion", formula: "PMs done / PMs due", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001", "ISO 45001"] },
  { id: "M02", process: "Maintenance", scope: "Generic", name: "Equipment availability (uptime)", formula: "Uptime / Scheduled time", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "M03", process: "Maintenance", scope: "Generic", name: "MTBF (mean time between failures)", formula: "Operating hours / Failures", unit: "hrs", target: 500, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "Q01", process: "QHSE", scope: "Generic", name: "Internal audit plan completion", formula: "Audits done / Planned", unit: "%", target: 100, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "Q02", process: "QHSE", scope: "Generic", name: "NCR closure on time", formula: "Closed on time / Total NCRs", unit: "%", target: 90, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "Q03", process: "QHSE", scope: "Generic", name: "Repeat NCR rate", formula: "Repeat NCRs / Total NCRs", unit: "%", target: 5, direction: "lower", frequency: "Quarterly", standards: ["IMS"] },
  { id: "E01", process: "Environment", scope: "Generic", name: "Energy intensity", formula: "kWh / Unit output", unit: "kWh/u", target: 1.2, direction: "lower", frequency: "Monthly", standards: ["ISO 14001"] },
  { id: "E02", process: "Environment", scope: "Generic", name: "Waste diverted from landfill", formula: "Recycled / Total waste", unit: "%", target: 70, direction: "higher", frequency: "Monthly", standards: ["ISO 14001"] },
  { id: "E03", process: "Environment", scope: "Generic", name: "Water consumption intensity", formula: "m³ / Unit output", unit: "m³/u", target: 0.8, direction: "lower", frequency: "Monthly", standards: ["ISO 14001"] },
  { id: "E04", process: "Environment", scope: "Generic", name: "GHG emissions intensity (Scope 1+2)", formula: "tCO₂e / Unit output", unit: "tCO₂e/u", target: 0.5, direction: "lower", frequency: "Quarterly", standards: ["ISO 14001"] },
  { id: "E05", process: "Environment", scope: "Generic", name: "Significant environmental incidents", formula: "Count of spills/exceedances", unit: "#", target: 0, direction: "lower", frequency: "Monthly", standards: ["ISO 14001"] },
  { id: "S01", process: "OH&S", scope: "Generic", name: "Lost-Time Injury Frequency Rate (LTIFR)", formula: "(LTIs × 1,000,000) / Hours worked", unit: "per M hrs", target: 1.0, direction: "lower", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "S02", process: "OH&S", scope: "Generic", name: "Total Recordable Injury Rate (TRIR)", formula: "(Recordables × 200,000) / Hours", unit: "per 200k hrs", target: 1.5, direction: "lower", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "S03", process: "OH&S", scope: "Generic", name: "Near-miss reporting rate", formula: "Near-misses / 100 staff / month", unit: "#", target: 5, direction: "higher", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "S04", process: "OH&S", scope: "Generic", name: "Toolbox talks completion", formula: "Sessions held / Planned", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "S05", process: "OH&S", scope: "Generic", name: "PPE compliance rate", formula: "Compliant observations / Total", unit: "%", target: 98, direction: "higher", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "S06", process: "OH&S", scope: "Generic", name: "HSE corrective actions closed on time", formula: "Closed on time / Due", unit: "%", target: 90, direction: "higher", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "C01", process: "Customer", scope: "Generic", name: "Customer satisfaction index", formula: "Avg survey score", unit: "/100", target: 85, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "C02", process: "Customer", scope: "Generic", name: "Customer complaints", formula: "Count of valid complaints", unit: "#", target: 5, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "C03", process: "Customer", scope: "Generic", name: "Complaint resolution time", formula: "Avg days to close", unit: "days", target: 7, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "I01", process: "Improvement", scope: "Generic", name: "Improvement initiatives delivered", formula: "Delivered / Planned", unit: "%", target: 80, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "I02", process: "Improvement", scope: "Generic", name: "CAPA effectiveness verified", formula: "Effective CAPAs / Verified", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "V01", process: "Vessel Operations", scope: "Port", name: "Berth productivity", formula: "Moves per berth-hour", unit: "moves/hr", target: 25, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "V02", process: "Vessel Operations", scope: "Port", name: "Vessel turnaround time", formula: "Avg hours alongside", unit: "hrs", target: 24, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "V03", process: "Vessel Operations", scope: "Port", name: "Berth occupancy", formula: "Occupied hours / Available", unit: "%", target: 70, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "V04", process: "Vessel Operations", scope: "Port", name: "Pilotage on-time rate", formula: "On-time / Total movements", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "CH01", process: "Cargo Handling", scope: "Port", name: "Crane productivity (gross)", formula: "Container moves / crane-hour", unit: "moves/hr", target: 28, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "CH02", process: "Cargo Handling", scope: "Port", name: "Cargo damage rate", formula: "Damaged units / Handled units", unit: "%", target: 0.1, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "CH03", process: "Cargo Handling", scope: "Port", name: "Lashing/securing non-conformities", formula: "NCs per 1,000 moves", unit: "#", target: 1, direction: "lower", frequency: "Monthly", standards: ["ISO 9001", "ISO 45001"] },
  { id: "CH04", process: "Cargo Handling", scope: "Port", name: "IMDG handling incidents", formula: "Count of dangerous goods incidents", unit: "#", target: 0, direction: "lower", frequency: "Monthly", standards: ["ISO 14001", "ISO 45001"] },
  { id: "Y01", process: "Yard & Logistics", scope: "Port", name: "Truck turnaround time", formula: "Avg gate-in to gate-out (min)", unit: "min", target: 35, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "Y02", process: "Yard & Logistics", scope: "Port", name: "Yard utilization", formula: "TEUs stored / Capacity", unit: "%", target: 75, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "Y03", process: "Yard & Logistics", scope: "Port", name: "Container dwell time", formula: "Avg days in yard", unit: "days", target: 5, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "Y04", process: "Yard & Logistics", scope: "Port", name: "Reefer monitoring compliance", formula: "Checks completed / Required", unit: "%", target: 100, direction: "higher", frequency: "Daily", standards: ["ISO 9001"] },
  { id: "EQ01", process: "Equipment & Assets", scope: "Port", name: "STS/RTG availability", formula: "Available hours / Scheduled", unit: "%", target: 92, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "EQ02", process: "Equipment & Assets", scope: "Port", name: "Equipment fuel efficiency", formula: "Litres / Move", unit: "L/move", target: 1.8, direction: "lower", frequency: "Monthly", standards: ["ISO 14001"] },
  { id: "EQ03", process: "Equipment & Assets", scope: "Port", name: "Statutory inspection compliance", formula: "Inspections done / Due", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["ISO 45001"] },
  // Top Management
  { id: "TM01", process: "Top Management", scope: "Generic", name: "Strategic objectives achieved", formula: "Achieved / Planned", unit: "%", target: 85, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "TM02", process: "Top Management", scope: "Generic", name: "Management review meetings held on schedule", formula: "Held / Planned", unit: "%", target: 100, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "TM03", process: "Top Management", scope: "Generic", name: "Budget vs actual variance", formula: "|Actual − Budget| / Budget", unit: "%", target: 5, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "TM04", process: "Top Management", scope: "Generic", name: "Stakeholder engagement index", formula: "Avg engagement score", unit: "/100", target: 80, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "TM05", process: "Top Management", scope: "Generic", name: "Strategic risks treated", formula: "Treated / Identified", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "TM06", process: "Top Management", scope: "Generic", name: "IMS performance review actions closed", formula: "Closed / Raised", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  // QAQC
  { id: "QC01", process: "QAQC", scope: "Generic", name: "Inspection pass rate", formula: "Passed / Inspected", unit: "%", target: 98, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "QC02", process: "QAQC", scope: "Generic", name: "Defect density", formula: "Defects / Unit output", unit: "#/u", target: 0.5, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "QC03", process: "QAQC", scope: "Generic", name: "Calibration compliance", formula: "Calibrated on time / Due", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "QC04", process: "QAQC", scope: "Generic", name: "Cost of poor quality (COPQ)", formula: "COPQ / Revenue", unit: "%", target: 2, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "QC05", process: "QAQC", scope: "Generic", name: "Inspection & test plan adherence", formula: "ITPs followed / Required", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "QC06", process: "QAQC", scope: "Generic", name: "Non-conformance reports raised", formula: "NCRs per month", unit: "#", target: 10, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  // QMS
  { id: "QM01", process: "QMS", scope: "Generic", name: "Document control compliance", formula: "Current docs / Total docs", unit: "%", target: 98, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "QM02", process: "QMS", scope: "Generic", name: "Process audit conformity", formula: "Conforming clauses / Total", unit: "%", target: 95, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "QM03", process: "QMS", scope: "Generic", name: "Quality objectives achieved", formula: "Met / Total", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "QM04", process: "QMS", scope: "Generic", name: "Awareness & training on QMS", formula: "Trained / Required", unit: "%", target: 95, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "QM05", process: "QMS", scope: "Generic", name: "Customer-related NCs", formula: "External NCs per quarter", unit: "#", target: 3, direction: "lower", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "QM06", process: "QMS", scope: "Generic", name: "Records retention compliance", formula: "Compliant records / Audited", unit: "%", target: 98, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  // Human Resources
  { id: "HR01", process: "Human Resources", scope: "Generic", name: "Time to fill vacancies", formula: "Avg days open", unit: "days", target: 30, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "HR02", process: "Human Resources", scope: "Generic", name: "Voluntary attrition rate", formula: "Voluntary leavers / Headcount", unit: "%", target: 8, direction: "lower", frequency: "Quarterly", standards: ["IMS"] },
  { id: "HR03", process: "Human Resources", scope: "Generic", name: "Training hours per employee", formula: "Total hours / Headcount", unit: "hrs", target: 24, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "HR04", process: "Human Resources", scope: "Generic", name: "Employee engagement score", formula: "Avg survey score", unit: "/100", target: 80, direction: "higher", frequency: "Annually", standards: ["IMS"] },
  { id: "HR05", process: "Human Resources", scope: "Generic", name: "Performance appraisals completed", formula: "Completed / Due", unit: "%", target: 100, direction: "higher", frequency: "Annually", standards: ["IMS"] },
  { id: "HR06", process: "Human Resources", scope: "Generic", name: "Absenteeism rate", formula: "Absent days / Workdays", unit: "%", target: 3, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  // Operations
  { id: "OP01", process: "Operations", scope: "Generic", name: "Overall Equipment Effectiveness (OEE)", formula: "Avail × Perf × Quality", unit: "%", target: 85, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "OP02", process: "Operations", scope: "Generic", name: "On-time delivery rate", formula: "On-time / Total orders", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "OP03", process: "Operations", scope: "Generic", name: "Operational cost per unit", formula: "Total opex / Units", unit: "$/u", target: 100, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "OP04", process: "Operations", scope: "Generic", name: "Process cycle time", formula: "Avg cycle time", unit: "hrs", target: 8, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "OP05", process: "Operations", scope: "Generic", name: "Schedule adherence", formula: "Tasks on schedule / Planned", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "OP06", process: "Operations", scope: "Generic", name: "Operational incidents", formula: "Incidents per month", unit: "#", target: 0, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  // Engineering
  { id: "EN01", process: "Engineering", scope: "Generic", name: "Design change requests rate", formula: "DCRs / Drawings issued", unit: "%", target: 5, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "EN02", process: "Engineering", scope: "Generic", name: "Drawing approval cycle time", formula: "Avg days to approve", unit: "days", target: 7, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "EN03", process: "Engineering", scope: "Generic", name: "Engineering rework rate", formula: "Rework hours / Total hours", unit: "%", target: 5, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "EN04", process: "Engineering", scope: "Generic", name: "Design verification on time", formula: "Verified on time / Planned", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "EN05", process: "Engineering", scope: "Generic", name: "Standards compliance in designs", formula: "Compliant designs / Reviewed", unit: "%", target: 100, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "EN06", process: "Engineering", scope: "Generic", name: "Engineering deliverables on time", formula: "On time / Planned", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  // Construction
  { id: "CN01", process: "Construction", scope: "Generic", name: "Schedule Performance Index (SPI)", formula: "EV / PV", unit: "ratio", target: 1, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "CN02", process: "Construction", scope: "Generic", name: "Cost Performance Index (CPI)", formula: "EV / AC", unit: "ratio", target: 1, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "CN03", process: "Construction", scope: "Generic", name: "Site safety LTIFR", formula: "(LTIs × 1M) / Hours", unit: "per M hrs", target: 1, direction: "lower", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "CN04", process: "Construction", scope: "Generic", name: "Snag/punch-list closure", formula: "Closed / Raised", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "CN05", process: "Construction", scope: "Generic", name: "Permit-to-work compliance", formula: "Compliant PTWs / Audited", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "CN06", process: "Construction", scope: "Generic", name: "Materials wastage rate", formula: "Wasted / Issued", unit: "%", target: 3, direction: "lower", frequency: "Monthly", standards: ["ISO 14001"] },
  // Sales
  { id: "SL01", process: "Sales", scope: "Generic", name: "Sales target achievement", formula: "Actual / Target", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "SL02", process: "Sales", scope: "Generic", name: "Lead conversion rate", formula: "Won / Qualified leads", unit: "%", target: 25, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "SL03", process: "Sales", scope: "Generic", name: "Average deal cycle time", formula: "Avg days to close", unit: "days", target: 45, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "SL04", process: "Sales", scope: "Generic", name: "Customer retention rate", formula: "Retained / Active customers", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "SL05", process: "Sales", scope: "Generic", name: "Quote-to-order ratio", formula: "Orders / Quotes", unit: "%", target: 40, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "SL06", process: "Sales", scope: "Generic", name: "Revenue per salesperson", formula: "Revenue / Headcount", unit: "$", target: 100000, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  // Marketing
  { id: "MK01", process: "Marketing", scope: "Generic", name: "Marketing-qualified leads (MQLs)", formula: "MQLs per month", unit: "#", target: 100, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "MK02", process: "Marketing", scope: "Generic", name: "Cost per lead (CPL)", formula: "Spend / Leads", unit: "$", target: 50, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "MK03", process: "Marketing", scope: "Generic", name: "Campaign ROI", formula: "(Revenue − Cost) / Cost", unit: "%", target: 200, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "MK04", process: "Marketing", scope: "Generic", name: "Brand awareness score", formula: "Avg survey score", unit: "/100", target: 70, direction: "higher", frequency: "Annually", standards: ["IMS"] },
  { id: "MK05", process: "Marketing", scope: "Generic", name: "Website conversion rate", formula: "Conversions / Visitors", unit: "%", target: 3, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "MK06", process: "Marketing", scope: "Generic", name: "Social engagement growth", formula: "Δ followers / Period", unit: "%", target: 10, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  // Finance & Accounts
  { id: "FN01", process: "Finance & Accounts", scope: "Generic", name: "Days Sales Outstanding (DSO)", formula: "(AR / Revenue) × Days", unit: "days", target: 45, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "FN02", process: "Finance & Accounts", scope: "Generic", name: "Days Payable Outstanding (DPO)", formula: "(AP / COGS) × Days", unit: "days", target: 45, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "FN03", process: "Finance & Accounts", scope: "Generic", name: "Operating margin", formula: "Operating profit / Revenue", unit: "%", target: 15, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "FN04", process: "Finance & Accounts", scope: "Generic", name: "Month-end close cycle time", formula: "Days to close books", unit: "days", target: 5, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "FN05", process: "Finance & Accounts", scope: "Generic", name: "Audit findings closed", formula: "Closed / Raised", unit: "%", target: 95, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "FN06", process: "Finance & Accounts", scope: "Generic", name: "Forecast accuracy", formula: "1 − |Actual − Forecast| / Actual", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  // Store
  { id: "ST01", process: "Store", scope: "Generic", name: "Inventory accuracy", formula: "Matched items / Counted", unit: "%", target: 98, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "ST02", process: "Store", scope: "Generic", name: "Stock-out incidents", formula: "Stock-outs per month", unit: "#", target: 2, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "ST03", process: "Store", scope: "Generic", name: "Issue request fulfillment time", formula: "Avg hours to issue", unit: "hrs", target: 4, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "ST04", process: "Store", scope: "Generic", name: "Slow-moving stock ratio", formula: "Slow stock / Total stock", unit: "%", target: 10, direction: "lower", frequency: "Quarterly", standards: ["IMS"] },
  { id: "ST05", process: "Store", scope: "Generic", name: "Stock obsolescence write-off", formula: "Obsolete / Inventory value", unit: "%", target: 2, direction: "lower", frequency: "Quarterly", standards: ["IMS"] },
  { id: "ST06", process: "Store", scope: "Generic", name: "Storage space utilization", formula: "Used / Available", unit: "%", target: 80, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  // ICT
  { id: "IT01", process: "ICT", scope: "Generic", name: "System uptime", formula: "Uptime / Total time", unit: "%", target: 99.5, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "IT02", process: "ICT", scope: "Generic", name: "Mean time to resolve (MTTR)", formula: "Avg hours to resolve", unit: "hrs", target: 4, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "IT03", process: "ICT", scope: "Generic", name: "Service desk tickets resolved on SLA", formula: "On-SLA / Total", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "IT04", process: "ICT", scope: "Generic", name: "Cybersecurity incidents", formula: "Incidents per month", unit: "#", target: 0, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "IT05", process: "ICT", scope: "Generic", name: "Backup success rate", formula: "Successful backups / Scheduled", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "IT06", process: "ICT", scope: "Generic", name: "Patch compliance", formula: "Patched assets / Total", unit: "%", target: 98, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  // Warehouse
  { id: "WH01", process: "Warehouse", scope: "Generic", name: "Order picking accuracy", formula: "Accurate picks / Total", unit: "%", target: 99, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "WH02", process: "Warehouse", scope: "Generic", name: "Order fulfillment cycle time", formula: "Avg hours to dispatch", unit: "hrs", target: 24, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "WH03", process: "Warehouse", scope: "Generic", name: "Inbound dock-to-stock time", formula: "Avg hours receive→put-away", unit: "hrs", target: 8, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "WH04", process: "Warehouse", scope: "Generic", name: "Damage in storage rate", formula: "Damaged units / Stored", unit: "%", target: 0.5, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "WH05", process: "Warehouse", scope: "Generic", name: "Warehouse safety incidents", formula: "Incidents per month", unit: "#", target: 0, direction: "lower", frequency: "Monthly", standards: ["ISO 45001"] },
  { id: "WH06", process: "Warehouse", scope: "Generic", name: "Inventory turnover", formula: "COGS / Avg inventory", unit: "x", target: 8, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  // Project Management
  { id: "PM01", process: "Project Management", scope: "Generic", name: "Projects delivered on time", formula: "On-time / Closed projects", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "PM02", process: "Project Management", scope: "Generic", name: "Projects within budget", formula: "Within budget / Closed", unit: "%", target: 90, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "PM03", process: "Project Management", scope: "Generic", name: "Scope change rate", formula: "Approved changes / Baseline scope", unit: "%", target: 10, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "PM04", process: "Project Management", scope: "Generic", name: "Risk mitigation closure", formula: "Closed / Raised", unit: "%", target: 90, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "PM05", process: "Project Management", scope: "Generic", name: "Stakeholder satisfaction", formula: "Avg survey score", unit: "/100", target: 85, direction: "higher", frequency: "Quarterly", standards: ["ISO 9001"] },
  { id: "PM06", process: "Project Management", scope: "Generic", name: "Earned Value (EV) variance", formula: "(EV − PV) / PV", unit: "%", target: 0, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  // Admin
  { id: "AD01", process: "Admin", scope: "Generic", name: "Facility maintenance request closure", formula: "Closed / Raised", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "AD02", process: "Admin", scope: "Generic", name: "Vehicle/fleet availability", formula: "Available / Total fleet", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "AD03", process: "Admin", scope: "Generic", name: "Office utility cost variance", formula: "|Actual − Budget| / Budget", unit: "%", target: 5, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "AD04", process: "Admin", scope: "Generic", name: "Travel request turnaround", formula: "Avg days to process", unit: "days", target: 2, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "AD05", process: "Admin", scope: "Generic", name: "Mailroom/document delivery accuracy", formula: "On-time deliveries / Total", unit: "%", target: 98, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "AD06", process: "Admin", scope: "Generic", name: "Visitor management compliance", formula: "Logged visits / Audited", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["ISO 45001"] },
  // Production / Manufacturing
  { id: "PD01", process: "Production / Manufacturing", scope: "Generic", name: "Production plan attainment", formula: "Produced / Planned", unit: "%", target: 95, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "PD02", process: "Production / Manufacturing", scope: "Generic", name: "Yield (good output)", formula: "Good / Total produced", unit: "%", target: 98, direction: "higher", frequency: "Monthly", standards: ["ISO 9001"] },
  { id: "PD03", process: "Production / Manufacturing", scope: "Generic", name: "Unplanned downtime", formula: "Downtime hrs / Available hrs", unit: "%", target: 5, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "PD04", process: "Production / Manufacturing", scope: "Generic", name: "Changeover time", formula: "Avg minutes per changeover", unit: "min", target: 30, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
  { id: "PD05", process: "Production / Manufacturing", scope: "Generic", name: "Energy consumption per unit", formula: "kWh / Unit", unit: "kWh/u", target: 1.2, direction: "lower", frequency: "Monthly", standards: ["ISO 14001"] },
  { id: "PD06", process: "Production / Manufacturing", scope: "Generic", name: "Scrap & rework cost", formula: "Cost / Revenue", unit: "%", target: 2, direction: "lower", frequency: "Monthly", standards: ["ISO 9001"] },
  // Business Development
  { id: "BD01", process: "Business Development", scope: "Generic", name: "New opportunities pipeline value", formula: "Pipeline $ created", unit: "$", target: 1000000, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "BD02", process: "Business Development", scope: "Generic", name: "Bid win rate", formula: "Won bids / Submitted", unit: "%", target: 30, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "BD03", process: "Business Development", scope: "Generic", name: "Tender response on time", formula: "On time / Submitted", unit: "%", target: 100, direction: "higher", frequency: "Monthly", standards: ["IMS"] },
  { id: "BD04", process: "Business Development", scope: "Generic", name: "New markets/clients onboarded", formula: "Count per quarter", unit: "#", target: 3, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "BD05", process: "Business Development", scope: "Generic", name: "Strategic partnerships signed", formula: "Count per quarter", unit: "#", target: 2, direction: "higher", frequency: "Quarterly", standards: ["IMS"] },
  { id: "BD06", process: "Business Development", scope: "Generic", name: "Proposal cycle time", formula: "Avg days to submit", unit: "days", target: 10, direction: "lower", frequency: "Monthly", standards: ["IMS"] },
];

export const PROCESS_FAMILIES: ProcessFamily[] = Array.from(
  new Set(KPI_LIBRARY.map((k) => k.process)),
) as ProcessFamily[];

export const KPI_STORAGE_KEY = "conformia.kpi.v1";

export type KpiReading = {
  kpiId: string;
  period: string;
  actual: number | "";
  note?: string;
};

export type KpiState = {
  owners: Record<string, string>;
  readings: KpiReading[];
};

export function evaluateStatus(actual: number, target: number, direction: Direction): "on" | "watch" | "off" {
  if (direction === "higher") {
    if (actual >= target) return "on";
    if (actual >= target * 0.9) return "watch";
    return "off";
  }
  if (actual <= target) return "on";
  if (actual <= target * 1.1) return "watch";
  return "off";
}

/**
 * Human-readable description of the evaluation method for a KPI.
 * Documents the thresholds applied by `evaluateStatus`.
 */
export function evaluationMethod(target: number, direction: Direction, unit: string): {
  rule: string;
  on: string;
  watch: string;
  off: string;
} {
  const u = unit ? ` ${unit}` : "";
  if (direction === "higher") {
    const watchLow = +(target * 0.9).toFixed(2);
    return {
      rule: `Higher-is-better · target ≥ ${target}${u}`,
      on: `Actual ≥ ${target}${u}`,
      watch: `${watchLow}${u} ≤ Actual < ${target}${u} (within 10% of target)`,
      off: `Actual < ${watchLow}${u}`,
    };
  }
  const watchHigh = +(target * 1.1).toFixed(2);
  return {
    rule: `Lower-is-better · target ≤ ${target}${u}`,
    on: `Actual ≤ ${target}${u}`,
    watch: `${target}${u} < Actual ≤ ${watchHigh}${u} (within 10% of target)`,
    off: `Actual > ${watchHigh}${u}`,
  };
}

export const STATUS_META = {
  on: { label: "On target", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  watch: { label: "Watch", dot: "bg-amber-500", bar: "bg-amber-500" },
  off: { label: "Off target", dot: "bg-rose-500", bar: "bg-rose-500" },
  none: { label: "No data", dot: "bg-muted-foreground/40", bar: "bg-muted-foreground/40" },
} as const;

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function lastNPeriods(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}
