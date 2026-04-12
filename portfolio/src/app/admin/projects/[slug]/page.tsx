'use client';

import { use } from 'react';
import { ProjectEditor } from '@/features/admin/components/ProjectEditor';
import { AdminBreadcrumb } from '@/features/admin/components/AdminBreadcrumb';

interface EditProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = use(params);
  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      <ProjectEditor projectSlug={slug} />
    </div>
  );
}