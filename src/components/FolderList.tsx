'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FolderNode, FileNode } from '@/src/lib/data';
import { Button } from '@/src/components/ui/button';
import { Folder, Trash2 } from 'lucide-react';
import { FilePreview } from './FilePreview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

export function FolderList({ nodes }: { nodes: Array<FolderNode | FileNode>}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FolderNode | FileNode | null>(null);
  const router = useRouter();

  const handleDeleteClick = (item: FolderNode | FileNode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(itemToDelete.id);
    
    try {
      const endpoint = itemToDelete.type === 'folder' ? `/api/folders/${itemToDelete.id}` : `/api/files/${itemToDelete.id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete');
      }
      
      router.refresh();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-muted-foreground text-sm">This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {nodes.map((node) => {
        if (node.type === 'folder') {
          return (
            <div key={node.id} className="relative group">
              <Link href={`/folder/${node.id}`}>
                <Button
                  variant="outline"
                  className="h-auto w-full p-4 flex flex-col items-center gap-3 hover:bg-accent hover:border-accent-foreground/20 transition-all"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
                    <Folder className="text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate w-full text-center text-foreground">
                    {node.name}
                  </span>
                </Button>
              </Link>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDeleteClick(node, e)}
                disabled={isDeleting === node.id || node.id === 'root'}
                title="Delete folder"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        
        const filePath = node.path || node.name;
        const fullPath = filePath ? `/${filePath}` : `/${node.name}`;
        
        return (
          <div key={node.id} className="relative group">
            <Button
              variant="outline"
              className="h-auto w-full p-4 hover:bg-accent hover:border-accent-foreground/20 transition-all relative"
              asChild
            >
              <a
                href={fullPath}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <FilePreview fileName={node.name} filePath={filePath} />
              </a>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => handleDeleteClick(node, e)}
              disabled={isDeleting === node.id}
              title="Delete file"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      })}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"?
              {itemToDelete?.type === 'folder' && (
                <span className="block mt-2 text-destructive font-medium">
                  This will permanently delete the folder and all its contents.
                </span>
              )}
              {itemToDelete?.type === 'file' && (
                <span className="block mt-2">
                  This action cannot be undone.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting !== null}
            >
              {isDeleting === itemToDelete?.id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
