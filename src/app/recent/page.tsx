import { getRoot } from '@/src/lib/data';
import type { FileNode, FolderNode } from '@/src/lib/data';
import { Separator } from '@/src/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/src/components/ui/breadcrumb';
import { Clock, Home } from 'lucide-react';
import { FilePreview } from '@/src/components/FilePreview';
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

  if (allFiles.length === 0) {
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

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              Recent Files
            </h1>
            <p className="text-muted-foreground text-sm">
              Your recently accessed files will appear here
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No recent files</h3>
            <p className="text-muted-foreground text-sm">
              Upload some files to see them here.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            Recent Files
          </h1>
          <p className="text-muted-foreground text-sm">
            Recently accessed files ({allFiles.length} items)
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-4">
        {allFiles.map((file) => {
          const filePath = file.path || file.name;
          const fullPath = filePath ? `/${filePath}` : `/${file.name}`;

          return (
            <div key={file.id} className="relative group">
              <a
                href={fullPath}
                target="_blank"
                rel="noopener noreferrer"
                className="block border rounded-lg p-2 sm:p-4 hover:bg-accent hover:border-accent-foreground/20 transition-all"
              >
                <FilePreview fileName={file.name} filePath={filePath} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
