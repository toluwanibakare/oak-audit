import apiClient from "./client";

export interface KpiItem {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}

export interface ChartPeriod {
  conducted: number[];
  completed: number[];
  labels: string[];
}

export interface ChartData {
  ytd: ChartPeriod;
}

export interface SeverityItem {
  label: string;
  value: number;
  color: string;
}

export interface ComplianceItem {
  standard: string;
  score: number;
}

export interface TopFinding {
  clause: string;
  title: string;
  count: number;
}

export interface UpcomingAudit {
  id: string;
  name: string;
  dept: string;
  date: string;
  lead: string;
  status: string;
}

export interface ActivityItem {
  text: string;
  who: string;
  when: string;
}

export interface DashboardData {
  kpis: KpiItem[];
  chartData: ChartData;
  findingsBySeverity: SeverityItem[];
  findingsByDept: [string, number][];
  complianceByStandard: ComplianceItem[];
  topFindings: TopFinding[];
  riskHeatmap: number[][];
  upcomingAudits: UpcomingAudit[];
  recentActivity: ActivityItem[];
}

export const dashboardApi = {
  get: (orgId: string) =>
    apiClient.get<DashboardData>(`/organizations/${orgId}/dashboard`).then((r) => r.data),
};
