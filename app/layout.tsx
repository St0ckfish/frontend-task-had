import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'File Explorer',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full flex">
        <aside className="w-32 bg-gray-100 p-2 flex flex-col gap-2">
          <Link href="/" className="btn">
            My Files
          </Link>
          <Link href="/recent" className="btn">
            Recent
          </Link>
        </aside>
        <main className="flex-1 p-4">{children}</main>
      </body>
    </html>
  );
}
