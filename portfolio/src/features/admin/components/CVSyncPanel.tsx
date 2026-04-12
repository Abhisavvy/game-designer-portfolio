"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ClipboardCopy,
  Download,
  FileText,
} from "lucide-react";

import type {
  CVBullet,
  CVBulletFormat,
  ConsistencyIssue,
  ConsistencyIssueSeverity,
} from "@/features/admin/types/admin";

export interface GroupedConsistencyIssues {
  high: ConsistencyIssue[];
  medium: ConsistencyIssue[];
  low: ConsistencyIssue[];
}

export interface ConsistencyValidationResponse {
  issues: GroupedConsistencyIssues;
  totalIssues: number;
  projectsChecked: number;
  summary: {
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
  };
}

type BulletFocus = "impact" | "technical" | "leadership" | "process";

interface CVSyncPanelProps {
  projectSlugs: string[];
  onBulletsGenerated?: (bullets: CVBullet[]) => void;
  onIssuesFound?: (issues: ConsistencyIssue[]) => void;
}

export function CVSyncPanel({
  projectSlugs,
  onBulletsGenerated,
  onIssuesFound,
}: CVSyncPanelProps) {
  const [format, setFormat] = useState<CVBulletFormat>("standard");
  const [focusArea, setFocusArea] = useState<BulletFocus>("impact");
  const [bullets, setBullets] = useState<CVBullet[]>([]);
  const [issues, setIssues] = useState<ConsistencyValidationResponse | null>(
    null,
  );
  const [cvJsonText, setCvJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "validate">(
    "generate",
  );

  const generateBullets = async () => {
    setError(null);
    try {
      setLoading(true);
      const response = await fetch("/api/admin/cv-sync/generate-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlugs,
          format,
          focusArea,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to generate bullets",
        );
        return;
      }

      setBullets(data.bullets as CVBullet[]);
      onBulletsGenerated?.(data.bullets);
    } catch (e) {
      console.error(e);
      setError("Failed to generate bullets");
    } finally {
      setLoading(false);
    }
  };

  const validateConsistency = async () => {
    setError(null);
    let cvData: unknown = undefined;
    const trimmed = cvJsonText.trim();
    if (trimmed.length > 0) {
      try {
        cvData = JSON.parse(trimmed) as unknown;
      } catch {
        setError("CV JSON is invalid — fix JSON syntax or clear the field.");
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/cv-sync/validate-consistency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlugs,
          cvData,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | ConsistencyValidationResponse
        | { error?: string };

      if (!response.ok || !("issues" in data)) {
        setError(
          typeof (data as { error?: string }).error === "string"
            ? (data as { error: string }).error
            : "Failed to validate consistency",
        );
        return;
      }

      setIssues(data);
      const flat = [
        ...data.issues.high,
        ...data.issues.medium,
        ...data.issues.low,
      ];
      onIssuesFound?.(flat);
    } catch (e) {
      console.error(e);
      setError("Failed to validate consistency");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  const exportBullets = () => {
    const bulletText = bullets.map((b) => `• ${b.content}`).join("\n");
    const blob = new Blob([bulletText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-bullets-${format}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityOrder: ConsistencyIssueSeverity[] = ["high", "medium", "low"];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      <div className="border-b border-gray-200 p-6">
        <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
          <FileText size={20} aria-hidden />
          <span>CV synchronization</span>
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Generate CV bullets from portfolio case studies and check glossary /
          metric alignment with a Reactive Resume JSON paste.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="CV sync tabs">
          <button
            type="button"
            onClick={() => setActiveTab("generate")}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "generate"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Generate bullets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("validate")}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "validate"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Validate consistency
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error ? (
          <div
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {activeTab === "generate" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="cv-bullet-format"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Bullet format
                </label>
                <select
                  id="cv-bullet-format"
                  value={format}
                  onChange={(e) =>
                    setFormat(e.target.value as CVBulletFormat)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="tight">Tight (concise)</option>
                  <option value="standard">Standard (balanced)</option>
                  <option value="narrative">Narrative (detailed)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cv-bullet-focus"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Focus area
                </label>
                <select
                  id="cv-bullet-focus"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value as BulletFocus)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="impact">Impact and results</option>
                  <option value="technical">Technical delivery</option>
                  <option value="leadership">Leadership</option>
                  <option value="process">Process and methodology</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {projectSlugs.length} project
                {projectSlugs.length !== 1 ? "s" : ""} selected
              </p>
              <button
                type="button"
                onClick={generateBullets}
                disabled={loading || projectSlugs.length === 0}
                className="inline-flex items-center space-x-2 rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText size={16} aria-hidden />
                <span>{loading ? "Generating…" : "Generate bullets"}</span>
              </button>
            </div>

            {bullets.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Generated CV bullets
                  </h4>
                  <button
                    type="button"
                    onClick={exportBullets}
                    className="inline-flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700"
                  >
                    <Download size={16} aria-hidden />
                    <span>Export</span>
                  </button>
                </div>

                <ul className="space-y-3">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-900">{bullet.content}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>Format: {bullet.format}</span>
                            <span>Source: {bullet.source}</span>
                            <span>Confidence: {bullet.confidence}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bullet.content)}
                          className="shrink-0 text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                          aria-label="Copy bullet to clipboard"
                        >
                          <ClipboardCopy size={18} aria-hidden />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="cv-json-paste"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Reactive Resume JSON (optional)
              </label>
              <textarea
                id="cv-json-paste"
                value={cvJsonText}
                onChange={(e) => setCvJsonText(e.target.value)}
                rows={6}
                placeholder='Paste an export from Reactive Resume (JSON). Leave empty to run portfolio-only checks (Word Roll casing, tech naming in tags/blurbs).'
                className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Validate {projectSlugs.length} project
                {projectSlugs.length !== 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={validateConsistency}
                disabled={loading || projectSlugs.length === 0}
                className="inline-flex items-center space-x-2 rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <AlertTriangle size={16} aria-hidden />
                <span>{loading ? "Validating…" : "Validate consistency"}</span>
              </button>
            </div>

            {issues ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-medium text-gray-900">
                    Consistency report
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-red-600">
                      {issues.summary.highSeverity} high
                    </span>
                    <span className="text-yellow-700">
                      {issues.summary.mediumSeverity} medium
                    </span>
                    <span className="text-gray-600">
                      {issues.summary.lowSeverity} low
                    </span>
                  </div>
                </div>

                {issues.totalIssues === 0 ? (
                  <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-4">
                    <CheckCircle
                      className="text-green-600"
                      size={20}
                      aria-hidden
                    />
                    <span className="text-green-800">
                      No consistency issues found for the current checks.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {severityOrder.map((severity) => {
                      const list = issues.issues[severity];
                      if (!list.length) return null;
                      const headingClass =
                        severity === "high"
                          ? "text-red-700"
                          : severity === "medium"
                            ? "text-yellow-800"
                            : "text-gray-700";
                      const boxClass =
                        severity === "high"
                          ? "border-red-200 bg-red-50"
                          : severity === "medium"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-gray-200 bg-gray-50";
                      return (
                        <div key={severity} className="space-y-2">
                          <h5
                            className={`font-medium capitalize ${headingClass}`}
                          >
                            {severity} severity
                          </h5>
                          <ul className={`space-y-2 rounded-lg border ${boxClass} p-2`}>
                            {list.map((issue, index) => (
                              <li
                                key={`${severity}-${issue.projectSlug}-${issue.field}-${index}`}
                                className="rounded-md border border-black/5 bg-white/60 p-3"
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  {issue.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                  Project: {issue.projectSlug} · Field:{" "}
                                  {issue.field}
                                </p>
                                {issue.suggestion ? (
                                  <p className="mt-1 text-xs italic text-gray-500">
                                    Suggestion: {issue.suggestion}
                                  </p>
                                ) : null}
                                {issue.portfolioValue || issue.cvValue ? (
                                  <p className="mt-1 text-xs text-gray-600">
                                    {issue.portfolioValue
                                      ? `Portfolio: ${issue.portfolioValue}`
                                      : null}
                                    {issue.portfolioValue && issue.cvValue
                                      ? " · "
                                      : null}
                                    {issue.cvValue ? `CV: ${issue.cvValue}` : null}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
