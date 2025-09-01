'use client';

import type { FileNode } from '@/src/lib/data';
import { File, Trash2, Edit2 } from 'lucide-react';
import { useViewStore } from '../lib/store';
import { FilePreview } from './FilePreview';
import { Input } from './ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

export function RecentFilesList({ files }: { files: FileNode[] }) {
  const { viewMode } = useViewStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileNode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteClick = (item: FileNode) => {
    if (isDeleting) return;
    
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (item: FileNode) => {
    if (isRenaming) return;
    
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = async (item: FileNode) => {
    if (!editName.trim() || editName === item.name) {
      setEditingId(null);
      setEditName('');
      return;
    }

    setIsRenaming(item.id);
    
    try {
      const response = await fetch(`/api/files/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename');
      }
      
      router.refresh();
      setEditingId(null);
      setEditName('');
    }finally {
      setIsRenaming(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: FileNode) => {
    if (e.key === 'Enter') {
      handleSaveEdit(item);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(itemToDelete.id);
    
    try {
      const response = await fetch(`/api/files/${itemToDelete.id}`, { method: 'DELETE' });
      
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

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center">
          <File className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">No recent files</h3>
          <p className="text-muted-foreground text-sm">
            Upload some files to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-4">
          {files.map((file) => {
            const filePath = file.path || file.name;
            const fullPath = filePath ? `/${filePath}` : `/${file.name}`;

            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <div className="relative group">
                    <a
                      href={fullPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border rounded-lg p-2 sm:p-4 hover:bg-accent hover:border-accent-foreground/20 transition-all"
                      onClick={(e) => {
                        if (editingId === file.id) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {editingId === file.id ? (
                        <div className="flex flex-col items-center gap-2">
                          <File className="w-16 h-16 sm:w-20 sm:h-20 text-gray-500" />
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, file)}
                            onBlur={() => handleSaveEdit(file)}
                            className="text-xs sm:text-sm font-medium text-center h-auto py-1 px-2"
                            autoFocus
                            disabled={isRenaming === file.id}
                          />
                        </div>
                      ) : (
                        <FilePreview fileName={file.name} filePath={filePath} />
                      )}
                    </a>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleEditClick(file)}
                    disabled={isRenaming === file.id}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isRenaming === file.id ? 'Renaming...' : 'Rename file'}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(file)}
                    disabled={isDeleting === file.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === file.id ? 'Deleting...' : 'Delete file'}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const filePath = file.path || file.name;
            const fullPath = filePath ? `/${filePath}` : `/${file.name}`;

            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <div className="group flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <a
                      href={fullPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={(e) => {
                        if (editingId === file.id) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <File className="h-6 w-6 text-gray-500 flex-shrink-0" />
                      {editingId === file.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, file)}
                          onBlur={() => handleSaveEdit(file)}
                          className="h-auto py-1 px-2 flex-1"
                          autoFocus
                          disabled={isRenaming === file.id}
                        />
                      ) : (
                        <span className="text-foreground truncate">{file.name}</span>
                      )}
                    </a>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleEditClick(file)}
                    disabled={isRenaming === file.id}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isRenaming === file.id ? 'Renaming...' : 'Rename file'}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(file)}
                    disabled={isDeleting === file.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === file.id ? 'Deleting...' : 'Delete file'}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Are you sure you want to delete "{itemToDelete?.name}"?
              <span className="block mt-2 text-xs sm:text-sm">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting !== null}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting !== null}
              className="w-full sm:w-auto"
            >
              {isDeleting === itemToDelete?.id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
