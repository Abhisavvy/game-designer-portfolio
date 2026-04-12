import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Production stub for template modules under `src/app/admin/` (`template.tsx`, …).
 */
export default function AdminTemplateOmitted({
  children: _children,
}: {
  children: ReactNode;
}) {
  notFound();
}
