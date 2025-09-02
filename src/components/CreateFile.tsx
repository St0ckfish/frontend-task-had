'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { FilePlus, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateFileButtonProps {
  folderId?: string;
}

export function CreateFileButton({ folderId = 'root' }: CreateFileButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (name.trim()) {
        formData.append('name', name.trim());
      }

      const encodedId = encodeURIComponent(folderId);
      const response = await fetch(`/api/files/${encodedId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        router.refresh();
        setOpen(false);
        setName('');
        setFile(null);
        toast.success(`File "${result.fileName || file.name}" uploaded successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create file');
      }
    } catch {
      toast.error('Failed to create file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile && !name.trim()) {
      setName(selectedFile.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 sm:gap-2">
          <FilePlus className="h-4 w-4" />
          <span className="hidden sm:inline">New File</span>
          <span className="sm:hidden">File</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New File
          </DialogTitle>
          <DialogDescription>
            Choose a file to upload and optionally customize its name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              required
              className="cursor-pointer file:cursor-pointer file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-3 file:border-0 file:rounded-md file:bg-muted file:text-muted-foreground file:hover:bg-muted/80 file:text-xs sm:file:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file-name">Custom Name (optional)</Label>
            <Input
              id="file-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Leave empty to use original filename"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setName('');
                setFile(null);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || isLoading}
              className="gap-2 w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
