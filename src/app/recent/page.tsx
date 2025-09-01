import { getRoot } from '@/src/lib/data';
import type { FileNode, FolderNode } from '@/src/lib/data';
import { Separator } from '@/src/components/ui/separator';
import { ViewToggle } from '@/src/components/ViewToggle';
import { RecentFilesList } from '@/src/components/RecentFilesList';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/src/components/ui/breadcrumb';
import { Clock, Home } from 'lucide-react';
import Link from 'next/link';

function getAllFiles(node: FolderNode): FileNode[] {
  const files: FileNode[] = [];

  for (const child of node.children) {
    if (child.type === 'file') {
      files.push(child);
    } else if (child.type === 'folder') {
      files.push(...getAllFiles(child));
    }
  }

  return files;
}

export default async function RecentPage() {
  const root = await getRoot();
  const allFiles = getAllFiles(root);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">
                  <span className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Home</span>
                  </span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Recent Files</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              Recent Files
            </h1>
            <p className="text-muted-foreground text-sm">
              {allFiles.length === 0 
                ? "Your recently accessed files will appear here"
                : `Recently accessed files (${allFiles.length} items)`
              }
            </p>
          </div>
          {allFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <ViewToggle />
            </div>
          )}
          {allFiles.length === 0 && (
            <div className="flex items-center gap-2">
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <RecentFilesList files={allFiles} />
      </div>
    </div>
  );
}
