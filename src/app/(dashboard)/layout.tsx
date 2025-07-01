'use client';

import { Toaster } from '@/components/ui/sonner';
import { ProjectContext, MOCK_PROJECT_ID } from '@/app/context/ProjectContext';
import { UserContext, MOCK_USERS } from '@/app/context/UserContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectContext.Provider value={MOCK_PROJECT_ID}>
      <UserContext.Provider value={MOCK_USERS}>
        {children}
        <Toaster richColors position="top-right" />
      </UserContext.Provider>
    </ProjectContext.Provider>
  );
}
