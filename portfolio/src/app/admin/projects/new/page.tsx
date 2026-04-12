'use client';

import { ProjectEditor } from '@/features/admin/components/ProjectEditor';
import { AdminBreadcrumb } from '@/features/admin/components/AdminBreadcrumb';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      <ProjectEditor />
    </div>
  );
}