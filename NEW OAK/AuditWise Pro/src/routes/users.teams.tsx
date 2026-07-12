import { createFileRoute, Navigate } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/users/teams")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Team — OakAudix" }] }),
  component: () => <Navigate to="/users/all" />,
});
