'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { ProjectFormModal } from '@/components/projects/project-form-modal';
import { ProjectList } from '@/components/projects/project-list';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  return (
    <>
      <Header
        title="Projects"
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus />
            <span className="hidden sm:inline">New project</span>
          </Button>
        }
      />
      <main className="flex-1 overflow-auto">
        <ProjectList onCreate={() => setCreating(true)} />
      </main>
      <ProjectFormModal
        open={creating}
        onOpenChange={setCreating}
        onSaved={(project) => router.push(`/projects/${project.id}`)}
      />
    </>
  );
}
