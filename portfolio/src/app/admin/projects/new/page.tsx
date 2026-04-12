'use client';

import { AdminBreadcrumb } from '@/features/admin/components/AdminBreadcrumb';
import { ProjectCreateWizard } from '@/features/admin/components/ProjectCreateWizard';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      <ProjectCreateWizard />
    </div>
  );
}