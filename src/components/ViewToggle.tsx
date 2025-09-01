'use client';

import { Grid3X3, List } from 'lucide-react';
import { Button } from './ui/button';
import { useViewStore } from '../lib/store';

export function ViewToggle() {
  const { viewMode, setViewMode } = useViewStore();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('grid')}
        className="h-8 w-8 p-0"
        title="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="h-8 w-8 p-0"
        title="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
