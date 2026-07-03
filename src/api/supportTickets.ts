import apiClient from "./client";

export interface TicketPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
  org_id?: string | null;
  user_id?: string | null;
}

export interface SupportTicket {
  id: string;
  org_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export const supportTicketsApi = {
  submit: (payload: TicketPayload) =>
    apiClient.post<{ message: string; id: string }>("/support-tickets", payload).then((r) => r.data),

  list: () =>
    apiClient.get<SupportTicket[]>("/support-tickets").then((r) => r.data),
};
