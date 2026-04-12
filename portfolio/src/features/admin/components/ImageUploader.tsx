'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminAssetUploadMetadataSchema } from '@/features/admin/validation/admin-api-schemas';

type MetadataForm = z.infer<typeof adminAssetUploadMetadataSchema>;

interface ImageUploaderProps {
  projectSlug?: string;
  category?: 'hero' | 'gallery' | 'process' | 'profile';
  onUploadComplete?: (asset: any) => void;
  maxFiles?: number;
}

export function ImageUploader({ 
  projectSlug, 
  category = 'gallery', 
  onUploadComplete,
  maxFiles = 5 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<MetadataForm>({
    resolver: zodResolver(adminAssetUploadMetadataSchema),
    defaultValues: {
      category,
      projectSlug: projectSlug || '',
      altText: '',
      caption: '',
      usageContext: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limit number of files
    const filesToProcess = acceptedFiles.slice(0, maxFiles - uploadedFiles.length);
    
    if (filesToProcess.length < acceptedFiles.length) {
      setMessage({
        type: 'error',
        text: `Only ${maxFiles} files allowed. ${acceptedFiles.length - filesToProcess.length} files were ignored.`
      });
    }

    // Process each file
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFiles(prev => [...prev, {
          file,
          preview: reader.result as string,
          uploaded: false,
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, [maxFiles, uploadedFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploading || uploadedFiles.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (data: MetadataForm) => {
    if (uploadedFiles.length === 0) {
      setMessage({ type: 'error', text: 'No files to upload' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const uploadPromises = uploadedFiles
        .filter(item => !item.uploaded)
        .map(async (item) => {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('metadata', JSON.stringify({
            ...data,
            projectSlug: projectSlug || '',
            usageContext: `${data.usageContext} - ${item.file.name}`,
          }));

          const response = await fetch('/api/admin/assets/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
          }

          const result = await response.json();
          return { ...item, ...result.asset, uploaded: true };
        });

      const results = await Promise.all(uploadPromises);
      
      // Update uploaded files
      setUploadedFiles(prev => 
        prev.map(item => {
          const uploaded = results.find(r => r.file === item.file);
          return uploaded || item;
        })
      );

      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded ${results.length} file${results.length > 1 ? 's' : ''}` 
      });

      // Update hero images in site-content.ts automatically
      const heroImages = results.filter(asset => asset.metadata?.category === 'hero');
      for (const heroAsset of heroImages) {
        if (heroAsset.metadata?.projectSlug) {
          try {
            await fetch('/api/admin/assets/update-hero', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectSlug: heroAsset.metadata.projectSlug,
                imagePath: heroAsset.publicUrl,
              }),
            });
          } catch (error) {
            console.warn('Failed to update hero image in site-content:', error);
          }
        }
      }

      // Notify parent component
      results.forEach(asset => {
        onUploadComplete?.(asset);
      });

      // Reset form for next upload
      form.reset({
        category,
        projectSlug: projectSlug || '',
        altText: '',
        caption: '',
        usageContext: '',
      });

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Upload failed' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-orange-500 bg-orange-50'
            : uploadedFiles.length >= maxFiles
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          
          {uploadedFiles.length >= maxFiles ? (
            <div>
              <p className="text-gray-500">Maximum files reached ({maxFiles})</p>
              <p className="text-sm text-gray-400">Remove files to upload more</p>
            </div>
          ) : isDragActive ? (
            <p className="text-orange-600 font-medium">Drop files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-gray-400 mt-1">
                JPEG, PNG, WebP up to 5MB each ({uploadedFiles.length}/{maxFiles} files)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Previews */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Files to Upload</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((item, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={item.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {item.uploaded ? (
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <CheckCircle size={16} />
                    </div>
                  ) : (
                    <button
                      onClick={() => removeFile(index)}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* File Info */}
                <div className="mt-2 text-sm">
                  <p className="text-gray-700 truncate">{item.file.name}</p>
                  <p className="text-gray-500">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Form */}
      {uploadedFiles.some(item => !item.uploaded) && (
        <form onSubmit={form.handleSubmit(uploadFiles)} className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Metadata</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...form.register('category')}
                  className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 hover:border-slate-400"
                  style={{ color: '#0f172a' }}
                >
                  <option value="hero">Hero Image</option>
                  <option value="gallery">Gallery</option>
                  <option value="process">Process/Workflow</option>
                  <option value="profile">Profile/Avatar</option>
                </select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Slug (Optional)
                </label>
                <input
                  type="text"
                  {...form.register('projectSlug')}
                  placeholder="e.g., word-roll-events"
                  className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 hover:border-slate-400"
                  style={{ color: '#0f172a' }}
                />
                {form.formState.errors.projectSlug && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.projectSlug.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text * <span className="text-gray-400">(for accessibility)</span>
              </label>
              <input
                type="text"
                {...form.register('altText')}
                placeholder="Describe what's in the image for screen readers"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {form.formState.errors.altText && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.altText.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption (Optional)
              </label>
              <input
                type="text"
                {...form.register('caption')}
                placeholder="Optional caption or title for display"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Context *
              </label>
              <input
                type="text"
                {...form.register('usageContext')}
                placeholder="Where will this image be used? (e.g., 'Hero section of Word Roll case study')"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {form.formState.errors.usageContext && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.usageContext.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Messages */}
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
    </div>
  );
}