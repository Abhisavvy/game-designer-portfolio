'use client';

import { useState, useEffect } from 'react';
import { ImageUploader } from '@/features/admin/components/ImageUploader';
import { AdminBreadcrumb } from '@/features/admin/components/AdminBreadcrumb';
import { Image as ImageIcon, Trash2, Download, Filter, Search } from 'lucide-react';
import { defaultPortfolioContent } from '@/features/portfolio/data/site-content';

// Component to show actual project images from site-content.ts
function ProjectImagesOverview({ onResetPlaceholder }: { onResetPlaceholder: (slug: string) => void }) {
  const projects = defaultPortfolioContent.projects;
  const caseStudies = defaultPortfolioContent.caseStudies;

  return (
    <div className="space-y-6">
      {/* Hero Images */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Hero Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {projects.map((project) => {
            const caseStudy = caseStudies[project.slug as keyof typeof caseStudies];
            const imageSrc = caseStudy?.media?.hero?.posterSrc || '/assets/placeholder-image.svg';
            const isPlaceholder = imageSrc.includes('placeholder-image.svg');
            
            return (
              <div key={project.slug} className="text-center">
                <div className="relative">
                  <img
                    src={imageSrc}
                    alt={`${project.title} hero`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-300 mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/placeholder-image.svg';
                    }}
                  />
                  <div className={`absolute top-1 right-1 text-white text-xs px-1 rounded ${
                    isPlaceholder ? 'bg-orange-500' : 'bg-green-500'
                  }`}>
                    {imageSrc.endsWith('.svg') ? 'SVG' : imageSrc.endsWith('.png') ? 'PNG' : 'IMG'}
                  </div>
                  <button
                    onClick={() => onResetPlaceholder(project.slug)}
                    className={`absolute bottom-1 right-1 text-white text-xs px-2 py-1 rounded transition-colors ${
                      isPlaceholder 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    title={isPlaceholder ? "Reset placeholder" : "Reset to placeholder"}
                  >
                    Reset
                  </button>
                </div>
                <p className="text-xs text-gray-600 truncate" title={project.title}>
                  {project.slug}
                </p>
                <p className="text-xs text-gray-500 truncate" title={project.title}>
                  {project.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gallery Images */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Gallery Images</h3>
        <div className="space-y-4">
          {projects.map((project) => {
            const caseStudy = caseStudies[project.slug as keyof typeof caseStudies];
            const galleryItems = caseStudy?.media?.processGallery?.items || [];
            
            if (galleryItems.length === 0) return null;
            
            return (
              <div key={`gallery-${project.slug}`} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{project.title} Gallery</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {galleryItems.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="relative">
                        <img
                          src={item.thumb}
                          alt={item.alt}
                          className="w-full h-16 object-cover rounded-md border border-gray-300 mb-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/placeholder-image.svg';
                          }}
                        />
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                          {item.thumb.endsWith('.svg') ? 'SVG' : item.thumb.endsWith('.png') ? 'PNG' : 'IMG'}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 truncate" title={item.label}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface Asset {
  filename: string;
  publicUrl: string;
  size: number;
  uploadedAt: string;
  projectSlug?: string;
}

export default function AssetsManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    projectSlug: string;
    search: string;
  }>({
    projectSlug: '',
    search: '',
  });

  useEffect(() => {
    loadAssets();
  }, [filter.projectSlug]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.projectSlug) {
        params.append('projectSlug', filter.projectSlug);
      }
      
      const response = await fetch(`/api/admin/assets/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (filename: string, projectSlug?: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const params = new URLSearchParams({ filename });
      if (projectSlug) {
        params.append('projectSlug', projectSlug);
      }

      const response = await fetch(`/api/admin/assets/delete?${params}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssets(prev => prev.filter(asset => asset.filename !== filename));
      } else {
        alert('Failed to delete asset');
      }
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset');
    }
  };

  const resetPlaceholder = async (projectSlug: string) => {
    if (!confirm(`Reset placeholder for ${projectSlug}? This will set it back to the default placeholder image.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/assets/reset-placeholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug, resetType: 'hero' }),
      });

      if (response.ok) {
        alert('Placeholder reset successfully');
        // Reload the page to show updated placeholders
        window.location.reload();
      } else {
        alert('Failed to reset placeholder');
      }
    } catch (error) {
      console.error('Failed to reset placeholder:', error);
      alert('Failed to reset placeholder');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAssets = assets.filter(asset =>
    asset.filename.toLowerCase().includes(filter.search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <AdminBreadcrumb />
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Assets Management</h1>
            <p className="text-slate-600">
              Upload and manage images and media files for your portfolio projects.
            </p>
          </div>
        </div>
      </div>

      {/* Current Project Images Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Project Images</h2>
        <ProjectImagesOverview onResetPlaceholder={resetPlaceholder} />
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <strong>Orange badges</strong> indicate placeholder images, <strong>green badges</strong> indicate actual project images. Click &quot;Reset&quot; to change any image back to placeholder.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const projectSlugs = defaultPortfolioContent.projects.map(p => p.slug);
                projectSlugs.forEach(slug => resetPlaceholder(slug));
              }}
              className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors border border-red-200"
            >
              Reset All to Placeholders
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Assets</h2>
        <ImageUploader
          onUploadComplete={() => loadAssets()}
          maxFiles={10}
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Library</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search assets..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <select
              value={filter.projectSlug}
              onChange={(e) => setFilter(prev => ({ ...prev, projectSlug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              <option value="general">General Assets</option>
              {/* Add dynamic project options here */}
            </select>
          </div>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading assets...</div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ImageIcon size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600">
              {filter.search || filter.projectSlug 
                ? 'Try adjusting your filters or upload new assets.'
                : 'Upload your first asset to get started.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredAssets.map((asset) => (
              <div key={asset.filename} className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square">
                  <img
                    src={asset.publicUrl}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <a
                      href={asset.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                      title="View full size"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => deleteAsset(asset.filename, asset.projectSlug)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Asset Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>{formatFileSize(asset.size)}</span>
                    <span>{asset.projectSlug || 'General'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(asset.uploadedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Asset Management Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use descriptive filenames for better organization</li>
          <li>• Always provide alt text for accessibility compliance</li>
          <li>• Organize assets by project using the project slug</li>
          <li>• Optimize images before upload (recommended: WebP format, &lt;1MB)</li>
          <li>• Use consistent naming conventions (e.g., &quot;project-hero-image.webp&quot;)</li>
        </ul>
      </div>
    </div>
  );
}