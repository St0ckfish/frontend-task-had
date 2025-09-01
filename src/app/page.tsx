import { getRoot } from '@/src/lib/data';
import { CreateFolderButton } from '@/src/components/CreateFolder';
import { CreateFileButton } from '@/src/components/CreateFile';
import { FolderList } from '@/src/components/FolderList';
import { Separator } from '@/src/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from '@/src/components/ui/breadcrumb';
import { Home as HomeIcon } from 'lucide-react';

export default async function Home() {
  const folder = await getRoot();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                <span className="flex items-center gap-1">
                  <HomeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Home</h1>
            <p className="text-muted-foreground text-sm">
              Manage your files and folders
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateFolderButton />
            <CreateFileButton />
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
