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

export type StandardKey = "9001" | "45001" | "14001" | "ims";

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
];

// All three standards share the same 18 process keys (same labels too — minor
// scope-text differences are acceptable; we use 9001 PROCESSES as the master list).
export type AnyProcessKey = ProcessKey;

export function getStandard(key: StandardKey): StandardMeta {
  return STANDARDS.find((s) => s.key === key) ?? STANDARDS[0];
}

export function getProcessesFor(std: StandardKey) {
  if (std === "45001") return PROCESSES_45001;
  if (std === "14001") return PROCESSES_14001;
  return PROCESSES;
}

export function getQuestionsFor(std: StandardKey, proc: AnyProcessKey): ClauseQuestionSet[] {
  if (std === "45001") return getQuestionsForProcess45001(proc as never) as unknown as ClauseQuestionSet[];
  if (std === "14001") return getQuestionsForProcess14001(proc as never) as unknown as ClauseQuestionSet[];
  if (std === "ims") return getQuestionsForIms(proc);
  return getQuestionsForProcess(proc);
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
