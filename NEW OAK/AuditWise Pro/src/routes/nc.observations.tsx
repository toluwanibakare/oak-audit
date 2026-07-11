import { createFileRoute } from "@tanstack/react-router";
import { makeNcPage } from "./nc.major";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/nc/observations")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Observations — AuditOS" }] }),
  component: makeNcPage("Observation", "04 · OBSERVATIONS", "Observations"),
});
