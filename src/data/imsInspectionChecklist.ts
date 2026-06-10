export type IMSChecklistItem = {
  id: number;
  item: string;
  evidence: string;
};

export type IMSCategory = {
  title: string;
  items: IMSChecklistItem[];
};

export const IMS_CHECKLIST_DATA: IMSCategory[] = [
  {
    title: "1. Chemical Management",
    items: [
      { id: 1, item: "Chemical containers properly labelled", evidence: "GHS labels" },
      { id: 2, item: "Safety Data Sheets available", evidence: "SDS files" },
      { id: 3, item: "Chemicals stored in designated areas", evidence: "Storage rooms" },
      { id: 4, item: "Incompatible chemicals separated", evidence: "Storage procedures" },
      { id: 5, item: "Chemical storage areas ventilated", evidence: "Ventilation system" },
      { id: 6, item: "Spill kits available", evidence: "Spill response kits" },
      { id: 7, item: "Secondary containment provided", evidence: "Bunded storage" },
      { id: 8, item: "Chemical inventory maintained", evidence: "Chemical register" },
      { id: 9, item: "Chemical handling procedures available", evidence: "SOPs" },
      { id: 10, item: "Workers trained on chemical safety", evidence: "Training records" }
    ]
  },
  {
    title: "2. Waste Management",
    items: [
      { id: 11, item: "Waste segregation practiced", evidence: "Color coded bins" },
      { id: 12, item: "Waste bins properly labelled", evidence: "Labels" },
      { id: 13, item: "Hazardous waste stored separately", evidence: "Hazardous storage" },
      { id: 14, item: "Waste storage areas clean", evidence: "Site inspection" },
      { id: 15, item: "Waste disposal records maintained", evidence: "Waste manifests" },
      { id: 16, item: "Licensed waste contractors used", evidence: "Contractor license" },
      { id: 17, item: "Recycling program implemented", evidence: "Recycling records" },
      { id: 18, item: "Waste containers not overflowing", evidence: "Visual inspection" },
      { id: 19, item: "Waste storage areas protected from rain", evidence: "Covered storage" },
      { id: 20, item: "Environmental signage for waste displayed", evidence: "Waste instructions" }
    ]
  },
  {
    title: "3. Environmental Controls",
    items: [
      { id: 21, item: "Air emissions controlled", evidence: "Emission control systems" },
      { id: 22, item: "Dust suppression systems available", evidence: "Dust control" },
      { id: 23, item: "Noise control measures implemented", evidence: "Noise barriers" },
      { id: 24, item: "Wastewater discharge controlled", evidence: "Effluent system" },
      { id: 25, item: "Environmental monitoring conducted", evidence: "Monitoring records" },
      { id: 26, item: "Spill prevention measures implemented", evidence: "Spill containment" },
      { id: 27, item: "Fuel storage properly managed", evidence: "Tank inspection" },
      { id: 28, item: "Oil spill kits available", evidence: "Spill kits" },
      { id: 29, item: "Stormwater drainage maintained", evidence: "Drainage system" },
      { id: 30, item: "Environmental permits available", evidence: "Regulatory permits" }
    ]
  }
];
