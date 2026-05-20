// Nigeria Legal & Regulatory Compliance Register
// Cross-sector seed: HSE, Environment, Labour, Tax, Data Protection, Corporate,
// and sector regulators relevant to production & service organizations in Nigeria.

export type ComplianceStatus =
  | "pending"
  | "compliant"
  | "partial"
  | "non_compliant"
  | "not_applicable";

export type Severity = "low" | "medium" | "high" | "critical";

export type Frequency =
  | "one_off"
  | "monthly"
  | "quarterly"
  | "biannual"
  | "annual"
  | "biennial"
  | "ongoing";

export type LegalDomain =
  | "corporate"
  | "tax"
  | "labour"
  | "hse"
  | "environment"
  | "data"
  | "consumer"
  | "sector"
  | "anti_corruption"
  | "immigration";

export type LegalItem = {
  id: string;
  domain: LegalDomain;
  jurisdiction: "Federal" | "State" | "Local" | "International";
  regulator: string;
  instrument: string;            // Act / Regulation / Standard
  citation: string;              // Section / Clause
  obligation: string;            // What the org must do
  applicability: string;         // To whom it applies
  evidence: string;              // Evidence of compliance
  frequency: Frequency;
  penalty: string;               // Sanction for non-compliance
};

export const DOMAIN_META: Record<LegalDomain, { label: string; tone: string; dot: string }> = {
  corporate:        { label: "Corporate & Commercial", tone: "bg-secondary text-foreground border-border",   dot: "bg-foreground" },
  tax:              { label: "Tax & Revenue",          tone: "bg-info/10 text-info border-info/30",          dot: "bg-info" },
  labour:           { label: "Labour & Employment",    tone: "bg-accent/10 text-accent border-accent/30",    dot: "bg-accent" },
  hse:              { label: "Occupational Safety",    tone: "bg-destructive/10 text-destructive border-destructive/30", dot: "bg-destructive" },
  environment:      { label: "Environment",            tone: "bg-success/10 text-success border-success/30", dot: "bg-success" },
  data:             { label: "Data Protection & ICT",  tone: "bg-info/10 text-info border-info/30",          dot: "bg-info" },
  consumer:         { label: "Consumer & Product",     tone: "bg-warning/15 text-[hsl(35_85%_28%)] border-warning/40", dot: "bg-warning" },
  sector:           { label: "Sector Regulators",      tone: "bg-secondary text-foreground border-border",   dot: "bg-primary" },
  anti_corruption:  { label: "Anti-Corruption & AML",  tone: "bg-destructive/10 text-destructive border-destructive/30", dot: "bg-destructive" },
  immigration:      { label: "Immigration & Expatriate", tone: "bg-accent/10 text-accent border-accent/30",  dot: "bg-accent" },
};

export const STATUS_META: Record<ComplianceStatus, { label: string; tone: string; dot: string; bar: string }> = {
  pending:        { label: "Not evaluated", tone: "bg-muted text-muted-foreground border-border",                  dot: "bg-muted-foreground/40", bar: "bg-muted-foreground/40" },
  compliant:      { label: "Compliant",     tone: "bg-success/10 text-success border-success/30",                  dot: "bg-success",            bar: "bg-success" },
  partial:        { label: "Partial",       tone: "bg-warning/15 text-[hsl(35_85%_28%)] border-warning/40",         dot: "bg-warning",            bar: "bg-warning" },
  non_compliant:  { label: "Non-compliant", tone: "bg-destructive/10 text-destructive border-destructive/30",      dot: "bg-destructive",        bar: "bg-destructive" },
  not_applicable: { label: "N/A",           tone: "bg-muted text-muted-foreground border-border",                  dot: "bg-muted-foreground/30",bar: "bg-muted-foreground/30" },
};

export const SEVERITY_META: Record<Severity, { label: string; score: number; tone: string }> = {
  low:      { label: "Low",      score: 1, tone: "bg-muted text-muted-foreground" },
  medium:   { label: "Medium",   score: 2, tone: "bg-warning/15 text-[hsl(35_85%_28%)]" },
  high:     { label: "High",     score: 3, tone: "bg-accent/15 text-accent" },
  critical: { label: "Critical", score: 4, tone: "bg-destructive/10 text-destructive" },
};

export type EvaluationEntry = {
  status: ComplianceStatus;
  severity: Severity | null;
  evidenceRef: string;     // doc / record reference
  notes: string;
  owner: string;
  lastReview: string;      // YYYY-MM-DD
  nextDue: string;         // YYYY-MM-DD
  action: string;          // closure action if non/partial
};

export const EMPTY_EVAL: EvaluationEntry = {
  status: "pending",
  severity: null,
  evidenceRef: "",
  notes: "",
  owner: "",
  lastReview: "",
  nextDue: "",
  action: "",
};

export const LEGAL_STORAGE_KEY = "conformia-ng-legal-compliance-v1";

// ---------------------------------------------------------------------------
// Seed register — broad, cross-sector. Citations are simplified pointers,
// users should validate exact section numbers against current gazettes.
// ---------------------------------------------------------------------------

export const LEGAL_ITEMS: LegalItem[] = [
  // ---- Corporate & Commercial ----
  { id: "CAMA-01", domain: "corporate", jurisdiction: "Federal", regulator: "Corporate Affairs Commission (CAC)",
    instrument: "Companies and Allied Matters Act (CAMA) 2020", citation: "Part B; s.417–425",
    obligation: "Maintain registered office, statutory registers, file annual returns and update beneficial ownership within statutory timelines.",
    applicability: "All registered companies and LLPs in Nigeria.",
    evidence: "CAC certificate, status report, annual return receipts, persons-with-significant-control register.",
    frequency: "annual",
    penalty: "Daily default fines; struck-off register; director disqualification." },
  { id: "CAMA-02", domain: "corporate", jurisdiction: "Federal", regulator: "CAC",
    instrument: "CAMA 2020", citation: "s.237–257",
    obligation: "Hold AGM, appoint auditors, prepare and file audited financial statements per IFRS.",
    applicability: "All companies (small companies have reduced obligations).",
    evidence: "Notice of AGM, signed minutes, audited accounts, auditor’s report.",
    frequency: "annual",
    penalty: "Fines; invalid resolutions; reputational risk." },

  // ---- Tax & Revenue ----
  { id: "TAX-CIT", domain: "tax", jurisdiction: "Federal", regulator: "Federal Inland Revenue Service (FIRS)",
    instrument: "Companies Income Tax Act (as amended by Finance Acts)", citation: "s.55; s.77",
    obligation: "File CIT returns within 6 months of year-end and remit tax due; self-assessment with audited accounts.",
    applicability: "All companies (with small-company exemptions where turnover ≤ ₦25m).",
    evidence: "TaxPro-Max acknowledgements, e-receipts, computation, audited financials.",
    frequency: "annual",
    penalty: "10% penalty + interest at CBN MPR + 5%; criminal liability for officers." },
  { id: "TAX-VAT", domain: "tax", jurisdiction: "Federal", regulator: "FIRS",
    instrument: "Value Added Tax Act (as amended)", citation: "s.15",
    obligation: "Register, charge 7.5% VAT on taxable supplies, file monthly returns by 21st of following month.",
    applicability: "Suppliers of taxable goods/services with turnover ≥ ₦25m.",
    evidence: "VAT certificate, monthly returns, e-invoices, input/output VAT schedules.",
    frequency: "monthly",
    penalty: "₦50,000 for first month and ₦25,000 monthly thereafter; 10% + interest." },
  { id: "TAX-PAYE", domain: "tax", jurisdiction: "State", regulator: "State Internal Revenue Service",
    instrument: "Personal Income Tax Act (PITA), as amended", citation: "s.81 (PAYE)",
    obligation: "Deduct PAYE from employees and remit by 10th of following month; file annual returns by 31 January.",
    applicability: "All employers of labour.",
    evidence: "PAYE schedules, e-receipts, Form H1 annual return.",
    frequency: "monthly",
    penalty: "10% of tax due + interest; criminal liability." },
  { id: "TAX-WHT", domain: "tax", jurisdiction: "Federal", regulator: "FIRS / SIRS",
    instrument: "WHT Regulations under CITA/PITA", citation: "Various rates 2.5%–10%",
    obligation: "Deduct WHT on qualifying payments and remit within 21 days; issue credit notes.",
    applicability: "All companies making qualifying payments.",
    evidence: "WHT schedules, e-receipts, credit notes issued.",
    frequency: "monthly",
    penalty: "10% + interest on unremitted amounts." },
  { id: "TAX-TET", domain: "tax", jurisdiction: "Federal", regulator: "FIRS / TETFund",
    instrument: "Tertiary Education Trust Fund (Establishment) Act", citation: "s.1",
    obligation: "Pay 3% Tertiary Education Tax on assessable profits.",
    applicability: "Resident companies (excludes small companies).",
    evidence: "TET assessment, e-receipts.",
    frequency: "annual",
    penalty: "Same as CIT non-compliance." },
  { id: "TAX-NPT", domain: "tax", jurisdiction: "Federal", regulator: "FIRS",
    instrument: "Nigeria Police Trust Fund Act 2019", citation: "s.4",
    obligation: "Pay 0.005% of net profit as NPTF levy.",
    applicability: "Companies operating in Nigeria.",
    evidence: "NPTF e-receipt; computation.",
    frequency: "annual",
    penalty: "Recovery as debt to FG." },
  { id: "TAX-NASENI", domain: "tax", jurisdiction: "Federal", regulator: "FIRS / NASENI",
    instrument: "NASENI Act (as amended by Finance Act)", citation: "s.20",
    obligation: "Pay 0.25% NASENI levy on profit before tax (turnover ≥ ₦100m, banking/ICT/telecoms).",
    applicability: "Banking, mobile telecoms, ICT, aviation, maritime, oil & gas with set thresholds.",
    evidence: "NASENI levy receipts; computation.",
    frequency: "annual",
    penalty: "Recovery + interest." },

  // ---- Labour & Employment ----
  { id: "LAB-LA", domain: "labour", jurisdiction: "Federal", regulator: "Federal Ministry of Labour & Employment",
    instrument: "Labour Act Cap L1 LFN 2004", citation: "s.7; s.55–61",
    obligation: "Issue written employment particulars within 3 months; observe working hour and overtime limits; protect women and young persons from night work.",
    applicability: "Workers as defined under the Act (excluding management cadres).",
    evidence: "Signed contracts, time records, payroll.",
    frequency: "ongoing",
    penalty: "Fines and imprisonment for repeat breaches." },
  { id: "LAB-PRA", domain: "labour", jurisdiction: "Federal", regulator: "PenCom",
    instrument: "Pension Reform Act 2014", citation: "s.4 (rates), s.11 (remittance)",
    obligation: "Remit minimum 10% employer + 8% employee pension contribution to PFA within 7 working days of salary payment; obtain compliance certificate annually.",
    applicability: "Employers with 3+ employees.",
    evidence: "Schedules to PFA, RSA PINs, PenCom compliance certificate.",
    frequency: "monthly",
    penalty: "2% per month penalty; bar from federal contracts without PenCom certificate." },
  { id: "LAB-NHF", domain: "labour", jurisdiction: "Federal", regulator: "Federal Mortgage Bank of Nigeria",
    instrument: "National Housing Fund Act 1992", citation: "s.4",
    obligation: "Deduct 2.5% of monthly basic salary of Nigerian employees earning ≥ ₦3,000 p.a. and remit to NHF.",
    applicability: "Employers in public/private sector.",
    evidence: "NHF schedules, remittance receipts, employee NHF numbers.",
    frequency: "monthly",
    penalty: "Fines under the Act and FMBN sanctions." },
  { id: "LAB-ITF", domain: "labour", jurisdiction: "Federal", regulator: "Industrial Training Fund (ITF)",
    instrument: "ITF (Amendment) Act 2011", citation: "s.6",
    obligation: "Pay 1% of annual payroll as ITF levy where employer has ≥ 5 employees or turnover ≥ ₦50m; obtain ITF compliance certificate annually.",
    applicability: "Employers meeting threshold.",
    evidence: "ITF assessment, payment receipts, compliance certificate.",
    frequency: "annual",
    penalty: "Fines; bar from public contracts/permits without certificate." },
  { id: "LAB-NSITF", domain: "labour", jurisdiction: "Federal", regulator: "NSITF",
    instrument: "Employee Compensation Act 2010", citation: "s.33",
    obligation: "Contribute 1% of total monthly payroll to the Employees Compensation Fund.",
    applicability: "All employers (public and private).",
    evidence: "NSITF receipts, ECS schedules, ECS compliance certificate.",
    frequency: "monthly",
    penalty: "10% per annum penalty; criminal liability." },
  { id: "LAB-NMW", domain: "labour", jurisdiction: "Federal", regulator: "Federal Ministry of Labour",
    instrument: "National Minimum Wage Act 2024", citation: "s.3",
    obligation: "Pay each worker not less than the prevailing national minimum wage (currently ₦70,000 monthly).",
    applicability: "All employers with ≥ 25 employees.",
    evidence: "Payroll register; bank schedules.",
    frequency: "ongoing",
    penalty: "Fines and back-pay orders." },

  // ---- Occupational Safety / HSE ----
  { id: "HSE-FA", domain: "hse", jurisdiction: "Federal", regulator: "Federal Ministry of Labour — Inspectorate",
    instrument: "Factories Act Cap F1 LFN 2004", citation: "s.1; s.47; s.55",
    obligation: "Register the factory; maintain general register; provide adequate safety, ventilation, lighting, sanitation; report accidents and dangerous occurrences.",
    applicability: "All workplaces meeting the 'factory' definition.",
    evidence: "Factory registration certificate, accident book, inspection reports, safety policy.",
    frequency: "ongoing",
    penalty: "Fines, closure, criminal liability for occupiers." },
  { id: "HSE-ECA", domain: "hse", jurisdiction: "Federal", regulator: "NSITF",
    instrument: "Employee Compensation Act 2010", citation: "s.5; s.7",
    obligation: "Report workplace injuries/diseases within 7 days; cooperate with NSITF investigations; ensure safe place of work.",
    applicability: "All employers.",
    evidence: "ECS injury report forms, investigation reports, CAPA records.",
    frequency: "ongoing",
    penalty: "Up to ₦100,000 + criminal liability for non-reporting." },
  { id: "HSE-FIRE", domain: "hse", jurisdiction: "Federal", regulator: "Federal Fire Service",
    instrument: "Federal Fire Service Act / state fire safety regulations", citation: "Various",
    obligation: "Obtain Fire Safety Certificate annually; maintain firefighting equipment; conduct fire drills.",
    applicability: "Industrial, commercial and public premises.",
    evidence: "Fire safety certificate, extinguisher inspection cards, drill records.",
    frequency: "annual",
    penalty: "Fines, closure orders." },

  // ---- Environment ----
  { id: "ENV-NESREA", domain: "environment", jurisdiction: "Federal", regulator: "NESREA",
    instrument: "NESREA (Establishment) Act 2007 + sectoral regulations", citation: "s.7; s.27",
    obligation: "Comply with national environmental standards; obtain permits; submit periodic environmental audit reports.",
    applicability: "All facilities with environmental aspects (excluding upstream oil & gas).",
    evidence: "NESREA permits, environmental audit reports (every 3 years), monitoring records.",
    frequency: "biennial",
    penalty: "Fines up to ₦1m + ₦50,000/day; closure; criminal liability." },
  { id: "ENV-EIA", domain: "environment", jurisdiction: "Federal", regulator: "Federal Ministry of Environment",
    instrument: "Environmental Impact Assessment Act Cap E12 LFN 2004", citation: "s.2",
    obligation: "Carry out EIA before commencing any project listed in the mandatory study list and obtain EIA certificate.",
    applicability: "Projects with potential significant environmental impact.",
    evidence: "EIA report, public review records, EIA certificate, EMP.",
    frequency: "one_off",
    penalty: "Up to ₦100,000 + ₦50,000/day; project shutdown." },
  { id: "ENV-EFFL", domain: "environment", jurisdiction: "Federal", regulator: "NESREA",
    instrument: "National Environmental (Surface and Groundwater Quality Control) Regulations 2011", citation: "Reg.10",
    obligation: "Treat effluent to NESREA limits before discharge; maintain discharge permit and monitoring log.",
    applicability: "All discharging facilities.",
    evidence: "Permit, lab results, effluent treatment plant records.",
    frequency: "monthly",
    penalty: "Fines, permit revocation." },
  { id: "ENV-WASTE", domain: "environment", jurisdiction: "Federal", regulator: "NESREA",
    instrument: "National Environmental (Sanitation and Waste Control) Regulations 2009", citation: "Reg.41–43",
    obligation: "Segregate, store and dispose of hazardous and non-hazardous waste through licensed handlers; maintain waste manifests.",
    applicability: "All waste generators.",
    evidence: "Waste manifests, vendor licences, disposal certificates.",
    frequency: "ongoing",
    penalty: "Fines and prosecution." },
  { id: "ENV-CLIMATE", domain: "environment", jurisdiction: "Federal", regulator: "National Council on Climate Change",
    instrument: "Climate Change Act 2021", citation: "s.24",
    obligation: "Private entities with ≥ 50 employees designate a climate change officer and prepare an annual carbon emission reduction plan.",
    applicability: "Public and private entities ≥ 50 employees.",
    evidence: "Officer designation letter, carbon plan, GHG inventory, annual report.",
    frequency: "annual",
    penalty: "Administrative penalties to be prescribed by Council." },

  // ---- Data Protection & ICT ----
  { id: "DATA-NDPA", domain: "data", jurisdiction: "Federal", regulator: "Nigeria Data Protection Commission (NDPC)",
    instrument: "Nigeria Data Protection Act 2023", citation: "s.24; s.32; s.44",
    obligation: "Lawful basis for processing; appoint DPO if Data Controller of Major Importance; file annual compliance audit through DPCO.",
    applicability: "Any entity processing personal data of Nigerian residents.",
    evidence: "Privacy notice, ROPA, DPIA, DPO appointment, NDPC audit acknowledgement.",
    frequency: "annual",
    penalty: "Up to 2% of annual gross revenue or ₦10m (whichever is higher) for major data controllers." },
  { id: "DATA-NITDA", domain: "data", jurisdiction: "Federal", regulator: "NITDA",
    instrument: "NITDA Act 2007 + Guidelines", citation: "s.6",
    obligation: "Pay 1% NITDA levy on profit before tax for qualifying companies; comply with local content guidelines for IT projects.",
    applicability: "Banking, mobile telecoms, insurance, ICT, pension companies with turnover ≥ ₦100m.",
    evidence: "NITDA levy receipts; local content clearance.",
    frequency: "annual",
    penalty: "Recovery + interest; sanctions on contracts." },
  { id: "DATA-CYBER", domain: "data", jurisdiction: "Federal", regulator: "ONSA / FIRS",
    instrument: "Cybercrimes (Prohibition, Prevention etc.) Act 2015 (as amended 2024)", citation: "s.41; s.44A",
    obligation: "Implement cybersecurity controls; report cyber incidents to ngCERT; pay 0.5% cybersecurity levy where applicable.",
    applicability: "Designated critical infrastructure operators (banking, telecoms, ISPs, etc.).",
    evidence: "Incident response plan, ngCERT reports, levy receipts.",
    frequency: "ongoing",
    penalty: "Up to ₦2m fines + criminal liability." },

  // ---- Consumer & Product ----
  { id: "CON-FCCPA", domain: "consumer", jurisdiction: "Federal", regulator: "FCCPC",
    instrument: "Federal Competition and Consumer Protection Act 2018", citation: "s.114–124",
    obligation: "Deal fairly with consumers; do not engage in misleading conduct; honour warranties; cooperate with FCCPC investigations.",
    applicability: "All undertakings supplying goods/services in Nigeria.",
    evidence: "Consumer complaints log, T&Cs, warranties, recall procedures.",
    frequency: "ongoing",
    penalty: "Up to 10% of preceding year turnover." },
  { id: "CON-NAFDAC", domain: "consumer", jurisdiction: "Federal", regulator: "NAFDAC",
    instrument: "NAFDAC Act + Pre-Packaged Food, Cosmetics, Drugs Regulations", citation: "Various",
    obligation: "Register regulated products; comply with GMP; label per NAFDAC requirements; cooperate with audits.",
    applicability: "Manufacturers, importers and distributors of food, drugs, cosmetics, medical devices, water, chemicals.",
    evidence: "NAFDAC registration numbers, GMP certificates, batch records, label artwork approvals.",
    frequency: "ongoing",
    penalty: "Product seizure, fines, prosecution; up to ₦500,000 + 5 years." },
  { id: "CON-SON", domain: "consumer", jurisdiction: "Federal", regulator: "Standards Organisation of Nigeria",
    instrument: "Standards Organisation of Nigeria Act 2015", citation: "s.5; s.21",
    obligation: "Comply with relevant Nigeria Industrial Standards; obtain MANCAP/SONCAP certificates for regulated products.",
    applicability: "Manufacturers and importers of standardised products.",
    evidence: "MANCAP/SONCAP certificates; NIS conformity reports.",
    frequency: "biennial",
    penalty: "Seizure, destruction of goods, fines up to ₦5m." },

  // ---- Sector regulators (cross-sector samples) ----
  { id: "SEC-NCC", domain: "sector", jurisdiction: "Federal", regulator: "Nigerian Communications Commission",
    instrument: "Nigerian Communications Act 2003", citation: "s.31",
    obligation: "Hold valid telecoms/VAS licence; pay annual operating levy; submit periodic returns.",
    applicability: "Telecoms operators, ISPs, VAS providers.",
    evidence: "NCC licence, ALOL receipts, returns acknowledgements.",
    frequency: "annual",
    penalty: "Licence suspension/revocation; administrative fines." },
  { id: "SEC-NERC", domain: "sector", jurisdiction: "Federal", regulator: "NERC",
    instrument: "Electricity Act 2023", citation: "Part IV",
    obligation: "Hold appropriate generation/distribution/captive licence; comply with Grid Code and metering rules.",
    applicability: "Electricity sector participants and captive generators > 1MW.",
    evidence: "NERC licence/permit, technical reports, tariff filings.",
    frequency: "annual",
    penalty: "Fines, licence revocation." },
  { id: "SEC-NUPRC", domain: "sector", jurisdiction: "Federal", regulator: "NUPRC / NMDPRA",
    instrument: "Petroleum Industry Act 2021", citation: "Various",
    obligation: "Hold relevant upstream/midstream/downstream licences; comply with HSE, gas flare and host community provisions.",
    applicability: "Oil & gas operators and service providers.",
    evidence: "Licences/permits, HCDT plans, flare reports.",
    frequency: "annual",
    penalty: "Royalty/penalty payments; licence revocation." },
  { id: "SEC-NIMASA", domain: "sector", jurisdiction: "Federal", regulator: "NIMASA",
    instrument: "NIMASA Act 2007 + Cabotage Act 2003", citation: "s.15; s.42",
    obligation: "Pay 3% NIMASA levy on contracts performed in Nigerian waters; comply with cabotage and ISPS.",
    applicability: "Shipping, logistics and offshore service operators.",
    evidence: "Levy receipts, cabotage waivers, ISPS certificates.",
    frequency: "ongoing",
    penalty: "Detention of vessels, fines, criminal liability." },
  { id: "SEC-CBN", domain: "sector", jurisdiction: "Federal", regulator: "Central Bank of Nigeria",
    instrument: "BOFIA 2020 + CBN AML/CFT Regulations", citation: "Part XIII",
    obligation: "Comply with prudential, KYC, AML/CFT and forex reporting obligations.",
    applicability: "Banks, OFIs, payment service providers, BDCs.",
    evidence: "CBN licence, returns, AML programme, audit reports.",
    frequency: "monthly",
    penalty: "Substantial fines, licence revocation." },

  // ---- Anti-corruption & AML ----
  { id: "AC-EFCC", domain: "anti_corruption", jurisdiction: "Federal", regulator: "EFCC / SCUML",
    instrument: "Money Laundering (Prevention and Prohibition) Act 2022", citation: "s.6; s.10; s.14",
    obligation: "Register DNFBPs with SCUML; conduct customer due diligence; report cash transactions ≥ USD10,000 equivalent and suspicious transactions.",
    applicability: "DNFBPs (real estate, dealers in precious metals, accountants, lawyers, NGOs, automobile dealers, etc.) and financial institutions.",
    evidence: "SCUML certificate, KYC files, CTR/STR filings on goAML.",
    frequency: "ongoing",
    penalty: "Fines up to ₦25m + 5 years imprisonment for officers." },
  { id: "AC-ICPC", domain: "anti_corruption", jurisdiction: "Federal", regulator: "ICPC",
    instrument: "Corrupt Practices and Other Related Offences Act 2000", citation: "s.8–17",
    obligation: "Prohibit bribery, kickbacks and conflicts of interest; maintain anti-bribery policy and gift register.",
    applicability: "All persons and corporate bodies in Nigeria.",
    evidence: "ABC policy, training records, gift & hospitality register, third-party due diligence.",
    frequency: "ongoing",
    penalty: "Up to 7 years imprisonment for individuals; corporate liability." },

  // ---- Immigration & Expatriate ----
  { id: "IMM-EXP", domain: "immigration", jurisdiction: "Federal", regulator: "Federal Ministry of Interior / NIS",
    instrument: "Immigration Act 2015 + Expatriate Quota Regulations", citation: "s.36; s.38",
    obligation: "Obtain expatriate quota and CERPAC for foreign workers; file monthly expatriate returns to NIS.",
    applicability: "Companies employing expatriates.",
    evidence: "Quota approval letter, CERPAC cards, monthly returns.",
    frequency: "monthly",
    penalty: "Fines up to ₦3m per offence; deportation; quota revocation." },
  { id: "IMM-LCN", domain: "immigration", jurisdiction: "Federal", regulator: "Federal Ministry of Interior",
    instrument: "Companies Regulations 2021", citation: "Reg.36",
    obligation: "Foreign-participation companies obtain Business Permit before commencing business.",
    applicability: "Companies with foreign shareholding.",
    evidence: "Business Permit certificate.",
    frequency: "one_off",
    penalty: "Operational shutdown; fines." },
];

export const DOMAIN_ORDER: LegalDomain[] = [
  "corporate","tax","labour","hse","environment","data","consumer","sector","anti_corruption","immigration",
];

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  one_off: "One-off",
  monthly: "Monthly",
  quarterly: "Quarterly",
  biannual: "Bi-annual",
  annual: "Annual",
  biennial: "Every 2 years",
  ongoing: "Continuous",
};
