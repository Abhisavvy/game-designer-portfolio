import type { Metadata } from "next";
import { ResumePageContent } from "@/features/portfolio/components/ResumePageContent";
import { resumeData, getFirstSentence } from "@/features/portfolio/components/resume/resumeData";

export const metadata: Metadata = {
  title: "Resume — Abhishek Dutta",
  description: getFirstSentence(resumeData.summary),
};

export default function ResumePage() {
  return <ResumePageContent />;
}
