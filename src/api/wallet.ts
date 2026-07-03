import apiClient from "./client";

export interface CreditWallet {
  org_id: string;
  balance: number;
}

export interface CreditTransaction {
  id: string;
  org_id: string;
  kind: string;
  credits: number;
  naira_amount: number | null;
  pack: string | null;
  reference: string | null;
  created_at: string;
}

export interface AuditLicense {
  id: string;
  org_id: string;
  pack: string;
  paid_amount_ngn: number;
  paystack_ref: string | null;
  active: boolean;
  purchased_at: string | null;
  expires_at: string | null;
}

export const walletApi = {
  get: (orgId: string) =>
    apiClient.get<CreditWallet>(`/organizations/${orgId}/wallet`).then((r) => r.data),

  transactions: (orgId: string) =>
    apiClient.get<CreditTransaction[]>(`/organizations/${orgId}/transactions`).then((r) => r.data),

  licenses: (orgId: string) =>
    apiClient.get<AuditLicense[]>(`/organizations/${orgId}/licenses`).then((r) => r.data),
};
