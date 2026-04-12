"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CVSyncPanel } from "@/features/admin/components/CVSyncPanel";
import type { CVBullet, ConsistencyIssue } from "@/features/admin/types/admin";
import {
  defaultPortfolioContent,
  type ProjectItem,
} from "@/features/portfolio/data/site-content";

function CVSyncPageContent() {
  const searchParams = useSearchParams();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const allProjects = useMemo(
    () => defaultPortfolioContent.projects,
    [],
  );

  useEffect(() => {
    const projectParam = searchParams.get("projects");
    if (projectParam) {
      setSelectedProjects(
        projectParam.split(",").map((s) => s.trim()).filter(Boolean),
      );
    }
  }, [searchParams]);

  const handleProjectToggle = (slug: string) => {
    setSelectedProjects((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleSelectAll = () => {
    setSelectedProjects(allProjects.map((p) => p.slug));
  };

  const handleClearAll = () => {
    setSelectedProjects([]);
  };

  const handleBulletsGenerated = (_bullets: CVBullet[]) => {
    /* Hook for future toast / persistence */
  };

  const handleIssuesFound = (_issues: ConsistencyIssue[]) => {
    /* Hook for future toast / persistence */
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-6 lg:px-0 lg:pt-10">
      <header className="mb-2">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          CV synchronization
        </h1>
        <p className="text-gray-600">
          Generate tight, standard, and narrative bullets from default portfolio
          case studies, then validate naming and metric alignment against a
          Reactive Resume JSON export.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Select projects
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="rounded-md px-3 py-1 text-sm text-orange-600 hover:text-orange-700"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-md px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all
            </button>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project: ProjectItem) => {
            const selected = selectedProjects.includes(project.slug);
            const hasCaseStudy = Boolean(
              defaultPortfolioContent.caseStudies[project.slug],
            );
            const id = `cv-sync-project-${project.slug}`;
            return (
              <li key={project.slug}>
                <label
                  htmlFor={id}
                  className={`flex cursor-pointer rounded-lg border p-4 transition-colors ${
                    selected
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleProjectToggle(project.slug)}
                    className="mt-1 h-4 w-4 shrink-0 accent-orange-600"
                  />
                  <span className="ml-3 min-w-0 flex-1">
                    <span className="block font-medium text-gray-900">
                      {project.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                      {project.blurb}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">{project.tag}</span>
                      {hasCaseStudy ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          Case study
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          No case study block
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        {selectedProjects.length > 0 ? (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              {selectedProjects.length} project
              {selectedProjects.length !== 1 ? "s" : ""} selected for CV sync.
            </p>
          </div>
        ) : null}
      </section>

      {selectedProjects.length > 0 ? (
        <CVSyncPanel
          projectSlugs={selectedProjects}
          onBulletsGenerated={handleBulletsGenerated}
          onIssuesFound={handleIssuesFound}
        />
      ) : (
        <p className="text-sm text-gray-500">
          Select at least one project to open the CV sync tools.
        </p>
      )}
    </div>
  );
}

function CVSyncFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-gray-600">
      Loading CV sync…
    </div>
  );
}

export default function CVSyncPage() {
  return (
    <Suspense fallback={<CVSyncFallback />}>
      <CVSyncPageContent />
    </Suspense>
  );
}
