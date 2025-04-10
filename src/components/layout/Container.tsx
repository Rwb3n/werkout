import React from 'react';
import { cn } from '@/lib/utils';

// Basic Container component
const Container = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div 
        ref={ref}
        className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}
        {...props}
    >
        {children}
    </div>
));
Container.displayName = 'Container';

// Basic Responsive Grid component
const Grid = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div 
        ref={ref}
        className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
        {...props}
    >
        {children}
    </div>
));
Grid.displayName = 'Grid';

export { Container, Grid }; 