'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarItem } from '@/src/components/ui/sidebar';
import { Files, Clock } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      <Link href="/" className="block my-2">
        <SidebarItem 
          icon={<Files className="h-4 w-4" />} 
          active={pathname === '/' || pathname.startsWith('/folder')}
        >
          My Files
        </SidebarItem>
      </Link>
      <Link href="/recent" className="block my-2">
        <SidebarItem 
          icon={<Clock className="h-4 w-4" />}
          active={pathname === '/recent'}
        >
          Recent
        </SidebarItem>
      </Link>
    </>
  );
}
