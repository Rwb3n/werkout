import React from 'react';
import { cn } from '@/lib/utils';

// Basic Container component
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "container mx-auto px-4 sm:px-6 lg:px-8", // Standard padding, responsive
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

// Basic Responsive Grid component
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number; // Base columns (mobile)
  smCols?: number;
  mdCols?: number;
  lgCols?: number;
  xlCols?: number;
  gap?: number; // Tailwind gap unit (e.g., 4 = gap-4)
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, smCols, mdCols, lgCols, xlCols, gap = 4, ...props }, ref) => {
    const gridClasses = [
      'grid',
      `gap-${gap}`,
      `grid-cols-${cols}`,
      smCols ? `sm:grid-cols-${smCols}` : '',
      mdCols ? `md:grid-cols-${mdCols}` : '',
      lgCols ? `lg:grid-cols-${lgCols}` : '',
      xlCols ? `xl:grid-cols-${xlCols}` : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={cn(gridClasses, className)}
        {...props}
      />
    );
  }
);
Grid.displayName = "Grid";

export { Container, Grid }; 