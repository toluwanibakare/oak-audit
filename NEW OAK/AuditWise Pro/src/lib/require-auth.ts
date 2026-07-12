import { redirect } from "@tanstack/react-router";

export function requireAuth() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("oa_token");
  if (!token) throw redirect({ to: "/auth" });
}
