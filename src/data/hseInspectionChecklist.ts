export type HSEChecklistItem = {
  id: number;
  item: string;
  evidence: string;
};

export type HSECategory = {
  title: string;
  items: HSEChecklistItem[];
};

export const HSE_CHECKLIST_DATA: HSECategory[] = [
  {
    title: "1. General Workplace Conditions",
    items: [
      { id: 1, item: "Workplace is clean and well organized", evidence: "Good housekeeping" },
      { id: 2, item: "Walkways clearly marked", evidence: "Floor markings" },
      { id: 3, item: "Emergency exits clearly identified", evidence: "Exit signage" },
      { id: 4, item: "Emergency exits unobstructed", evidence: "Physical observation" },
      { id: 5, item: "Floors free from slip or trip hazards", evidence: "No loose cables, spills" },
      { id: 6, item: "Adequate lighting in all work areas", evidence: "Lighting system" },
      { id: 7, item: "Adequate ventilation provided", evidence: "Ventilation systems" },
      { id: 8, item: "Work areas free from excessive noise", evidence: "Noise monitoring records" },
      { id: 9, item: "Workstations ergonomically designed", evidence: "Ergonomic assessment" },
      { id: 10, item: "Adequate space between equipment", evidence: "Safe layout" }
    ]
  },
  {
    title: "2. Safety Signage & Information",
    items: [
      { id: 11, item: "Safety signs displayed in required areas", evidence: "Warning signs" },
      { id: 12, item: "Mandatory PPE signs displayed", evidence: "PPE signage" },
      { id: 13, item: "Emergency evacuation maps displayed", evidence: "Evacuation plans" },
      { id: 14, item: "Fire safety signs visible", evidence: "Fire signage" },
      { id: 15, item: "Chemical hazard signs displayed", evidence: "GHS labels" },
      { id: 16, item: "First aid location signs visible", evidence: "First aid signage" },
      { id: 17, item: "Noise hazard warning signs displayed", evidence: "Hearing protection signage" },
      { id: 18, item: "Restricted access signs posted", evidence: "Access control" },
      { id: 19, item: "Environmental protection signs posted", evidence: "Waste disposal signs" },
      { id: 20, item: "Safety instructions posted near machinery", evidence: "Operating instructions" }
    ]
  },
  {
    title: "3. Personal Protective Equipment (PPE)",
    items: [
      { id: 21, item: "Required PPE identified for each work area", evidence: "PPE hazard assessment" },
      { id: 22, item: "Workers wearing required PPE", evidence: "Visual observation" },
      { id: 23, item: "PPE in good condition", evidence: "PPE inspection" },
      { id: 24, item: "PPE available for visitors", evidence: "Visitor PPE stock" },
      { id: 25, item: "PPE storage provided", evidence: "PPE lockers" },
      { id: 26, item: "Damaged PPE replaced promptly", evidence: "Replacement records" },
      { id: 27, item: "PPE training provided", evidence: "Training records" },
      { id: 28, item: "Respiratory protection available where needed", evidence: "Respirator stock" },
      { id: 29, item: "Hearing protection available in high noise areas", evidence: "Ear protection" },
      { id: 30, item: "Eye protection available in hazardous areas", evidence: "Safety goggles" }
    ]
  },
  {
    title: "4. Machine Safety",
    items: [
      { id: 31, item: "Machines equipped with safety guards", evidence: "Machine guarding" },
      { id: 32, item: "Moving parts properly guarded", evidence: "Physical inspection" },
      { id: 33, item: "Emergency stop buttons functional", evidence: "Emergency stop testing" },
      { id: 34, item: "Machine operating instructions displayed", evidence: "SOPs" },
      { id: 35, item: "Only trained operators running machines", evidence: "Competency records" },
      { id: 36, item: "Lockout/Tagout devices available", evidence: "LOTO kits" },
      { id: 37, item: "Machines inspected regularly", evidence: "Inspection logs" },
      { id: 38, item: "No exposed rotating parts", evidence: "Visual inspection" },
      { id: 39, item: "Interlocks functioning correctly", evidence: "Maintenance records" },
      { id: 40, item: "Machines properly maintained", evidence: "Preventive maintenance records" }
    ]
  },
  {
    title: "5. Electrical Safety",
    items: [
      { id: 41, item: "Electrical panels clearly labelled", evidence: "Panel labels" },
      { id: 42, item: "Electrical panels accessible", evidence: "No obstruction" },
      { id: 43, item: "No exposed wiring", evidence: "Safe wiring" },
      { id: 44, item: "Electrical equipment properly grounded", evidence: "Earthing verification" },
      { id: 45, item: "Electrical maintenance conducted regularly", evidence: "Maintenance records" },
      { id: 46, item: "Lockout procedures applied for electrical work", evidence: "LOTO records" },
      { id: 47, item: "Extension cords in good condition", evidence: "Visual inspection" },
      { id: 48, item: "No overloading of sockets", evidence: "Load distribution" },
      { id: 49, item: "Electrical rooms restricted", evidence: "Access control" },
      { id: 50, item: "Electrical hazard signs displayed", evidence: "Warning signage" }
    ]
  },
  {
    title: "6. Fire Safety",
    items: [
      { id: 51, item: "Fire extinguishers available", evidence: "Fire extinguishers" },
      { id: 52, item: "Fire extinguishers inspected regularly", evidence: "Inspection tags" },
      { id: 53, item: "Fire extinguishers easily accessible", evidence: "Proper placement" },
      { id: 54, item: "Fire alarm system functional", evidence: "Alarm testing" },
      { id: 55, item: "Fire hydrants available", evidence: "Hydrant system" },
      { id: 56, item: "Fire exits clearly marked", evidence: "Exit signage" },
      { id: 57, item: "Fire evacuation plan displayed", evidence: "Evacuation map" },
      { id: 58, item: "Fire drills conducted", evidence: "Drill records" },
      { id: 59, item: "Combustible materials properly stored", evidence: "Storage control" },
      { id: 60, item: "Smoking prohibited in restricted areas", evidence: "No smoking signs" }
    ]
  },
  {
    title: "7. Chemical Management",
    items: [
      { id: 61, item: "Chemical containers properly labelled", evidence: "GHS labels" },
      { id: 62, item: "Safety Data Sheets available", evidence: "SDS files" },
      { id: 63, item: "Chemicals stored in designated areas", evidence: "Storage rooms" },
      { id: 64, item: "Incompatible chemicals separated", evidence: "Storage procedures" },
      { id: 65, item: "Chemical storage areas ventilated", evidence: "Ventilation system" },
      { id: 66, item: "Spill kits available", evidence: "Spill response kits" },
      { id: 67, item: "Secondary containment provided", evidence: "Bunded storage" },
      { id: 68, item: "Chemical inventory maintained", evidence: "Chemical register" },
      { id: 69, item: "Chemical handling procedures available", evidence: "SOPs" },
      { id: 70, item: "Workers trained on chemical safety", evidence: "Training records" }
    ]
  },
  {
    title: "8. Waste Management",
    items: [
      { id: 71, item: "Waste segregation practiced", evidence: "Color coded bins" },
      { id: 72, item: "Waste bins properly labelled", evidence: "Labels" },
      { id: 73, item: "Hazardous waste stored separately", evidence: "Hazardous storage" },
      { id: 74, item: "Waste storage areas clean", evidence: "Site inspection" },
      { id: 75, item: "Waste disposal records maintained", evidence: "Waste manifests" },
      { id: 76, item: "Licensed waste contractors used", evidence: "Contractor license" },
      { id: 77, item: "Recycling program implemented", evidence: "Recycling records" },
      { id: 78, item: "Waste containers not overflowing", evidence: "Visual inspection" },
      { id: 79, item: "Waste storage areas protected from rain", evidence: "Covered storage" },
      { id: 80, item: "Environmental signage for waste displayed", evidence: "Waste instructions" }
    ]
  },
  {
    title: "9. Environmental Controls",
    items: [
      { id: 81, item: "Air emissions controlled", evidence: "Emission control systems" },
      { id: 82, item: "Dust suppression systems available", evidence: "Dust control" },
      { id: 83, item: "Noise control measures implemented", evidence: "Noise barriers" },
      { id: 84, item: "Wastewater discharge controlled", evidence: "Effluent system" },
      { id: 85, item: "Environmental monitoring conducted", evidence: "Monitoring records" },
      { id: 86, item: "Spill prevention measures implemented", evidence: "Spill containment" },
      { id: 87, item: "Fuel storage properly managed", evidence: "Tank inspection" },
      { id: 88, item: "Oil spill kits available", evidence: "Spill kits" },
      { id: 89, item: "Stormwater drainage maintained", evidence: "Drainage system" },
      { id: 90, item: "Environmental permits available", evidence: "Regulatory permits" }
    ]
  },
  {
    title: "10. Warehouse & Material Handling",
    items: [
      { id: 91, item: "Materials stored safely", evidence: "Storage layout" },
      { id: 92, item: "Stacking done safely", evidence: "Safe stacking" },
      { id: 93, item: "Heavy materials stored at lower levels", evidence: "Storage practice" },
      { id: 94, item: "Aisles kept clear", evidence: "Visual inspection" },
      { id: 95, item: "Forklift routes marked", evidence: "Traffic markings" },
      { id: 96, item: "Forklift operators trained", evidence: "Certification records" },
      { id: 97, item: "Pallets in good condition", evidence: "Pallet inspection" },
      { id: 98, item: "Manual handling procedures available", evidence: "SOPs" },
      { id: 99, item: "Mechanical lifting aids available", evidence: "Lifting equipment" },
      { id: 100, item: "Warehouse lighting adequate", evidence: "Lighting system" }
    ]
  },
  {
    title: "11. Emergency Preparedness",
    items: [
      { id: 101, item: "Emergency response plan available", evidence: "ERP document" },
      { id: 102, item: "Emergency contacts displayed", evidence: "Contact list" },
      { id: 103, item: "First aid kits available", evidence: "First aid kits" },
      { id: 104, item: "First aid kits inspected regularly", evidence: "Inspection log" },
      { id: 105, item: "Trained first aiders available", evidence: "First aider list" },
      { id: 106, item: "Emergency assembly points identified", evidence: "Muster point signs" },
      { id: 107, item: "Emergency lighting available", evidence: "Lighting system" },
      { id: 108, item: "Spill response procedures available", evidence: "Spill procedure" },
      { id: 109, item: "Workers trained on emergency response", evidence: "Training records" },
      { id: 110, item: "Emergency drills conducted", evidence: "Drill reports" }
    ]
  },
  {
    title: "12. Worker Welfare Facilities",
    items: [
      { id: 111, item: "Clean drinking water available", evidence: "Water facilities" },
      { id: 112, item: "Adequate sanitation facilities", evidence: "Toilets" },
      { id: 113, item: "Handwashing facilities provided", evidence: "Wash stations" },
      { id: 114, item: "Changing rooms provided", evidence: "Locker rooms" },
      { id: 115, item: "Rest areas available", evidence: "Rest facilities" },
      { id: 116, item: "Eating areas separated from production", evidence: "Cafeteria" },
      { id: 117, item: "Medical support available", evidence: "Clinic/medical room" },
      { id: 118, item: "Workers informed of health programs", evidence: "Awareness posters" },
      { id: 119, item: "Adequate ventilation in welfare areas", evidence: "Ventilation" },
      { id: 120, item: "Facilities clean and maintained", evidence: "Housekeeping" }
    ]
  },
  {
    title: "13. Contractor Safety",
    items: [
      { id: 121, item: "Contractors undergo HSE induction", evidence: "Induction records" },
      { id: 122, item: "Contractors provided PPE", evidence: "PPE records" },
      { id: 123, item: "Contractor activities supervised", evidence: "Supervision records" },
      { id: 124, item: "Contractors follow permit system", evidence: "Permit records" },
      { id: 125, item: "Contractor risk assessments available", evidence: "Risk assessments" },
      { id: 126, item: "Contractor incident reporting system", evidence: "Incident logs" },
      { id: 127, item: "Contractor safety training conducted", evidence: "Training records" },
      { id: 128, item: "Contractor compliance monitored", evidence: "Inspection reports" },
      { id: 129, item: "Contractor work areas inspected", evidence: "Audit records" },
      { id: 130, item: "Contractor safety performance evaluated", evidence: "Performance reviews" }
    ]
  },
  {
    title: "14. Permit to Work System",
    items: [
      { id: 131, item: "Permit-to-work procedure implemented", evidence: "PTW procedure" },
      { id: 132, item: "Hot work permits issued when required", evidence: "Permit records" },
      { id: 133, item: "Confined space permits issued", evidence: "Confined space permits" },
      { id: 134, item: "Work at height permits issued", evidence: "Height work permits" },
      { id: 135, item: "Permit authorization defined", evidence: "Approval signatures" },
      { id: 136, item: "Permits displayed at work site", evidence: "Physical permits" },
      { id: 137, item: "Permit conditions followed", evidence: "Site observation" },
      { id: 138, item: "Permit closed after job completion", evidence: "Permit close-out" },
      { id: 139, item: "Workers trained on permit system", evidence: "Training records" },
      { id: 140, item: "Permit records retained", evidence: "Permit files" }
    ]
  },
  {
    title: "15. HSE Management Practices",
    items: [
      { id: 141, item: "Safety meetings conducted", evidence: "Meeting minutes" },
      { id: 142, item: "Toolbox talks conducted", evidence: "Toolbox records" },
      { id: 143, item: "Safety inspections conducted regularly", evidence: "Inspection reports" },
      { id: 144, item: "Incident reporting system implemented", evidence: "Incident logs" },
      { id: 145, item: "Corrective actions tracked", evidence: "Corrective action register" },
      { id: 146, item: "HSE performance indicators monitored", evidence: "KPI reports" },
      { id: 147, item: "Internal HSE audits conducted", evidence: "Audit reports" },
      { id: 148, item: "HSE training conducted regularly", evidence: "Training records" },
      { id: 149, item: "Management site inspections conducted", evidence: "Inspection reports" },
      { id: 150, item: "Continuous improvement actions implemented", evidence: "Improvement plans" }
    ]
  }
];
