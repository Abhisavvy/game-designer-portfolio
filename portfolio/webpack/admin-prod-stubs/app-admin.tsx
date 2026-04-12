import { notFound } from "next/navigation";

/** Production build: dev-only admin App Router surface resolves here instead of real sources. */
export default function AdminSurfaceOmitted() {
  notFound();
}
