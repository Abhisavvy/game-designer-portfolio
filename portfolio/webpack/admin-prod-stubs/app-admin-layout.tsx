import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Production stub for layout modules under `src/app/admin/` (`layout.tsx`, …).
 * Admin layout trees are omitted; any matched segment returns 404.
 */
export default function AdminLayoutOmitted({
  children: _children,
}: {
  children: ReactNode;
}) {
  notFound();
}
