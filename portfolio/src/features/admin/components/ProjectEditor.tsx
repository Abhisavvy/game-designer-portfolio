'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CVSyncPanel } from './CVSyncPanel';
import { ImageUploader } from './ImageUploader';
import { PreviewPanel } from './PreviewPanel';
import type { AdminProject, AdminCaseStudy } from '../types/admin';

const projectSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required'),
  tag: z.string().min(1, 'Tag is required'),
  blurb: z.string().min(1, 'Blurb is required').max(200, 'Blurb must be 200 characters or less'),
  href: z.string().min(1, 'Href is required'),
  externalUrl: z.string().url('Valid URL required').optional().or(z.literal('')),
});

const caseStudySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  problem: z.string().min(1, 'Problem description is required'),
  approach: z.string().min(1, 'Approach description is required'),
  constraints: z.string().min(1, 'Constraints description is required'),
  outcome: z.string().min(1, 'Outcome description is required'),
  contributions: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type CaseStudyFormData = z.infer<typeof caseStudySchema>;

interface ProjectEditorProps {
  projectSlug?: string; // undefined for new projects
}

export function ProjectEditor({ projectSlug }: ProjectEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'case-study' | 'assets' | 'cv-sync'>('basic');
  const [loading, setLoading] = useState(!!projectSlug);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [project, setProject] = useState<AdminProject | null>(null);
  const [caseStudy, setCaseStudy] = useState<AdminCaseStudy | null>(null);

  const isNewProject = !projectSlug;

  // Project basic info form
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      slug: '',
      title: '',
      tag: '',
      blurb: '',
      href: '',
      externalUrl: '',
    },
  });

  // Case study form
  const caseStudyForm = useForm<CaseStudyFormData>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      title: '',
      subtitle: '',
      problem: '',
      approach: '',
      constraints: '',
      outcome: '',
      contributions: '',
    },
  });

  useEffect(() => {
    if (projectSlug) {
      loadProject();
    }
  }, [projectSlug]);

  const loadProject = async () => {
    if (!projectSlug) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/projects');
      if (response.ok) {
        const data = await response.json();
        const foundProject = data.projects.find((p: AdminProject) => p.slug === projectSlug);
        
        if (foundProject) {
          setProject(foundProject);
          projectForm.reset(foundProject);
          
          // Load case study data
          const caseStudyResponse = await fetch(`/api/admin/content/case-studies?projectSlug=${projectSlug}`);
          if (caseStudyResponse.ok) {
            const caseStudyData = await caseStudyResponse.json();
            setCaseStudy(caseStudyData.caseStudy);
            caseStudyForm.reset(caseStudyData.caseStudy);
          }
        } else {
          setMessage({ type: 'error', text: 'Project not found' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load project' });
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (data: ProjectFormData) => {
    try {
      setSaving(true);
      
      const url = '/api/admin/content/projects';
      const method = isNewProject ? 'POST' : 'PUT';
      const body = isNewProject 
        ? { project: data }
        : { slug: projectSlug, project: data };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        setProject(result.project);
        setMessage({ type: 'success', text: `Project ${isNewProject ? 'created' : 'updated'} successfully` });
        
        // Auto-generate href if not provided
        if (!data.href) {
          projectForm.setValue('href', `/projects/${data.slug}`);
        }
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to save project' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save project' });
    } finally {
      setSaving(false);
    }
  };

  const saveCaseStudy = async (data: CaseStudyFormData) => {
    if (!project?.slug) {
      setMessage({ type: 'error', text: 'Project must be saved before adding case study' });
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/content/case-studies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectSlug: project.slug,
          caseStudy: data,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCaseStudy(result.caseStudy);
        setMessage({ type: 'success', text: 'Case study saved successfully' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to save case study' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save case study' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading project...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info', description: 'Project title, slug, and description' },
    { id: 'case-study' as const, label: 'Case Study', description: 'Detailed project analysis' },
    { id: 'assets' as const, label: 'Assets', description: 'Images and media files' },
    { id: 'cv-sync' as const, label: 'CV Sync', description: 'Generate matching CV bullets' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/projects"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNewProject ? 'New Project' : `Edit ${project?.title || 'Project'}`}
            </h1>
            <p className="text-gray-600">
              {isNewProject ? 'Create a new portfolio project' : 'Update project details and content'}
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div>
                <div>{tab.label}</div>
                <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        {activeTab === 'basic' && (
          <form onSubmit={projectForm.handleSubmit(saveProject)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Slug *
                </label>
                <input
                  type="text"
                  {...projectForm.register('slug')}
                  placeholder="e.g., word-roll-events"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {projectForm.formState.errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{projectForm.formState.errors.slug.message}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Used in URLs. Only lowercase letters, numbers, and hyphens.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  {...projectForm.register('title')}
                  placeholder="e.g., Word Roll Event System"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {projectForm.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{projectForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag *
                </label>
                <input
                  type="text"
                  {...projectForm.register('tag')}
                  placeholder="e.g., Game Design"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {projectForm.formState.errors.tag && (
                  <p className="text-red-500 text-sm mt-1">{projectForm.formState.errors.tag.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Href *
                </label>
                <input
                  type="text"
                  {...projectForm.register('href')}
                  placeholder="e.g., /projects/word-roll-events"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {projectForm.formState.errors.href && (
                  <p className="text-red-500 text-sm mt-1">{projectForm.formState.errors.href.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Blurb * <span className="text-gray-400">({projectForm.watch('blurb')?.length || 0}/200)</span>
              </label>
              <textarea
                rows={3}
                {...projectForm.register('blurb')}
                placeholder="Brief description of the project for cards and listings..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {projectForm.formState.errors.blurb && (
                <p className="text-red-500 text-sm mt-1">{projectForm.formState.errors.blurb.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                External URL (Optional)
              </label>
              <input
                type="url"
                {...projectForm.register('externalUrl')}
                placeholder="https://example.com/live-demo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {projectForm.formState.errors.externalUrl && (
                <p className="text-red-500 text-sm mt-1">{projectForm.formState.errors.externalUrl.message}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Link to live demo, case study, or external documentation.</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={20} />
                <span>{saving ? 'Saving...' : 'Save Project'}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'case-study' && (
          <form onSubmit={caseStudyForm.handleSubmit(saveCaseStudy)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Study Title *
                </label>
                <input
                  type="text"
                  {...caseStudyForm.register('title')}
                  placeholder="Detailed project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {caseStudyForm.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{caseStudyForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle *
                </label>
                <input
                  type="text"
                  {...caseStudyForm.register('subtitle')}
                  placeholder="Brief tagline or context"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {caseStudyForm.formState.errors.subtitle && (
                  <p className="text-red-500 text-sm mt-1">{caseStudyForm.formState.errors.subtitle.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem *
              </label>
              <textarea
                rows={4}
                {...caseStudyForm.register('problem')}
                placeholder="What challenge or opportunity did this project address?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {caseStudyForm.formState.errors.problem && (
                <p className="text-red-500 text-sm mt-1">{caseStudyForm.formState.errors.problem.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approach *
              </label>
              <textarea
                rows={4}
                {...caseStudyForm.register('approach')}
                placeholder="How did you solve the problem? What methods and tools did you use?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {caseStudyForm.formState.errors.approach && (
                <p className="text-red-500 text-sm mt-1">{caseStudyForm.formState.errors.approach.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Constraints *
              </label>
              <textarea
                rows={3}
                {...caseStudyForm.register('constraints')}
                placeholder="What limitations or requirements shaped your solution?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {caseStudyForm.formState.errors.constraints && (
                <p className="text-red-500 text-sm mt-1">{caseStudyForm.formState.errors.constraints.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outcome *
              </label>
              <textarea
                rows={4}
                {...caseStudyForm.register('outcome')}
                placeholder="What were the results? Include metrics if available."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {caseStudyForm.formState.errors.outcome && (
                <p className="text-red-500 text-sm mt-1">{caseStudyForm.formState.errors.outcome.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                My Contributions (Optional)
              </label>
              <textarea
                rows={3}
                {...caseStudyForm.register('contributions')}
                placeholder="Specific role and contributions to the project..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={20} />
                <span>{saving ? 'Saving...' : 'Save Case Study'}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Assets</h3>
              <p className="text-gray-600">
                Upload images and media files for this project. Assets will be organized in the project folder.
              </p>
            </div>
            
            <ImageUploader
              projectSlug={project?.slug}
              category="gallery"
              onUploadComplete={(asset) => {
                console.log('Asset uploaded:', asset);
                // TODO: Update project data with new asset
              }}
            />
          </div>
        )}

            {activeTab === 'cv-sync' && caseStudy && (
              <CVSyncPanel caseStudy={caseStudy} />
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <PreviewPanel 
            previewUrl={project?.href ? `http://localhost:3000${project.href}` : 'http://localhost:3000'}
          />
        </div>
      </div>
    </div>
  );
}