import React from 'react';
import { findFolder, getBreadcrumbPath } from '@/src/lib/data';
import { CreateFolderButton } from '@/src/components/CreateFolder';
import { CreateFileButton } from '@/src/components/CreateFile';
import { FolderList } from '@/src/components/FolderList';
import { ViewToggle } from '@/src/components/ViewToggle';
import { Separator } from '@/src/components/ui/separator';
import { Button } from '@/src/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/src/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

export default async function FolderPage({ params }: Props) {
  const folder = await findFolder(params.id);
  const breadcrumbPath = await getBreadcrumbPath(params.id);

  if (!folder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Folder not found</h2>
          <p className="text-muted-foreground">The folder you're looking for doesn't exist.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4 gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbPath?.map((item, index) => (
              <React.Fragment key={item.id}>
                <BreadcrumbItem>
                  {index === breadcrumbPath.length - 1 ? (
                    <BreadcrumbPage className="text-sm sm:text-base">
                      {item.name === 'root' ? 'Home' : item.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.id === 'root' ? '/' : `/folder/${item.id}`}>
                        {item.name === 'root' ? (
                          <span className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span className="hidden sm:inline">Home</span>
                          </span>
                        ) : (
                          <span className="text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbPath.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{folder.name}</h1>
            <p className="text-muted-foreground text-sm">
              Manage files and folders in this directory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle />
            <CreateFolderButton folderId={params.id} />
            <CreateFileButton folderId={params.id} />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <FolderList nodes={folder.children} />
      </div>
    </div>
  );
}
