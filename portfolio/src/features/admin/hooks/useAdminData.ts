'use client';

import { useState, useEffect } from 'react';
import { AdminProject, AdminPersonalInfo } from '../types/admin';

export function useAdminData() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [personalInfo, setPersonalInfo] = useState<AdminPersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load projects
      const projectsResponse = await fetch('/api/admin/content/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects);
      }

      // Load personal info
      const personalResponse = await fetch('/api/admin/content/personal');
      if (personalResponse.ok) {
        const personalData = await personalResponse.json();
        setPersonalInfo(personalData.personal);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
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
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update personal info');
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
    reload: loadAdminData,
  };
}
