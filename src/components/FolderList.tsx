'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FolderNode, FileNode } from '@/src/lib/data';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Folder, Trash2, File, Edit2 } from 'lucide-react';
import { useViewStore } from '../lib/store';
import { FilePreview } from './FilePreview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/src/components/ui/context-menu';

export function FolderList({ nodes }: { nodes: Array<FolderNode | FileNode>}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FolderNode | FileNode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const { viewMode } = useViewStore();
  const router = useRouter();

  const handleDeleteClick = (item: FolderNode | FileNode, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isDeleting) return;
    
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (item: FolderNode | FileNode, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isRenaming || item.id === 'root') return;
    
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = async (item: FolderNode | FileNode) => {
    if (!editName.trim() || editName === item.name) {
      setEditingId(null);
      setEditName('');
      return;
    }

    setIsRenaming(item.id);
    
    try {
      const endpoint = item.type === 'folder' ? `/api/folders/${item.id}` : `/api/files/${item.id}`;
      const response = await fetch(endpoint, {
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
    } catch {
    } finally {
      setIsRenaming(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: FolderNode | FileNode) => {
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
      <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-muted-foreground text-sm">This folder is empty</p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
          {nodes.map((node) => {
            if (node.type === 'folder') {
              return (
                <ContextMenu key={node.id}>
                  <ContextMenuTrigger asChild>
                    <div className="relative group">
                      <Link 
                        href={`/folder/${node.id}`}
                        className="block w-full"
                        onClick={(e) => {
                          if (editingId === node.id) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 group-hover:scale-105">
                          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                            <Folder 
                              className="w-full h-full text-blue-500 drop-shadow-sm" 
                              fill="currentColor"
                              strokeWidth={1}
                            />
                          </div>
                          
                          {editingId === node.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, node)}
                              onBlur={() => handleSaveEdit(node)}
                              className="text-xs sm:text-sm md:text-base font-medium text-center h-auto py-1 px-2"
                              autoFocus
                              disabled={isRenaming === node.id}
                            />
                          ) : (
                            <span className="text-xs sm:text-sm md:text-base font-medium text-center text-foreground leading-tight max-w-full break-words">
                              {node.name}
                            </span>
                          )}
                        </div>
                      </Link>
                      
                      {node.id !== 'root' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                          onClick={(e) => handleDeleteClick(node, e)}
                          disabled={isDeleting === node.id}
                          title="Delete folder"
                        >
                          <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </Button>
                      )}
                    </div>
                  </ContextMenuTrigger>
                  {node.id !== 'root' && (
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => handleEditClick(node)}
                        disabled={isRenaming === node.id}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {isRenaming === node.id ? 'Renaming...' : 'Rename folder'}
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(node)}
                        disabled={isDeleting === node.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting === node.id ? 'Deleting...' : 'Delete folder'}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  )}
                </ContextMenu>
              );
            }
            
            const filePath = node.path || node.name;
            const fullPath = filePath ? `/${filePath}` : `/${node.name}`;
            
            return (
              <ContextMenu key={node.id}>
                <ContextMenuTrigger asChild>
                  <div className="relative group">
                    <a
                      href={fullPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                      onClick={(e) => {
                        if (editingId === node.id) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {editingId === node.id ? (
                        <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-accent/50 transition-all duration-200">
                          <File className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-500" />
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, node)}
                            onBlur={() => handleSaveEdit(node)}
                            className="text-xs sm:text-sm md:text-base font-medium text-center h-auto py-1 px-2"
                            autoFocus
                            disabled={isRenaming === node.id}
                          />
                        </div>
                      ) : (
                        <FilePreview fileName={node.name} filePath={filePath} />
                      )}
                    </a>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                      onClick={(e) => handleDeleteClick(node, e)}
                      disabled={isDeleting === node.id}
                      title="Delete file"
                    >
                      <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleEditClick(node)}
                    disabled={isRenaming === node.id}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isRenaming === node.id ? 'Renaming...' : 'Rename file'}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(node)}
                    disabled={isDeleting === node.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === node.id ? 'Deleting...' : 'Delete file'}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {nodes.map((node) => {
            if (node.type === 'folder') {
              return (
                <ContextMenu key={node.id}>
                  <ContextMenuTrigger asChild>
                    <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <Link 
                        href={`/folder/${node.id}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                        onClick={(e) => {
                          if (editingId === node.id) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Folder className="h-6 w-6 text-blue-500 flex-shrink-0" fill="currentColor" strokeWidth={1} />
                        {editingId === node.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, node)}
                            onBlur={() => handleSaveEdit(node)}
                            className="font-medium h-auto py-1 px-2 flex-1"
                            autoFocus
                            disabled={isRenaming === node.id}
                          />
                        ) : (
                          <span className="font-medium text-foreground truncate">{node.name}</span>
                        )}
                      </Link>
                      
                      {node.id !== 'root' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                          onClick={(e) => handleDeleteClick(node, e)}
                          disabled={isDeleting === node.id}
                          title="Delete folder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </ContextMenuTrigger>
                  {node.id !== 'root' && (
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => handleEditClick(node)}
                        disabled={isRenaming === node.id}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {isRenaming === node.id ? 'Renaming...' : 'Rename folder'}
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(node)}
                        disabled={isDeleting === node.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting === node.id ? 'Deleting...' : 'Delete folder'}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  )}
                </ContextMenu>
              );
            }
            
            const filePath = node.path || node.name;
            const fullPath = filePath ? `/${filePath}` : `/${node.name}`;
            
            return (
              <ContextMenu key={node.id}>
                <ContextMenuTrigger asChild>
                  <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <a
                      href={fullPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={(e) => {
                        if (editingId === node.id) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <File className="h-6 w-6 text-gray-500 flex-shrink-0" />
                      {editingId === node.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, node)}
                          onBlur={() => handleSaveEdit(node)}
                          className="h-auto py-1 px-2 flex-1"
                          autoFocus
                          disabled={isRenaming === node.id}
                        />
                      ) : (
                        <span className="text-foreground truncate">{node.name}</span>
                      )}
                    </a>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={(e) => handleDeleteClick(node, e)}
                      disabled={isDeleting === node.id}
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleEditClick(node)}
                    disabled={isRenaming === node.id}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isRenaming === node.id ? 'Renaming...' : 'Rename file'}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(node)}
                    disabled={isDeleting === node.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === node.id ? 'Deleting...' : 'Delete file'}
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
              {itemToDelete?.type === 'folder' && (
                <span className="block mt-2 text-destructive font-medium text-xs sm:text-sm">
                  This will permanently delete the folder and all its contents.
                </span>
              )}
              {itemToDelete?.type === 'file' && (
                <span className="block mt-2 text-xs sm:text-sm">
                  This action cannot be undone.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
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
