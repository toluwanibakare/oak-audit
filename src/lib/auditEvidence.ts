export type EvidenceItem = {
  name: string;
  url: string;
  kind?: string;
};

const EVIDENCE_MARKER = "\n[[OAK_EVIDENCE]]";

export function parseAuditNote(raw: string | null | undefined) {
  if (!raw) return { text: "", evidence: [] as EvidenceItem[] };

  const markerIndex = raw.indexOf(EVIDENCE_MARKER);
  if (markerIndex === -1) {
    return { text: raw, evidence: [] as EvidenceItem[] };
  }

  const text = raw.slice(0, markerIndex).trimEnd();
  const evidenceRaw = raw.slice(markerIndex + EVIDENCE_MARKER.length).trim();

  try {
    const evidence = JSON.parse(evidenceRaw) as EvidenceItem[];
    return { text, evidence: Array.isArray(evidence) ? evidence : [] };
  } catch {
    return { text: raw, evidence: [] as EvidenceItem[] };
  }
}

export function serializeAuditNote(text: string, evidence: EvidenceItem[]) {
  const cleanText = text.trim();
  if (!evidence.length) return cleanText;
  return `${cleanText}${EVIDENCE_MARKER}${JSON.stringify(evidence)}`;
}

export function safeEvidenceName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}
