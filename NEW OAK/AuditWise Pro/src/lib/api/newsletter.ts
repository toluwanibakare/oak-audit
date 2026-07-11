import apiClient from "./client";

export interface SubscribePayload {
  email: string;
  source?: "signup" | "landing";
}

export const newsletterApi = {
  subscribe: (payload: SubscribePayload) =>
    apiClient.post<{ message: string }>("/newsletter/subscribe", payload).then((r) => r.data),
};
