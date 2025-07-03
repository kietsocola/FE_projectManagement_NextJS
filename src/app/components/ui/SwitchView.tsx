'use client';

import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';

interface SwitchViewProps {
  viewMode: 'list' | 'kanban';
  onSwitch: () => void;
}

export default function SwitchView({ viewMode, onSwitch }: SwitchViewProps) {
  return (
    <Button variant="outline" onClick={onSwitch}>
      {viewMode === 'list' ? (
        <>
          <LayoutGrid className="mr-2 h-4 w-4" />
          Kanban View
        </>
      ) : (
        <>
          <List className="mr-2 h-4 w-4" />
          List View
        </>
      )}
    </Button>
  );
}