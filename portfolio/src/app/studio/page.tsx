import type { Metadata } from "next";
import { StudioHub } from "@/features/portfolio/components/StudioHub";

export const metadata: Metadata = {
  title: "Studio — CV & portfolio",
  description:
    "Build a new CV and edit your portfolio in the browser. Export JSON for Reactive Resume and portfolio backup.",
};

export default function StudioPage() {
  return <StudioHub />;
}
