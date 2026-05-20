export type PackCode = "9001" | "14001" | "45001" | "27001" | "hse" | "ims";

export const PACKS: { code: PackCode; label: string; description: string; price: number; standards: string[] }[] = [
  { code: "9001",  label: "ISO 9001 Quality",        description: "Quality Management",       price: 4500, standards: ["9001"] },
  { code: "14001", label: "ISO 14001 Environment",   description: "Environmental Management", price: 4500, standards: ["14001"] },
  { code: "45001", label: "ISO 45001 OH&S",          description: "Occupational Health & Safety", price: 4500, standards: ["45001"] },
  { code: "27001", label: "ISO 27001 InfoSec",       description: "Information Security",     price: 4500, standards: ["27001"] },
  { code: "hse",   label: "HSE Bundle",              description: "14001 + 45001 combined",   price: 5900, standards: ["14001", "45001"] },
  { code: "ims",   label: "IMS Bundle",              description: "9001 + 14001 + 45001 + 27001 cross-mapped", price: 15000, standards: ["9001", "14001", "45001", "27001"] },
];

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function packGrantsStandard(pack: PackCode, std: string): boolean {
  const p = PACKS.find((x) => x.code === pack);
  return !!p && p.standards.includes(std);
}