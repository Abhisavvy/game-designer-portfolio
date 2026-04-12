'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminProject, AdminPersonalInfo } from '../types/admin';

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

async function errorMessageFromResponse(response: Response, label: string): Promise<string> {
  const status = `${response.status} ${response.statusText}`.trim();
  let detail = '';
  try {
    const text = await response.text();
    if (text) {
      try {
        const parsed = JSON.parse(text) as { error?: unknown; message?: unknown };
        if (typeof parsed.error === 'string') detail = parsed.error;
        else if (typeof parsed.message === 'string') detail = parsed.message;
        else detail = text.slice(0, 300);
      } catch {
        detail = text.slice(0, 300);
      }
    }
  } catch {
    // ignore body read failures
  }
  return detail ? `${label} (${status}): ${detail}` : `${label}: request failed (${status})`;
}

export function useAdminData() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [personalInfo, setPersonalInfo] = useState<AdminPersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadAdminData = useCallback(async (signal?: AbortSignal) => {
    const fetchOpts = signal ? { signal } : {};

    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const [projectsResponse, personalResponse] = await Promise.all([
        fetch('/api/admin/content/projects', fetchOpts),
        fetch('/api/admin/content/personal', fetchOpts),
      ]);

      const errors: string[] = [];
      if (!projectsResponse.ok) {
        errors.push(await errorMessageFromResponse(projectsResponse, 'Projects'));
      }
      if (!personalResponse.ok) {
        errors.push(await errorMessageFromResponse(personalResponse, 'Personal info'));
      }

      if (errors.length > 0) {
        if (mountedRef.current) {
          setProjects([]);
          setPersonalInfo(null);
          setError(errors.join(' · '));
        }
        return;
      }

      const [projectsData, personalData] = await Promise.all([
        projectsResponse.json() as Promise<{ projects?: AdminProject[] }>,
        personalResponse.json() as Promise<{ personal?: AdminPersonalInfo | null }>,
      ]);

      if (!mountedRef.current) return;

      setProjects(Array.isArray(projectsData.projects) ? projectsData.projects : []);
      setPersonalInfo(personalData.personal ?? null);
      setError(null);
    } catch (err) {
      if (isAbortError(err)) return;
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void loadAdminData(ac.signal);
    return () => ac.abort();
  }, [loadAdminData]);

  const updateProject = async (slug: string, projectData: AdminProject) => {
    try {
      const response = await fetch('/api/admin/content/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, project: projectData }),
      });

      if (response.ok) {
        setProjects((prev) => prev.map((p) => (p.slug === slug ? projectData : p)));
        return true;
      }
      if (mountedRef.current) {
        setError(await errorMessageFromResponse(response, 'Update project'));
      }
      return false;
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to update project');
      }
      return false;
    }
  };

  const updatePersonalInfo = async (data: AdminPersonalInfo) => {
    try {
      const response = await fetch('/api/admin/content/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personal: data }),
      });

      if (response.ok) {
        setPersonalInfo(data);
        return true;
      }
      if (mountedRef.current) {
        setError(await errorMessageFromResponse(response, 'Update personal info'));
      }
      return false;
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to update personal info');
      }
      return false;
    }
  };

  return {
    projects,
    personalInfo,
    loading,
    error,
    updateProject,
    updatePersonalInfo,
    reload: () => {
      void loadAdminData();
    },
  };
}
