import apiClient from "./client";

export interface InitiatePayload {
  org_id: string;
  pack: string;
  user_count?: number;
  email: string;
  audit_title: string;
  audit_criteria?: string | null;
  audit_scope?: string | null;
  audit_object?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  audit_owner?: string | null;
  auditee_name: string;
  auditee_email: string;
  lead_auditor_id?: string | null;
}

export interface InitiateResponse {
  authorization_url: string;
  reference: string;
}

export interface VerifyResponse {
  ok: boolean;
  audit_id?: string;
  message?: string;
  error?: string;
}

export const paystackApi = {
  initiate: (payload: InitiatePayload) =>
    apiClient.post<InitiateResponse>("/paystack/initiate", payload).then((r) => r.data),

  verify: (reference: string) =>
    apiClient.post<VerifyResponse>("/paystack/verify", { reference }).then((r) => r.data),
};
