import { createFileRoute } from "@tanstack/react-router";
import { makeNcPage } from "./nc.major";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/nc/ofi")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "OFI — AuditOS" }] }),
  component: makeNcPage("OFI", "04 · OFI", "Opportunities for Improvement"),
});
