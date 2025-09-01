import type { ReactNode } from 'react';
import '@/src/styles/globals.css';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider
} from '@/src/components/ui/sidebar';
import { Navigation } from '@/src/components/Navigation';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'File Explorer',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultExpanded={false}>
            <div className="flex h-screen">
              <Sidebar>
                <SidebarHeader>
                  File Explorer
                </SidebarHeader>
                <SidebarContent>
                  <Navigation />
                </SidebarContent>
              </Sidebar>
              <main className="flex-1 p-3 sm:p-6 bg-background overflow-auto min-w-0">
                {children}
              </main>
            </div>
          </SidebarProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
