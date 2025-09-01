'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';
import { Button } from './button';
import { PanelLeft } from 'lucide-react';

interface SidebarContextProps {
  isExpanded: boolean;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function SidebarProvider({ children, defaultExpanded = true }: SidebarProviderProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggle = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ isExpanded, toggle }}>
      {children}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={toggle}
        />
      )}
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.ComponentProps<'aside'> {
  children: React.ReactNode;
}

function Sidebar({ className, children, ...props }: SidebarProps) {
  const { isExpanded } = useSidebar();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out shadow-sm',
        'fixed md:relative z-50 md:z-auto',
        isExpanded 
          ? 'w-64 translate-x-0' 
          : 'w-16 -translate-x-full md:translate-x-0',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

interface SidebarHeaderProps extends React.ComponentProps<'div'> {
  children?: React.ReactNode;
}

function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  const { isExpanded, toggle } = useSidebar();

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-border px-3 py-4 bg-muted/50',
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="h-8 w-8 shrink-0 bg-gray-200"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      {isExpanded && children && (
        <div className="flex-1 truncate text-sm font-semibold text-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

interface SidebarContentProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto px-2 py-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarItemProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
}

function SidebarItem({ className, children, icon, active = false, ...props }: SidebarItemProps) {
  const { isExpanded } = useSidebar();

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      {isExpanded && <div className="flex-1 truncate">{children}</div>}
    </div>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarProvider,
  useSidebar,
};
