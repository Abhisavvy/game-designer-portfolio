import type { Metadata } from "next";
import { ResumePageContent } from "@/features/portfolio/components/ResumePageContent";

export const metadata: Metadata = {
  title: "Resume - Abhishek Dutta",
  description: "Systems & Feature Designer specializing in LiveOps, retention mechanics, and mobile game design.",
};

export default function ResumePage() {
  return <ResumePageContent />;
}