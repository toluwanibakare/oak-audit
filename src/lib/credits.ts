import type { PackCode } from "./packs";

// 1 credit = ₦5,000 (configurable here, also mirrored in DB function spend_credits_for_pack)
export const NAIRA_PER_CREDIT = 5000;

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export type TopupBundle = { credits: number; popular?: boolean };
export const TOPUP_BUNDLES: TopupBundle[] = [
  { credits: 1 },
  { credits: 3, popular: true },
  { credits: 5 },
  { credits: 10 },
];

// Cost in credits for each audit pack (mirrors DB function)
export const PACK_CREDIT_COST: Record<PackCode, number> = {
  "9001": 1,
  "14001": 1,
  "45001": 1,
  "27001": 1,
  "hse": 2,
  "ims": 3,
};

// Client pack codes -> RPC pack keys used by spend_credits_for_pack
export const PACK_RPC_KEY: Record<PackCode, string> = {
  "9001": "iso9001",
  "14001": "iso14001",
  "45001": "iso45001",
  "27001": "iso27001",
  "hse": "hse",
  "ims": "ims",
};
