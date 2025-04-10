import React from 'react';
import { Slot } from "@radix-ui/react-slot"; // Import Slot
import { cva, type VariantProps } from "class-variance-authority"; // Using cva for better variant management

import { cn } from "@/lib/utils"; // Assuming utils file for cn helper

// Define variants using cva
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Matching names from previous attempt + common shadcn/ui names
        default: "bg-primary text-primary-foreground hover:bg-primary/90", // Renamed primary to default
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Matching names from previous attempt + common shadcn/ui names
        default: "h-10 px-4 py-2", // Renamed md to default
        sm: "h-9 rounded-md px-3", // Adjusted styles slightly
        lg: "h-11 rounded-md px-8", // Adjusted styles slightly
        icon: "h-10 w-10", // Added icon size variant
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define props interface, extending cva variants
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean; // Kept isLoading prop
  asChild?: boolean // Uncomment asChild prop
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    
    // Use Slot if asChild is true, otherwise use "button"
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp // Use the dynamic component type
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // Disable the underlying element if loading OR original disabled prop is set
        // Note: `disabled` might not work directly on Slot's child (e.g., an <a> tag)
        // Actual disabling logic might need to be handled in the parent for asChild links.
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Conditionally render loading indicator ONLY if not asChild */}
        {!asChild && isLoading ? (
          <span className="animate-spin mr-2">⏳</span> 
        ) : null}
        {/* Always render children */} 
        {children}
      </Comp> // Use the dynamic component type
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }; // Export variants for potential reuse 