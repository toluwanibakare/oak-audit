import { PACK_TIER_PRICES } from "./pricing";

export type PackCode = "9001" | "14001" | "45001" | "27001" | "hse" | "ims";

export type Pack = {
  code: PackCode;
  label: string;
  description: string;
  /** The starting (lowest-tier) price, used for display only */
  basePrice: number;
  standards: string[];
  /** Audits covered (for display) */
  auditsIncluded: string[];
};

export const PACKS: Pack[] = [
  {
    code: "9001",
    label: "ISO 9001",
    description: "Quality Management System",
    basePrice: PACK_TIER_PRICES["9001"]["1-5"],
    standards: ["9001"],
    auditsIncluded: ["ISO 9001:2015 Internal Audit"],
  },
  {
    code: "14001",
    label: "ISO 14001",
    description: "Environmental Management System",
    basePrice: PACK_TIER_PRICES["14001"]["1-5"],
    standards: ["14001"],
    auditsIncluded: ["ISO 14001:2015 Internal Audit"],
  },
  {
    code: "45001",
    label: "ISO 45001",
    description: "Occupational Health & Safety",
    basePrice: PACK_TIER_PRICES["45001"]["1-5"],
    standards: ["45001"],
    auditsIncluded: ["ISO 45001:2018 Internal Audit"],
  },
  {
    code: "27001",
    label: "ISO 27001",
    description: "Information Security Management",
    basePrice: PACK_TIER_PRICES["27001"]["1-5"],
    standards: ["27001"],
    auditsIncluded: ["ISO 27001:2022 Internal Audit"],
  },
  {
    code: "hse",
    label: "HSE Bundle",
    description: "Health, Safety & Environment",
    basePrice: PACK_TIER_PRICES["hse"]["1-5"],
    standards: ["14001", "45001"],
    auditsIncluded: ["ISO 14001:2015 Internal Audit", "ISO 45001:2018 Internal Audit"],
  },
  {
    code: "ims",
    label: "IMS Bundle",
    description: "Integrated Management System",
    basePrice: PACK_TIER_PRICES["ims"]["1-5"],
    standards: ["9001", "14001", "45001"],
    auditsIncluded: [
      "ISO 9001:2015 Internal Audit",
      "ISO 14001:2015 Internal Audit",
      "ISO 45001:2018 Internal Audit",
    ],
  },
];

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function packGrantsStandard(pack: PackCode, std: string): boolean {
  const p = PACKS.find((x) => x.code === pack);
  return !!p && p.standards.includes(std);
}