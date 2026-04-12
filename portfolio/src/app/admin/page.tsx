'use client';

import Link from 'next/link';
import { useAdminData } from '@/features/admin/hooks/useAdminData';
import { User, FolderOpen, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { projects, personalInfo, loading, error } = useAdminData();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading admin data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="text-red-500" size={20} />
        <span className="text-red-700">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Portfolio Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage your portfolio content, assets, and CV synchronization.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/personal"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Personal Info</h3>
              <p className="text-sm text-gray-600">{personalInfo ? 'Configured' : 'Not set'}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/projects"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-green-100 p-3">
              <FolderOpen className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Projects</h3>
              <p className="text-sm text-gray-600">{projects.length} projects</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/assets"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <ImageIcon className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Assets</h3>
              <p className="text-sm text-gray-600">Images & files</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/resume"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-orange-100 p-3">
              <FileText className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Resume</h3>
              <p className="text-sm text-gray-600">CV sync & export</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            type="button"
            className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Add New Project</h3>
            <p className="mt-1 text-sm text-gray-600">Create a new portfolio project with case study</p>
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Upload Assets</h3>
            <p className="mt-1 text-sm text-gray-600">Add images and files to your portfolio</p>
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Sync CV</h3>
            <p className="mt-1 text-sm text-gray-600">Generate CV bullets from case studies</p>
          </button>
        </div>
      </div>
    </div>
  );
}
