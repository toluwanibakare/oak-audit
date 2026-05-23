// HSE Site Inspection Checklist Audit Question Bank
// 15 categories, 10 questions each (150 items total)

import { type ClauseQuestionSet } from "./processAudit";

export type HseProcessKey =
  | "hse_general"
  | "hse_signage"
  | "hse_ppe"
  | "hse_machine"
  | "hse_electrical"
  | "hse_fire"
  | "hse_chemical"
  | "hse_waste"
  | "hse_environment"
  | "hse_warehouse"
  | "hse_emergency"
  | "hse_welfare"
  | "hse_contractor"
  | "hse_permit"
  | "hse_management";

export type HseProcessMeta = {
  key: HseProcessKey;
  name: string;
  scope: string;
};

export const HSE_PROCESSES: HseProcessMeta[] = [
  { key: "hse_general", name: "General Workplace Conditions", scope: "Cleanliness, pathways, exits, noise, ergonomic design, spacing." },
  { key: "hse_signage", name: "Safety Signage & Information", scope: "Warning signs, evacuation maps, first aid, operating instructions." },
  { key: "hse_ppe", name: "Personal Protective Equipment", scope: "PPE availability, condition, storage, records and training." },
  { key: "hse_machine", name: "Machine Safety", scope: "Machine guards, emergency stops, competency, interlocks, maintenance." },
  { key: "hse_electrical", name: "Electrical Safety", scope: "Panels, wiring, earthing, LOTO, overloading, restriction controls." },
  { key: "hse_fire", name: "Fire Safety", scope: "Extinguishers, alarms, hydrants, evacuation routes, fire drills." },
  { key: "hse_chemical", name: "Chemical Management", scope: "GHS labels, SDS sheets, secondary containment, spill kits, chemical inventory." },
  { key: "hse_waste", name: "Waste Management", scope: "Waste segregation, color coding, hazardous waste, disposal manifests." },
  { key: "hse_environment", name: "Environmental Controls", scope: "Emissions, dust control, wastewater discharge, noise levels, permits." },
  { key: "hse_warehouse", name: "Warehouse & Material Handling", scope: "Safe stacking, aisles, forklift training, manual and mechanical lifting." },
  { key: "hse_emergency", name: "Emergency Preparedness", scope: "ERP, emergency contacts, first aid kits, assembly points, drill records." },
  { key: "hse_welfare", name: "Worker Welfare Facilities", scope: "Drinking water, sanitation, rest areas, ventilation, medical support." },
  { key: "hse_contractor", name: "Contractor Safety", scope: "Contractor inductions, activities supervision, permits, risk assessments." },
  { key: "hse_permit", name: "Permit to Work System", scope: "Hot work, confined spaces, heights, PTW audits and closed records." },
  { key: "hse_management", name: "HSE Management Practices", scope: "Toolbox talks, HSE metrics, internal audits, training and management site visits." },
];

const HSE_QUESTIONS: Record<HseProcessKey, ClauseQuestionSet[]> = {
  hse_general: [
    { clause: "1", title: "Cleanliness", generic: ["Is the workplace clean and well organized?"], specific: ["Verify that floors, tables, and aisles are free of litter and clutter."], evidence: ["Good housekeeping, clean floors, clear work benches."] },
    { clause: "2", title: "Walkways", generic: ["Are walkways clearly marked?"], specific: ["Verify walkways are visible and free from obstruction."], evidence: ["Floor markings, no stored materials in paths."] },
    { clause: "3", title: "Emergency Exits Identification", generic: ["Are emergency exits clearly identified?"], specific: ["Verify exit signs are illuminated and visible from a distance."], evidence: ["Exit signage, green exit lighting."] },
    { clause: "4", title: "Emergency Exits Obstruction", generic: ["Are emergency exits unobstructed?"], specific: ["Verify no equipment or goods block the doors or exit paths."], evidence: ["Physical observation of exit doors and pathways."] },
    { clause: "5", title: "Slip/Trip Hazards", generic: ["Are floors free from slip or trip hazards?"], specific: ["Verify no loose cables, liquid spills, or uneven carpets exist."], evidence: ["No loose cables, dry floor surfaces, spill control."] },
    { clause: "6", title: "Lighting", generic: ["Is there adequate lighting in all work areas?"], specific: ["Inspect illumination levels to ensure workers can see clearly without strain."], evidence: ["Lighting system, lux measurements where applicable."] },
    { clause: "7", title: "Ventilation", generic: ["Is adequate ventilation provided?"], specific: ["Verify airflow is active and extraction systems are functioning in high temperature/dust zones."], evidence: ["Ventilation systems, open windows, HVAC status."] },
    { clause: "8", title: "Noise Control", generic: ["Are work areas free from excessive noise?"], specific: ["Verify noise control measures are in place and ear protection zones are marked."], evidence: ["Noise monitoring records, silencers, isolated machines."] },
    { clause: "9", title: "Ergonomics", generic: ["Are workstations ergonomically designed?"], specific: ["Ensure chairs, monitors, and benches support proper posture."], evidence: ["Ergonomic assessment, adjustable chairs/benches."] },
    { clause: "10", title: "Space Layout", generic: ["Is there adequate space between equipment?"], specific: ["Verify safe clearance for operators and machinery movement."], evidence: ["Safe layout, clear distance between workstations."] },
  ],
  hse_signage: [
    { clause: "11", title: "Safety Signs", generic: ["Are safety signs displayed in required areas?"], specific: ["Verify high-voltage, wet floor, and hazard warnings are visible."], evidence: ["Warning signs, hazard placards."] },
    { clause: "12", title: "Mandatory PPE Signs", generic: ["Are mandatory PPE signs displayed?"], specific: ["Check that ear, eye, and head protection entry requirements are clearly signed."], evidence: ["PPE signage at access points."] },
    { clause: "13", title: "Evacuation Maps", generic: ["Are emergency evacuation maps displayed?"], specific: ["Verify map is present, readable, and points to the current 'You Are Here' location."], evidence: ["Evacuation plans, muster point locations on maps."] },
    { clause: "14", title: "Fire Safety Signs", generic: ["Are fire safety signs visible?"], specific: ["Verify extinguishers and hose reel markers are visible from all angles."], evidence: ["Fire signage, extinguisher mounting tags."] },
    { clause: "15", title: "Chemical Hazards Signage", generic: ["Are chemical hazard signs displayed?"], specific: ["Ensure GHS labels and chemical room warnings are posted."], evidence: ["GHS hazard labels, chemical storage signs."] },
    { clause: "16", title: "First Aid Locations", generic: ["Are first aid location signs visible?"], specific: ["Verify green cross markers for first aid boxes and eye wash stations are present."], evidence: ["First aid signage, green cross indicators."] },
    { clause: "17", title: "Noise Hazard Signs", generic: ["Are noise hazard warning signs displayed?"], specific: ["Check for 'Hearing Protection Required' signs in loud machine rooms."], evidence: ["Hearing protection signage."] },
    { clause: "18", title: "Restricted Access", generic: ["Are restricted access signs posted?"], specific: ["Ensure server rooms, electrical substations, and dangerous areas are marked."], evidence: ["Access control signs, authorised entry labels."] },
    { clause: "19", title: "Environmental Protection Signage", generic: ["Are environmental protection signs posted?"], specific: ["Check for proper waste disposal instructions and spill reporting signs."], evidence: ["Waste disposal signs, spill kit instructions."] },
    { clause: "20", title: "Machinery Operating Instructions", generic: ["Are safety instructions posted near machinery?"], specific: ["Verify safe operating procedures (SOPs) are mounted near active tools."], evidence: ["Operating instructions, machine safety placards."] },
  ],
  hse_ppe: [
    { clause: "21", title: "PPE Assessment", generic: ["Is required PPE identified for each work area?"], specific: ["Check the PPE hazard matrix for different process tasks."], evidence: ["PPE hazard assessment, task sheets."] },
    { clause: "22", title: "PPE Wear compliance", generic: ["Are workers wearing required PPE?"], specific: ["Audit safety shoes, hard hats, high-vis vests, goggles, and gloves on site."], evidence: ["Visual observation of staff wearing PPE."] },
    { clause: "23", title: "PPE Condition", generic: ["Is PPE in good condition?"], specific: ["Inspect safety harnesses and gloves for tears, and helmets for cracks."], evidence: ["PPE inspection records, visual check."] },
    { clause: "24", title: "Visitor PPE", generic: ["Is PPE available for visitors?"], specific: ["Verify visitor log includes confirmation of PPE issues (shoes/glasses/vests)."], evidence: ["Visitor PPE stock, vest storage."] },
    { clause: "25", title: "PPE Storage", generic: ["Is PPE storage provided?"], specific: ["Ensure lockers and hooks are provided for workers to protect their gear when idle."], evidence: ["PPE lockers, dust-free containers."] },
    { clause: "26", title: "PPE Replacement", generic: ["Are damaged PPE replaced promptly?"], specific: ["Check supply log and replacement request tickets."], evidence: ["Replacement records, stock list."] },
    { clause: "27", title: "PPE Training", generic: ["Is PPE training provided?"], specific: ["Verify training on fitment and care of respirators and safety harnesses."], evidence: ["Training records, signed attendance list."] },
    { clause: "28", title: "Respiratory Protection", generic: ["Is respiratory protection available where needed?"], specific: ["Check for masks and cartridges in spray painting or dusty zones."], evidence: ["Respirator stock, cartridge replacement log."] },
    { clause: "29", title: "Hearing Protection", generic: ["Is hearing protection available in high noise areas?"], specific: ["Ensure earmuffs and earplugs are stocked in generator and machine rooms."], evidence: ["Ear protection dispensers, stock checks."] },
    { clause: "30", title: "Eye Protection", generic: ["Is eye protection available in hazardous areas?"], specific: ["Verify goggles are available for welding, cutting, or chemical handling."], evidence: ["Safety goggles, welding shields."] },
  ],
  hse_machine: [
    { clause: "31", title: "Safety Guards", generic: ["Are machines equipped with safety guards?"], specific: ["Verify visual guards are attached to rotating and cutting components."], evidence: ["Machine guarding, mechanical barriers."] },
    { clause: "32", title: "Moving Parts Guarding", generic: ["Are moving parts properly guarded?"], specific: ["Verify belts, gears, and shafts have solid covers in place."], evidence: ["Physical inspection of covers and panels."] },
    { clause: "33", title: "Emergency Stops", generic: ["Are emergency stop buttons functional?"], specific: ["Check response and accessibility of e-stop cords and buttons on active machinery."], evidence: ["Emergency stop testing logs, immediate shutoff verified."] },
    { clause: "34", title: "Machinery Operating Procedures", generic: ["Are machine operating instructions displayed?"], specific: ["Ensure safe operations checklists are readable at control consoles."], evidence: ["SOPs, visual guides."] },
    { clause: "35", title: "Operator Training", generic: ["Are only trained operators running machines?"], specific: ["Check authorization tags and operator training credentials."], evidence: ["Competency records, machine license list."] },
    { clause: "36", title: "Lockout/Tagout (LOTO)", generic: ["Are Lockout/Tagout devices available?"], specific: ["Verify padlock stations, tags, and hasps are present at isolation units."], evidence: ["LOTO kits, padlocks, warning tags."] },
    { clause: "37", title: "Machine Inspection", generic: ["Are machines inspected regularly?"], specific: ["Verify pre-start inspection sheets are updated daily by operators."], evidence: ["Inspection logs, pre-start checklists."] },
    { clause: "38", title: "Exposed Rotation", generic: ["Are there no exposed rotating parts?"], specific: ["Check that chucks, pulleys, and shafts are completely covered."], evidence: ["Visual inspection of rotating components."] },
    { clause: "39", title: "Interlocks", generic: ["Are interlocks functioning correctly?"], specific: ["Verify opening a protective cover automatically cuts machine power."], evidence: ["Maintenance records, interlock trip testing."] },
    { clause: "40", title: "Preventive Maintenance", generic: ["Are machines properly maintained?"], specific: ["Review oiling, calibration, and maintenance schedules of equipment."], evidence: ["Preventive maintenance records, service logs."] },
  ],
  hse_electrical: [
    { clause: "41", title: "Panel Labeling", generic: ["Are electrical panels clearly labelled?"], specific: ["Verify voltage rating symbols and breaker directories are accurate."], evidence: ["Panel labels, circuit breaker schedules."] },
    { clause: "42", title: "Panel Accessibility", generic: ["Are electrical panels accessible?"], specific: ["Check for a 1-meter clear working space in front of panels and DB boards."], evidence: ["No obstruction, clear safety mats in place."] },
    { clause: "43", title: "Wiring Condition", generic: ["Is there no exposed wiring?"], specific: ["Check cable trays, junction boxes, and outlets for open hot conductors."], evidence: ["Safe wiring, closed junction boxes."] },
    { clause: "44", title: "Grounding/Earthing", generic: ["Are electrical equipment properly grounded?"], specific: ["Inspect earth connections and continuity testing markers on metal housings."], evidence: ["Earthing verification reports, copper earth braids."] },
    { clause: "45", title: "Electrical Maintenance", generic: ["Is electrical maintenance conducted regularly?"], specific: ["Review thermographic scanning records and insulation resistance tests."], evidence: ["Maintenance records, electrician logs."] },
    { clause: "46", title: "Electrical LOTO", generic: ["Are lockout procedures applied for electrical work?"], specific: ["Check isolation checklists for recent panel repair work."], evidence: ["LOTO records, permit files."] },
    { clause: "47", title: "Extension Cords", generic: ["Are extension cords in good condition?"], specific: ["Ensure no daisy-chaining, taping, or exposed conductors are present on cords."], evidence: ["Visual inspection, PAT testing logs."] },
    { clause: "48", title: "Socket Loading", generic: ["Is there no overloading of sockets?"], specific: ["Verify multi-plugs are not cascading from single wall outlets."], evidence: ["Load distribution check, cool-to-touch plugs."] },
    { clause: "49", title: "Electrical Room Access", generic: ["Are electrical rooms restricted?"], specific: ["Check that substation and transformer gates are locked and marked."], evidence: ["Access control, high voltage signage."] },
    { clause: "50", title: "Electrical Hazard Signs", generic: ["Are electrical hazard signs displayed?"], specific: ["Verify 'Danger: High Voltage' and lightning bolt symbols are clear."], evidence: ["Warning signage, shock treatment charts."] },
  ],
  hse_fire: [
    { clause: "51", title: "Extinguisher Availability", generic: ["Are fire extinguishers available?"], specific: ["Verify correct extinguisher type (CO2, Dry Powder, Water) for the hazard class."], evidence: ["Fire extinguishers present on brackets."] },
    { clause: "52", title: "Extinguisher Inspection", generic: ["Are fire extinguishers inspected regularly?"], specific: ["Verify monthly physical checks and annual service pressure tags."], evidence: ["Inspection tags, pressure gauge green-zone alignment."] },
    { clause: "53", title: "Extinguisher Accessibility", generic: ["Are fire extinguishers easily accessible?"], specific: ["Verify no materials or trash bins block access to fire equipment."], evidence: ["Proper placement, clear red backing lines on walls."] },
    { clause: "54", title: "Fire Alarms", generic: ["Is the fire alarm system functional?"], specific: ["Verify break-glass units are free and weekly alarm test logs are kept."], evidence: ["Alarm testing panel records, heat/smoke detectors clean."] },
    { clause: "55", title: "Fire Hydrants", generic: ["Are fire hydrants available?"], specific: ["Check pressure dials and hose reels in the perimeter yards."], evidence: ["Hydrant system, hose reel cabinets intact."] },
    { clause: "56", title: "Fire Exit Markings", generic: ["Are fire exits clearly marked?"], specific: ["Verify green running man signs and floor arrows are accurate."], evidence: ["Exit signage, directional arrows."] },
    { clause: "57", title: "Evacuation Plan Display", generic: ["Are fire evacuation plans displayed?"], specific: ["Ensure emergency pathways map is visible in the common lobby area."], evidence: ["Evacuation map, emergency assembly directions."] },
    { clause: "58", title: "Fire Drills", generic: ["Are fire drills conducted?"], specific: ["Check log for biannual or annual evacuation drills with response times."], evidence: ["Drill records, scenario descriptions."] },
    { clause: "59", title: "Combustible Storage", generic: ["Are combustible materials properly stored?"], specific: ["Check that cardboard, wood pallets, and fuels are kept away from heat sources."], evidence: ["Storage control, fire-rated cabinets for volatile materials."] },
    { clause: "60", title: "Smoking Policy", generic: ["Is smoking prohibited in restricted areas?"], specific: ["Verify 'No Smoking' decals are displayed in chemical, storage, and office zones."], evidence: ["No smoking signs, designated smoking shelters."] },
  ],
  hse_chemical: [
    { clause: "61", title: "Chemical Labeling", generic: ["Are chemical containers properly labelled?"], specific: ["Ensure all decanted chemicals show product names and GHS hazard icons."], evidence: ["GHS labels, chemical secondary container tracking."] },
    { clause: "62", title: "Safety Data Sheets (SDS)", generic: ["Are Safety Data Sheets available?"], specific: ["Verify the chemical binder contains updated 16-section SDS in English/local languages."], evidence: ["SDS files, chemical safety binders."] },
    { clause: "63", title: "Chemical Storage Rooms", generic: ["Are chemicals stored in designated areas?"], specific: ["Verify restricted access and fire-rated walls of the chemical store."], evidence: ["Storage rooms, spill bund gates."] },
    { clause: "64", title: "Chemical Compatibility", generic: ["Are incompatible chemicals separated?"], specific: ["Ensure acids and bases, or flammables and oxidizers, are not stored together."], evidence: ["Storage segregation procedures, separate containment trays."] },
    { clause: "65", title: "Chemical Store Ventilation", generic: ["Are chemical storage areas ventilated?"], specific: ["Verify exhaust fans are active and venting to a safe outdoor location."], evidence: ["Ventilation system, mechanical ventilation running."] },
    { clause: "66", title: "Spill Kits", generic: ["Are spill kits available?"], specific: ["Ensure absorbent pads, socks, disposal bags, and PPE are packed in yellow bins."], evidence: ["Spill response kits, neutralizers present."] },
    { clause: "67", title: "Secondary Containment", generic: ["Is secondary containment provided?"], specific: ["Check that liquid chemical drums sit on containment bunds holding 110% of volume."], evidence: ["Bunded storage, spill pallets dry and clean."] },
    { clause: "68", title: "Chemical Inventory", generic: ["Is a chemical inventory maintained?"], specific: ["Check the chemical register for accurate volumes, hazards, and locations."], evidence: ["Chemical register, volume control logs."] },
    { clause: "69", title: "Chemical Handling SOPs", generic: ["Are chemical handling procedures available?"], specific: ["Ensure decanting, eye wash operations, and spill cleanup procedures are posted."], evidence: ["SOPs, emergency response placards."] },
    { clause: "70", title: "Chemical Safety Training", generic: ["Are workers trained on chemical safety?"], specific: ["Verify training on GHS pictograms, SDS readings, and spill response."], evidence: ["Training records, chemical awareness matrix."] },
  ],
  hse_waste: [
    { clause: "71", title: "Waste Segregation", generic: ["Is waste segregation practiced?"], specific: ["Check distinct containers for domestic, hazardous, recyclable, and e-waste."], evidence: ["Color coded bins, scrap segregation yards."] },
    { clause: "72", title: "Waste Bin Labeling", generic: ["Are waste bins properly labelled?"], specific: ["Ensure signage for 'General Waste', 'Food Waste', or 'Oily Rags' is clear."], evidence: ["Bin labels, waste disposal charts."] },
    { clause: "73", title: "Hazardous Waste", generic: ["Is hazardous waste stored separately?"], specific: ["Verify spent batteries, fluorescent tubes, and oily rags are locked in a safe bund."], evidence: ["Hazardous storage, battery recycle drums."] },
    { clause: "74", title: "Waste Storage Cleanliness", generic: ["Are waste storage areas clean?"], specific: ["Check for flies, rodents, odor, or liquid runoff in dump yards."], evidence: ["Site inspection, pest control records."] },
    { clause: "75", title: "Waste Disposal Logs", generic: ["Are waste disposal records maintained?"], specific: ["Review weight slips and collection receipts for safe tracking."], evidence: ["Waste manifests, disposal tickets."] },
    { clause: "76", title: "Waste Contractors", generic: ["Are licensed waste contractors used?"], specific: ["Confirm environmental licenses of the operating collection agency."], evidence: ["Contractor license, agency permits."] },
    { clause: "77", title: "Recycling Program", generic: ["Is a recycling program implemented?"], specific: ["Track quantities of paper, wood pallets, and metal scrap sent for recycling."], evidence: ["Recycling records, paper reuse programs."] },
    { clause: "78", title: "Waste Capacity", generic: ["Are waste containers not overflowing?"], specific: ["Verify bins are emptied before reaching their rims."], evidence: ["Visual inspection of waste bins."] },
    { clause: "79", title: "Waste Weather Protection", generic: ["Are waste storage areas protected from rain?"], specific: ["Verify waste skip containers are covered or stored under sheds to avoid runoffs."], evidence: ["Covered storage, tarpaulin or roofing present."] },
    { clause: "80", title: "Waste Disposal Signage", generic: ["Is environmental signage for waste displayed?"], specific: ["Check for posters encouraging recycling and prohibiting hazardous liquids in drains."], evidence: ["Waste instructions, recycling posters."] },
  ],
  hse_environment: [
    { clause: "81", title: "Air Emissions", generic: ["Are air emissions controlled?"], specific: ["Inspect exhaust stacks and scrubber units for visual smoke or soot."], evidence: ["Emission control systems, stack testing records."] },
    { clause: "82", title: "Dust Suppression", generic: ["Are dust suppression systems available?"], specific: ["Verify water sprayers or baghouse filters are running in crushing areas."], evidence: ["Dust control sprinklers, dust hoods."] },
    { clause: "83", title: "Noise Monitoring", generic: ["Are noise control measures implemented?"], specific: ["Verify soundproof walls or vibration isolation pads under generators."], evidence: ["Noise barriers, boundary sound levels logs."] },
    { clause: "84", title: "Wastewater Discharge", generic: ["Is wastewater discharge controlled?"], specific: ["Check oil-water interceptors and septic status for leaks."], evidence: ["Effluent system, neutralisation tanks."] },
    { clause: "85", title: "Environmental Monitoring", generic: ["Is environmental monitoring conducted?"], specific: ["Review quarterly air quality, noise, and effluent water analysis reports."], evidence: ["Monitoring records, certified lab certificates."] },
    { clause: "86", title: "Spill Prevention", generic: ["Are spill prevention measures implemented?"], specific: ["Verify drip trays are placed under oil barrels and drum transfer pumps."], evidence: ["Spill containment trays, bund status."] },
    { clause: "87", title: "Fuel Storage", generic: ["Is fuel storage properly managed?"], specific: ["Check tank vents, secondary bund volume, and level indicator gauges."], evidence: ["Tank inspection reports, fuel transfer SOPs."] },
    { clause: "88", title: "Oil Spill Kits", generic: ["Are oil spill kits available?"], specific: ["Ensure spill mats and granular absorbents are stored near diesel tanks."], evidence: ["Spill kits, granular absorbent bags."] },
    { clause: "89", title: "Stormwater Drainage", generic: ["Is stormwater drainage maintained?"], specific: ["Check outdoor drainage trenches for trash, mud blocks, or oil films."], evidence: ["Drainage system clean, clear rainwater flows."] },
    { clause: "90", title: "Environmental Permits", generic: ["Are environmental permits available?"], specific: ["Review EPA permits, air discharges, and EIA approvals for the site."], evidence: ["Regulatory permits, air discharge licenses."] },
  ],
  hse_warehouse: [
    { clause: "91", title: "Materials Storage", generic: ["Are materials stored safely?"], specific: ["Verify boxes are not leaning, and racks are anchored to the floor."], evidence: ["Storage layout, rack integrity certifications."] },
    { clause: "92", title: "Safe Stacking", generic: ["Is stacking done safely?"], specific: ["Verify stacks do not exceed recommended heights and are cross-tied."], evidence: ["Safe stacking levels, shrink wrap checks."] },
    { clause: "93", title: "Heavy Material Storage", generic: ["Are heavy materials stored at lower levels?"], specific: ["Check that bottom shelves hold steel rods/heavy parts and top is for light boxes."], evidence: ["Storage practice, rack load rating markers."] },
    { clause: "94", title: "Aisle Clearances", generic: ["Are aisles kept clear?"], specific: ["Verify pallet jacks and spare pallets do not block forklift lanes."], evidence: ["Visual inspection of walkways and aisles."] },
    { clause: "95", title: "Forklift Routes", generic: ["Are forklift routes marked?"], specific: ["Check for pedestrian yellow pathways next to driving lanes."], evidence: ["Traffic markings, mirrors at intersections."] },
    { clause: "96", title: "Forklift Competency", generic: ["Are forklift operators trained?"], specific: ["Check valid operator licenses and eye examination updates."], evidence: ["Certification records, forklift licenses list."] },
    { clause: "97", title: "Pallet Condition", generic: ["Are pallets in good condition?"], specific: ["Verify broken wooden slats and loose nails are retired to scrap areas."], evidence: ["Pallet inspection checklist, retired pallet logs."] },
    { clause: "98", title: "Manual Handling", generic: ["Are manual handling procedures available?"], specific: ["Check charts demonstrating correct bending and team lift limits."], evidence: ["SOPs, posture instructions."] },
    { clause: "99", title: "Lifting Aids", generic: ["Are mechanical lifting aids available?"], specific: ["Verify access to crane hoists, pallet jacks, and lift trolleys."], evidence: ["Lifting equipment, chain hoist testing certs."] },
    { clause: "100", title: "Warehouse Illumination", generic: ["Is warehouse lighting adequate?"], specific: ["Verify high-bay lamps illuminate standard rack storage areas clearly."], evidence: ["Lighting system, clear visual visibility."] },
  ],
  hse_emergency: [
    { clause: "101", title: "Emergency Response Plan", generic: ["Is an emergency response plan available?"], specific: ["Verify evacuation, spill, and medical emergency manuals are present."], evidence: ["ERP document, crisis command guidelines."] },
    { clause: "102", title: "Emergency Contact List", generic: ["Are emergency contacts displayed?"], specific: ["Check if numbers for fire brigade, hospitals, and police are up-to-date."], evidence: ["Contact list at reception and notice boards."] },
    { clause: "103", title: "First Aid Kit Availability", generic: ["Are first aid kits available?"], specific: ["Ensure wall-mounted first aid kits are in offices, labs, and workshop floors."], evidence: ["First aid kits installed and locked/accessible."] },
    { clause: "104", title: "First Aid Inspection", generic: ["Are first aid kits inspected regularly?"], specific: ["Check checklist inside box to ensure no expired items or low stock exist."], evidence: ["Inspection log, list of medication stock."] },
    { clause: "105", title: "Trained First Aiders", generic: ["Are trained first aiders available?"], specific: ["Check names, photos, and phone numbers of certified first aid wardens."], evidence: ["First aider list, certificate files."] },
    { clause: "106", title: "Assembly Points", generic: ["Are emergency assembly points identified?"], specific: ["Check outdoor assembly board markers and muster cards."], evidence: ["Muster point signs, assembly ground clean."] },
    { clause: "107", title: "Emergency Lighting", generic: ["Is emergency lighting available?"], specific: ["Verify automatic battery lamps illuminate dark halls when primary power cuts."], evidence: ["Lighting system, backup batteries tested monthly."] },
    { clause: "108", title: "Spill Response SOPs", generic: ["Are spill response procedures available?"], specific: ["Check spill maps and clean-up flowcharts placed near bulk storage."], evidence: ["Spill procedure, absorbent disposal instructions."] },
    { clause: "109", title: "Emergency Training", generic: ["Are workers trained on emergency response?"], specific: ["Verify training records for fire wardens and spill response teams."], evidence: ["Training records, signed assessment logs."] },
    { clause: "110", title: "Emergency Drills", generic: ["Are emergency drills conducted?"], specific: ["Check for chemical spill, fire, and casualty rescue drill logs."], evidence: ["Drill reports, correction items logged."] },
  ],
  hse_welfare: [
    { clause: "111", title: "Drinking Water", generic: ["Is clean drinking water available?"], specific: ["Verify water dispensers have fresh filters and cups are provided."], evidence: ["Water facilities, lab test certificates for well/tap."] },
    { clause: "112", title: "Sanitation Facilities", generic: ["Are adequate sanitation facilities provided?"], specific: ["Check separate male/female toilets are clean, flushing, and lockable."], evidence: ["Toilets clean, tissue rolls stocked."] },
    { clause: "113", title: "Handwashing Facilities", generic: ["Are handwashing facilities provided?"], specific: ["Verify soap dispensers and clean air dryers/paper towels are present."], evidence: ["Wash stations, hot water supply in food prep zones."] },
    { clause: "114", title: "Changing Rooms", generic: ["Are changing rooms provided?"], specific: ["Check for personal lockers and bench seating in changing areas."], evidence: ["Locker rooms, clean change lockers."] },
    { clause: "115", title: "Rest Areas", generic: ["Are rest areas available?"], specific: ["Ensure chairs and protection from weather are provided for shift breaks."], evidence: ["Rest facilities, shaded seating benches."] },
    { clause: "116", title: "Eating Areas", generic: ["Are eating areas separated from production?"], specific: ["Verify canteen or lunch rooms are isolated from chemicals or dust areas."], evidence: ["Cafeteria, clean microwaves and dining tables."] },
    { clause: "117", title: "Medical Support", generic: ["Is medical support available?"], specific: ["Verify site nurse or clinic is stocked and has an ambulance contact system."], evidence: ["Clinic/medical room, cot bed, stethoscope."] },
    { clause: "118", title: "Health Awareness Programs", generic: ["Are workers informed of health programs?"], specific: ["Check notice boards for flyers on vaccination drives or healthy lifestyles."], evidence: ["Awareness posters, health seminar reports."] },
    { clause: "119", title: "Welfare Ventilation", generic: ["Is there adequate ventilation in welfare areas?"], specific: ["Verify exhaust fans or AC systems are operational in toilets and changing rooms."], evidence: ["Ventilation status, fresh odors."] },
    { clause: "120", title: "Welfare Housekeeping", generic: ["Are facilities clean and maintained?"], specific: ["Confirm janitor cleaning checklists are signed hourly/daily."], evidence: ["Housekeeping sheets, clean common spaces."] },
  ],
  hse_contractor: [
    { clause: "121", title: "Contractor Induction", generic: ["Do contractors undergo HSE induction?"], specific: ["Verify signed contractor induction logs before site access badges are issued."], evidence: ["Induction records, signed safety sheets."] },
    { clause: "122", title: "Contractor PPE", generic: ["Are contractors provided PPE?"], specific: ["Check contractor staff are fully equipped with matching safety gear."], evidence: ["PPE records, contractor gear checks."] },
    { clause: "123", title: "Contractor Supervision", generic: ["Are contractor activities supervised?"], specific: ["Check supervision logs and job hazard analysis (JHA) forms for work."], evidence: ["Supervision records, JHA reviews."] },
    { clause: "124", title: "Contractor Permits", generic: ["Do contractors follow the permit system?"], specific: ["Verify active contractor work has open hot work or height permits."], evidence: ["Permit records, PTW binder."] },
    { clause: "125", title: "Contractor Risk Assessment", generic: ["Are contractor risk assessments available?"], specific: ["Verify method statements and risk sheets are submitted for contractor tasks."], evidence: ["Risk assessments, approved method statements."] },
    { clause: "126", title: "Contractor Incident Log", generic: ["Is there a contractor incident reporting system?"], specific: ["Verify contractor near-misses and injuries are logged in the master database."], evidence: ["Incident logs, subcontractor incident reports."] },
    { clause: "127", title: "Contractor Training", generic: ["Is contractor safety training conducted?"], specific: ["Check specific training for specialized contractor rigging or scaffold building."], evidence: ["Training records, scaffolding certs."] },
    { clause: "128", title: "Contractor Monitoring", generic: ["Is contractor compliance monitored?"], specific: ["Review random spot-audit reports for contractor work scopes."], evidence: ["Inspection reports, nonconformance issues logged."] },
    { clause: "129", title: "Contractor Site Audits", generic: ["Are contractor work areas inspected?"], specific: ["Verify daily inspections of contractor laydown yards are conducted."], evidence: ["Audit records, safety officer logs."] },
    { clause: "130", title: "Contractor Evaluation", generic: ["Is contractor safety performance evaluated?"], specific: ["Check post-project GRC contractor rating cards for renewals."], evidence: ["Performance reviews, rating matrix."] },
  ],
  hse_permit: [
    { clause: "131", title: "PTW System Implementation", generic: ["Is a permit-to-work procedure implemented?"], specific: ["Check high-risk tasks requiring formal permits before startup."], evidence: ["PTW procedure, active permit registry."] },
    { clause: "132", title: "Hot Work Permits", generic: ["Are hot work permits issued when required?"], specific: ["Verify oxygen/acetylene cutting and welding areas have active permits and fire watches."], evidence: ["Permit records, fire watch checklist."] },
    { clause: "133", title: "Confined Space Permits", generic: ["Are confined space permits issued?"], specific: ["Confirm gas detector logs and ventilation checks are attached to permits."], evidence: ["Confined space permits, multi-gas test records."] },
    { clause: "134", title: "Working at Height Permits", generic: ["Are work at height permits issued?"], specific: ["Verify harness inspection and wind speed checks are listed before height work."], evidence: ["Height work permits, scaffold tag green confirmation."] },
    { clause: "135", title: "Permit Authorisation", generic: ["Is permit authorization defined?"], specific: ["Check that authorizing engineers and area owners sign off on entry."], evidence: ["Approval signatures, authorized list of PTW issuers."] },
    { clause: "136", title: "Permits Display", generic: ["Are permits displayed at the work site?"], specific: ["Verify copies of active permits are posted at the task work front."], evidence: ["Physical permits hanging on work racks."] },
    { clause: "137", title: "Permit Conditions", generic: ["Are permit conditions followed?"], specific: ["Audit safety controls like spark containment screens and barricades."], evidence: ["Site observation, safety screens in place."] },
    { clause: "138", title: "Permit Closure", generic: ["Are permits closed after job completion?"], specific: ["Verify sign-off that the work area is clean and equipment is returned to normal."], evidence: ["Permit close-out logs, housekeeping signoff."] },
    { clause: "139", title: "Permit Training", generic: ["Are workers trained on the permit system?"], specific: ["Verify training on the five steps of PTW (Request, Issue, Accept, Close, Cancel)."], evidence: ["Training records, certified issuer card database."] },
    { clause: "140", title: "Permit Records Retention", generic: ["Are permit records retained?"], specific: ["Check archive boxes or GRC database folders for expired permits."], evidence: ["Permit files, historical compliance storage."] },
  ],
  hse_management: [
    { clause: "141", title: "Safety Meetings", generic: ["Are safety meetings conducted?"], specific: ["Check minutes of the monthly central safety committee reviews."], evidence: ["Meeting minutes, signed attendance rosters."] },
    { clause: "142", title: "Toolbox Talks", generic: ["Are toolbox talks conducted?"], specific: ["Check daily brief logs signed by team leaders and operators."], evidence: ["Toolbox records, topics log (slips/PPE/electrical)."] },
    { clause: "143", title: "HSE Inspections", generic: ["Are safety inspections conducted regularly?"], specific: ["Verify weekly walking inspections conducted by safety officers."], evidence: ["Inspection reports, corrective action lists."] },
    { clause: "144", title: "Incident Reporting", generic: ["Is an incident reporting system implemented?"], specific: ["Check portal or form log for registering accidents and close-calls."], evidence: ["Incident logs, flash alerts, formal investigation reports."] },
    { clause: "145", title: "Corrective Actions Tracking", generic: ["Are corrective actions tracked?"], specific: ["Ensure GRC registers track action status, owners, and closure proof."], evidence: ["Corrective action register, CAPA system updates."] },
    { clause: "146", title: "HSE KPIs", generic: ["Are HSE performance indicators monitored?"], specific: ["Check safety board showing LTIFR, waste generation, and emission rates."], evidence: ["KPI reports, safety dashboard charts."] },
    { clause: "147", title: "Internal HSE Audits", generic: ["Are internal HSE audits conducted?"], specific: ["Verify recent comprehensive audit scopes and report copies."], evidence: ["Audit reports, auditor certifications."] },
    { clause: "148", title: "HSE Training Schedules", generic: ["Is HSE training conducted regularly?"], specific: ["Confirm first aid, firefighting, and ergonomics courses are active."], evidence: ["Training records, safety calendar."] },
    { clause: "149", title: "Management Walks", generic: ["Are management site inspections conducted?"], specific: ["Verify reports or photos of executives doing periodic safety tour walkabouts."], evidence: ["Inspection reports, executive walk photos."] },
    { clause: "150", title: "Continuous Improvement", generic: ["Are continuous improvement actions implemented?"], specific: ["Check feedback forms and suggestions implemented to optimize safety controls."], evidence: ["Improvement plans, hazard reduction awards records."] },
  ],
};

export const HSE_KEY_MAPPING: Record<string, HseProcessKey> = {
  warehouse: "hse_warehouse",
  store: "hse_warehouse",
  production: "hse_machine",
  engineering: "hse_machine",
  construction: "hse_general",
  ict: "hse_electrical",
  admin: "hse_general",
  operations: "hse_general",
  hr: "hse_welfare",
  finance: "hse_management",
  qaqc: "hse_management",
  top_management: "hse_management",
  qms: "hse_management",
  project_management: "hse_general",
  sales: "hse_general",
  marketing: "hse_general",
  procurement: "hse_contractor",
  business_development: "hse_general",
};

export function getQuestionsForHseProcess(proc: string): ClauseQuestionSet[] {
  const mappedKey = (proc.startsWith("hse_") ? proc : (HSE_KEY_MAPPING[proc.toLowerCase()] ?? "hse_general")) as HseProcessKey;
  return HSE_QUESTIONS[mappedKey] ?? [];
}
