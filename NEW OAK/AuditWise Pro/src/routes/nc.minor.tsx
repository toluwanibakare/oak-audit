import { createFileRoute } from "@tanstack/react-router";
import { makeNcPage } from "./nc.major";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/nc/minor")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Minor NC — AuditOS" }] }),
  component: makeNcPage("Minor", "04 · MINOR NC", "Minor Nonconformities"),
});
