// OakAudix workflow engine — types

export type AuditType =
  | "Internal" | "Supplier" | "HSE" | "Quality" | "Environmental"
  | "Information Security" | "Integrated" | "Operational" | "Compliance" | "Regulatory";

export type Standard =
  | "ISO 9001" | "ISO 14001" | "ISO 45001" | "ISO 27001" | "ISO 37301"
  | "ISO 19011" | "Custom Standard";

export type StageId =
  | "programme" | "scheduling" | "checklist" | "inspection"
  | "findings" | "capa" | "verification" | "closure" | "history";

export type StageStatus =
  | "Draft" | "Pending Approval" | "Approved" | "Rejected"
  | "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "Locked";

export type Role =
  | "Administrator" | "Audit Manager" | "Lead Auditor" | "Auditor"
  | "Reviewer" | "Department Head" | "CAPA Owner" | "Executive" | "Read Only";

export type Permission = "view" | "create" | "edit" | "approve" | "close" | "delete" | "export";

export type RiskPriority = "Low" | "Medium" | "High" | "Critical";

export type FindingCategory =
  | "Major NC" | "Minor NC" | "Observation" | "Opportunity for Improvement" | "Positive Practice";

export type CAPAStatus =
  | "Open" | "In Progress" | "Awaiting Review" | "Overdue" | "Verified" | "Closed";

export type QuestionType =
  | "yes_no" | "pass_fail" | "rating" | "dropdown" | "text" | "photo"
  | "video" | "gps" | "barcode" | "qr" | "date" | "number" | "file";

export interface ChecklistQuestion {
  id: string;
  clause?: string;
  text: string;
  type: QuestionType;
  mandatory?: boolean;
  photoRequired?: boolean;
  evidenceRequired?: boolean;
  options?: string[];
}

export interface Evidence {
  id: string;
  name: string;
  mime: string;
  dataUrl?: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Finding {
  id: string;
  auditRef: string;
  clause?: string;
  requirement?: string;
  description: string;
  category: FindingCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  probability: 1 | 2 | 3 | 4 | 5;
  impact?: string;
  evidence: Evidence[];
  rootCause?: string;
  owner: string;
  targetDate: string;
  createdAt: string;
  createdBy: string;
  locked?: boolean;
}

export interface CAPA {
  id: string;
  findingId: string;
  owner: string;
  department?: string;
  dueDate: string;
  priority: RiskPriority;
  rootCause?: string;
  correctiveAction: string;
  preventiveAction?: string;
  verificationRequired: boolean;
  approvalRequired: boolean;
  completionPct: number;
  status: CAPAStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationComments?: string;
  effectivenessConfirmed?: boolean;
  createdAt: string;
}

export interface InspectionResponse {
  questionId: string;
  value: string | number | boolean | null;
  notes?: string;
  evidence?: Evidence[];
  gps?: { lat: number; lng: number };
  timestamp?: string;
}

export interface ScheduleSlot {
  start: string;
  end: string;
  assignees: string[];
  location?: string;
  reminders: number[]; // days before
}

export interface AuditTrailEntry {
  id: string;
  at: string;
  actor: string;
  role: Role;
  action: string;
  stage?: StageId;
  target?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ip?: string;
  device?: string;
}

export interface AppNotification {
  id: string;
  at: string;
  channel: "in_app" | "email" | "sms" | "teams" | "slack";
  to: string;
  subject: string;
  body: string;
  read?: boolean;
  audit?: string;
  stage?: StageId;
}

export interface StageState {
  id: StageId;
  status: StageStatus;
  completion: number;
  responsible?: string;
  dueDate?: string;
  approvalStatus?: "Not Required" | "Pending" | "Approved" | "Rejected";
  approvers?: string[];
  approvedBy?: string;
  approvedAt?: string;
  comments: Array<{ id: string; by: string; at: string; text: string }>;
  evidenceCount: number;
  notificationsSent: number;
}

export interface AuditProgramme {
  id: string;
  code: string;
  title: string;
  type: AuditType;
  standards: Standard[];
  site: string;
  department: string;
  objectives: string;
  scope: string;
  criteria: string;
  leadAuditor: string;
  teamMembers: string[];
  approvers: string[];
  riskPriority: RiskPriority;
  targetDate: string;
  estimatedDurationDays: number;
  createdBy: string;
  createdAt: string;

  stages: Record<StageId, StageState>;
  currentStage: StageId;

  schedule?: ScheduleSlot;
  checklist: ChecklistQuestion[];
  inspection: InspectionResponse[];
  findings: Finding[];
  capas: CAPA[];
  reportSummary?: string;
  closureNotes?: string;
  closedAt?: string;
}

export interface StageConfig {
  id: StageId;
  label: string;
  shortLabel: string;
  requiresApproval: boolean;
  approverRoles: Role[];
  notifyRoles: Role[];
  entryCriteria: (a: AuditProgramme) => { ok: boolean; reason?: string };
}

export type RBACMatrix = Record<Role, Record<StageId, Permission[]>>;
