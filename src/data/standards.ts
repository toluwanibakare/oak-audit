// Unified accessor across ISO 9001 / 45001 / 14001 process audit data.
import {
  PROCESSES,
  getQuestionsForProcess,
  type ProcessKey,
  type ClauseQuestionSet,
} from "./processAudit";
import {
  PROCESSES_45001,
  getQuestionsForProcess45001,
} from "./processAudit45001";
import {
  PROCESSES_14001,
  getQuestionsForProcess14001,
} from "./processAudit14001";
import {
  HSE_PROCESSES,
  getQuestionsForHseProcess,
  type HseProcessKey,
} from "./standardsHse";
import {
  IMS_PROCESSES,
  getQuestionsForImsProcess,
  type ImsProcessKey,
} from "./standardsIms";

export type StandardKey = "9001" | "45001" | "14001" | "ims" | "hse";

export type StandardMeta = {
  key: StandardKey;
  code: string;
  name: string;
  tagline: string;
  storageKey: string;
};

export const STANDARDS: StandardMeta[] = [
  { key: "9001",  code: "ISO 9001:2015",  name: "Quality",      tagline: "Quality Management System",      storageKey: "conformia-process-audit-v2" },
  { key: "45001", code: "ISO 45001:2018", name: "OH&S",         tagline: "Occupational Health & Safety",   storageKey: "conformia-process-audit-45001-v1" },
  { key: "14001", code: "ISO 14001:2015", name: "Environment",  tagline: "Environmental Management System",storageKey: "conformia-process-audit-14001-v1" },
  { key: "ims",   code: "IMS (9001 + 14001 + 45001)", name: "IMS", tagline: "Integrated Management System", storageKey: "conformia-process-audit-ims-v1" },
  { key: "hse",   code: "HSE Site Inspection", name: "HSE Site Inspection", tagline: "Health, Safety & Environment Site Inspection", storageKey: "conformia-process-audit-hse-v1" },
];

export type AnyProcessKey = ProcessKey | HseProcessKey | ImsProcessKey;

export function getStandard(key: StandardKey): StandardMeta {
  return STANDARDS.find((s) => s.key === key) ?? STANDARDS[0];
}

export function getProcessesFor(std: StandardKey) {
  if (std === "45001") return PROCESSES_45001;
  if (std === "14001") return PROCESSES_14001;
  if (std === "hse") return HSE_PROCESSES;
  if (std === "ims") return IMS_PROCESSES;
  return PROCESSES;
}

export function normalizeProcessKey(key: string): string {
  const clean = key.toLowerCase().replace(/^(hse|ims)_/, "").replace(/__/, "_");
  if (clean === "engineering_design" || clean === "engineering_design") return "engineering";
  if (clean === "finance_accounts" || clean === "finance__accounts" || clean === "finance_accounts") return "finance";
  if (clean === "qa_qc" || clean === "qaqc") return "qaqc";
  if (clean === "qms_quality_management" || clean === "qms_quality_management") return "qms";
  if (clean === "human_resources") return "hr";
  if (clean === "ict_it" || clean === "ict_it") return "ict";
  if (clean === "production_manufacturing" || clean === "production_manufacturing") return "production";
  if (clean === "administration") return "admin";
  return clean;
}

export function isProcessInStandard(std: StandardKey, key: string): boolean {
  if (key.startsWith("custom_")) return true;
  const procs = getProcessesFor(std);
  const normalizedKey = normalizeProcessKey(key);
  return procs.some((p) => normalizeProcessKey(p.key) === normalizedKey);
}

export function getQuestionsFor(std: StandardKey, proc: AnyProcessKey): ClauseQuestionSet[] {
  const normKey = normalizeProcessKey(proc);
  if (std === "45001") return getQuestionsForProcess45001(normKey as never) as unknown as ClauseQuestionSet[];
  if (std === "14001") return getQuestionsForProcess14001(normKey as never) as unknown as ClauseQuestionSet[];
  if (std === "hse") {
    const matchingHseProc = HSE_PROCESSES.find(p => normalizeProcessKey(p.key) === normKey);
    const res = getQuestionsForHseProcess((matchingHseProc?.key ?? proc) as HseProcessKey);
    if (res && res.length > 0) return res;
    return getQuestionsForHse(proc);
  }
  if (std === "ims") {
    const matchingImsProc = IMS_PROCESSES.find(p => normalizeProcessKey(p.key) === normKey);
    const res = getQuestionsForImsProcess((matchingImsProc?.key ?? proc) as ImsProcessKey);
    if (res && res.length > 0) return res;
    return getQuestionsForIms(proc);
  }
  return getQuestionsForProcess(normKey as ProcessKey);
}


// IMS = union of 9001 + 14001 + 45001 question sets per process,
// merged by clause. Each question is tagged with its source standard so
// the auditor knows which control they're evaluating.
function tag(qs: string[] | undefined, std: string): string[] {
  return (qs ?? []).map((q) => `[${std}] ${q}`);
}

function getQuestionsForIms(proc: AnyProcessKey): ClauseQuestionSet[] {
  const q9 = getQuestionsForProcess(proc) ?? [];
  const q14 = (getQuestionsForProcess14001(proc as never) as unknown as ClauseQuestionSet[]) ?? [];
  const q45 = (getQuestionsForProcess45001(proc as never) as unknown as ClauseQuestionSet[]) ?? [];

  const byClause = new Map<string, ClauseQuestionSet>();
  const add = (sets: ClauseQuestionSet[], std: "9001" | "14001" | "45001") => {
    for (const s of sets) {
      const existing = byClause.get(s.clause);
      if (!existing) {
        byClause.set(s.clause, {
          clause: s.clause,
          title: s.title,
          generic: tag(s.generic, std),
          specific: tag(s.specific, std),
          evidence: tag(s.evidence, std),
        });
      } else {
        existing.generic = [...existing.generic, ...tag(s.generic, std)];
        existing.specific = [...existing.specific, ...tag(s.specific, std)];
        existing.evidence = [...existing.evidence, ...tag(s.evidence, std)];
      }
    }
  };
  add(q9, "9001");
  add(q14, "14001");
  add(q45, "45001");

  const clauseSort = (a: string) => a.split(".").map((n) => parseInt(n, 10) || 0);
  return Array.from(byClause.values()).sort((a, b) => {
    const A = clauseSort(a.clause), B = clauseSort(b.clause);
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      const x = A[i] ?? 0, y = B[i] ?? 0;
      if (x !== y) return x - y;
    }
    return 0;
  });
}

function getQuestionsForHse(proc: AnyProcessKey): ClauseQuestionSet[] {
  const q14 = (getQuestionsForProcess14001(proc as never) as unknown as ClauseQuestionSet[]) ?? [];
  const q45 = (getQuestionsForProcess45001(proc as never) as unknown as ClauseQuestionSet[]) ?? [];

  const byClause = new Map<string, ClauseQuestionSet>();
  const add = (sets: ClauseQuestionSet[], std: "14001" | "45001") => {
    for (const s of sets) {
      const existing = byClause.get(s.clause);
      if (!existing) {
        byClause.set(s.clause, {
          clause: s.clause,
          title: s.title,
          generic: tag(s.generic, std),
          specific: tag(s.specific, std),
          evidence: tag(s.evidence, std),
        });
      } else {
        existing.generic = [...existing.generic, ...tag(s.generic, std)];
        existing.specific = [...existing.specific, ...tag(s.specific, std)];
        existing.evidence = [...existing.evidence, ...tag(s.evidence, std)];
      }
    }
  };
  add(q14, "14001");
  add(q45, "45001");

  const clauseSort = (a: string) => a.split(".").map((n) => parseInt(n, 10) || 0);
  return Array.from(byClause.values()).sort((a, b) => {
    const A = clauseSort(a.clause), B = clauseSort(b.clause);
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      const x = A[i] ?? 0, y = B[i] ?? 0;
      if (x !== y) return x - y;
    }
    return 0;
  });
}
