import * as React from 'react';
import { cn } from '../../lib/utils';

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageLayout({ children, className, ...props }: PageLayoutProps) {
  return (
    <div
      className={cn('flex-1 flex flex-col h-full overflow-hidden bg-background', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-border bg-card shrink-0', className)}
      {...props}
    >
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto p-6 space-y-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}
