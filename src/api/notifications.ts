import apiClient from "./client";

export const notificationsApi = {
  sendEmail: (to: string, subject: string, html: string) =>
    apiClient.post("/notifications/send-email", { to, subject, html }).then((r) => r.data),
};
