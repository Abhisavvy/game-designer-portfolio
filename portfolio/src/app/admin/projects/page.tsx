'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import type { AdminProject } from '@/features/admin/types/admin';

export default function ProjectsManagementPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setError(null);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete the project "${slug}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/projects?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.slug !== slug));
        setMessage({ type: 'success', text: 'Project deleted successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete project' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="text-red-500" size={20} />
        <span className="text-red-700">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects Management</h1>
          <p className="text-gray-600">
            Manage your portfolio projects, case studies, and content.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add New Project</span>
        </Link>
      </div>

      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first portfolio project.
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Your First Project</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div key={project.slug} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {project.tag}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{project.blurb}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="font-mono">/{project.slug}</span>
                    {project.externalUrl && (
                      <a
                        href={project.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink size={14} />
                        <span>External Link</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/admin/projects/${project.slug}`}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </Link>
                  
                  <button
                    onClick={() => deleteProject(project.slug)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Project Management Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use descriptive slugs for SEO-friendly URLs (e.g., "word-roll-events")</li>
          <li>• Keep blurbs concise but compelling (2-3 sentences max)</li>
          <li>• Tags help categorize projects (Game Design, AI Tools, etc.)</li>
          <li>• External URLs are optional but useful for live demos or case studies</li>
          <li>• CV sync will automatically generate matching resume bullets</li>
        </ul>
      </div>
    </div>
  );
}