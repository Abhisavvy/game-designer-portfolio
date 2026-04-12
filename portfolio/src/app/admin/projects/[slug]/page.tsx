'use client';

import { ProjectEditor } from '@/features/admin/components/ProjectEditor';

interface EditProjectPageProps {
  params: {
    slug: string;
  };
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  return <ProjectEditor projectSlug={params.slug} />;
}